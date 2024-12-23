const ethers = require('ethers');
const fs = require('fs');
const path = require('path');
// import SingleDiceGame_abi from '../../artifacts/contracts/SingleDiceGames.sol/SingleDiceGame.json';

async function playDiceGame() {
    try {
        // Debugging: Log start of function
        console.log('Starting Dice Game Interaction');

        // Provider setup (replace with your network provider)
        const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
        // Player's wallet (ensure private key is securely managed)
        const privateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
        const wallet = new ethers.Wallet(privateKey, provider);

        // Contract addresses and ABIs
        const usdeTokenAddress = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0';
        const diceGameAddress = '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9';

        // Load contract ABIs (ensure these are correctly exported)
        const usdeTokenABI = require('../../artifacts/contracts/EthenaUSDe.sol/EthenaUSDe.json').abi;
        const diceGameABI = require('../../artifacts/contracts/SingleDiceGames.sol/SingleDiceGame.json').abi;

        // Create contract instances
        const usdeTokenContract = new ethers.Contract(usdeTokenAddress, usdeTokenABI, wallet);
        const diceGameContract = new ethers.Contract(diceGameAddress, diceGameABI, wallet);

        // Game parameters
        const betAmount = ethers.parseUnits('0.1', 18); // 10 USDE tokens
        const selectedNumber = 3; // Player's selected dice number

        // Debugging: Log contract and wallet details
        console.log('Wallet Address:', wallet.address);
        console.log('USDE Token Contract:', usdeTokenAddress);
        console.log('Dice Game Contract:', diceGameAddress);

        // Step 1: Check player's USDE token balance
        const balance = await usdeTokenContract.balanceOf(wallet.address);
        console.log('Player USDE Balance:', ethers.formatUnits(balance, 18));

        // Step 2: Approve contract to spend tokens
        const approveTx = await usdeTokenContract.approve(diceGameAddress, betAmount, {
            gasLimit: 100000 // Adjust gas limit as needed
        });
        console.log('Approval Transaction Hash:', approveTx.hash);
        await approveTx.wait();

        // Step 3: Play Dice Game
        const playTx = await diceGameContract.playDice(selectedNumber, betAmount, {
            gasLimit: 300000 // Adjust gas limit as needed
        });
        console.log('Play Transaction Hash:', playTx.hash);

        // Wait for transaction confirmation
        const receipt = await playTx.wait();

        // Step 4: Parse game result from events
        const gamePlayedEvent = receipt.events?.find(e => e.event === 'GamePlayed');
        if (gamePlayedEvent) {
            console.log('Game Result:');
            console.log('Selected Number:', gamePlayedEvent.args.selectedNumber.toString());
            console.log('Rolled Number:', gamePlayedEvent.args.rolledNumber.toString());
            console.log('Bet Amount:', ethers.formatUnits(gamePlayedEvent.args.betAmount, 18));
            console.log('Payout:', ethers.formatUnits(gamePlayedEvent.args.payout, 18));
        }

    } catch (error) {
        // Comprehensive Error Handling
        console.error('Game Interaction Error:');
        console.error('Error Name:', error.name);
        console.error('Error Message:', error.message);
        
        // Additional Error Context
        if (error.reason) {
            console.error('Reason:', error.reason);
        }
        if (error.code) {
            console.error('Error Code:', error.code);
        }
        if (error.stack) {
            console.error('Stack Trace:', error.stack);
        }

        // Log to file for further investigation
        const errorLogPath = path.join(__dirname, 'error_log.txt');
        fs.appendFileSync(errorLogPath, 
            `[${new Date().toISOString()}] ${error.name}: ${error.message}\n${error.stack}\n\n`
        );
    }
}

// Run the game
playDiceGame().catch(console.error);