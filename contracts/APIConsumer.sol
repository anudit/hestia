// SPDX-License-Identifier: MIT
// 0x94f0f5F1303BAFb4FdA90301D8CEf3320D7b52a8 on matic mumbai.
pragma solidity ^0.7.0;

import "@chainlink/contracts/src/v0.7/ChainlinkClient.sol";

contract APIConsumer is ChainlinkClient {
    address owner;

    using Chainlink for Chainlink.Request;

    uint256 public ethUsdPrice;

    bytes32 private jobId;
    uint256 private fee;

    event RequestFulfilled(bytes32 indexed requestId, uint256 indexed price);

    constructor() {
        owner=msg.sender;
        setChainlinkOracle(0xBf87377162512f8098f78f055DFD2aDAc34cbB47);
        setChainlinkToken(0x70d1F773A9f81C852087B77F6Ae6d3032B02D2AB);
        jobId = "6b57e3fe0d904ba48d137b39350c7892";
        fee = 0.01 * (10 ** 18); // 0.01 LINK
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

    function fulfill(bytes32 _requestId, uint256 _price) public recordChainlinkFulfillment(_requestId) {
        emit RequestFulfilled(_requestId, _price);
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
