# Sponsor Technology Usage in EthenaFun Project

## 1. Ethena's USDe Stablecoin Integration
- I have implemented a decentralized Head or Tail betting game that utilizes Ethena's USDe stablecoin as the primary betting token.
- I built a smart contract (HeadOrTailTokenGame.sol) that seamlessly integrates with USDe through the standard ERC20 interface.
- I designed the game mechanics to allow players to bet their USDe tokens on coin flip outcomes (Head or Tail).
- I implemented the following features in the contract:
  - I set up configurable bet amounts ranging from 0.1 to 0.5 USDe
  - I configured a Return to Player (RTP) multiplier of 1.7x for normal wins
  - I added an exciting bonus multiplier of 2.2x with a 4% chance occurrence
  - I built comprehensive token management functions including withdrawals, top-ups, and balance checks

## 2. LayerZero O-App Integration
- I deployed the project on Ethena's testnet (chainId: 52085143) as specified in the hardhat.config.js
- I designed the game contract to be cross-chain compatible, preparing it for future expansion using LayerZero's omnichain architecture
- I implemented a VRF (Verifiable Random Function) coordinator interface that can seamlessly integrate with LayerZero's cross-chain messaging system

## 3. Goldsky Subgraph Integration
- I implemented comprehensive event emission for key game actions:
  - I added GameResult events to track all game outcomes
  - I included RequestedRandomNumber events for VRF request tracking
  - I ensured all events are properly indexed for Goldsky subgraph querying
- I structured the events to include detailed information such as:
  - Player addresses for user tracking
  - Bet amounts for financial analysis
  - Game outcomes for statistics
  - Bonus round occurrences
  - Win/loss statistics for transparency
- This implementation enables real-time game statistics and historical data analysis through Goldsky's infrastructure

## 4. Technical Features
- I prioritized security by utilizing OpenZeppelin's battle-tested contracts for token handling and access control
- I implemented verifiable randomness through VRF to ensure transparent and fair game outcomes
- For the user experience:
  - I built the frontend using Next.js for a modern, responsive interface
  - I integrated real-time game statistics and history tracking
  - I automated token approvals and bet management for seamless gameplay

## 5. Non-DeFi Application Aspects
I demonstrated a unique non-DeFi use case for USDe by:
- Creating an entertaining gaming platform that uses USDe as its primary currency
- Implementing provably fair gaming mechanics for user trust
- Building social elements through game statistics and player tracking
- Showcasing how USDe can be effectively used in casual, consumer-facing applications

## Project Impact
Through this implementation, I have:
- Demonstrated the versatility of Ethena's technology stack
- Created an engaging user experience that goes beyond traditional DeFi applications
- Built a sustainable gaming ecosystem using USDe as the core currency
- Shown how blockchain gaming can be both fun and fair using Ethena's infrastructure
