const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
    try {
        console.log("Starting withdrawal process...");

        // Get the contract
        const gameAddress = "0xf6d43694D413Fd65Ec1fbC144a3e331B76671c72";
        const game = await ethers.getContractAt("HeadOrTailTokenGame", gameAddress);

        // Get current balance
        const balance = await game.getBalance();
        console.log("Current contract balance:", ethers.formatEther(balance), "USDe");

        if (balance <= 0) {
            console.log("Contract has no balance to withdraw");
            return;
        }

        // Withdraw all funds
        console.log("Withdrawing all funds...");
        const withdrawTx = await game.withdrawAll();
        await withdrawTx.wait();

        // Verify new balance
        const newBalance = await game.getBalance();
        console.log("New contract balance:", ethers.formatEther(newBalance), "USDe");
        console.log("Withdrawal complete!");

    } catch (error) {
        console.error("Error during withdrawal:", error.message);
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
