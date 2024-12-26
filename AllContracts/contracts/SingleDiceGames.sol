// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract SingleDiceGame is Ownable, ReentrancyGuard {
    IERC20 public usdeToken;
    uint256 public minBet;
    uint256 public maxBet;
    uint256 public houseEdge; // In basis points (1/100 of a percent)
    
    event GamePlayed(
        address indexed player,
        uint256 selectedNumber,
        uint256 rolledNumber,
        uint256 betAmount,
        uint256 payout
    );
    
    constructor(
        address _usdeToken,
        uint256 _minBet,
        uint256 _maxBet,
        uint256 _houseEdge
    ) Ownable(msg.sender) {  // Pass msg.sender as the initial owner
        usdeToken = IERC20(_usdeToken);
        minBet = _minBet;
        maxBet = _maxBet;
        houseEdge = _houseEdge;
    }
    
    // Function to generate a pseudo-random number
    function generateRandomNumber() private view returns (uint256) {
        return uint256(
            keccak256(
                abi.encodePacked(
                    block.timestamp,
                    block.prevrandao, // Updated from block.difficulty which is deprecated
                    msg.sender
                )
            )
        ) % 6 + 1; // Returns 1-6
    }
    
    // Main game function
    function playDice(uint256 selectedNumber, uint256 betAmount) external nonReentrant {
        require(selectedNumber >= 1 && selectedNumber <= 6, "Invalid number selection");
        require(betAmount >= minBet && betAmount <= maxBet, "Bet amount out of range");
        require(usdeToken.balanceOf(msg.sender) >= betAmount, "Insufficient balance");
        
        // Calculate potential payout (5x for winning)
        uint256 potentialPayout = (betAmount * 5 * (10000 - houseEdge)) / 10000;
        
        // Check if contract has enough balance for potential payout
        require(usdeToken.balanceOf(address(this)) >= potentialPayout, 
                "Insufficient contract balance");
        
        // Transfer bet amount from player to contract
        require(usdeToken.transferFrom(msg.sender, address(this), betAmount),
                "Transfer failed");
        
        // Generate random number and determine win/loss
        uint256 rolledNumber = generateRandomNumber();
        uint256 payout = 0;
        
        if (rolledNumber == selectedNumber) {
            payout = potentialPayout;
            require(usdeToken.transfer(msg.sender, payout), "Payout transfer failed");
        }
        
        emit GamePlayed(msg.sender, selectedNumber, rolledNumber, betAmount, payout);
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
    
    // View functions
    function getContractBalance() external view returns (uint256) {
        return usdeToken.balanceOf(address(this));
    }
}