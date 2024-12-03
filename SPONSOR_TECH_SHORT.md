# Sponsor Technology Usage - EthenaFun Project

## Ethena's USDe Stablecoin
I built a Head or Tail betting game using USDe as the primary token. The implementation includes:
- Smart contract integration with USDe for betting (0.1 to 0.5 USDe per bet)
- 1.7x multiplier for normal wins and 2.2x for bonus wins (4% chance)
- Automated token management for bets, wins, and withdrawals

## LayerZero O-App
I designed the system for cross-chain compatibility by:
- Deploying on Ethena's testnet (chainId: 52085143)
- Implementing VRF coordinator interface compatible with LayerZero messaging
- Structuring the contract for future cross-chain expansion

## Goldsky Subgraph
I integrated event tracking for real-time analytics:
- Game outcomes and player statistics
- Bet amounts and win/loss tracking
- VRF request monitoring
All events are indexed for efficient querying through Goldsky's infrastructure.

## Non-DeFi Application
I demonstrated USDe's versatility beyond DeFi by:
- Creating an entertaining gaming platform
- Implementing provably fair mechanics
- Building social features through player statistics

This project showcases how Ethena's technology stack can power engaging consumer applications while maintaining transparency and fairness.
