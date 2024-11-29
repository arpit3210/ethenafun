const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
    // Contract addresses
    const GAME_TOKEN_ADDRESS = "0x426E7d03f9803Dd11cb8616C65b99a3c0AfeA6dE";
    const GAME_ADDRESS = "0x7Ed53358127b0a863761fb40E2f52016C3c89526"; // New deployment address

    // Get contract instances
    const gameToken = await ethers.getContractAt("IERC20", GAME_TOKEN_ADDRESS); // Use IERC20 interface instead of MockERC20
    const game = await ethers.getContractAt("HeadOrTailTokenGame", GAME_ADDRESS);

    // Get signers
    const [owner] = await ethers.getSigners();
    console.log("Interacting with contracts using address:", await owner.getAddress());

    try {
        console.log("\n1. Testing Read Functions:");
        console.log("Owner address:", await game.owner());
        console.log("Game token address:", await game.gameToken());
        console.log("RTP:", await game.getRtp());
        console.log("Bonus:", await game.getBonus());
        console.log("Total Head:", await game.getTotalHead());
        console.log("Total Tail:", await game.getTotalTail());
        console.log("Contract balance:", await game.getBalance());

        // Check token balance
        const ownerBalance = await gameToken.balanceOf(await owner.getAddress());
        console.log("\n2. Token Information:");
        console.log("Owner token balance:", ethers.formatEther(ownerBalance));

        // Approve tokens for game contract
        const approvalAmount = ethers.parseEther("0.1"); 
        console.log("\nApproving tokens for game contract");
        const approveTx = await gameToken.approve(GAME_ADDRESS, approvalAmount);
        await approveTx.wait();
        console.log("Approved amount:", ethers.formatEther(approvalAmount));

        console.log("\n3. Testing Game Functions:");
        // Place a bet
        const betAmount = ethers.parseEther("0.1");
        console.log("Placing a bet of", ethers.formatEther(betAmount), "tokens on HEAD");
        const playTx = await game.play(true);
        const receipt = await playTx.wait();
        
        // Find RequestedRandomNumber event
        const requestEvent = receipt.logs.find(log => {
            try {
                const parsed = game.interface.parseLog(log);
                return parsed.name === "RequestedRandomNumber";
            } catch (e) {
                return false;
            }
        });
        
        if (requestEvent) {
            const parsedEvent = game.interface.parseLog(requestEvent);
            console.log("Game started! Request ID:", parsedEvent.args[0]);
        }

        console.log("\n4. Testing Admin Functions:");
        // Set new RTP and bonus values
        console.log("Setting new RTP value to 20");
        const rtpTx = await game.setRtp(20);
        await rtpTx.wait();
        console.log("New RTP:", await game.getRtp());

        console.log("Setting new bonus value to 25");
        const bonusTx = await game.setBonus(25);
        await bonusTx.wait();
        console.log("New bonus:", await game.getBonus());

        console.log("\nAll tests completed successfully!");

    } catch (error) {
        console.error("Error during interaction:", error);
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
