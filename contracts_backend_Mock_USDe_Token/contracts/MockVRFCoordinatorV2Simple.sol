// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MockVRFCoordinatorV2Simple {
    uint256 private nonce = 0;
    
    function requestRandomWords(
        bytes32,        // keyHash
        uint64,        // subId
        uint16,        // minimumRequestConfirmations
        uint32,        // callbackGasLimit
        uint32         // numWords
    ) external returns (uint256 requestId) {
        requestId = nonce++;
        // Immediately fulfill the request
        uint256[] memory randomWords = new uint256[](1);
        randomWords[0] = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, requestId)));
        
        // Call the fulfillRandomWords function on the requesting contract
        (bool success,) = msg.sender.call(
            abi.encodeWithSignature("rawFulfillRandomWords(uint256,uint256[])", requestId, randomWords)
        );
        require(success, "Mock VRF callback failed");
        
        return requestId;
    }
}
