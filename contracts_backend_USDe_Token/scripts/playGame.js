const hre = require("hardhat");
const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

// Utility function to generate random choice
function getRandomChoice() {
    return Math.random() < 0.5;
}

// Utility function to get random bet amount
// Utility function to get random bet amount
function getRandomBetAmount() {
    const allowedBetAmounts = [
        ethers.parseEther("0.1"),
        ethers.parseEther("0.2"),
        ethers.parseEther("0.3"),
        ethers.parseEther("0.4"),
        ethers.parseEther("0.5")
    ];
    
    // Use BigInt-safe random selection
    const randomIndex = BigInt(Math.floor(Math.random() * allowedBetAmounts.length));
    return allowedBetAmounts[Number(randomIndex)];
}

async function playGame(game, token, player, betAmount) {
    try {
        // Determine random choice
        const choice = getRandomChoice();
        
        // Predefined allowed bet amounts in the contract
        const allowedBetAmounts = [
            ethers.parseEther("0.1"),
            ethers.parseEther("0.2"),
            ethers.parseEther("0.3"),
            ethers.parseEther("0.4"),
            ethers.parseEther("0.5")
        ];
        
        // Find the closest allowed bet amount
        const closestBetAmount = allowedBetAmounts.reduce((prev, curr) => 
            curr <= betAmount ? curr : prev
        );
        
        console.log(`Adjusted bet amount: ${ethers.formatEther(closestBetAmount)} USDe`);
        
        // Detailed contract interaction debugging
        try {
            // Check contract interactions
            console.log(`Game Contract Address: ${game.target}`);
            console.log(`Token Contract Address: ${token.target}`);
            console.log(`Player Address: ${player.address}`);
            
            // Check token balance
            const balance = await token.balanceOf(player.address);
            console.log(`Player Token Balance: ${ethers.formatEther(balance)} USDe`);
            
            // Check token allowance
            const allowance = await token.allowance(player.address, game.target);
            console.log(`Current Token Allowance: ${ethers.formatEther(allowance)} USDe`);
            
            // Approve tokens if needed
            if (allowance < closestBetAmount) {
                console.log(`Approving ${ethers.formatEther(closestBetAmount)} USDe for game contract`);
                const approveTx = await token.connect(player).approve(game.target, closestBetAmount);
                const approveReceipt = await approveTx.wait();
                console.log(`Approve Tx Hash: ${approveTx.hash}`);
                console.log(`Approve Tx Block: ${approveReceipt.blockNumber}`);
            }
            
            // Log transaction details
            console.log(`Attempting to play game with choice: ${choice ? "HEAD" : "TAIL"}, bet: ${ethers.formatEther(closestBetAmount)} USDe`);
            
            // Set up event listeners
            const randomNumberListener = new Promise((resolve) => {
                game.once("RandomNumber", (randomNumber) => {
                    console.log(`🎲 Random Number Generated: ${randomNumber}`);
                    resolve(randomNumber);
                });
            });

            const gameResultListener = new Promise((resolve) => {
                game.once("GameResult", (player, gameId, isWinner, betAmount, amountWon, bonus, isHead) => {
                    console.log(`🏆 Game Result Event:`);
                    console.log(`  Player: ${player}`);
                    console.log(`  Game ID: ${gameId}`);
                    console.log(`  Winner: ${isWinner}`);
                    console.log(`  Bet Amount: ${ethers.formatEther(betAmount)} USDe`);
                    console.log(`  Amount Won: ${ethers.formatEther(amountWon)} USDe`);
                    console.log(`  Bonus Round: ${bonus}`);
                    console.log(`  Choice: ${isHead ? "HEAD" : "TAIL"}`);
                    
                    resolve({
                        player,
                        gameId,
                        isWinner,
                        betAmount,
                        amountWon,
                        bonus,
                        isHead
                    });
                });
            });
            
            // Attempt to play the game with detailed error handling
            const tx = await game.connect(player).play(choice);
            console.log(`Transaction sent: ${tx.hash}`);
            
            const receipt = await tx.wait();
            console.log(`Transaction mined in block ${receipt.blockNumber}`);
            
            // Wait for and log events
            const [randomNumber, gameResult] = await Promise.all([
                randomNumberListener, 
                gameResultListener
            ]);
            
            return {
                player: player.address,
                choice: choice ? "HEAD" : "TAIL",
                betAmount: closestBetAmount.toString(),
                won: gameResult.isWinner,
                amountWon: gameResult.amountWon.toString(),
                bonus: gameResult.bonus,
                randomNumber: randomNumber.toString()
            };
        } catch (txError) {
            // Comprehensive error logging
            console.error("🚨 Transaction Error Details:");
            console.error(`Error Message: ${txError.message}`);
            console.error(`Error Code: ${txError.code}`);
            
            // Additional error context
            if (txError.transaction) {
                console.error(`Transaction Data: ${JSON.stringify(txError.transaction, null, 2)}`);
            }
            
            // Try to decode revert reason
            try {
                const errorInterface = new ethers.Interface([
                    "error InsufficientAllowance()",
                    "error InvalidBetAmount()",
                    "error InsufficientBalance()"
                ]);
                
                if (txError.data) {
                    const decodedError = errorInterface.parseError(txError.data);
                    console.error(`Decoded Revert Reason: ${decodedError.name}`);
                }
            } catch (decodeError) {
                console.error(`Could not decode error: ${decodeError.message}`);
            }
            
            throw txError;
        }
    } catch (error) {
        console.error(`🔴 Game play error: ${error.message}`);
        return null;
    }
}

async function main() {
    // Game and token addresses from previous deployment
    // const gameAddress = "0x81AAdF737Dc270F3C53B0a02C266d60Cd39Ca250";


    // Game and token addresses from latest deployment
    const gameAddress = "0x5F7cB6FeE571c5BEBb9f3E415c39F0Ce01684b70";
    const tokenAddress = "0x426E7d03f9803Dd11cb8616C65b99a3c0AfeA6dE";
    
    // Connect to contracts
    const game = await ethers.getContractAt("HeadOrTailTokenGame", gameAddress);
    const token = await ethers.getContractAt("IERC20", tokenAddress);
    
    // Retrieve network
    const network = await ethers.provider.getNetwork();
    console.log(`🌐 Connected to network: ${network.name} (Chain ID: ${network.chainId})`);
    
    // Get the first signer (deployer/main account)
    const [player] = await ethers.getSigners();
    console.log(`🎮 Playing with account: ${player.address}`);
    
    // Check player's token balance
    const balance = await token.balanceOf(player.address);
    console.log(`💰 Your USDe balance: ${ethers.formatEther(balance)} USDe`);
    
    // Gameplay results
    const gameResults = [];
    
    // Play 10 games
    console.log("🎲 Starting 10 games of Head or Tail...");
    
    for (let i = 0; i < 10; i++) {
        // Get random bet amount
        const betAmount = getRandomBetAmount();
        
        console.log(`\n🎮 Game ${i + 1}: Betting ${ethers.formatEther(betAmount)} USDe`);
        
        // Play the game
        const result = await playGame(game, token, player, betAmount);
        
        if (result) {
            gameResults.push(result);
            console.log(`   Result: ${result.won ? "🏆 WON" : "❌ LOST"}`);
            console.log(`   Choice: ${result.choice}`);
            console.log(`   Amount Won: ${ethers.formatEther(result.amountWon)} USDe`);
        }
    }
    
    // Calculate statistics
    const totalGames = gameResults.length;
    const wins = gameResults.filter(r => r.won).length;
    const losses = totalGames - wins;
    const winRate = (wins / totalGames) * 100;
    const totalAmountWon = gameResults.reduce((sum, r) => 
        r.won ? sum + BigInt(r.amountWon) : sum, 0n);
    
    // Generate markdown report
    const reportContent = `# 🎲 Head or Tail Game Report

## 🎮 Player Information
- **Address**: \`${player.address}\`

## 📊 Game Statistics
- **Total Games Played**: ${totalGames}
- **Wins**: ${wins}
- **Losses**: ${losses}
- **Win Rate**: ${winRate.toFixed(2)}%

## 💰 Financial Summary
- **Total Amount Won**: ${ethers.formatEther(totalAmountWon)} USDe

## 🎮 Detailed Game Results

| Game | Bet Amount | Choice | Result | Amount Won | Bonus | Random Number |
|------|------------|--------|--------|------------|-------|--------------|
${gameResults.map((result, index) => 
    `| ${index + 1} | ${ethers.formatEther(result.betAmount)} USDe | ${result.choice} | ${result.won ? "✅ WON" : "❌ LOST"} | ${ethers.formatEther(result.amountWon)} USDe | ${result.bonus} | ${result.randomNumber} |`
).join('\n')}

## 🕒 Report Generated
${new Date().toISOString()}
`;
    
    // Save report
    const reportPath = path.join(__dirname, '..', 'GameplayReport.md');
    fs.writeFileSync(reportPath, reportContent, 'utf-8');
    
    console.log("\n📄 Detailed report saved to GameplayReport.md");
    console.log(`\n🏆 Final Results: ${wins} wins out of ${totalGames} games`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Gameplay Error:", error);
        process.exit(1);
    });