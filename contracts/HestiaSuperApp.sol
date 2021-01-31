/*===============================
    __  __          __  _
   / / / /__  _____/ /_(_)___ _
  / /_/ / _ \/ ___/ __/ / __ `/
 / __  /  __(__  ) /_/ / /_/ /
/_/ /_/\___/____/\__/_/\__,_/

===============================*/

// SPDX-License-Identifier: MIT
pragma solidity >=0.7.6 <0.8.0;

import {RedirectAll, ISuperToken, IConstantFlowAgreementV1, ISuperfluid} from "./RedirectAll.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/payment/PullPayment.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";


interface IAPIConsumer {
    function getPrice() external view returns(uint256);
}

contract HestiaMeta {
    struct EIP712Domain {
        string name;
        string version;
        uint256 chainId;
        address verifyingContract;
    }

    struct MetaTransaction {
    		uint256 nonce;
    		address from;
    }

    mapping(address => uint256) public nonces;
    bytes32 internal constant EIP712_DOMAIN_TYPEHASH = keccak256(bytes("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"));
    bytes32 internal constant META_TRANSACTION_TYPEHASH = keccak256(bytes("MetaTransaction(uint256 nonce,address from)"));
    bytes32 internal DOMAIN_SEPARATOR = keccak256(abi.encode(
        EIP712_DOMAIN_TYPEHASH,
    		keccak256(bytes("Hestia")),
    		keccak256(bytes("1")),
    		80001,
    		address(this)
    ));

}

contract HestiaSuperApp is ERC721, PullPayment, ReentrancyGuard, HestiaMeta /*, RedirectAll*/ {

    uint256 public _tokenIds;
    uint256 public _postIds;
    mapping(uint256 => Post) public _posts;

    IAPIConsumer api;

    uint256 taxDuration = 0 seconds;

    struct Post {
        address creator;
        address owner;
        uint256 price;
        uint256 taxrate; // 5% = 0.05 * 10000 = 500
        uint256 lastTaxCollected;
        string postData;
        bool exists;
    }

    event NewPost(
        uint256 indexed _postId,
        address indexed _seller,
        uint256 indexed _price,
        string _postData,
        bytes32 _metaData
    );

    event PostSold(
        uint256 indexed _postId,
        uint256 _tokenId,
        address indexed _previousOwner,
        address indexed _newOwner,
        uint256 _amount
    );

    event TaxPayed(
        uint256 indexed _postId,
        address indexed _taxPayer,
        uint256 _amount
    );

    event PostPriceUpdate(
        uint256 indexed _postId,
        address indexed _seller,
        uint256 _oldPrice,
        uint256 _newPrice
    );

    event PostLike(
        uint256 indexed _postId,
        address indexed _user
    );

    // 0x94f0f5F1303BAFb4FdA90301D8CEf3320D7b52a8 on matic mumbai
    constructor(/*ISuperfluid host,IConstantFlowAgreementV1 cfa,ISuperToken acceptedToken*/)
      ERC721("Hestia", "HESTIA")
    //   RedirectAll(host,cfa,acceptedToken,msg.sender)
    {
        api = IAPIConsumer(0x94f0f5F1303BAFb4FdA90301D8CEf3320D7b52a8);
    }

    modifier postExist(uint256 id) {
        require(_posts[id].exists, "Hestia:Post id Not Found");
        _;
    }

    modifier onlyPostOwner(uint256 id, address _address) {
        require(_posts[id].creator == _address, "Hestia:Not your post.");
        _;
    }

    function consumePrice() public view returns(uint256){
        return api.getPrice();
    }

    function createPost(
        uint256 price,
        uint256 taxrate,
        string memory postData,
        bytes32 metaData
    )
        public nonReentrant()
    {
        require(price > 0, "Hestia:Price cannot be 0");
        handleCreatePost(price, taxrate, postData, metaData, msg.sender);
    }

    function createPostMeta(
        uint256 price, uint256 taxrate, string memory postData, bytes32 metaData,
        address creator, bytes32 r, bytes32 s, uint8 v
    )
        public
        nonReentrant()
    {
        require(price > 0, "Hestia:Price cannot be 0");

        MetaTransaction memory metaTx = MetaTransaction({
            nonce: nonces[creator],
            from: creator
        });

        bytes32 digest = keccak256(
            abi.encodePacked(
                "\x19\x01",
                DOMAIN_SEPARATOR,
                keccak256(abi.encode(META_TRANSACTION_TYPEHASH, metaTx.nonce, metaTx.from))
            )
        );

        require(creator != address(0), "invalid-address-0");
        require(creator == ecrecover(digest, v, r, s), "invalid-signatures");

        handleCreatePost(price, taxrate, postData, metaData, creator);
    }

    function handleCreatePost(uint256 price, uint256 taxrate,
        string memory postData,
        bytes32 metaData,
        address creator
    )
        internal
    {
        _postIds++;
        _posts[_postIds] = Post(creator, creator, price, taxrate, block.timestamp,  postData, true);

        _tokenIds++;

        _safeMint(creator, _tokenIds);
        approve(address(this), _tokenIds);
        _setTokenURI(_tokenIds, postData);

        emit NewPost(_postIds, creator, price, postData, metaData);
    }

    function purchasePost(uint256 postId, address _tokenAddress)
        external
        payable
        postExist(postId)
        nonReentrant()
    {
        if (_tokenAddress == 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE) { // Ether Address
            Post storage post = _posts[postId];

            uint256 taxAmount = ((post.price*post.taxrate)/10000);
            uint256 totalCost = post.price + taxAmount;
            require(msg.value >= totalCost, "Hestia:Bid lower than total price");

            _safeTransfer(post.owner, msg.sender, _tokenIds, "");
            payable(post.creator).transfer(taxAmount);
            approve(address(this), _tokenIds);
            _asyncTransfer(post.owner, post.price);
            address oldOwner = post.owner;
            _posts[postId].owner = msg.sender;

            emit PostSold(postId, _tokenIds, oldOwner, msg.sender, post.price);
            emit TaxPayed(postId,  msg.sender, taxAmount);
        }
        else {
            // TODO: Chainlink fullfiller
        }
    }

    function updatePostPrice(uint256 postId, uint256 newPrice)
        external
        payable
        postExist(postId)
        onlyPostOwner(postId, msg.sender)
        nonReentrant()
    {
        require(newPrice > 0,  "Hestia:Price cannot be 0.");
        uint256 oldprice = _posts[postId].price;
        _posts[postId].price = newPrice;

        emit PostPriceUpdate(postId, msg.sender, oldprice, newPrice);
    }

    // Important so that funds do not get locked
    // for addresses that cannot receive ETH.
    function getPayments() external {
        withdrawPayments(msg.sender);
    }

    function payTaxes(uint256 postId, address _tokenAddress)
        external
        payable
        postExist(postId)
        onlyPostOwner(postId, msg.sender)
        nonReentrant()
    {
        require(block.timestamp - _posts[postId].lastTaxCollected >= taxDuration);
        if (_tokenAddress == 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE) { // Ether Address

            Post storage post = _posts[postId];

            uint256 taxAmount = ((post.price*post.taxrate)/10000);
            require(msg.value >= taxAmount, "Hestia:Insufficient taxAmount.");
            payable(post.creator).transfer(taxAmount);

            _posts[postId].lastTaxCollected = block.timestamp;
            emit TaxPayed(postId, msg.sender, taxAmount);
        }
        else {

        }
    }

    // function _beforeTokenTransfer(
    //   address /*from*/,
    //   address to,
    //   uint256 /*tokenId*/
    // ) internal override {
    //     _changeReceiver(to);
    // }


    function likePost (
        uint256 postId, address liker,
        bytes32 r, bytes32 s, uint8 v
    )
        public
    {
        MetaTransaction memory metaTx = MetaTransaction({
            nonce: nonces[liker],
            from: liker
        });

        bytes32 digest = keccak256(
            abi.encodePacked(
                "\x19\x01",
                DOMAIN_SEPARATOR,
                keccak256(abi.encode(META_TRANSACTION_TYPEHASH, metaTx.nonce, metaTx.from))
            )
        );

        require(liker != address(0), "Hestia:invalid-address-0");
        require(liker == ecrecover(digest, v, r, s), "Hestia:invalid-signatures");

        emit PostLike(postId, liker);
    }
}
