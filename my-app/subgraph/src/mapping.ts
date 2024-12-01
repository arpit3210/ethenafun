// import { BigInt, Address } from '@graphprotocol/graph-ts';
// import {
//   GameResult as GameResultEvent,
//   GameCreated as GameCreatedEvent
// } from '../generated/HeadOrTailGame/HeadOrTailGame';
// import { Game, Player, GameStats } from '../generated/schema';

// export function handleGameResult(event: GameResultEvent): void {
//   // Load or create the game entity
//   let game = Game.load(event.params.gameId.toString());
//   if (!game) {
//     game = new Game(event.params.gameId.toString());
//   }

//   // Update game data
//   game.player = event.params.player.toHexString();
//   game.requestId = event.params.requestId;
//   game.gameId = event.params.gameId;
//   game.isHead = event.params.isHead;
//   game.isWinner = event.params.isWinner;
//   game.betAmount = event.params.betAmount;
//   game.amountWon = event.params.amountWon;
//   game.bonus = event.params.bonus;
//   game.timestamp = event.block.timestamp;
//   game.blockNumber = event.block.number;
//   game.transactionHash = event.transaction.hash.toHexString();
//   game.save();

//   // Load or create player entity
//   let player = Player.load(event.params.player.toHexString());
//   if (!player) {
//     player = new Player(event.params.player.toHexString());
//     player.address = event.params.player.toHexString();
//     player.totalGames = BigInt.fromI32(0);
//     player.totalWins = BigInt.fromI32(0);
//     player.totalLosses = BigInt.fromI32(0);
//     player.totalBetAmount = BigInt.fromI32(0);
//     player.totalWinAmount = BigInt.fromI32(0);
//   }

//   // Update player statistics
//   player.totalGames = player.totalGames.plus(BigInt.fromI32(1));
//   player.totalBetAmount = player.totalBetAmount.plus(event.params.betAmount);
  
//   if (event.params.isWinner) {
//     player.totalWins = player.totalWins.plus(BigInt.fromI32(1));
//     player.totalWinAmount = player.totalWinAmount.plus(event.params.amountWon);
//   } else {
//     player.totalLosses = player.totalLosses.plus(BigInt.fromI32(1));
//   }
//   player.save();

//   // Update global game statistics
//   let stats = GameStats.load('global');
//   if (!stats) {
//     stats = new GameStats('global');
//     stats.totalGames = BigInt.fromI32(0);
//     stats.totalPlayers = BigInt.fromI32(0);
//     stats.totalBetAmount = BigInt.fromI32(0);
//     stats.totalWinAmount = BigInt.fromI32(0);
//   }

//   stats.totalGames = stats.totalGames.plus(BigInt.fromI32(1));
//   stats.totalBetAmount = stats.totalBetAmount.plus(event.params.betAmount);
//   if (event.params.isWinner) {
//     stats.totalWinAmount = stats.totalWinAmount.plus(event.params.amountWon);
//   }
//   stats.lastUpdated = event.block.timestamp;
//   stats.save();
// }

// export function handleGameCreated(event: GameCreatedEvent): void {
//   let game = new Game(event.params.gameId.toString());
//   game.player = event.params.player.toHexString();
//   game.requestId = event.params.requestId;
//   game.gameId = event.params.gameId;
//   game.isHead = event.params.isHead;
//   game.isWinner = false; // Will be updated by GameResult event
//   game.betAmount = BigInt.fromI32(0); // Will be updated by GameResult event
//   game.amountWon = BigInt.fromI32(0); // Will be updated by GameResult event
//   game.bonus = false; // Will be updated by GameResult event
//   game.timestamp = event.block.timestamp;
//   game.blockNumber = event.block.number;
//   game.transactionHash = event.transaction.hash.toHexString();
//   game.save();
// }
