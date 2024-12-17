const hre = require("hardhat");
const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
    console.log("Starting HeadOrTailTokenGame deployment process...");

    // Get token address
    const tokenAddress = "0x426E7d03f9803Dd11cb8616C65b99a3c0AfeA6dE";
    console.log("Using existing USDe token at:", tokenAddress);

    // Get deployer
    const [deployer] = await ethers.getSigners();
    console.log("Deploying from address:", deployer.address);

    // Deploy Game Contract
    const Game = await ethers.getContractFactory("HeadOrTailTokenGame");
    const game = await Game.deploy(tokenAddress);
    await game.waitForDeployment();
    
    console.log("HeadOrTailTokenGame deployed to:", game.target);

    // Safely get deployer's token balance
    let balance = "Unknown";
    try {
        const token = await ethers.getContractAt("IERC20", tokenAddress);
        balance = await token.balanceOf(deployer.address);
        console.log("Your current USDe balance:", ethers.formatEther(balance));
    } catch (error) {
        console.warn("Could not retrieve token balance:", error.message);
    }

    // Save deployment details
    const deploymentInfo = {
        tokenName: "USDe",
        tokenAddress: tokenAddress,
        contractName: "HeadOrTailTokenGame",
        contractAddress: game.target,
        deployer: deployer.address,
        deploymentTimestamp: new Date().toISOString(),
        balance: balance.toString()
    };
    
    const outputDir = path.join(__dirname, '..', 'contracts_4deployed.md');
    fs.writeFileSync(outputDir, 
        `# Deployment Details

## Token Information
- **Name**: ${deploymentInfo.tokenName}
- **Address**: \`${deploymentInfo.tokenAddress}\`

## Game Contract Information
- **Name**: ${deploymentInfo.contractName}
- **Address**: \`${deploymentInfo.contractAddress}\`
- **Deployer**: \`${deploymentInfo.deployer}\`
- **Deployment Time**: ${deploymentInfo.deploymentTimestamp}

## Deployment Notes
Deployed on Ethena chain.

## Balance Information
- **Deployer Balance**: ${balance === "Unknown" ? "Could not retrieve" : ethers.formatEther(balance) + " USDe"}

## Game Instructions
1. Approve exactly 0.1 USDe for betting
2. Call play() with your choice (true for HEAD, false for TAIL)
`, 'utf-8');

    console.log("\nDeployment completed successfully!");
    console.log("Deployment details saved to contracts_4deployed.md");
    console.log("\nTo play the game:");
    console.log("1. Approve exactly 0.1 USDe for betting");
    console.log("2. Call play() with your choice (true for HEAD, false for TAIL)");

    return game;
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });