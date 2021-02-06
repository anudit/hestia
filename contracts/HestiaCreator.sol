/*===============================
    __  __          __  _
   / / / /__  _____/ /_(_)___ _
  / /_/ / _ \/ ___/ __/ / __ `/
 / __  /  __(__  ) /_/ / /_/ /
/_/ /_/\___/____/\__/_/\__,_/

===============================*/

// SPDX-License-Identifier: MIT
pragma solidity >=0.7.6 <0.8.0;

contract HestiaCreator {

    struct Creator {
        uint256 creatorID;
        address creatorAddress;
        string creatorName;
        bytes32 metaData;
    }

    event NewCreator(
        uint256 indexed creatorID,
        address indexed creatorAddress,
        string indexed creatorName,
        string creatorNameString,
        bytes32 metaData
    );

    event UpdateMetadata(
        uint256 indexed creatorID,
        bytes32 metaData
    );

    uint256 public creatorIDs;
    mapping(uint256 => Creator) public creators;

    constructor() {}

    function registerCreator(string memory _creatorName, bytes32 _metaData) public {
        creatorIDs+=1;
        creators[creatorIDs] = Creator(creatorIDs, msg.sender, _creatorName, _metaData);

        emit NewCreator(creatorIDs, msg.sender, _creatorName, _creatorName, _metaData);
    }

    function updateMetaData(uint256 _creatorID, bytes32 metaData) public {
        require(msg.sender == creators[_creatorID].creatorAddress);
        creators[_creatorID].metaData = metaData;
        emit UpdateMetadata(_creatorID, metaData);
    }
}
