// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

contract StringUtils {

    function uint2str(uint _i) internal pure returns (string memory _uintAsString) {
        // make a copy of the param to avoid security/no-assign-params error
        uint c = _i;
        if (_i == 0) {
          return '0';
        }
        uint j = _i;
        uint len;
        while (j != 0) {
          len++;
          j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint k = len - 1;
        while (c != 0) {
          bstr[k--] = byte(uint8(48 + c % 10));
          c /= 10;
        }
        return string(bstr);
    }

    function address2str(address _addr) internal pure returns(string memory) {
        bytes32 value = bytes32(uint256(_addr));
        bytes memory alphabet = '0123456789abcdef';
        bytes memory str = new bytes(42);
        str[0] = '0';
        str[1] = 'x';
        for (uint i = 0; i < 20; i++) {
          str[2+i*2] = alphabet[uint8(value[i + 12] >> 4)];
          str[3+i*2] = alphabet[uint8(value[i + 12] & 0x0f)];
        }
        return string(str);
    }

}
