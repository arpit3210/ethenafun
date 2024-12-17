const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
    try {
        console.log("Checking transaction history...");

        // Get contracts and addresses
        const [signer] = await ethers.getSigners();
        const userAddress = signer.address;
        const tokenAddress = "0x426E7d03f9803Dd11cb8616C65b99a3c0AfeA6dE";
        const gameAddress = "0xf6d43694D413Fd65Ec1fbC144a3e331B76671c72";

        console.log("\nYour address:", userAddress);
        console.log("Token address:", tokenAddress);
        console.log("Game address:", gameAddress);

        // Get token contract
        const token = await ethers.getContractAt("IERC20", tokenAddress);

        // Get transfer events TO the game contract
        const transferFilter = token.filters.Transfer(userAddress, gameAddress);
        const transferEvents = await token.queryFilter(transferFilter);

        console.log("\nTransfers TO game contract:");
        for (const event of transferEvents) {
            console.log("- Amount:", ethers.formatEther(event.args.value), "USDe");
            console.log("  Transaction:", event.transactionHash);
        }

        // Get transfer events FROM the game contract
        const withdrawFilter = token.filters.Transfer(gameAddress, userAddress);
        const withdrawEvents = await token.queryFilter(withdrawFilter);

        console.log("\nTransfers FROM game contract:");
        for (const event of withdrawEvents) {
            console.log("- Amount:", ethers.formatEther(event.args.value), "USDe");
            console.log("  Transaction:", event.transactionHash);
        }

    } catch (error) {
        console.error("Error checking history:", error.message);
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
