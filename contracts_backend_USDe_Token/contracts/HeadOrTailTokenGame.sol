// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract HeadOrTailTokenGame is Ownable {
    // Token contract
    IERC20 public gameToken;

    uint256 private gameCount;
    uint256 private rtp = 17;        // 1.7x for normal win
    uint256 private bonus = 22;      // 2.2x for bonus win
    uint256 private bonusRate = 4;   // 4% chance for bonus
    uint256 private totalHead;
    uint256 private totalTail;

    uint256 private constant DECIMALS = 10 ** 18;
    uint256[] public allowedBetAmounts;

    event GameResult(
        address indexed player,
        uint256 gameId,
        bool isWinner,
        uint256 betAmount,
        uint256 amountWon,
        bool bonus,
        bool isHead
    );

    constructor(address _gameTokenAddress) {
        gameToken = IERC20(_gameTokenAddress);

        allowedBetAmounts = [
            0.1 * 10**18,    // 0.1 tokens
            0.2 * 10**18,    // 0.2 tokens
            0.3 * 10**18,    // 0.3 tokens
            0.4 * 10**18,    // 0.4 tokens
            0.5 * 10**18     // 0.5 tokens
        ];
    }

    function play(bool choice) external returns (bool) {
        // Validate bet amount
        require(
            isAllowedBetAmount(msg.sender),
            "Please send correct amount to play the game."
        );

        // Transfer tokens from player to contract
        uint256 betAmount = getAllowedBetAmount(msg.sender);
        require(
            gameToken.transferFrom(msg.sender, address(this), betAmount),
            "Token transfer failed"
        );

        // Generate random result using block data
        uint256 randomNumber = uint256(
            keccak256(
                abi.encodePacked(
                    block.timestamp,
                    block.prevrandao,
                    msg.sender,
                    gameCount
                )
            )
        ) % 100;

        bool result = randomNumber % 2 == 0;  // Even = Head, Odd = Tail
        bool isWinner = (result == choice);
        bool bonusRound = randomNumber < bonusRate;

        result ? totalHead++ : totalTail++;
        uint256 amountWon = 0;

        if (isWinner) {
            // Calculate winnings
            amountWon = multiply(
                betAmount,
                (DECIMALS * (bonusRound ? bonus : rtp)) / 10
            );

            // Ensure contract has enough tokens
            uint256 contractBalance = gameToken.balanceOf(address(this));
            if (amountWon > contractBalance) {
                amountWon = contractBalance;
            }
            
            // Transfer winnings to player
            require(
                gameToken.transfer(msg.sender, amountWon),
                "Winnings transfer failed"
            );
        }

        gameCount++;
        emit GameResult(
            msg.sender,
            gameCount,
            isWinner,
            betAmount,
            amountWon,
            bonusRound,
            result
        );

        return isWinner;
    }

    // Withdraw tokens (only by owner)
    function withdrawFunds() public onlyOwner {
        uint256 balance = gameToken.balanceOf(address(this));
        require(balance > 0, "Contract balance is empty.");
        require(
            gameToken.transfer(owner(), balance),
            "Withdrawal failed"
        );
    }

    // Get contract token balance
    function getBalance() public view returns (uint256) {
        return gameToken.balanceOf(address(this));
    }

    // Top up contract balance
    function topUpBalance(uint256 amount) public {
        require(
            gameToken.transferFrom(msg.sender, address(this), amount),
            "Top-up failed"
        );
    }

    function multiply(uint256 a, uint256 b) private pure returns (uint256) {
        uint256 result = (a * b) / DECIMALS;
        return result;
    }

    function isAllowedBetAmount(address player) private view returns (bool) {
        return getAllowedBetAmount(player) > 0;
    }

    function getAllowedBetAmount(address player) private view returns (uint256) {
        for (uint256 i = 0; i < allowedBetAmounts.length; i++) {
            uint256 amount = allowedBetAmounts[i];
            if (gameToken.allowance(player, address(this)) >= amount) {
                return amount;
            }
        }
        return 0;
    }

    // Getters for game parameters
    function getRtp() public view returns (uint256) {
        return rtp;
    }

    function setRtp(uint256 _rtp) public onlyOwner {
        rtp = _rtp;
    }

    function getBonus() public view returns (uint256) {
        return bonus;
    }

    function setBonus(uint256 _bonus) public onlyOwner {
        bonus = _bonus;
    }

    function getTotalHead() public view returns (uint256) {
        return totalHead;
    }

    function getTotalTail() public view returns (uint256) {
        return totalTail;
    }
}
