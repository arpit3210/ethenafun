const hre = require("hardhat");
const fs = require('fs');

async function main() {
    console.log("Deploying contracts...");

    // Deploy Mock USDe
    const MockUSDe = await hre.ethers.getContractFactory("MockUSDe");
    const mockUSDe = await MockUSDe.deploy();
    await mockUSDe.waitForDeployment();
    console.log("Mock USDe deployed to:", await mockUSDe.getAddress());

    // Deploy Mock VRF Coordinator
    const MockVRFCoordinator = await hre.ethers.getContractFactory("MockVRFCoordinatorV2Simple");
    const mockVRFCoordinator = await MockVRFCoordinator.deploy();
    await mockVRFCoordinator.waitForDeployment();
    console.log("Mock VRF Coordinator deployed to:", await mockVRFCoordinator.getAddress());

    // Deploy HeadOrTailTokenGame
    const HeadOrTailTokenGame = await hre.ethers.getContractFactory("HeadOrTailTokenGame");
    const game = await HeadOrTailTokenGame.deploy(
        await mockVRFCoordinator.getAddress(),
        await mockUSDe.getAddress()
    );
    await game.waitForDeployment();
    console.log("HeadOrTailTokenGame deployed to:", await game.getAddress());

    // Get signers
    const [owner, player1, player2] = await hre.ethers.getSigners();

    // Mint tokens to players using faucet
    console.log("\nMinting tokens to players...");
    await mockUSDe.connect(player1).faucet();
    await mockUSDe.connect(player2).faucet();

    // Approve game contract to spend tokens
    const gameAddress = await game.getAddress();
    await mockUSDe.connect(player1).approve(gameAddress, hre.ethers.parseEther("1000"));
    await mockUSDe.connect(player2).approve(gameAddress, hre.ethers.parseEther("1000"));

    // Play some rounds
    console.log("\nPlaying game rounds...");
    
    // Game 1: Player 1 plays Head
    console.log("\nGame 1: Player 1 betting on Head...");
    let betAmount = hre.ethers.parseEther("1"); // 1 token bet
    await mockUSDe.connect(player1).approve(gameAddress, betAmount);
    let playTx = await game.connect(player1).play(true);
    let receipt = await playTx.wait();
    
    // Get requestId from events
    let requestId = receipt.logs[2].args[0];
    console.log("Request ID:", requestId);
    
    // Get game result (VRF callback is automatic)
    let gameResult = await game.gameStatus(requestId);
    console.log("Game 1 Result:", {
        player: gameResult.player,
        isWinner: gameResult.isWinner,
        betAmount: hre.ethers.formatEther(gameResult.betAmount),
        isHead: gameResult.isHead
    });

    // Game 2: Player 2 plays Tail
    console.log("\nGame 2: Player 2 betting on Tail...");
    await mockUSDe.connect(player2).approve(gameAddress, betAmount);
    playTx = await game.connect(player2).play(false);
    receipt = await playTx.wait();
    
    requestId = receipt.logs[2].args[0];
    console.log("Request ID:", requestId);
    
    let game2Result = await game.gameStatus(requestId);
    console.log("Game 2 Result:", {
        player: game2Result.player,
        isWinner: game2Result.isWinner,
        betAmount: hre.ethers.formatEther(game2Result.betAmount),
        isHead: game2Result.isHead
    });

    // Game 3: Player 1 plays Tail
    console.log("\nGame 3: Player 1 betting on Tail...");
    await mockUSDe.connect(player1).approve(gameAddress, betAmount);
    playTx = await game.connect(player1).play(false);
    receipt = await playTx.wait();
    
    requestId = receipt.logs[2].args[0];
    console.log("Request ID:", requestId);
    
    let game3Result = await game.gameStatus(requestId);
    console.log("Game 3 Result:", {
        player: game3Result.player,
        isWinner: game3Result.isWinner,
        betAmount: hre.ethers.formatEther(game3Result.betAmount),
        isHead: game3Result.isHead
    });
    
    // Check final balances
    const player1Balance = await mockUSDe.balanceOf(player1.address);
    const player2Balance = await mockUSDe.balanceOf(player2.address);
    console.log("\nFinal Balances:");
    console.log("Player 1:", hre.ethers.formatEther(player1Balance), "USDe");
    console.log("Player 2:", hre.ethers.formatEther(player2Balance), "USDe");

    // Update game report
    const report = fs.readFileSync('GAME_REPORT.md', 'utf8');
    const updatedReport = report.replace(
        '[Game results will be recorded here after playing]',
        `### Game 1
- Player: ${player1.address}
- Bet: 1 USDe on Head
- Result: ${gameResult.isWinner ? 'Won' : 'Lost'}

### Game 2
- Player: ${player2.address}
- Bet: 1 USDe on Tail
- Result: ${game2Result.isWinner ? 'Won' : 'Lost'}

### Game 3
- Player: ${player1.address}
- Bet: 1 USDe on Tail
- Result: ${game3Result.isWinner ? 'Won' : 'Lost'}`
    ).replace(
        '[Player statistics will be recorded here after playing]',
        `### Player 1 (${player1.address})
- Games Played: 2
- Wins: ${(gameResult.isWinner ? 1 : 0) + (game3Result.isWinner ? 1 : 0)}
- Losses: ${(gameResult.isWinner ? 0 : 1) + (game3Result.isWinner ? 0 : 1)}
- Final Balance: ${hre.ethers.formatEther(player1Balance)} USDe

### Player 2 (${player2.address})
- Games Played: 1
- Wins: ${game2Result.isWinner ? 1 : 0}
- Losses: ${game2Result.isWinner ? 0 : 1}
- Final Balance: ${hre.ethers.formatEther(player2Balance)} USDe`
    ).replace(
        '[Will be updated after game sessions]',
        `The game was successfully tested with mock USDe tokens. The randomness was provided by a mock VRF coordinator for testing purposes.

Contract Addresses:
- Mock USDe: ${await mockUSDe.getAddress()}
- Game Contract: ${await game.getAddress()}
- Mock VRF: ${await mockVRFCoordinator.getAddress()}

Summary:
- Total Games Played: 3
- Total Players: 2
- Players can bet 1 USDe token per game
- Winning pays 1.7x (or 2.2x for bonus wins)
- Game uses Chainlink VRF for randomness`
    );
    
    fs.writeFileSync('GAME_REPORT.md', updatedReport);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
