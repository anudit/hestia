// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

import "@chainlink/contracts/src/v0.7/ChainlinkClient.sol";
import "./StringUtils.sol";

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

contract APIConsumer is ChainlinkClient, StringUtils {
    address owner;

    using Chainlink for Chainlink.Request;

    struct TransferFulfill {
        bytes32 requestId;
        uint256 postId;
        address tokenAddress;
        uint256 amount;
        uint256 result;
        bool isComplete;
    }

    uint256 public ethUsdPrice;
    bytes32[] public requestIdList;
    string[] public requestApiList;


    bytes32 private jobId;
    uint256 private fee;

    mapping(string => address) public tokensAllowed;
    mapping(bytes32 => TransferFulfill) public TokenTransferRecords;

    event RequestFulfilled(bytes32 indexed requestId, uint256 indexed price);

    constructor() {
        owner=msg.sender;
        setChainlinkOracle(0xBf87377162512f8098f78f055DFD2aDAc34cbB47);
        setChainlinkToken(0x70d1F773A9f81C852087B77F6Ae6d3032B02D2AB);
        jobId = "6b57e3fe0d904ba48d137b39350c7892";
        fee = 0.01 * (10 ** 18); // 0.01 LINK

        addNewToken("DAI", 0x6B175474E89094C44Da98b954EedeAC495271d0F);
    }

    function addNewToken(string memory _tokenSymbol, address _tokenAddress) public {
        require(msg.sender == owner);
        tokensAllowed[_tokenSymbol] = _tokenAddress;
    }

    function requestEthereumPrice() public returns (bytes32 requestId) {
        Chainlink.Request memory request = buildChainlinkRequest(jobId, address(this), this.fulfill.selector);

        request.add("get", "https://api.1inch.exchange/v2.0/quote?fromTokenAddress=0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee&toTokenAddress=0x6b175474e89094c44da98b954eedeac495271d0f&amount=1");
        string[] memory path = new string[](1);
        path[0] = "toTokenAmount";
        request.addStringArray("path", path);

        request.addInt("times", 1000000000000000000);
        return sendChainlinkRequest(request, fee);
    }

    function requestEthToTokenPrice(uint256 _postId, string memory _tokenSymbol, uint256 _amount) public returns (bytes32 requestId) {
        require(tokensAllowed[_tokenSymbol] != 0x0000000000000000000000000000000000000000);

        Chainlink.Request memory request = buildChainlinkRequest(jobId, address(this), this.fulfill.selector);

        string memory reqApiAddress =string(abi.encodePacked(
            "https://api.1inch.exchange/v2.0/quote?fromTokenAddress=0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee&toTokenAddress=",
            address2str(tokensAllowed[_tokenSymbol]),
            "&amount=",
            uint2str(_amount))
        );

        requestApiList.push(reqApiAddress);
        request.add("get", reqApiAddress);

        string[] memory path = new string[](1);
        path[0] = "toTokenAmount";
        request.addStringArray("path", path);

        request.addInt("times", 1000000000000000000);

        requestId = sendChainlinkRequest(request, fee);
        requestIdList.push(requestId);
        TokenTransferRecords[requestId] = TransferFulfill(requestId, _postId, tokensAllowed[_tokenSymbol], _amount, 0, false);

        return requestId;
    }

    function fulfill(bytes32 _requestId, uint256 _price) public recordChainlinkFulfillment(_requestId) {
        emit RequestFulfilled(_requestId, _price);

        TransferFulfill memory record = TokenTransferRecords[_requestId];
        // IERC20 token = IERC20(record.tokenAddress);

        ethUsdPrice = _price;
    }

    function getPrice() public view returns(uint256){
        return ethUsdPrice;
    }

    function withdrawLink() public {
        require(msg.sender == owner);
        LinkTokenInterface _link = LinkTokenInterface(chainlinkTokenAddress());
        require(_link.transfer(msg.sender, _link.balanceOf(address(this))), "Unable to transfer");
    }

}
