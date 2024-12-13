const hre = require("hardhat");
const { ethers } = require("hardhat");

async function ensureContractBalance(game, token, signer) {
    // Check contract balance
    const contractBalance = await token.balanceOf(game.target);
    console.log("\nContract balance:", ethers.formatEther(contractBalance), "USDe");
    
    // If balance is low, top up with 10 USDe
    if (contractBalance < ethers.parseEther("10")) {
        console.log("Contract balance is low. Topping up with 10 USDe...");
        const topUpAmount = ethers.parseEther("10");
        
        // Approve tokens
        const approveTx = await token.approve(game.target, topUpAmount);
        await approveTx.wait();
        console.log("Tokens approved for top-up");
        
        // Top up contract
        const topUpTx = await game.topUpBalance(topUpAmount);
        await topUpTx.wait();
        console.log("Contract topped up successfully!");
        
        const newBalance = await token.balanceOf(game.target);
        console.log("New contract balance:", ethers.formatEther(newBalance), "USDe\n");
    }
}

async function playGames(game, token, signer, count, strategy = "random") {
    let results = [];
    const startBalance = await token.balanceOf(signer.address);
    
    // Approve token spending
    const betAmount = ethers.parseEther("0.1");
    const totalNeeded = betAmount * BigInt(count);
    const currentAllowance = await token.allowance(signer.address, game.target);
    
    if (currentAllowance < totalNeeded) {
        console.log("Approving tokens for gameplay...");
        const approveTx = await token.approve(game.target, totalNeeded);
        await approveTx.wait();
        console.log("Tokens approved!\n");
    }

    // Play games
    for (let i = 0; i < count; i++) {
        try {
            console.log(`Game ${i + 1}/${count}:`);
            
            // Choose based on strategy
            let choice;
            switch(strategy) {
                case "always_head":
                    choice = true;
                    break;
                case "always_tail":
                    choice = false;
                    break;
                case "alternate":
                    choice = i % 2 === 0;
                    break;
                default: // random
                    choice = Math.random() < 0.5;
            }
            console.log("Choosing:", choice ? "HEAD" : "TAIL");

            // Get balance before playing
            const balanceBefore = await token.balanceOf(signer.address);

            // Play the game
            const tx = await game.play(choice);
            console.log("Transaction sent, waiting for confirmation...");
            const receipt = await tx.wait();

            // Get the RequestedRandomNumber event
            const requestEvent = receipt.logs.find(log => {
                try {
                    const decoded = game.interface.parseLog(log);
                    return decoded.name === "RequestedRandomNumber";
                } catch (e) {
                    return false;
                }
            });

            if (!requestEvent) {
                throw new Error("RequestedRandomNumber event not found");
            }

            const requestId = game.interface.parseLog(requestEvent).args[0];
            console.log("Fulfilling VRF request...");

            // Fulfill the VRF request
            const vrfCoordinator = await ethers.getContractAt("MockVRFCoordinatorV2Simple", await game.getVRFCoordinator());
            const fulfillTx = await vrfCoordinator.fulfillRandomWords(requestId);
            await fulfillTx.wait();

            // Get balance after playing
            const balanceAfter = await token.balanceOf(signer.address);
            const difference = balanceAfter - balanceBefore;
            const won = difference > 0n;
            const amountWon = difference > 0n ? difference : 0n;
            
            results.push({
                game: i + 1,
                choice: choice ? "HEAD" : "TAIL",
                won,
                amount: ethers.formatEther(amountWon),
                netChange: ethers.formatEther(difference)
            });

            console.log(`Result: ${won ? "WON" : "LOST"}`);
            if (won) {
                console.log(`Won: ${ethers.formatEther(amountWon)} USDe`);
            }
            console.log(`Net change: ${ethers.formatEther(difference)} USDe\n`);

            // Add a small delay between games
            await new Promise(resolve => setTimeout(resolve, 2000));

        } catch (gameError) {
            console.error(`Error in game ${i + 1}:`, gameError.message);
            break;
        }
    }

    return {
        results,
        startBalance,
        endBalance: await token.balanceOf(signer.address)
    };
}

async function generateGameReport(results) {
    console.log("\n🎲 Head or Tail Game Report 🎲");
    console.log("----------------------------");
    
    // Overall Statistics
    const totalGames = results.length;
    const gamesWon = results.filter(r => r.won).length;
    const gamesLost = totalGames - gamesWon;
    
    console.log(`Total Games Played: ${totalGames}`);
    console.log(`Games Won: ${gamesWon} (${((gamesWon/totalGames)*100).toFixed(2)}%)`);
    console.log(`Games Lost: ${gamesLost} (${((gamesLost/totalGames)*100).toFixed(2)}%)`);
    
    // Detailed Game Results
    console.log("\nDetailed Game Results:");
    results.forEach((result, index) => {
        console.log(`Game ${index + 1}: 
  Choice: ${result.choice ? 'HEAD' : 'TAIL'}
  Result: ${result.won ? '🎉 WON' : '❌ LOST'}
  Amount ${result.won ? 'Won' : 'Lost'}: ${ethers.formatEther(result.amount)} USDe`);
    });
    
    // Profit/Loss Calculation
    const totalAmountWon = results.reduce((sum, r) => r.won ? sum + BigInt(ethers.utils.parseEther(r.amount)) : sum, 0n);
    const totalAmountLost = results.reduce((sum, r) => !r.won ? sum + BigInt(ethers.utils.parseEther(r.amount)) : sum, 0n);
    const netProfit = totalAmountWon - totalAmountLost;
    
    console.log("\n💰 Financial Summary:");
    console.log(`Total Amount Won: ${ethers.formatEther(totalAmountWon)} USDe`);
    console.log(`Total Amount Lost: ${ethers.formatEther(totalAmountLost)} USDe`);
    console.log(`Net Profit/Loss: ${ethers.formatEther(netProfit)} USDe`);
    
    return {
        totalGames,
        gamesWon,
        gamesLost,
        totalAmountWon,
        totalAmountLost,
        netProfit
    };
}

async function main() {
    try {
        // Contract addresses from latest deployment
        const gameAddress = "0xaB8B61dc2afC24100b0fF999857023690c1D4114";
        const tokenAddress = "0x426E7d03f9803Dd11cb8616C65b99a3c0AfeA6dE";
        
        // Connect to contracts
        const [signer] = await ethers.getSigners();
        const game = await ethers.getContractAt("HeadOrTailTokenGame", gameAddress);
        const token = await ethers.getContractAt("IERC20", tokenAddress);
        
        console.log("Starting game session...");
        console.log("Your address:", signer.address);

        // Ensure contract has enough balance
        await ensureContractBalance(game, token, signer);

        // Play with different strategies
        const strategies = [
            { name: "Random", type: "random", games: 20 },
            { name: "Always HEAD", type: "always_head", games: 15 },
            { name: "Always TAIL", type: "always_tail", games: 15 }
        ];

        let allResults = [];
        let report = "# Extended Game Session Report\n\n";

        for (const strategy of strategies) {
            console.log(`\n## Playing ${strategy.games} games with ${strategy.name} strategy`);
            const gameSession = await playGames(game, token, signer, strategy.games, strategy.type);
            
            const wins = gameSession.results.filter(r => r.won).length;
            const totalWon = gameSession.results.reduce((acc, r) => acc + (r.won ? parseFloat(r.amount) : 0), 0);
            const netChange = ethers.formatEther(gameSession.endBalance - gameSession.startBalance);

            report += `\n## ${strategy.name} Strategy Results\n`;
            report += `- Games Played: ${strategy.games}\n`;
            report += `- Wins: ${wins}\n`;
            report += `- Losses: ${strategy.games - wins}\n`;
            report += `- Win Rate: ${((wins/strategy.games) * 100).toFixed(1)}%\n`;
            report += `- Total Amount Won: ${totalWon.toFixed(2)} USDe\n`;
            report += `- Net Change: ${netChange} USDe\n\n`;
            report += `### Detailed Results\n`;
            
            gameSession.results.forEach(r => {
                report += `- Game ${r.game}: ${r.choice} - ${r.won ? "WON" : "LOST"}`;
                if (r.won) report += ` (Won: ${r.amount} USDe)`;
                report += ` [Net: ${r.netChange} USDe]\n`;
            });
            
            allResults = allResults.concat(gameSession.results);
        }

        // Overall statistics
        const totalGames = allResults.length;
        const totalWins = allResults.filter(r => r.won).length;
        const totalAmountWon = allResults.reduce((acc, r) => acc + (r.won ? parseFloat(r.amount) : 0), 0);

        report = `# Overall Statistics\n` +
                `- Total Games Played: ${totalGames}\n` +
                `- Total Wins: ${totalWins}\n` +
                `- Total Losses: ${totalGames - totalWins}\n` +
                `- Overall Win Rate: ${((totalWins/totalGames) * 100).toFixed(1)}%\n` +
                `- Total Amount Won: ${totalAmountWon.toFixed(2)} USDe\n\n` +
                report;

        // Write report to file
        const fs = require("fs");
        fs.writeFileSync("win_lose_report.md", report);
        console.log("\nDetailed report generated: win_lose_report.md");

        // Generate game report
        const gameReport = await generateGameReport(allResults);
        console.log("\nGame Report:");
        console.log(`Total Games: ${gameReport.totalGames}`);
        console.log(`Games Won: ${gameReport.gamesWon}`);
        console.log(`Games Lost: ${gameReport.gamesLost}`);
        console.log(`Total Amount Won: ${ethers.formatEther(gameReport.totalAmountWon)} USDe`);
        console.log(`Total Amount Lost: ${ethers.formatEther(gameReport.totalAmountLost)} USDe`);
        console.log(`Net Profit/Loss: ${ethers.formatEther(gameReport.netProfit)} USDe`);

    } catch (error) {
        console.error("Error during gameplay:", error);
        if (error.data) {
            console.error("Error data:", error.data);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
