/*===============================
    __  __          __  _
   / / / /__  _____/ /_(_)___ _
  / /_/ / _ \/ ___/ __/ / __ `/
 / __  /  __(__  ) /_/ / /_/ /
/_/ /_/\___/____/\__/_/\__,_/

===============================*/

// SPDX-License-Identifier: MIT
pragma solidity >=0.7.6 <0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/payment/PullPayment.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

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

contract Hestia is ERC721, PullPayment, ReentrancyGuard, HestiaMeta {

    uint256 public _tokenIds;
    uint256 public _postIds;
    mapping(uint256 => Post) public _posts;

    struct Post {
        address seller;
        uint256 price;
        string postData;
        bool exists;
    }

    event NewPost(
        uint256 indexed _postId,
        address indexed _seller,
        uint256 _price,
        string _postData,
        bytes32 indexed _metaData
    );

    event PostSold(
        uint256 indexed _postId,
        uint256 _tokenId,
        address indexed _seller,
        address indexed _buyer,
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

    constructor() ERC721("Hestia", "HESTIA") {}

    modifier postExist(uint256 id) {
        require(_posts[id].exists, "Not Found");
        _;
    }

    modifier onlyPostOwner(uint256 id, address _address) {
        require(_posts[id].seller == _address, "Not your post.");
        _;
    }

    function addPost(uint256 price, string memory postData, bytes32 metaData) public nonReentrant() {
        require(price > 0, "Price cannot be 0");
        handleAddPost(price, postData, metaData, msg.sender);
    }

    function addPostMeta(
        uint256 price, string memory postData, bytes32 metaData,
        address buyer, bytes32 r, bytes32 s, uint8 v
    )
        public
        nonReentrant()
    {
        require(price > 0, "Price cannot be 0");

        MetaTransaction memory metaTx = MetaTransaction({
            nonce: nonces[buyer],
            from: buyer
        });

        bytes32 digest = keccak256(
            abi.encodePacked(
                "\x19\x01",
                DOMAIN_SEPARATOR,
                keccak256(abi.encode(META_TRANSACTION_TYPEHASH, metaTx.nonce, metaTx.from))
            )
        );

        require(buyer != address(0), "invalid-address-0");
        require(buyer == ecrecover(digest, v, r, s), "invalid-signatures");

        handleAddPost(price, postData, metaData, buyer);
    }

    function handleAddPost(uint256 price,
        string memory postData,
        bytes32 metaData,
        address buyer
    )
        internal
    {
        _postIds++;
        _posts[_postIds] = Post(buyer, price, postData, true);

        emit NewPost(_postIds, buyer, price, postData, metaData);
    }

    function purchasePost(uint256 postId)
        external
        payable
        postExist(postId)
        nonReentrant()
    {
        Post storage post = _posts[postId];

        require(msg.value >= post.price, "Bid lower than cost price.");

        _tokenIds++;

        _safeMint(msg.sender, _tokenIds);
        _setTokenURI(_tokenIds, post.postData);
        _asyncTransfer(post.seller, msg.value);

        emit PostSold(postId, _tokenIds, msg.sender, post.seller, msg.value);
    }

    function updatePostPrice(uint256 postId, uint256 newPrice)
        external
        payable
        postExist(postId)
        onlyPostOwner(postId, msg.sender)
        nonReentrant()
    {
        require(msg.value > 0,  "Price cannot be 0.");
        uint256 oldprice = _posts[postId].price;
        _posts[postId].price = newPrice;

        emit PostPriceUpdate(postId, msg.sender, oldprice, newPrice);
    }

    function getPayments() external {
        withdrawPayments(msg.sender);
    }

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

        require(liker != address(0), "invalid-address-0");
        require(liker == ecrecover(digest, v, r, s), "invalid-signatures");

        emit PostLike(postId, liker);
    }
}
