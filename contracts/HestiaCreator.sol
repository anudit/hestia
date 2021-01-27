/*===============================
    __  __          __  _
   / / / /__  _____/ /_(_)___ _
  / /_/ / _ \/ ___/ __/ / __ `/
 / __  /  __(__  ) /_/ / /_/ /
/_/ /_/\___/____/\__/_/\__,_/

===============================*/

// SPDX-License-Identifier: MIT
pragma solidity >=0.7.6 <0.8.0;

interface IAPIConsumer {
    function getPrice() external view returns(uint256);
}

contract HestiaCreator {
    IAPIConsumer api;

    struct Creator {
        uint256 creatorId;
        address creatorAddress;
        uint256[] postIds;
    }

    // 0x94f0f5F1303BAFb4FdA90301D8CEf3320D7b52a8 on matic mumbai
    constructor(address _apiAddress) {
        api = IAPIConsumer(_apiAddress);
    }

    function consumePrice() public view returns(uint256){
        return api.getPrice();
    }
}
