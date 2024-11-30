const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
    try {
        console.log("Starting fund recovery process...");

        // Get contracts
        const gameAddress = "0xf6d43694D413Fd65Ec1fbC144a3e331B76671c72";
        const tokenAddress = "0x426E7d03f9803Dd11cb8616C65b99a3c0AfeA6dE";
        
        const game = await ethers.getContractAt("HeadOrTailTokenGame", gameAddress);
        const token = await ethers.getContractAt("IERC20", tokenAddress);

        // Get current balances
        const contractBalance = await token.balanceOf(gameAddress);
        console.log("\nContract USDe balance:", ethers.formatEther(contractBalance));

        if (contractBalance > 0) {
            console.log("\nWithdrawing funds from contract...");
            const withdrawTx = await game.withdrawFunds();
            await withdrawTx.wait();
            console.log("Withdrawal complete!");

            // Check new balances
            const newContractBalance = await token.balanceOf(gameAddress);
            const [signer] = await ethers.getSigners();
            const newWalletBalance = await token.balanceOf(signer.address);

            console.log("\nNew balances:");
            console.log("Contract:", ethers.formatEther(newContractBalance), "USDe");
            console.log("Your wallet:", ethers.formatEther(newWalletBalance), "USDe");
        } else {
            console.log("\nNo funds in contract to withdraw");
        }

    } catch (error) {
        console.error("Error during recovery:", error.message);
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
