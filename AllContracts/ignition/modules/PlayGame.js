const ethers = require('ethers');
const fs = require('fs');
const path = require('path');
require("dotenv").config();

async function playDiceGame() {
    try {
        console.log('Starting Dice Game Interaction');

        const provider = new ethers.JsonRpcProvider('https://testnet.rpc.ethena.fi');
        const privateKey = process.env.PRIVATE_KEY;
        const wallet = new ethers.Wallet(privateKey, provider);

        const usdeTokenAddress = '0x426E7d03f9803Dd11cb8616C65b99a3c0AfeA6dE';
        const diceGameAddress = '0xee0B9D2d0227bBDe74652784EF9d47F78255b517';

        const usdeTokenABI = require('../../artifacts/contracts/EthenaUSDe.sol/EthenaUSDe.json').abi;
        const diceGameABI = require('../../artifacts/contracts/SingleDiceGames.sol/SingleDiceGame.json').abi;

        const usdeTokenContract = new ethers.Contract(usdeTokenAddress, usdeTokenABI, wallet);
        const diceGameContract = new ethers.Contract(diceGameAddress, diceGameABI, wallet);

        const betAmount = ethers.parseUnits('0.1', 18);
        const selectedNumber = 4;

        console.log('Wallet Address:', wallet.address);
        console.log('USDE Token Contract:', usdeTokenAddress);
        console.log('Dice Game Contract:', diceGameAddress);

        const balance = await usdeTokenContract.balanceOf(wallet.address);
        console.log('Player USDE Balance:', ethers.formatUnits(balance, 'ether'));

        const approveTx = await usdeTokenContract.approve(diceGameAddress, betAmount, {
            gasLimit: 100000
        });
        console.log('Approval Transaction Hash:', approveTx.hash);
        await approveTx.wait();

        try {
            const playTx = await diceGameContract.playDice(selectedNumber, betAmount, {
                gasLimit: 3000000
            });
            console.log('Play Transaction Hash:', playTx.hash);

            const receipt = await playTx.wait();
            console.log('Transaction Logs:', receipt.logs);

            // Parse all transaction logs
            receipt.logs.forEach((log, index) => {
                try {
                    const parsedLog = diceGameContract.interface.parseLog(log);
                    console.log(`Parsed Log ${index}:`, parsedLog);
                } catch (parseError) {
                    console.error(`Error parsing log ${index}:`, parseError);
                }
            });

            // Parse GamePlayed event
            const gamePlayedEvent = receipt.logs
                .map(log => {
                    try {
                        return diceGameContract.interface.parseLog(log);
                    } catch {
                        return null;
                    }
                })
                .find(parsedLog => parsedLog && parsedLog.name === 'GamePlayed');

            if (gamePlayedEvent) {
                console.log('Game Result:');
                console.log('Player:', gamePlayedEvent.args[0]);
                console.log('Selected Number:', gamePlayedEvent.args[1].toString());
                console.log('Rolled Number:', gamePlayedEvent.args[2].toString());
                console.log('Bet Amount:', ethers.formatUnits(gamePlayedEvent.args[3], 18));
                console.log('Payout:', ethers.formatUnits(gamePlayedEvent.args[4], 18));

                if ((gamePlayedEvent.args[4]) > (ethers.parseUnits('0', 18))) {
                    console.log('You won the game! 🏆🤑 ');
                } else {
                    console.log('You lost the game. 😅');
                }

            } else {
                console.log('No GamePlayed event found in transaction logs');
                
                // Additional debugging information
                console.log('All Available Events:');
                receipt.logs.forEach((log, index) => {
                    try {
                        const parsed = diceGameContract.interface.parseLog(log);
                        console.log(`Event ${index}:`, parsed.name);
                    } catch {
                        console.log(`Event ${index}: Unable to parse`);
                    }
                });
            }

        } catch (playError) {
            console.error('Detailed Play Error:', playError);
            
            if (playError.reason) {
                console.error('Revert Reason:', playError.reason);
            }
            
            if (playError.data) {
                console.error('Error Data:', playError.data);
            }
            
            console.error('Full Error Object:', JSON.stringify(playError, null, 2));
        }

    } catch (error) {
        console.error('Game Interaction Error:');
        console.error('Error Name:', error.name);
        console.error('Error Message:', error.message);
        
        if (error.reason) console.error('Reason:', error.reason);
        if (error.code) console.error('Error Code:', error.code);
        if (error.stack) console.error('Stack Trace:', error.stack);

        const errorLogPath = path.join(__dirname, 'error_log.txt');
        fs.appendFileSync(errorLogPath, 
            `[${new Date().toISOString()}] ${error.name}: ${error.message}\n${error.stack}\n\n`
        );
    }
}

module.exports = playDiceGame;