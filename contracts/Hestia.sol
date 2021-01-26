/*===============================
    __  __          __  _
   / / / /__  _____/ /_(_)___ _
  / /_/ / _ \/ ___/ __/ / __ `/
 / __  /  __(__  ) /_/ / /_/ /
/_/ /_/\___/____/\__/_/\__,_/

===============================*/

// SPDX-License-Identifier: MIT
pragma solidity >=0.7.5 <0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/payment/PullPayment.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Hestia is ERC721, PullPayment, ReentrancyGuard {

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

        _postIds++;
        _posts[_postIds] = Post(msg.sender, price, postData, true);

        emit NewPost(_postIds, msg.sender, price, postData, metaData);
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
}
