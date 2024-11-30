const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
    try {
        console.log("Searching for older contract deployments...");

        // More potential contract addresses
        const moreAddresses = [
            "0x5FbDB2315678afecb367f032d93F642f64180aa3",  // Common local hardhat address
            "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
            "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
            "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
            "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
            "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707",  // From your transaction history
            "0x0165878A594ca255338adfa4d48449f69242Eb8F",
            "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853"
        ];

        const [signer] = await ethers.getSigners();
        const userAddress = signer.address;
        console.log("Your address:", userAddress);

        // Get token contract
        const tokenAddress = "0x426E7d03f9803Dd11cb8616C65b99a3c0AfeA6dE";
        const token = await ethers.getContractAt("IERC20", tokenAddress);

        // Initial balance
        const initialBalance = await token.balanceOf(userAddress);
        console.log("\nInitial balance:", ethers.formatEther(initialBalance), "USDe");

        // Check each address
        for (const address of moreAddresses) {
            console.log("\n----------------------------------------");
            console.log("Checking address:", address);

            try {
                // Check token balance
                const balance = await token.balanceOf(address);
                console.log("Token balance:", ethers.formatEther(balance), "USDe");

                if (balance > 0) {
                    console.log("Found tokens! Attempting to recover...");
                    try {
                        // Try to get contract instance
                        const contract = await ethers.getContractAt("HeadOrTailTokenGame", address);
                        
                        // Check ownership
                        const owner = await contract.owner();
                        console.log("Contract owner:", owner);
                        
                        if (owner.toLowerCase() === userAddress.toLowerCase()) {
                            console.log("You own this contract! Attempting withdrawal...");
                            
                            try {
                                const tx = await contract.withdrawFunds();
                                await tx.wait();
                                console.log("Successfully withdrawn!");
                            } catch (e) {
                                console.log("withdrawFunds failed, trying withdrawAll...");
                                try {
                                    const tx2 = await contract.withdrawAll();
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

                // Check for any remaining allowance
                const allowance = await token.allowance(userAddress, address);
                if (allowance > 0) {
                    console.log("\nFound allowance:", ethers.formatEther(allowance), "USDe");
                    console.log("Resetting allowance...");
                    const tx = await token.approve(address, 0);
                    await tx.wait();
                    console.log("Allowance reset to 0");
                }

            } catch (error) {
                console.log("Error checking address:", error.message);
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
