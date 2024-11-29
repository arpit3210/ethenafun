// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";

contract MockVRFCoordinatorV2 is VRFCoordinatorV2Interface {
    uint256 private constant COORDINATOR_GAS_OVERHEAD = 52000;

    struct RequestConfig {
        address requester;
    }

    mapping(uint256 => RequestConfig) private s_requests;
    uint256 private s_nextRequestId = 1;

    function requestRandomWords(
        bytes32 keyHash,
        uint64 subId,
        uint16 minimumRequestConfirmations,
        uint32 callbackGasLimit,
        uint32 numWords
    ) external returns (uint256) {
        uint256 requestId = s_nextRequestId++;
        s_requests[requestId] = RequestConfig({
            requester: msg.sender
        });
        return requestId;
    }

    function fulfillRandomWords(uint256 _requestId, uint256[] memory _randomWords) external {
        VRFConsumerBaseV2(s_requests[_requestId].requester).rawFulfillRandomWords(_requestId, _randomWords);
    }

    function getRequestConfig()
        external
        pure
        returns (
            uint16 minimumRequestConfirmations,
            uint32 maxGasLimit,
            bytes32[] memory keyHashes
        )
    {
        bytes32[] memory keysHash = new bytes32[](1);
        return (3, 2000000, keysHash);
    }

    function getFeeConfig()
        external
        pure
        returns (
            uint32,
            uint32,
            uint32,
            uint32,
            uint32,
            uint32
        )
    {
        return (0, 0, 0, 0, 0, 0);
    }

    function getFallbackWeiPerUnitLink() external pure returns (int256) {
        return 0;
    }

    function getTypeAndVersion() external pure returns (string memory) {
        return "MockVRFCoordinatorV2 1.0.0";
    }

    function estimateRequestPrice(uint32, uint256) external pure returns (uint96) {
        return 0;
    }

    function createSubscription() external pure returns (uint64) {
        return 1;
    }

    function getSubscription(uint64) external pure returns (
        uint96 balance,
        uint64 reqCount,
        address owner,
        address[] memory consumers
    ) {
        address[] memory _consumers = new address[](0);
        return (0, 0, address(0), _consumers);
    }

    function requestSubscriptionOwnerTransfer(uint64 subId, address newOwner) external pure {}

    function acceptSubscriptionOwnerTransfer(uint64 subId) external pure {}

    function addConsumer(uint64 subId, address consumer) external pure {}

    function removeConsumer(uint64 subId, address consumer) external pure {}

    function cancelSubscription(uint64 subId, address to) external pure {}

    function pendingRequestExists(uint64) external pure returns (bool) {
        return false;
    }
}
