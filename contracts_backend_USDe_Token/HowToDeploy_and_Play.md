# How to Deploy and Play with USDe Token

## What is USDe Token?

USDe Token is a fully collateralized stablecoin project built on the Ethereum blockchain, developed as part of the Ethena ecosystem. It maintains a stable 1:1 peg with the US Dollar through a sophisticated collateralization mechanism and integrates seamlessly with the Ethena protocol.

## Setting Up the Project

### Prerequisites

1. **Node.js and npm**
   - Download and install Node.js (v14.0.0 or later) from [nodejs.org](https://nodejs.org/)
   - npm (Node Package Manager) comes bundled with Node.js

2. **Code Editor**
   - We recommend [Visual Studio Code](https://code.visualstudio.com/) with Solidity extensions

3. **Crypto Wallet**
   - Install [MetaMask](https://metamask.io/) browser extension
   - Create or import a wallet
   - Add some test ETH from a faucet for deployment

4. **Git**
   - Install from [git-scm.com](https://git-scm.com/)

### Project Setup

1. **Clone the Repository**
   ```bash
   git clone [your-repository-url]
   cd contracts_backend_USDe_Token
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   - Create a `.env` file in the project root
   ```env
   PRIVATE_KEY=your_wallet_private_key
   INFURA_API_KEY=your_infura_api_key
   ETHERSCAN_API_KEY=your_etherscan_api_key
   ```

## Understanding the Project Structure

### Key Files

1. **Smart Contracts** (`/contracts`)
   - `USDe.sol`: Main USDe token contract
   - `Collateral.sol`: Handles collateral management
   - `Oracle.sol`: Price feed integration

2. **Deployment Scripts** (`/scripts`)
   - `deploy.js`: Main deployment script
   - `verify.js`: Contract verification script

3. **Test Files** (`/test`)
   - Contains comprehensive test suites

## Deployment Guide

### Local Development Network

1. **Start Local Network**
   ```bash
   npx hardhat node
   ```

2. **Deploy Contracts**
   ```bash
   npx hardhat run scripts/deploy.js --network localhost
   ```

### Testnet Deployment (Ethena Network)

1. **Configure Network**
   - Ensure your `.env` file has the correct keys
   - Add Ethena Network Testnet to MetaMask with these parameters:
     - Network Name: Ethena Network Testnet
     - RPC URL: https://testnet.rpc.ethena.fi
     - Chain ID: 52085143
     - Currency Symbol: ETH
     - Block Explorer URL: https://testnet.explorer.ethena.fi

2. **Deploy**
   ```bash
   npx hardhat run scripts/deploy.js --network ethena_testnet
   ```

3. **Verify Contract**
   ```bash
   npx hardhat verify --network ethena_testnet [CONTRACT_ADDRESS]
   ```

Note: Make sure to configure the Ethena Network Testnet in your `hardhat.config.js`:
```javascript
networks: {
  ethena_testnet: {
    url: "https://testnet.rpc.ethena.fi",
    chainId: 52085143,
    accounts: [process.env.PRIVATE_KEY]
  }
}
```

## Interacting with USDe Token

### Using Hardhat Console

1. **Start Console**
   ```bash
   npx hardhat console --network [network-name]
   ```

2. **Basic Interactions**
   ```javascript
   // Get contract instance
   const USDe = await ethers.getContractFactory("USDe")
   const usde = await USDe.attach("CONTRACT_ADDRESS")

   // Check balance
   await usde.balanceOf("YOUR_ADDRESS")

   // Transfer tokens
   await usde.transfer("RECIPIENT_ADDRESS", "AMOUNT")
   ```

### Using Web Interface (if available)

1. Connect your MetaMask wallet
2. Navigate to the dApp interface
3. Interact with USDe token functions:
   - Mint tokens (if authorized)
   - Transfer tokens
   - Check balances
   - View collateral ratio

## Game Mechanics

### Betting Amounts
The game accepts the following bet amounts in USDe tokens:
- 0.1 USDe
- 0.2 USDe
- 0.3 USDe
- 0.4 USDe
- 0.5 USDe

### Rewards
The game features two types of wins:
1. **Normal Win**: 1.7x your bet amount
   - Example: Betting 0.1 USDe and winning normally will reward you with 0.17 USDe
   
2. **Bonus Win**: 2.2x your bet amount
   - 4% chance of triggering a bonus win
   - Example: Betting 0.1 USDe and winning with bonus will reward you with 0.22 USDe

### How to Play
1. Ensure you have enough USDe tokens in your wallet
2. Approve the game contract to spend your tokens
3. Choose your bet amount (0.1 to 0.5 USDe)
4. Select either HEAD or TAIL
5. Confirm the transaction and wait for the result
6. If you win, rewards will be automatically sent to your wallet

### Example Game Flow
```javascript
// 1. Approve tokens for the game contract
await usdeToken.approve(gameContractAddress, ethers.parseEther("1.0")); // Approve more than needed

// 2. Play the game with 0.1 USDe on HEAD (true for HEAD, false for TAIL)
await game.play(true);
```

Note: The game uses Chainlink VRF (Verifiable Random Function) to ensure fair and verifiable randomness for each game outcome.

## Common Operations

### Minting USDe (for authorized addresses)
```javascript
await usde.mint("ADDRESS", "AMOUNT")
```

### Checking Collateral Ratio
```javascript
await usde.getCollateralRatio()
```

### Transferring Tokens
```javascript
await usde.transfer("RECIPIENT", "AMOUNT")
```

## Troubleshooting

### Common Issues

1. **Transaction Failed**
   - Check if you have enough ETH for gas
   - Verify you're connected to the correct network
   - Ensure you have sufficient permissions

2. **Contract Not Found**
   - Verify the contract address is correct
   - Check if you're on the right network

3. **Insufficient Balance**
   - Check your USDe token balance
   - Ensure you have enough collateral (if minting)

## Security Best Practices

1. Never share your private keys
2. Always verify contract addresses
3. Test transactions with small amounts first
4. Keep your wallet software updated
5. Review transaction details before signing

## Additional Resources

- [Ethena Documentation](https://docs.ethena.fi)
- [Ethereum Development Documentation](https://ethereum.org/developers)
- [Hardhat Documentation](https://hardhat.org/getting-started)
- [OpenZeppelin Guides](https://docs.openzeppelin.com/learn)

## Support

If you encounter any issues or need assistance:
1. Check the project's GitHub Issues
2. Join our Discord community
3. Contact the development team

Remember to always exercise caution when dealing with cryptocurrencies and smart contracts. Never share your private keys or seed phrases with anyone.
