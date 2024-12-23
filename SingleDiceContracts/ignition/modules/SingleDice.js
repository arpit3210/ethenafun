const { ethers } = require("hardhat");


const main = async () => {
  // Get contract factory
  const SingleDiceGame = await ethers.getContractFactory("SingleDiceGame");
  
  // Deploy contract with constructor arguments
  const singleDiceGame = await SingleDiceGame.deploy(
    "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0", // USDE token address
    "100000000000000000", // minBet (0.1 USDE)
    "500000000000000000", // maxBet (0.5 USDE)
    20 // houseEdge (0.2%)
  );

  await singleDiceGame.waitForDeployment();
  console.log("SingleDiceGame deployed to:", singleDiceGame.target);
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });