const hre = require("hardhat");

async function main() {
  console.log("Deploying Mock USDe token...");

  const MockUSDe = await hre.ethers.getContractFactory("MockUSDe");
  const mockUSDe = await MockUSDe.deploy();

  await mockUSDe.waitForDeployment();

  console.log("Mock USDe deployed to:", await mockUSDe.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
