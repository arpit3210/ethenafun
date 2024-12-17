# USDe Token Backend Contracts

## Overview
This repository contains the smart contracts and backend implementation for the USDe Token project, developed as part of the Ethena Hackathon. USDe is a fully collateralized stablecoin designed to maintain a stable value pegged to the US Dollar.

## Features
- Smart contract implementation of USDe Token
- Collateralization mechanism
- Integration with Ethena protocol
- Backend services for token management

## Prerequisites
- Node.js (v14.0.0 or later)
- Hardhat
- Ethereum wallet (MetaMask recommended)
- Git

## Installation

1. Clone the repository:
```bash
git clone [your-repository-url]
cd contracts_backend_USDe_Token
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
Create a `.env` file in the root directory and add the following:
```env
PRIVATE_KEY=your_private_key
INFURA_API_KEY=your_infura_api_key
ETHERSCAN_API_KEY=your_etherscan_api_key
```

## Smart Contracts

The main contracts in this project include:
- USDe Token Contract
- Collateral Manager
- Price Oracle Integration

## Development

1. Compile contracts:
```bash
npx hardhat compile
```

2. Run tests:
```bash
npx hardhat test
```

3. Deploy contracts:
```bash
npx hardhat run scripts/deploy.js --network [network-name]
```

## Testing
The project includes comprehensive tests for all smart contracts. To run the test suite:
```bash
npm test
```

## Deployment
Instructions for deploying to different networks:

### Testnet
```bash
npx hardhat run scripts/deploy.js --network goerli
```

### Mainnet
```bash
npx hardhat run scripts/deploy.js --network mainnet
```

## Security
- All smart contracts have been thoroughly tested
- Follow best practices for private key management
- Regular security audits recommended

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact
Project Link: [https://github.com/yourusername/contracts_backend_USDe_Token](https://github.com/yourusername/contracts_backend_USDe_Token)

## Acknowledgments
- Ethena Labs
- OpenZeppelin for smart contract libraries
- Ethereum community
