// const { ethers } = require("hardhat");


// const main = async () => {
//   // Get contract factory
//   const SingleDiceGame = await ethers.getContractFactory("SingleDiceGame");
  
//   // Deploy contract with constructor arguments
//   const singleDiceGame = await SingleDiceGame.deploy(
//     "0x426E7d03f9803Dd11cb8616C65b99a3c0AfeA6dE", // USDE token address
//     "100000000000000000", // minBet (0.1 USDE)
//     "500000000000000000", // maxBet (0.5 USDE)
//     20 // houseEdge (0.2%)
//   );

//   await singleDiceGame.waitForDeployment();
//   console.log("SingleDiceGame deployed to:", singleDiceGame.target);
// };


const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("SingleDiceModule", (m) => {
  const usdETokenAddress = "0x426E7d03f9803Dd11cb8616C65b99a3c0AfeA6dE";
  const minBet = "100000000000000000"; // 0.1 USDE
  const maxBet = "500000000000000000"; // 0.5 USDE
  const houseEdge = 20; // 0.2%

  const singleDiceGame = m.contract("SingleDiceGame", [
    usdETokenAddress,
    minBet,
    maxBet,
    houseEdge
  ]);

  return { singleDiceGame };
});

// main()
//   .then(() => process.exit(0))
//   .catch((error) => {
//     console.error(error);
//     process.exit(1);
//   });




// Contract Deployment Details 

// PS D:\2-6_plan_work daily\Web3 Projects\Ethena-Hackathon-project\ethenafun\AllContracts> npx hardhat ignition deploy ./ignition/modules/SingleDice.js --network   ethenaTestnet
// √ Confirm deploy to network ethenaTestnet (52085143)? ... yes
// Hardhat Ignition 🚀

// Deploying [ SingleDiceModule ]

// Batch #1
//   Executed SingleDiceModule#SingleDiceGame

// [ SingleDiceModule ] successfully deployed 🚀

// Deployed Addresses

// SingleDiceModule#SingleDiceGame - 0xee0B9D2d0227bBDe74652784EF9d47F78255b517