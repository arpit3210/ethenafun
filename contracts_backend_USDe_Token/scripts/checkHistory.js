const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
    try {
        console.log("Investigating token transfers and approvals...");

        // Addresses
        const tokenAddress = "0x426E7d03f9803Dd11cb8616C65b99a3c0AfeA6dE";
        const gameAddress = "0xf6d43694D413Fd65Ec1fbC144a3e331B76671c72";
        const [signer] = await ethers.getSigners();
        const userAddress = signer.address;

        console.log("\nWallet address:", userAddress);
        console.log("Game contract:", gameAddress);
        console.log("Token contract:", tokenAddress);

        // Get contracts
        const token = await ethers.getContractAt("IERC20", tokenAddress);
        const game = await ethers.getContractAt("HeadOrTailTokenGame", gameAddress);

        // Check current balances
        const balance = await token.balanceOf(userAddress);
        console.log("\nCurrent USDe balance:", ethers.formatEther(balance));

        // Check allowance
        const allowance = await token.allowance(userAddress, gameAddress);
        console.log("Current allowance to game contract:", ethers.formatEther(allowance));

        // Get contract info
        const owner = await game.owner();
        console.log("\nGame contract owner:", owner);
        console.log("Is wallet owner?", owner.toLowerCase() === userAddress.toLowerCase());

        // Check if there was any topup
        const topupEvents = await game.queryFilter(game.filters.ContractTopUp());
        console.log("\nTop-up events:", topupEvents.length);
        for (const event of topupEvents) {
            console.log("- Amount:", ethers.formatEther(event.args.amount), "USDe");
            console.log("  From:", event.args.from);
        }

        // Check if there were any bets
        const betEvents = await game.queryFilter(game.filters.BetPlaced());
        console.log("\nBet events:", betEvents.length);
        for (const event of betEvents) {
            console.log("- Amount:", ethers.formatEther(event.args.amount), "USDe");
            console.log("  Player:", event.args.player);
            console.log("  Choice:", event.args.choice ? "HEAD" : "TAIL");
        }

    } catch (error) {
        console.error("Error during investigation:", error.message);
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
