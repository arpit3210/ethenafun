// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract DoubleDiceGame is Ownable, ReentrancyGuard {
    IERC20 public usdeToken;
    uint256 public minBet;
    uint256 public maxBet;
    uint256 public houseEdge; // In basis points (1/100 of a percent)
    
    // Mapping to store valid sum selections and their corresponding multipliers
    mapping(uint256 => uint256) public sumMultipliers;
    
    event GamePlayed(
        address indexed player,
        uint256 selectedSum,
        uint256 rolledSum,
        uint256[2] rolledNumbers,
        uint256 betAmount,
        uint256 payout
    );
    
    constructor(
        address _usdeToken,
        uint256 _minBet,
        uint256 _maxBet,
        uint256 _houseEdge
    ) Ownable(msg.sender) {
        usdeToken = IERC20(_usdeToken);
        minBet = _minBet;
        maxBet = _maxBet;
        houseEdge = _houseEdge;
        
        // Initialize multipliers based on probability
        // The multipliers are set considering the probability of each sum
        sumMultipliers[2] = 35;  // 1/36 chance
        sumMultipliers[3] = 17;  // 2/36 chance
        sumMultipliers[4] = 11;  // 3/36 chance
        sumMultipliers[5] = 8;   // 4/36 chance
        sumMultipliers[6] = 6;   // 5/36 chance
        sumMultipliers[7] = 5;   // 6/36 chance
        sumMultipliers[8] = 6;   // 5/36 chance
        sumMultipliers[9] = 8;   // 4/36 chance
        sumMultipliers[10] = 11; // 3/36 chance
        sumMultipliers[11] = 17; // 2/36 chance
        sumMultipliers[12] = 35; // 1/36 chance
    }
    
    // Function to generate two pseudo-random numbers
    function generateRandomNumbers() private view returns (uint256[2] memory) {
        uint256 randomHash = uint256(
            keccak256(
                abi.encodePacked(
                    block.timestamp,
                    block.prevrandao,
                    msg.sender
                )
            )
        );
        
        uint256[2] memory numbers;
        numbers[0] = (randomHash % 6) + 1;              // First die (1-6)
        numbers[1] = ((randomHash >> 128) % 6) + 1;     // Second die (1-6)
        
        return numbers;
    }
    
    // Main game function
    function playDice(uint256 selectedSum, uint256 betAmount) external nonReentrant {
        require(selectedSum >= 2 && selectedSum <= 12, "Invalid sum selection");
        require(sumMultipliers[selectedSum] > 0, "Invalid sum selection");
        require(betAmount >= minBet && betAmount <= maxBet, "Bet amount out of range");
        require(usdeToken.balanceOf(msg.sender) >= betAmount, "Insufficient balance");
        
        // Calculate potential payout using the multiplier for the selected sum
        uint256 multiplier = sumMultipliers[selectedSum];
        uint256 potentialPayout = (betAmount * multiplier * (10000 - houseEdge)) / 10000;
        
        // Check if contract has enough balance for potential payout
        require(usdeToken.balanceOf(address(this)) >= potentialPayout, 
                "Insufficient contract balance");
        
        // Transfer bet amount from player to contract
        require(usdeToken.transferFrom(msg.sender, address(this), betAmount),
                "Transfer failed");
        
        // Generate random numbers and determine win/loss
        uint256[2] memory rolledNumbers = generateRandomNumbers();
        uint256 rolledSum = rolledNumbers[0] + rolledNumbers[1];
        uint256 payout = 0;
        
        if (rolledSum == selectedSum) {
            payout = potentialPayout;
            require(usdeToken.transfer(msg.sender, payout), "Payout transfer failed");
        }
        
        emit GamePlayed(msg.sender, selectedSum, rolledSum, rolledNumbers, betAmount, payout);
    }
    
    // Admin functions
    function withdrawFunds(uint256 amount) external onlyOwner {
        require(usdeToken.transfer(owner(), amount), "Withdrawal failed");
    }
    
    function setMinBet(uint256 _minBet) external onlyOwner {
        minBet = _minBet;
    }
    
    function setMaxBet(uint256 _maxBet) external onlyOwner {
        maxBet = _maxBet;
    }
    
    function setHouseEdge(uint256 _houseEdge) external onlyOwner {
        require(_houseEdge <= 1000, "House edge too high"); // Max 10%
        houseEdge = _houseEdge;
    }
    
    // New admin function to update multipliers if needed
    function setMultiplier(uint256 sum, uint256 multiplier) external onlyOwner {
        require(sum >= 2 && sum <= 12, "Invalid sum");
        require(multiplier > 0, "Multiplier must be greater than 0");
        sumMultipliers[sum] = multiplier;
    }
    
    // View functions
    function getContractBalance() external view returns (uint256) {
        return usdeToken.balanceOf(address(this));
    }
    
    function getMultiplier(uint256 sum) external view returns (uint256) {
        return sumMultipliers[sum];
    }
}







// DoubleDiceGameModule#DoubleDiceGame - 0x2839D26160d468af0af8eBa9b525832D4B95a1A5