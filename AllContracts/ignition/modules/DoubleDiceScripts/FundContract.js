const ethers = require('ethers');
const fs = require('fs');
const path = require('path');
require("dotenv").config();


async function fundContract() {
    try {
        // Debugging: Log start of function
        console.log('Starting Fund to the contract');

        // Provider setup (replace with your network provider)
        const provider = new ethers.JsonRpcProvider('https://testnet.rpc.ethena.fi');
        // Player's wallet (ensure private key is securely managed)
        // const privateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';   address of the local node wallet
        const privateKey = process.env.PRIVATE_KEY;
        const wallet = new ethers.Wallet(privateKey, provider);

        // Contract addresses and ABIs
        const ContractAddress_usdeTokenAddress = '0x426E7d03f9803Dd11cb8616C65b99a3c0AfeA6dE';
        const DoubleDiceGameContractAddress = '0x2839D26160d468af0af8eBa9b525832D4B95a1A5';

        // Load contract ABIs (ensure these are correctly exported)
        const usdeTokenABI = require('../../../artifacts/contracts/EthenaUSDe.sol/EthenaUSDe.json').abi;
     
        // Create contract instances
        const usdeTokenContract = new ethers.Contract(ContractAddress_usdeTokenAddress, usdeTokenABI, wallet);
     

        // Game parameters
        const FundAmount = ethers.parseUnits('10', 18); // 10 USDE tokens
       

        // Debugging: Log contract and wallet details
        console.log('Wallet Address:', wallet.address);
        console.log('USDE Token Contract:', ContractAddress_usdeTokenAddress);
      

        // Step 1: Check player's USDE token balance
        const balance = await usdeTokenContract.balanceOf(wallet.address);
        console.log('Wallet USDE Balance:', ethers.formatUnits(balance, 18));

        // Step 2: Approve contract to spend tokens
        const transferUSDeTx = await usdeTokenContract.transfer(DoubleDiceGameContractAddress, FundAmount, {
            gasLimit: 100000 // Adjust gas limit as needed
        });
        console.log('Transaction Hash for Token Transfer:', transferUSDeTx.hash);
        await transferUSDeTx.wait();

  

        // Wait for transaction confirmation
        const receipt = await transferUSDeTx.wait();
console.log('Transaction Hash:', transferUSDeTx.hash);
        console.log('Transaction Block Number:', receipt.blockNumber);
        console.log('Transaction Status:', receipt.status); 

        // Step 3: Check contract's USDE token balance
        const contractBalance = await usdeTokenContract.balanceOf(DoubleDiceGameContractAddress);
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

module.exports =  fundContract;