const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
    const tokenAddress = "0x426E7d03f9803Dd11cb8616C65b99a3c0AfeA6dE";
    const token = await ethers.getContractAt("IERC20", tokenAddress);

    // Get signer
    const [signer] = await ethers.getSigners();
    console.log("Checking token with address:", await signer.getAddress());

    try {
        // Get token info
        const name = await token.name().catch(() => "Name not available");
        const symbol = await token.symbol().catch(() => "Symbol not available");
        const decimals = await token.decimals().catch(() => "Decimals not available");
        const totalSupply = await token.totalSupply().catch(() => "Total supply not available");
        
        console.log("\nToken Information:");
        console.log("Name:", name);
        console.log("Symbol:", symbol);
        console.log("Decimals:", decimals);
        console.log("Total Supply:", totalSupply.toString());

        // Check if contract has any public functions for minting or faucet
        const code = await ethers.provider.getCode(tokenAddress);
        console.log("\nContract deployed:", code !== "0x");

        // Get signer's balance
        const balance = await token.balanceOf(await signer.getAddress());
        console.log("\nYour balance:", ethers.formatEther(balance));

    } catch (error) {
        console.error("Error:", error);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
