const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
    try {
        console.log("Starting safe game interaction...");

        // Contract addresses
        const gameAddress = "0x7D1A99766f38e09ccE1936EC22eE3B6C55d8902c";  // Latest deployment
        const tokenAddress = "0x426E7d03f9803Dd11cb8616C65b99a3c0AfeA6dE";

        // Get contracts
        const game = await ethers.getContractAt("HeadOrTailTokenGame", gameAddress);
        const token = await ethers.getContractAt("IERC20", tokenAddress);

        // Get user address
        const [signer] = await ethers.getSigners();
        const userAddress = signer.address;

        // Check current balances
        const balance = await token.balanceOf(userAddress);
        console.log("\nYour current balance:", ethers.formatEther(balance), "USDe");

        // Check current allowance
        const currentAllowance = await token.allowance(userAddress, gameAddress);
        console.log("Current allowance:", ethers.formatEther(currentAllowance), "USDe");

        // Only approve if needed
        const betAmount = ethers.parseEther("0.1");  // Minimum bet amount
        if (currentAllowance < betAmount) {
            console.log("\nApproving exactly 0.1 USDe for betting...");
            const approveTx = await token.approve(gameAddress, betAmount);
            await approveTx.wait();
            console.log("Approval complete!");
        }

        // Confirm user wants to play
        console.log("\nReady to play!");
        console.log("Bet amount: 0.1 USDe");
        console.log("Choice: HEAD (true)");
        console.log("This will use exactly 0.1 USDe from your balance");

        // Place bet
        console.log("\nPlacing bet...");
        const playTx = await game.play(true);  // true for HEAD
        const receipt = await playTx.wait();

        // Get game result from events
        const gameResultEvent = receipt.logs.find(
            log => log.fragment && log.fragment.name === 'GameResult'
        );

        if (gameResultEvent) {
            const { isWinner, amountWon, bonus } = gameResultEvent.args;
            console.log("\nGame Result:");
            console.log("Winner:", isWinner);
            if (isWinner) {
                console.log("Amount won:", ethers.formatEther(amountWon), "USDe");
                console.log("Bonus win:", bonus);
            }
        }

        // Check final balance
        const finalBalance = await token.balanceOf(userAddress);
        console.log("\nFinal balance:", ethers.formatEther(finalBalance), "USDe");

    } catch (error) {
        console.error("Error during game play:", error.message);
        if (error.data) {
            console.error("Error data:", error.data);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
