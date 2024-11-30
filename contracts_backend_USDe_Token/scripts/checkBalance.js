const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
    try {
        console.log("Checking contract balances...");

        // Contract addresses
        const gameAddress = "0xf6d43694D413Fd65Ec1fbC144a3e331B76671c72";
        const tokenAddress = "0x426E7d03f9803Dd11cb8616C65b99a3c0AfeA6dE";

        // Get contracts
        const game = await ethers.getContractAt("HeadOrTailTokenGame", gameAddress);
        const token = await ethers.getContractAt("IERC20", tokenAddress);

        // Check native balance
        const ethBalance = await ethers.provider.getBalance(gameAddress);
        console.log("Native ETH balance:", ethers.formatEther(ethBalance), "ETH");

        // Check token balance
        const tokenBalance = await token.balanceOf(gameAddress);
        console.log("USDe token balance:", ethers.formatEther(tokenBalance), "USDe");

        if (tokenBalance > 0) {
            console.log("\nAttempting to withdraw tokens...");
            const withdrawTx = await game.withdrawAll();
            await withdrawTx.wait();
            console.log("Withdrawal transaction completed!");

            // Verify new balance
            const newBalance = await token.balanceOf(gameAddress);
            console.log("New token balance:", ethers.formatEther(newBalance), "USDe");
        }

    } catch (error) {
        console.error("Error:", error.message);
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
