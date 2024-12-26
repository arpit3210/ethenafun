const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("DoubleDiceGameModule", (m) => {
  const usdETokenAddress = "0x426E7d03f9803Dd11cb8616C65b99a3c0AfeA6dE";
  const minBet = "100000000000000000"; // 0.1 USDE
  const maxBet = "500000000000000000"; // 0.5 USDE
  const houseEdge = 20; // 0.2%

  const DoubleDiceGame = m.contract("DoubleDiceGame", [
    usdETokenAddress,
    minBet,
    maxBet,
    houseEdge
  ]);

  return { DoubleDiceGame };
});




// command to run this module
// npx hardhat run --network ethenaTestnet ignition/modules/DeployDoubleDiceGame.js
//  npx hardhat ignition deploy ./ignition/modules/DeployDoubleDiceGame.js --network   ethenaTestnet