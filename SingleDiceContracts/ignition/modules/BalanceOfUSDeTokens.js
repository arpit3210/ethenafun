const ethers = require('ethers');
const usdeTokenAddress = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0';
const userAddress = '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9';

async function checkBalance() {
    const provider = new ethers.JsonRpcProvider();
    const usdeTokenContract = new ethers.Contract(usdeTokenAddress, ['function balanceOf(address) public view returns (uint)'], provider);
    const balance = await usdeTokenContract.balanceOf(userAddress);
    console.log(`Balance of ${userAddress}: ${ethers.utils.formatUnits(balance, 18)}`);
}

module.exports = { checkBalance };
