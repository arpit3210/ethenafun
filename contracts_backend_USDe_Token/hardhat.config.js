require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",
  networks: {
    hardhat: {
      chainId: 31337,
    },
    ethenaTestnet: {
      url: "https://testnet.rpc.ethena.fi",
      chainId: 52085143,
      accounts: [process.env.PRIVATE_KEY],
      gasPrice: 20000000000, // 20 Gwei
    },
    // Add other networks as needed
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  allowUnlimitedContractSize: true
};
