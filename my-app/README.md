# Ethena Head or Tail Game 🎮

## 🔗 Quick Links
- 🌐 **Live Demo**: [https://ethenafun.vercel.app/](https://ethenafun.vercel.app/)
- 📂 **GitHub Repository**: [https://github.com/arpit3210/ethenafun](https://github.com/arpit3210/ethenafun)
- 📚 **Documentation**:
  - [Technical Details](./docs/TECHNICAL_DETAILS.md)
  - [Smart Contracts](./docs/SMART_CONTRACTS.md)
  - [Frontend Architecture](./docs/FRONTEND.md)
  - [Token Economics](./docs/TOKENOMICS.md)
  - [Security](./docs/SECURITY.md)
  - [Deployment Guide](./docs/DEPLOYMENT.md)

## Project Overview
This project is part of the Ethena Hackathon, implementing a fun and interactive Head or Tail game using Ethena's technology stack. Players can participate in a decentralized betting game where they can wager on the outcome of a coin flip using USDe tokens.

## Project Code: `ccq3hga22bece1rvn0tccq3hgzswaqyb`

## 🚀 Features
- Decentralized Head or Tail betting game
- Integration with Ethena's USDe stablecoin
- Real-time game statistics using The Graph Protocol
- User-friendly Next.js frontend interface
- Smart contract-based game logic for transparency and fairness

## 🛠 Technology Stack
- **Frontend**: Next.js, React
- **Smart Contracts**: Solidity
- **Indexing**: The Graph Protocol
- **Stablecoin**: Ethena USDe
- **Styling**: Tailwind CSS, Radix UI

## 📦 Project Structure
```
my-app/
├── app/              # Next.js application files
├── contracts/        # Solidity smart contracts
├── subgraph/        # The Graph Protocol indexing
├── components/      # React components
└── public/          # Static assets
```

## 🔧 Setup and Installation

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 🎮 How to Play
1. Connect your wallet
2. Get some USDe tokens
3. Choose Heads or Tails
4. Place your bet
5. Wait for the result
6. Collect your winnings (if you win!)

## 📝 Smart Contract Details
The game's smart contracts are deployed on the following networks:
- Ethereum Mainnet: [Contract Address]
- Testnet: [Contract Address]

## 🔍 The Graph Integration
We use The Graph Protocol to index and query game events, providing real-time statistics and game history. The subgraph can be found at [Subgraph URL].

## 🏆 Sponsor Technologies Used

### Ethena Labs Integration
- Implemented USDe stablecoin as the primary betting token
- Utilized sUSDe for reward distribution to winners
- Smart contracts interact directly with Ethena's protocol

### Goldsky Integration
- Built a custom subgraph for real-time game tracking
- Indexing all game events and statistics
- Deployed at `subgraph/` directory
- Efficient querying of historical game data and player statistics

### LayerZero Integration
- Implemented cross-chain functionality using O-App
- Enables players to participate from multiple chains
- Unified liquidity across different networks

## 🎯 Unique Value Proposition
Our Head or Tail game demonstrates innovative use of:
1. sUSDe Rewards: Players earn additional yields through sUSDe staking
2. Cross-chain Gaming: LayerZero O-App enables seamless multi-chain experience
3. Real-time Analytics: Goldsky subgraph provides instant game statistics

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments
- Ethena Labs for providing the USDe infrastructure
- The Graph Protocol for decentralized indexing
- The entire Ethereum community
