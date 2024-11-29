const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
    console.log("Starting safe deployment process...");

    // Get token address
    const tokenAddress = "0x426E7d03f9803Dd11cb8616C65b99a3c0AfeA6dE";
    console.log("Using existing token at:", tokenAddress);

    // Deploy VRF Coordinator
    const VRFCoordinator = await ethers.getContractFactory("MockVRFCoordinatorV2");
    const coordinator = await VRFCoordinator.deploy();
    await coordinator.waitForDeployment();
    console.log("MockVRFCoordinator deployed to:", coordinator.target);

    // Deploy Game Contract
    const Game = await ethers.getContractFactory("HeadOrTailTokenGame");
    const game = await Game.deploy(coordinator.target, tokenAddress);
    await game.waitForDeployment();
    console.log("HeadOrTailTokenGame deployed to:", game.target);

    // Get deployer's token balance
    const token = await ethers.getContractAt("IERC20", tokenAddress);
    const [deployer] = await ethers.getSigners();
    const balance = await token.balanceOf(deployer.address);
    console.log("\nYour current USDe balance:", ethers.formatEther(balance));

    console.log("\nDeployment completed successfully!");
    console.log("No automatic token transfers were made.");
    console.log("\nTo play the game:");
    console.log("1. Approve exactly 0.1 USDe for betting");
    console.log("2. Call play() with your choice (true for HEAD, false for TAIL)");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
