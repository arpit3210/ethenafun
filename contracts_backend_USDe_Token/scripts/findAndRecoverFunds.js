const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
    try {
        console.log("Starting comprehensive fund recovery process...");

        // Get all deployed game contracts from deploy.js history
        const gameAddresses = [
            "0xaB8B61dc2afC24100b0fF999857023690c1D4114",  // Latest deployment
            "0xc985E38bdc6882FC1bD6872D4DD52aEbBee664d0",  // Previous deployment
            "0xE2380f37B9498ca87c47D8B64dA928c8098716fD",  // Previous deployment
            "0x7D1A99766f38e09ccE1936EC22eE3B6C55d8902c",  // Previous deployment
            "0xf6d43694D413Fd65Ec1fbC144a3e331B76671c72",  // Previous deployment
            "0x7Ed53358127b0a863761fb40E2f52016C3c89526"   // Oldest deployment
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

        // Check each game contract
        for (const gameAddress of gameAddresses) {
            console.log("\nChecking game contract:", gameAddress);
            
            try {
                const game = await ethers.getContractAt("HeadOrTailTokenGame", gameAddress);
                
                // Check if we're the owner
                const owner = await game.owner();
                console.log("Contract owner:", owner);
                console.log("Are you owner?", owner.toLowerCase() === userAddress.toLowerCase());

                // Check contract's token balance
                const contractBalance = await token.balanceOf(gameAddress);
                console.log("Contract balance:", ethers.formatEther(contractBalance), "USDe");

                if (contractBalance > 0 && owner.toLowerCase() === userAddress.toLowerCase()) {
                    console.log("\nFound funds! Attempting to withdraw...");
                    try {
                        // Try withdrawFunds first
                        const withdrawTx = await game.withdrawFunds();
                        await withdrawTx.wait();
                        console.log("Successfully withdrawn using withdrawFunds()!");
                    } catch (withdrawError) {
                        console.log("withdrawFunds() failed, trying withdrawAll()...");
                        try {
                            // Try withdrawAll as fallback
                            const withdrawAllTx = await game.withdrawAll();
                            await withdrawAllTx.wait();
                            console.log("Successfully withdrawn using withdrawAll()!");
                        } catch (withdrawAllError) {
                            console.error("Both withdrawal methods failed:", withdrawAllError.message);
                        }
                    }

                    // Check new balances
                    const newContractBalance = await token.balanceOf(gameAddress);
                    const newUserBalance = await token.balanceOf(userAddress);
                    console.log("\nAfter withdrawal:");
                    console.log("Contract balance:", ethers.formatEther(newContractBalance), "USDe");
                    console.log("Your balance:", ethers.formatEther(newUserBalance), "USDe");
                }

                // Check and reset any remaining allowance
                const allowance = await token.allowance(userAddress, gameAddress);
                if (allowance > 0) {
                    console.log("\nResetting allowance for contract:", gameAddress);
                    const approveTx = await token.approve(gameAddress, 0);
                    await approveTx.wait();
                    console.log("Allowance reset to 0");
                }

            } catch (error) {
                console.log("Error checking contract:", error.message);
            }
        }

        // Final balance check
        const finalBalance = await token.balanceOf(userAddress);
        console.log("\nFinal balance check:");
        console.log("Your balance:", ethers.formatEther(finalBalance), "USDe");

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
