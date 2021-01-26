/*===============================
    __  __          __  _
   / / / /__  _____/ /_(_)___ _
  / /_/ / _ \/ ___/ __/ / __ `/
 / __  /  __(__  ) /_/ / /_/ /
/_/ /_/\___/____/\__/_/\__,_/

===============================*/

// SPDX-License-Identifier: MIT
pragma solidity >=0.7.5 <0.8.0;

interface IAPIConsumer {
    function getPrice() external view returns(uint256);
}

contract HestiaCreator {
    IAPIConsumer api;
    constructor(address _apiAddress){
        api = IAPIConsumer(_apiAddress);
    }

    function consumePrice() public view returns(uint256){
        return api.getPrice();
    }
}
