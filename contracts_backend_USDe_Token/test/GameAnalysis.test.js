const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("HeadOrTailTokenGame Analysis", function () {
    let headOrTailGame;
    let gameToken;
    let owner;
    let player;
    let results = {
        totalGames: 0,
        wins: 0,
        losses: 0,
        bonusWins: 0,
        heads: 0,
        tails: 0,
        totalBet: BigInt(0),
        totalWon: BigInt(0)
    };

    beforeEach(async function () {
        [owner, player] = await ethers.getSigners();

        // Deploy mock ERC20 token
        const MockToken = await ethers.getContractFactory("MockERC20", owner);
        gameToken = await MockToken.deploy("Game Token", "GAME");
        await gameToken.waitForDeployment();

        // Deploy the game contract
        const HeadOrTailGame = await ethers.getContractFactory("HeadOrTailTokenGame", owner);
        headOrTailGame = await HeadOrTailGame.deploy(
            await gameToken.getAddress()
        );
        await headOrTailGame.waitForDeployment();

        // Mint tokens to player
        await gameToken.mint(player.address, ethers.parseEther("1000"));
        // Approve game contract
        await gameToken.connect(player).approve(await headOrTailGame.getAddress(), ethers.parseEther("1000"));
    });

    async function playGame(strategy) {
        const betAmount = ethers.parseEther("0.1"); // Using minimum bet
        let choice;

        switch(strategy) {
            case "alwaysHead":
                choice = true;
                break;
            case "alwaysTail":
                choice = false;
                break;
            case "alternate":
                choice = results.totalGames % 2 === 0;
                break;
            case "followPrevious":
                choice = results.heads >= results.tails;
                break;
            default:
                choice = Math.random() < 0.5;
        }

        const balanceBefore = await gameToken.balanceOf(player.address);
        const tx = await headOrTailGame.connect(player).play(choice);
        const receipt = await tx.wait();

        const event = receipt.logs.find(log => log.fragment?.name === "GameResult");
        if (event) {
            const [, , , isWinner, betAmountEvent, amountWon, bonus, isHead] = event.args;
            
            results.totalGames++;
            results.totalBet = results.totalBet + BigInt(betAmountEvent);
            
            if (isWinner) {
                results.wins++;
                results.totalWon = results.totalWon + BigInt(amountWon);
                if (bonus) results.bonusWins++;
            } else {
                results.losses++;
            }
            
            if (isHead) results.heads++;
            else results.tails++;
        }

        const balanceAfter = await gameToken.balanceOf(player.address);
        return {
            choice,
            balanceChange: balanceAfter - balanceBefore
        };
    }

    describe("Game Analysis", function () {
        const GAMES_PER_STRATEGY = 20;
        const strategies = ["alwaysHead", "alwaysTail", "alternate", "followPrevious", "random"];

        for (const strategy of strategies) {
            it(`Analysis of ${strategy} strategy`, async function () {
                console.log(`\n=== Testing ${strategy} strategy ===`);
                
                // Reset results for new strategy
                results = {
                    totalGames: 0,
                    wins: 0,
                    losses: 0,
                    bonusWins: 0,
                    heads: 0,
                    tails: 0,
                    totalBet: BigInt(0),
                    totalWon: BigInt(0)
                };

                for (let i = 0; i < GAMES_PER_STRATEGY; i++) {
                    await playGame(strategy);
                }

                // Calculate statistics
                const winRate = (results.wins / results.totalGames * 100).toFixed(2);
                const bonusRate = (results.bonusWins / results.totalGames * 100).toFixed(2);
                const headRate = (results.heads / results.totalGames * 100).toFixed(2);
                const totalBetEth = ethers.formatEther(results.totalBet.toString());
                const totalWonEth = ethers.formatEther(results.totalWon.toString());
                const roi = ((Number(totalWonEth) - Number(totalBetEth)) / Number(totalBetEth) * 100).toFixed(2);

                console.log(`Total Games: ${results.totalGames}`);
                console.log(`Wins: ${results.wins} (${winRate}%)`);
                console.log(`Losses: ${results.losses}`);
                console.log(`Bonus Wins: ${results.bonusWins} (${bonusRate}%)`);
                console.log(`Heads: ${results.heads} (${headRate}%)`);
                console.log(`Tails: ${results.tails} (${100-headRate}%)`);
                console.log(`Total Bet: ${totalBetEth} tokens`);
                console.log(`Total Won: ${totalWonEth} tokens`);
                console.log(`ROI: ${roi}%`);
            });
        }
    });
});
