const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
    try {
        console.log("Searching for contract deployments in transaction history...");

        const [signer] = await ethers.getSigners();
        const userAddress = signer.address;
        console.log("Your address:", userAddress);

        // Get token contract
        const tokenAddress = "0x426E7d03f9803Dd11cb8616C65b99a3c0AfeA6dE";
        const token = await ethers.getContractAt("IERC20", tokenAddress);

        // Get current block
        const currentBlock = await ethers.provider.getBlockNumber();
        console.log("Current block:", currentBlock);

        // Initial balance
        const initialBalance = await token.balanceOf(userAddress);
        console.log("\nInitial balance:", ethers.formatEther(initialBalance), "USDe");

        // Search last 1000 blocks for contract creation transactions
        const startBlock = Math.max(0, currentBlock - 1000);
        console.log(`\nSearching blocks ${startBlock} to ${currentBlock}...`);

        const potentialContracts = new Set();

        for (let i = startBlock; i <= currentBlock; i++) {
            const block = await ethers.provider.getBlock(i, true);
            if (!block) continue;

            for (const tx of block.transactions) {
                if (tx.from.toLowerCase() === userAddress.toLowerCase() && !tx.to) {
                    // This is a contract creation transaction
                    const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
                    if (receipt && receipt.contractAddress) {
                        console.log("\nFound contract deployment:");
                        console.log("Block:", i);
                        console.log("Contract:", receipt.contractAddress);
                        potentialContracts.add(receipt.contractAddress);
                    }
                }
            }
        }

        console.log("\nChecking found contracts for funds...");
        for (const address of potentialContracts) {
            console.log("\n----------------------------------------");
            console.log("Checking contract:", address);

            try {
                // Check token balance
                const balance = await token.balanceOf(address);
                console.log("Token balance:", ethers.formatEther(balance), "USDe");

                if (balance > 0) {
                    console.log("Found tokens! Attempting to recover...");
                    try {
                        const game = await ethers.getContractAt("HeadOrTailTokenGame", address);
                        const owner = await game.owner();
                        
                        if (owner.toLowerCase() === userAddress.toLowerCase()) {
                            console.log("You own this contract! Attempting withdrawal...");
                            
                            try {
                                const tx = await game.withdrawFunds();
                                await tx.wait();
                                console.log("Successfully withdrawn!");
                            } catch (e) {
                                try {
                                    const tx2 = await game.withdrawAll();
                                    await tx2.wait();
                                    console.log("Successfully withdrawn using withdrawAll!");
                                } catch (e2) {
                                    console.log("Both withdrawal methods failed");
                                }
                            }
                        }
                    } catch (e) {
                        console.log("Not a valid game contract");
                    }
                }

                // Check allowance
                const allowance = await token.allowance(userAddress, address);
                if (allowance > 0) {
                    console.log("\nFound allowance:", ethers.formatEther(allowance), "USDe");
                    console.log("Resetting allowance...");
                    const tx = await token.approve(address, 0);
                    await tx.wait();
                    console.log("Allowance reset to 0");
                }

            } catch (error) {
                console.log("Error checking contract:", error.message);
            }
        }

        // Final balance check
        const finalBalance = await token.balanceOf(userAddress);
        console.log("\n----------------------------------------");
        console.log("Final balance:", ethers.formatEther(finalBalance), "USDe");
        const recovered = Number(ethers.formatEther(finalBalance)) - Number(ethers.formatEther(initialBalance));
        if (recovered > 0) {
            console.log("Total recovered:", recovered, "USDe");
        }

    } catch (error) {
        console.error("Error during search:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
