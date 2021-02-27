/*===============================
    __  __          __  _
   / / / /__  _____/ /_(_)___ _
  / /_/ / _ \/ ___/ __/ / __ `/
 / __  /  __(__  ) /_/ / /_/ /
/_/ /_/\___/____/\__/_/\__,_/

===============================*/

// SPDX-License-Identifier: AGPL-3.0
pragma solidity >=0.7.6 <0.8.0;

import {RedirectAll, ISuperToken, IConstantFlowAgreementV1, ISuperfluid} from "./RedirectAll.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@chainlink/contracts/src/v0.7/ChainlinkClient.sol";
import "./StringUtils.sol";
import "./BaseRelayRecipient.sol";

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
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

contract HestiaSuperApp is ERC721, HestiaMeta, ChainlinkClient, StringUtils, BaseRelayRecipient, RedirectAll {

    address owner;

    //===================================
    // Chainlink Stuff
    //===================================

    using Chainlink for Chainlink.Request;

    struct TransferFulfill {
        uint256 postId;
        address from;
        address tokenAddress;
        bool isComplete;
    }

    bytes32 private jobId;
    uint256 private fee;

    mapping(bytes32 => address) public tokensAllowed;
    mapping(bytes32 => TransferFulfill) public TokenTransferRecords;

    event RequestFulfilled(bytes32 indexed requestId, uint256 indexed price);

    //===================================
    // Hestia Stuff
    //===================================

    uint256 public _tokenIds;
    uint256 public _postIds;
    mapping(uint256 => Post) public _posts;
    mapping(uint256 => mapping(address => bool) ) public _postLikedByAddress;

    address ETH_ADDRESS = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
    uint256 taxDuration = 0 seconds; // Debugging should be increased to 365 years.

    struct Post {
        address creator;
        address owner;
        uint256 price;
        uint256 taxrate; // 5% = 0.05 * 10000 = 500
        uint256 lastTaxCollected;
        string postData;
        uint256 likes;
        bool exists;
    }

    event NewPost(
        uint256 indexed _postId,
        address indexed _creator,
        uint256 indexed _price,
        string _postData,
        string _metaData
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

    event PostLiked(
        uint256 indexed _postId,
        address indexed _user
    );

    constructor(ISuperfluid host,IConstantFlowAgreementV1 cfa,ISuperToken acceptedToken)
      ERC721("Hestia", "HESTIA")
      RedirectAll(host,cfa,acceptedToken,msg.sender)
    {
        owner = msg.sender;
        setChainlinkOracle(0xBf87377162512f8098f78f055DFD2aDAc34cbB47);
        setChainlinkToken(0x70d1F773A9f81C852087B77F6Ae6d3032B02D2AB);
        jobId = "6b57e3fe0d904ba48d137b39350c7892";
        fee = 0.01 * (10 ** 18); // 0.01 LINK

        addNewToken(0x4554480000000000000000000000000000000000000000000000000000000000, ETH_ADDRESS);
    }

    modifier postExist(uint256 id) {
        require(_posts[id].exists, "Hestia:Post id Not Found");
        _;
    }

    modifier onlyPostOwner(uint256 id, address _address) {
        require(_posts[id].creator == _address, "Hestia:Not your post.");
        _;
    }

    function addNewToken(bytes32 _tokenSymbol, address _tokenAddress) public {
        require(msg.sender == owner);
        tokensAllowed[_tokenSymbol] = _tokenAddress;
    }

    function withdrawLink() public {
        require(msg.sender == owner);
        LinkTokenInterface _link = LinkTokenInterface(chainlinkTokenAddress());
        require(_link.transfer(msg.sender, _link.balanceOf(address(this))), "Unable to transfer");
    }

    function createPost(
        uint256 price, uint256 taxrate, string memory postData, string memory metaData
    )
        public
    {
        require(price > 0, "Hestia:Price cannot be 0");
        handleCreatePost(price, taxrate, postData, metaData, msg.sender);
    }

    function createPostForwarder(
        uint256 price, uint256 taxrate, string memory postData, string memory metaData
    )
        public
    {
        require(price > 0, "Hestia:Price cannot be 0");
        handleCreatePost(price, taxrate, postData, metaData, _msgSenderForwarder());
    }

    function createPostMeta(
        uint256 price, uint256 taxrate, string memory postData, string memory metaData,
        address creator, bytes32 r, bytes32 s, uint8 v
    )
        public
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
        string memory postData, string memory  metaData, address creator
    )
        internal
    {
        _postIds++;
        _posts[_postIds] = Post(creator, creator, price, taxrate, block.timestamp, postData, 0, true);

        _tokenIds++;

        _safeMint(creator, _tokenIds);
        approve(address(this), _tokenIds);
        _setTokenURI(_tokenIds, postData);

        emit NewPost(_postIds, creator, price, postData, metaData);
    }

    function purchasePost(uint256 postId, bytes32 _tokenSymbol)
        external
        payable
        postExist(postId)

    {
        require(tokensAllowed[_tokenSymbol] != 0x0000000000000000000000000000000000000000); //Token must be allowed.

        Post storage post = _posts[postId];
        uint256 taxAmount = ((post.price*post.taxrate)/10000);
        uint256 totalCost = post.price + taxAmount;

        if (_tokenSymbol == 0x4554480000000000000000000000000000000000000000000000000000000000) { //formatBytes32String("ETH")

            require(msg.value >= totalCost, "Hestia:Bid lower than total price");

            _safeTransfer(post.owner, msg.sender, _tokenIds, "");
            payable(post.creator).transfer(taxAmount);
            approve(address(this), _tokenIds);
            payable(post.owner).transfer(post.price);
            address oldOwner = post.owner;
            _posts[postId].owner = msg.sender;

            emit PostSold(postId, _tokenIds, oldOwner, msg.sender, post.price);
            emit TaxPayed(postId,  msg.sender, taxAmount);
        }
        else {

            Chainlink.Request memory request = buildChainlinkRequest(jobId, address(this), this.fulfill.selector);

            string memory reqApiAddress =string(abi.encodePacked(
                "https://api.1inch.exchange/v2.0/quote?fromTokenAddress=0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee&toTokenAddress=",
                address2str(tokensAllowed[_tokenSymbol]),
                "&amount=",
                uint2str(totalCost))
            );

            // requestApiList.push(reqApiAddress);
            request.add("get", reqApiAddress);

            string[] memory path = new string[](1);
            path[0] = "toTokenAmount";
            request.addStringArray("path", path);

            // request.addInt("times", 1000000000000000000); // Price already in wei

            bytes32 requestId = sendChainlinkRequest(request, fee);
            // requestIdList.push(requestId);
            TokenTransferRecords[requestId] = TransferFulfill(postId, msg.sender, tokensAllowed[_tokenSymbol], false);
        }
    }

    function fulfill(bytes32 _requestId, uint256 _price) public recordChainlinkFulfillment(_requestId) {
        emit RequestFulfilled(_requestId, _price);

        require(TokenTransferRecords[_requestId].isComplete == false);

        TransferFulfill memory record = TokenTransferRecords[_requestId];
        IERC20 token = IERC20(record.tokenAddress);

        require(token.allowance(record.from, address(this)) >= _price, "Hestia:Insufficient allowance to pay owner");
        require(token.transferFrom(record.from, _posts[record.postId].owner, _price), "Hestia:Unable to transfer amount to owner");
        TokenTransferRecords[_requestId].isComplete = true;

        Post storage post = _posts[record.postId];
        uint256 taxAmount = ((post.price*post.taxrate)/10000);

        address oldOwner = post.owner;
        _posts[record.postId].owner = record.from;

        emit PostSold(record.postId, _tokenIds, oldOwner, record.from, post.price);
        emit TaxPayed(record.postId, record.from, taxAmount);
    }

    function updatePostPrice(uint256 postId, uint256 newPrice)
        external
        payable
        postExist(postId)
        onlyPostOwner(postId, msg.sender)

    {
        require(newPrice > 0,  "Hestia:Price cannot be 0.");
        uint256 oldprice = _posts[postId].price;
        _posts[postId].price = newPrice;

        emit PostPriceUpdate(postId, msg.sender, oldprice, newPrice);
    }

    function payTaxes(uint256 postId)
        external
        payable
        postExist(postId)
        onlyPostOwner(postId, msg.sender)

    {
        require(block.timestamp - _posts[postId].lastTaxCollected >= taxDuration);
        Post storage post = _posts[postId];

        uint256 taxAmount = ((post.price*post.taxrate)/10000);
        require(msg.value >= taxAmount, "Hestia:Insufficient taxAmount.");
        payable(post.creator).transfer(taxAmount);

        _posts[postId].lastTaxCollected = block.timestamp;
        emit TaxPayed(postId, msg.sender, taxAmount);
    }

    function _beforeTokenTransfer(
      address /*from*/,
      address to,
      uint256 /*tokenId*/
    ) internal override {
        _changeReceiver(to);
    }

    function likePostMeta(
        uint256 postId, address liker,
        bytes32 r, bytes32 s, uint8 v
    )
        postExist(postId)
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
        require(_postLikedByAddress[postId][liker] == false, "Hestia:Post already liked by address.");
        _handleLikePost(postId, liker);
    }

    function likePost(uint256 postId)
        postExist(postId)
        public
    {
        require(_postLikedByAddress[postId][msg.sender] == false, "Hestia:Post already liked by address.");
        _handleLikePost(postId, msg.sender);
    }

    function _handleLikePost(uint256 postId, address liker) internal {
        _postLikedByAddress[postId][liker] = true;
        _posts[postId].likes += 1;
        emit PostLiked(postId, liker);
    }
}
