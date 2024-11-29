# Head or Tail Token Game Report

## Game Overview
The Head or Tail Token Game is a blockchain-based gambling game where players can bet USDe tokens on either Head or Tail. The game uses Chainlink VRF for fair and verifiable randomness.

## Contract Addresses
- Mock USDe Token: [Contract will be deployed]
- Mock VRF Coordinator: [Contract will be deployed]
- Head or Tail Game: [Contract will be deployed]

## Game Rules
1. Players must have USDe tokens to play
2. Players can bet any amount of tokens on either Head (true) or Tail (false)
3. If the player wins, they receive 2x their bet amount
4. If the player loses, they lose their bet amount
5. The result is determined using Chainlink VRF for fairness

## Game Sessions
### Game 1
- Player: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
- Bet: 1 USDe on Head
- Result: Lost
- Final Balance: 999.0 USDe

## Token Distribution
- Initial token amount per player: 1000 USDe (from faucet)
- Minimum bet: None
- Maximum bet: Limited by player's balance and approval

## Player Statistics
### Player 1 (0x70997970C51812dc3A010C7d01b50e0d17dc79C8)
- Games Played: 1
- Wins: 0
- Losses: 1
- Final Balance: 999.0 USDe

## Technical Notes
- The game uses a Mock VRF Coordinator for testing purposes
- All randomness in test environment is simulated
- Players must approve token spending before playing

## Conclusion
The game was successfully tested with mock USDe tokens. The randomness was provided by a mock VRF coordinator for testing purposes.
Contract Addresses:
- Mock USDe: 0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e
- Game Contract: 0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82
- Mock VRF: 0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0
