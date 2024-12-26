
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// Import the playDiceGame function
const playDiceGame = require("./ignition/modules/PlayGame");
const fundContract = require("./ignition/modules/FundContract");
const fundDoubleDiceGame = require("./ignition/modules/DoubleDiceScripts/FundContract");
const playDoubleDiceGame = require("./ignition/modules/DoubleDiceScripts/PlayDoubleDiceGame");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    hardhat: {
      chainId: 31337,
    },
    ethenaTestnet: {
      url: "https://testnet.rpc.ethena.fi",
      chainId: 52085143,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  allowUnlimitedContractSize: true
};

// Add a custom task to run the game
task("play-dice", "Play the Dice Game")
  .setAction(async () => {
    await playDiceGame();
  });

// Add a custom task to fund the contract
task("fund-contract", "Fund the Contract")
  .setAction(async () => {
    await fundContract();   // Change the value of fund to be the amount you want to send to smart contract
  });


  // Add a custom task to fund the contract of double dice
task("fund-double-dice-contract", "Fund the Double Dice Contract")
.setAction(async () => {
  await fundDoubleDiceGame();   // Change the value of fund to be the amount you want to send to smart contract
});


// Add a custom task to play the double dice game
task("play-double-dice", "Play the Double Dice Game")
.setAction(async () => {
  await playDoubleDiceGame();
});


// write commadd to run the task
// npx hardhat play-double-dice --network ethenaTestnet
// npx hardhat fund-double-dice-contract  --network ethenaTestnet