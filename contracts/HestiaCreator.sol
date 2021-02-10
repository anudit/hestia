/*===============================
    __  __          __  _
   / / / /__  _____/ /_(_)___ _
  / /_/ / _ \/ ___/ __/ / __ `/
 / __  /  __(__  ) /_/ / /_/ /
/_/ /_/\___/____/\__/_/\__,_/

===============================*/

// SPDX-License-Identifier: MIT
pragma solidity >=0.7.6 <0.8.0;
pragma abicoder v2;

contract HestiaCreator {

    struct Creator {
        address creatorAddress;
        string creatorName;
        string metaData;
        bool active;
    }

    event NewCreator(
        address indexed creatorAddress,
        string indexed creatorName,
        string creatorNameString,
        string metaData
    );

    event UpdateMetadata(
        address indexed creatorAddress,
        string newMetaData
    );

    mapping(address => Creator) public creators;

    constructor() {}

    function registerCreator(string memory _creatorName, string memory _metaData) public {
        require(creators[msg.sender].active == false, "HestiaCreator: Creator already registered.");
        creators[msg.sender] = Creator(msg.sender, _creatorName, _metaData, true);
        emit NewCreator(msg.sender, _creatorName, _creatorName, _metaData);
    }

    function updateMetaData(string memory _newMetaData) public {
        require(creators[msg.sender].active == true, "HestiaCreator: Creator not registered.");
        creators[msg.sender].metaData = _newMetaData;
        emit UpdateMetadata(msg.sender, _newMetaData);
    }

    function getCreator(address _creatorAddress) public view returns (Creator memory){
        return creators[_creatorAddress];
    }
}
