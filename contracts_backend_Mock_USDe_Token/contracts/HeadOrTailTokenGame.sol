// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface ISimpleVRF {
    function requestRandomWords(
        bytes32 keyHash,
        uint64 subId,
        uint16 minimumRequestConfirmations,
        uint32 callbackGasLimit,
        uint32 numWords
    ) external returns (uint256);
}

contract HeadOrTailTokenGame is Ownable {
    // Token contract
    IERC20 public gameToken;
    ISimpleVRF private immutable i_vrfCoordinator;

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
        uint256 indexed requestId,
        uint gameId,
        bool isWinner,
        uint betAmount,
        uint amountWon,
        bool bonus,
        bool isHead
    );

    struct GameStatus {
        uint256 fees;
        uint256 randomWord;
        address player;
        bool isWinner;
        bool fulfilled;
        bool isHead;
        uint256 betAmount;
    }
    mapping(uint256 => GameStatus) public gameStatus;

    event RequestedRandomNumber(uint256 indexed requestId);

    constructor(
        address _vrfCoordinator,
        address _gameTokenAddress
    ) {
        i_vrfCoordinator = ISimpleVRF(_vrfCoordinator);
        gameToken = IERC20(_gameTokenAddress);

        allowedBetAmounts = [
            1 * 10**18,    // 1 tokens
            2 * 10**18,    // 2 tokens
            3 * 10**18,    // 3 tokens
            4 * 10**18,    // 4 tokens
            5 * 10**18     // 5 tokens
        ];
    }

    function play(bool choice) external returns (uint256) {
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

        // Request random number
        uint256 requestId = i_vrfCoordinator.requestRandomWords(
            0x0000000000000000000000000000000000000000000000000000000000000000, // dummy keyHash
            0, // dummy subId
            1, // dummy confirmations
            100000, // dummy gas limit
            1 // numWords
        );

        // Store game status
        gameStatus[requestId] = GameStatus({
            fees: 0,
            randomWord: 0,
            player: msg.sender,
            isWinner: false,
            fulfilled: false,
            isHead: choice,
            betAmount: betAmount
        });

        emit RequestedRandomNumber(requestId);
        return requestId;
    }

    function rawFulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) external {
        require(msg.sender == address(i_vrfCoordinator), "Only VRF can fulfill");
        fulfillRandomWords(requestId, randomWords);
    }

    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) internal {
        gameStatus[requestId].fulfilled = true;
        gameStatus[requestId].randomWord = randomWords[0];

        uint256 randomNumber = randomWords[0] % 100;

        bool result = randomNumber % 2 == 0;
        bool isWinner = (result == gameStatus[requestId].isHead);
        bool bonusRound = randomNumber < bonusRate;

        result ? totalHead++ : totalTail++;
        uint256 amountWon = 0;

        if (isWinner) {
            // Calculate winnings
            amountWon = multiply(
                gameStatus[requestId].betAmount,
                (DECIMALS * (bonusRound ? bonus : rtp)) / 10
            );

            // Ensure contract has enough tokens
            uint256 contractBalance = gameToken.balanceOf(address(this));
            if (amountWon > contractBalance) {
                amountWon = contractBalance;
            }

            gameStatus[requestId].isWinner = true;
            
            // Transfer winnings to player
            require(
                gameToken.transfer(gameStatus[requestId].player, amountWon),
                "Winnings transfer failed"
            );
        }

        gameCount++;
        emit GameResult(
            gameStatus[requestId].player,
            requestId,
            gameCount,
            isWinner,
            gameStatus[requestId].betAmount,
            amountWon,
            bonusRound,
            result
        );
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
