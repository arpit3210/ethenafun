const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
    try {
        console.log("Starting comprehensive fund recovery for all previous contracts...");

        // List of all previous game contract deployments
        const gameAddresses = [
            "0xf6d43694D413Fd65Ec1fbC144a3e331B76671c72",  // Latest
            "0x7Ed53358127b0a863761fb40E2f52016C3c89526",  // Previous
            "0x56f320A5D9CDde0C5C6BcfB763bD984F5e136877",  // VRF Coordinator (might have funds)
            "0x8Ab77353aC866B7Ab690890e620c249A8D3e92D0",  // Your address (for reference)
            // Add more previous contract addresses here
            "0x426E7d03f9803Dd11cb8616C65b99a3c0AfeA6dE"   // Token contract
        ];

        const tokenAddress = "0x426E7d03f9803Dd11cb8616C65b99a3c0AfeA6dE";
        const [signer] = await ethers.getSigners();
        const userAddress = signer.address;

        console.log("\nYour address:", userAddress);
        console.log("Token address:", tokenAddress);

        // Get token contract
        const token = await ethers.getContractAt("IERC20", tokenAddress);
        
        // Check user's current balance
        const currentBalance = await token.balanceOf(userAddress);
        console.log("\nYour current balance:", ethers.formatEther(currentBalance), "USDe");

        // Check each contract address
        for (const gameAddress of gameAddresses) {
            console.log("\n----------------------------------------");
            console.log("Checking address:", gameAddress);
            
            try {
                // First check token balance of this address
                const addressBalance = await token.balanceOf(gameAddress);
                console.log("USDe balance:", ethers.formatEther(addressBalance), "USDe");

                if (addressBalance > 0) {
                    console.log("Found tokens! Attempting recovery...");
                    
                    try {
                        // Try to get contract instance
                        const game = await ethers.getContractAt("HeadOrTailTokenGame", gameAddress);
                        
                        // Check if we're the owner
                        const owner = await game.owner();
                        console.log("Contract owner:", owner);
                        console.log("Are you owner?", owner.toLowerCase() === userAddress.toLowerCase());

                        if (owner.toLowerCase() === userAddress.toLowerCase()) {
                            console.log("\nTrying withdrawFunds()...");
                            try {
                                const withdrawTx = await game.withdrawFunds();
                                await withdrawTx.wait();
                                console.log("Successfully withdrawn using withdrawFunds()!");
                            } catch (withdrawError) {
                                console.log("withdrawFunds() failed, trying withdrawAll()...");
                                try {
                                    const withdrawAllTx = await game.withdrawAll();
                                    await withdrawAllTx.wait();
                                    console.log("Successfully withdrawn using withdrawAll()!");
                                } catch (withdrawAllError) {
                                    console.log("Both withdrawal methods failed. This might not be a game contract.");
                                }
                            }
                        }

                        // Check and reset allowance
                        const allowance = await token.allowance(userAddress, gameAddress);
                        if (allowance > 0) {
                            console.log("\nResetting allowance...");
                            const approveTx = await token.approve(gameAddress, 0);
                            await approveTx.wait();
                            console.log("Allowance reset to 0");
                        }
                    } catch (contractError) {
                        console.log("Not a valid game contract or no withdrawal function available");
                    }
                }

            } catch (error) {
                console.log("Error checking address:", error.message);
            }
        }

        // Final balance check
        const finalBalance = await token.balanceOf(userAddress);
        console.log("\n----------------------------------------");
        console.log("Final balance check:");
        console.log("Your balance:", ethers.formatEther(finalBalance), "USDe");
        
        // Calculate total recovered
        const recovered = finalBalance.sub(currentBalance);
        if (recovered > 0) {
            console.log("Total recovered in this session:", ethers.formatEther(recovered), "USDe");
        }

    } catch (error) {
        console.error("Error during recovery:", error.message);
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
