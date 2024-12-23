const ethers = require('ethers');
const fs = require('fs');
const path = require('path');
// import SingleDiceGame_abi from '../../artifacts/contracts/SingleDiceGames.sol/SingleDiceGame.json';

async function FundContract() {
    try {
        // Debugging: Log start of function
        console.log('Starting Fund to the contract');

        // Provider setup (replace with your network provider)
        const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
        // Player's wallet (ensure private key is securely managed)
        const privateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
        const wallet = new ethers.Wallet(privateKey, provider);

        // Contract addresses and ABIs
        const ContractAddress_usdeTokenAddress = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0';
        const diceGameContractAddress = '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9';

        // Load contract ABIs (ensure these are correctly exported)
        const usdeTokenABI = require('../../artifacts/contracts/EthenaUSDe.sol/EthenaUSDe.json').abi;
        // const diceGameABI = require('../../artifacts/contracts/SingleDiceGames.sol/SingleDiceGame.json').abi;

        // Create contract instances
        const usdeTokenContract = new ethers.Contract(ContractAddress_usdeTokenAddress, usdeTokenABI, wallet);
     

        // Game parameters
        const FundAmount = ethers.parseUnits('10', 18); // 10 USDE tokens
       

        // Debugging: Log contract and wallet details
        console.log('Wallet Address:', wallet.address);
        console.log('USDE Token Contract:', usdeTokenAddress);
      

        // Step 1: Check player's USDE token balance
        const balance = await usdeTokenContract.balanceOf(wallet.address);
        console.log('Contract USDE Balance:', ethers.formatUnits(balance, 18));

        // Step 2: Approve contract to spend tokens
        const transferUSDeTx = await usdeTokenContract.transfer(diceGameContractAddress, FundAmount, {
            gasLimit: 100000 // Adjust gas limit as needed
        });
        console.log('Transaction Hash for Token Transfer:', transferUSDeTx.hash);
        await transferUSDeTx.wait();

  

        // Wait for transaction confirmation
        const receipt = await transferUSDeTx.wait();
console.log('Transaction Hash:', receipt.transactionHash);
        console.log('Transaction Block Number:', receipt.blockNumber);
        console.log('Transaction Status:', receipt.status); 

        // Step 3: Check contract's USDE token balance
        const contractBalance = await usdeTokenContract.balanceOf(diceGameContractAddress);
        console.log('Contract USDE Balance after transfer:', ethers.formatUnits(contractBalance, 18));

        // Debugging: Log end of function
        console.log('Finished Fund to the contract');


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
        const logFilePath = path.join(__dirname, 'error_log.txt');
        fs.appendFileSync(logFilePath, `Error: ${error.name}: ${error.message}\n\n`);
    }
}

module.exports = { FundContract };