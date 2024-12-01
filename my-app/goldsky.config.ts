// import { Config } from '@goldskycom/client';

// const config: Config = {
//   name: 'ethena-head-tail-game',
//   description: 'Indexer for the Ethena Head or Tail Game',
//   version: '1.0.0',
//   chains: [
//     {
//       name: 'sepolia',
//       chainId: 11155111,
//       contracts: [
//         {
//           name: 'HeadOrTailGame',
//           address: process.env.GAME_CONTRACT_ADDRESS || '',
//           startBlock: 0, // Replace with your contract deployment block
//           abi: [
//             'event GameResult(address indexed player, uint256 indexed requestId, uint256 indexed gameId, bool isWinner, uint256 betAmount, uint256 amountWon, bool bonus, bool isHead)',
//             'event GameCreated(address indexed player, uint256 indexed requestId, uint256 indexed gameId, bool isHead)',
//           ]
//         }
//       ]
//     }
//   ],
//   entities: {
//     Game: {
//       fields: {
//         id: 'string',
//         player: 'string',
//         requestId: 'string',
//         gameId: 'string',
//         isHead: 'boolean',
//         isWinner: 'boolean',
//         betAmount: 'string',
//         amountWon: 'string',
//         bonus: 'boolean',
//         timestamp: 'string',
//         blockNumber: 'string',
//         transactionHash: 'string'
//       }
//     },
//     Player: {
//       fields: {
//         id: 'string',
//         address: 'string',
//         totalGames: 'number',
//         totalWins: 'number',
//         totalLosses: 'number',
//         totalBetAmount: 'string',
//         totalWinAmount: 'string',
//         games: 'Game[]'
//       }
//     }
//   },
//   eventHandlers: {
//     'HeadOrTailGame.GameResult': {
//       handler: async (event, context) => {
//         const { player, requestId, gameId, isWinner, betAmount, amountWon, bonus, isHead } = event.args;
        
//         // Create or update game
//         const game = {
//           id: gameId.toString(),
//           player: player.toLowerCase(),
//           requestId: requestId.toString(),
//           gameId: gameId.toString(),
//           isHead,
//           isWinner,
//           betAmount: betAmount.toString(),
//           amountWon: amountWon.toString(),
//           bonus,
//           timestamp: event.block.timestamp.toString(),
//           blockNumber: event.block.number.toString(),
//           transactionHash: event.transaction.hash
//         };
//         await context.entities.Game.create(game);

//         // Update player statistics
//         const playerAddress = player.toLowerCase();
//         let playerEntity = await context.entities.Player.findOne({ address: playerAddress });
        
//         if (!playerEntity) {
//           playerEntity = {
//             id: playerAddress,
//             address: playerAddress,
//             totalGames: 0,
//             totalWins: 0,
//             totalLosses: 0,
//             totalBetAmount: '0',
//             totalWinAmount: '0',
//             games: []
//           };
//         }

//         playerEntity.totalGames += 1;
//         if (isWinner) {
//           playerEntity.totalWins += 1;
//           playerEntity.totalWinAmount = (BigInt(playerEntity.totalWinAmount) + BigInt(amountWon)).toString();
//         } else {
//           playerEntity.totalLosses += 1;
//         }
//         playerEntity.totalBetAmount = (BigInt(playerEntity.totalBetAmount) + BigInt(betAmount)).toString();
//         playerEntity.games.push(game);

//         await context.entities.Player.save(playerEntity);
//       }
//     }
//   }
// };

// export default config;
