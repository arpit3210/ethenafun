const { ethers } = require("hardhat");

async function main() {
  try {
    // Get the contract factory
    const EthenaUSDe = await ethers.getContractFactory("EthenaUSDe");
    
    // Get the deployer's address
    const [deployer] = await ethers.getSigners();
    console.log("Deploying EthenaUSDe with account:", deployer.address);

    // Deploy the contract with the deployer as initial owner
    const ethenaUSDe = await EthenaUSDe.deploy(deployer.address);
    await ethenaUSDe.waitForDeployment(); // Wait for the contract to be deployed();

    console.log("EthenaUSDe deployed to:", ethenaUSDe.target);
    console.log("Owner address:", await ethenaUSDe.owner());
    console.log("Total supply:", (await ethenaUSDe.totalSupply()).toString());

  } catch (error) {
    console.error("Error during deployment:", error);
    process.exit(1);
  }
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });