// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MockVRFCoordinatorV2Simple {
    uint256 private nonce = 0;
    uint256 private lastRandom;
    
    struct Request {
        address requester;
        uint256[] randomWords;
        bool fulfilled;
    }
    
    mapping(uint256 => Request) private requests;
    
    function requestRandomWords(
        bytes32,        // keyHash
        uint64,        // subId
        uint16,        // minimumRequestConfirmations
        uint32,        // callbackGasLimit
        uint32         // numWords
    ) external returns (uint256 requestId) {
        requestId = nonce++;
        
        // Generate more varied randomness using multiple sources
        uint256[] memory randomWords = new uint256[](1);
        lastRandom = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.number,
            msg.sender,
            requestId,
            lastRandom,
            blockhash(block.number - 1)
        )));
        randomWords[0] = lastRandom;
        
        // Store request for later fulfillment
        requests[requestId] = Request({
            requester: msg.sender,
            randomWords: randomWords,
            fulfilled: false
        });
        
        return requestId;
    }
    
    function fulfillRandomWords(uint256 requestId) external {
        require(!requests[requestId].fulfilled, "Request already fulfilled");
        require(requests[requestId].requester != address(0), "Request does not exist");
        
        requests[requestId].fulfilled = true;
        
        // Call the fulfillRandomWords function on the requesting contract
        (bool success,) = requests[requestId].requester.call(
            abi.encodeWithSignature(
                "rawFulfillRandomWords(uint256,uint256[])", 
                requestId, 
                requests[requestId].randomWords
            )
        );
        require(success, "Mock VRF callback failed");
    }
}
