const hre = require("hardhat");

async function main() {
    // Use existing token contract
    const GAME_TOKEN_ADDRESS = "0x426E7d03f9803Dd11cb8616C65b99a3c0AfeA6dE";
    console.log("Using existing token at:", GAME_TOKEN_ADDRESS);

    // Deploy Mock VRF Coordinator
    const MockVRFCoordinator = await hre.ethers.getContractFactory("MockVRFCoordinatorV2Simple");
    const mockVRF = await MockVRFCoordinator.deploy();
    await mockVRF.waitForDeployment();
    console.log("MockVRFCoordinator deployed to:", await mockVRF.getAddress());

    // Deploy HeadOrTailTokenGame with Mock VRF
    const HeadOrTailGame = await hre.ethers.getContractFactory("HeadOrTailTokenGame");
    const game = await HeadOrTailGame.deploy(
        await mockVRF.getAddress(),
        GAME_TOKEN_ADDRESS
    );
    await game.waitForDeployment();

    console.log("HeadOrTailTokenGame deployed to:", await game.getAddress());

    // Verify contracts on block explorer (optional)
    console.log("Verifying contracts on block explorer...");
    try {
        await hre.run("verify:verify", {
            address: await mockVRF.getAddress(),
            constructorArguments: [],
        });
        
        await hre.run("verify:verify", {
            address: await game.getAddress(),
            constructorArguments: [
                await mockVRF.getAddress(),
                GAME_TOKEN_ADDRESS
            ],
        });
        console.log("Contracts verified successfully");
    } catch (error) {
        console.log("Error verifying contracts:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
