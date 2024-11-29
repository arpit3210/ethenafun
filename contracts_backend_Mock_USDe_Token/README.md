# Head or Tail Token Game 🎮

A blockchain-based gambling game where players can bet ERC20 tokens (USDe) on Head or Tail outcomes. The game uses Chainlink VRF for verifiable random results.

## Table of Contents
- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Game Rules](#game-rules)
- [How to Play](#how-to-play)
  - [Local Testing](#local-testing)
  - [Playing on Real Network](#playing-on-real-network)
- [Smart Contracts](#smart-contracts)
- [Deployment](#deployment)
- [Using with Existing ERC20 Tokens](#using-with-existing-erc20-tokens)
- [Security Considerations](#security-considerations)
- [Troubleshooting](#troubleshooting)

## Overview

The Head or Tail Token Game is a simple yet exciting gambling game where:
- Players bet USDe tokens on either Head (true) or Tail (false)
- Winners receive 1.7x their bet amount
- Lucky winners (4% chance) receive 2.2x their bet amount
- Results are determined using Chainlink VRF for fairness
- Supported bet amounts: 1, 2, 3, 4, or 5 tokens

## Prerequisites

1. Node.js (v14+ recommended)
2. NPM or Yarn
3. Git
4. MetaMask or similar Web3 wallet
5. Basic understanding of blockchain transactions
6. USDe tokens for betting

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd contracts_backend_Mock_USDe_Token
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your values:
PRIVATE_KEY=your_private_key
ETHERSCAN_API_KEY=your_etherscan_key
NETWORK_RPC_URL=your_network_rpc
```

## Game Rules

1. Betting:
   - Minimum bet: 1 USDe token
   - Maximum bet: 5 USDe tokens
   - Only allowed amounts: 1, 2, 3, 4, or 5 tokens

2. Winning:
   - Normal win: 1.7x bet amount
   - Bonus win (4% chance): 2.2x bet amount

3. Token Approval:
   - Players must approve the game contract to spend their USDe tokens
   - Approval amount should be at least the bet amount

## How to Play

### Local Testing

1. Start local Hardhat node:
```bash
npx hardhat node
```

2. Deploy contracts and run test games:
```bash
npx hardhat run scripts/deploy-and-play.js --network localhost
```

3. Interact using Hardhat console:
```bash
npx hardhat console --network localhost

// Get contract instances
const Game = await ethers.getContractFactory("HeadOrTailTokenGame")
const game = await Game.attach("DEPLOYED_GAME_ADDRESS")
const token = await ethers.getContractAt("IERC20", "TOKEN_ADDRESS")

// Approve tokens
await token.approve(game.address, ethers.parseEther("10"))

// Play game (true for Head, false for Tail)
await game.play(true)
```

### Playing on Real Network

1. Deploy to your chosen network (e.g., Ethereum, Polygon):
```bash
npx hardhat run scripts/deploy.js --network <network-name>
```

2. Using MetaMask:
   - Add the game contract address to MetaMask
   - Ensure you have USDe tokens in your wallet
   - Approve the game contract to spend your tokens
   - Call the play() function with your choice

3. Using a frontend (if available):
   - Connect your wallet
   - Select bet amount (1-5 tokens)
   - Choose Head or Tail
   - Confirm transaction
   - Wait for result

## Using with Existing ERC20 Tokens

To use the game with an already deployed ERC20 token:

1. Deploy only the game contract:
```bash
npx hardhat run scripts/deploy-game-only.js --network <network-name>
```

2. Constructor parameters needed:
   - VRF Coordinator address (get from Chainlink docs for your network)
   - Token address (your ERC20 token address)

3. Example deployment script:
```javascript
const GameFactory = await ethers.getContractFactory("HeadOrTailTokenGame")
const game = await GameFactory.deploy(
    "VRF_COORDINATOR_ADDRESS",
    "YOUR_TOKEN_ADDRESS"
)
await game.deployed()
```

4. Verify contract on Etherscan:
```bash
npx hardhat verify --network <network-name> DEPLOYED_GAME_ADDRESS "VRF_COORDINATOR_ADDRESS" "TOKEN_ADDRESS"
```

## Smart Contracts

1. HeadOrTailTokenGame.sol:
   - Main game logic
   - Handles bets and winnings
   - Integrates with Chainlink VRF

2. MockUSDe.sol (for testing):
   - ERC20 token implementation
   - Includes faucet for testing

3. MockVRFCoordinator.sol (for testing):
   - Simulates Chainlink VRF
   - Provides random numbers locally

## Security Considerations

1. Token Approval:
   - Only approve what you plan to bet
   - Revoke approval after playing
   - Use incremental approval when possible

2. Transaction Safety:
   - Wait for transaction confirmation
   - Check gas prices
   - Verify contract addresses

3. Risk Management:
   - Only bet what you can afford to lose
   - Start with smaller bets
   - Monitor your win/loss ratio

## Troubleshooting

1. Transaction Failed:
   - Check token approval
   - Verify token balance
   - Ensure bet amount is allowed
   - Check network gas prices

2. Result Not Showing:
   - Wait for VRF callback
   - Check transaction status
   - Verify network connection

3. Common Errors:
   - "Insufficient allowance": Need to approve tokens
   - "Invalid bet amount": Use allowed amounts only
   - "Transfer failed": Check token balance

## Support

For issues or questions:
1. Check the troubleshooting guide
2. Review transaction on block explorer
3. Contact support team
4. Check GitHub issues

## License

MIT License - see LICENSE file for details
