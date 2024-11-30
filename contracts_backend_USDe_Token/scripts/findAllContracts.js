const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
    try {
        console.log("Searching for all previous contract deployments...");

        // Additional possible contract addresses from transaction history
        const additionalAddresses = [
            "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6",
            "0x8E68C0216562890adc3cf3D596681A55AcaE6A69",
            "0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0",
            "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
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
        for (const address of additionalAddresses) {
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
