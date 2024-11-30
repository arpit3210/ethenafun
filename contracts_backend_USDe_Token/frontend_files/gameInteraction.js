import { ethers } from 'ethers';
import {
    CONTRACT_ADDRESSES,
    NETWORK_CONFIG,
    GAME_CONFIG,
    ERROR_MESSAGES,
    STATUS_MESSAGES,
    parseUSDe,
    formatUSDe
} from './contractConfig';

// Import ABIs
import GameABI from '../artifacts/contracts/HeadOrTailTokenGame.sol/HeadOrTailTokenGame.json';
import TokenABI from '../artifacts/@openzeppelin/contracts/token/ERC20/IERC20.sol/IERC20.json';

export class GameInteraction {
    constructor(provider) {
        this.provider = provider;
        this.signer = provider.getSigner();
        this.gameContract = new ethers.Contract(
            CONTRACT_ADDRESSES.GAME_CONTRACT,
            GameABI.abi,
            this.signer
        );
        this.tokenContract = new ethers.Contract(
            CONTRACT_ADDRESSES.USDE_TOKEN,
            TokenABI.abi,
            this.signer
        );
    }

    // Check if connected to correct network
    async checkNetwork() {
        const network = await this.provider.getNetwork();
        return network.chainId.toString() === NETWORK_CONFIG.chainId;
    }

    // Get user's USDe balance
    async getBalance() {
        const address = await this.signer.getAddress();
        const balance = await this.tokenContract.balanceOf(address);
        return formatUSDe(ethers.formatUnits(balance, 18));
    }

    // Get current token allowance
    async getAllowance() {
        const address = await this.signer.getAddress();
        const allowance = await this.tokenContract.allowance(
            address,
            CONTRACT_ADDRESSES.GAME_CONTRACT
        );
        return formatUSDe(ethers.formatUnits(allowance, 18));
    }

    // Approve tokens for betting
    async approveTokens(amount) {
        const parsedAmount = parseUSDe(amount);
        const tx = await this.tokenContract.approve(
            CONTRACT_ADDRESSES.GAME_CONTRACT,
            parsedAmount
        );
        return await tx.wait();
    }

    // Place a bet
    async placeBet(isHead, amount) {
        // Validate bet amount
        if (amount < GAME_CONFIG.MIN_BET || amount > GAME_CONFIG.MAX_BET) {
            throw new Error(ERROR_MESSAGES.INVALID_BET_AMOUNT);
        }

        // Check balance
        const balance = await this.getBalance();
        if (parseFloat(balance) < amount) {
            throw new Error(ERROR_MESSAGES.INSUFFICIENT_BALANCE);
        }

        // Check allowance
        const allowance = await this.getAllowance();
        if (parseFloat(allowance) < amount) {
            throw new Error(ERROR_MESSAGES.INSUFFICIENT_ALLOWANCE);
        }

        // Place bet
        const tx = await this.gameContract.play(isHead);
        return await tx.wait();
    }

    // Listen for game result
    async listenForResult(txReceipt) {
        const gameResultEvent = txReceipt.logs.find(
            log => log.fragment && log.fragment.name === 'GameResult'
        );

        if (gameResultEvent) {
            const { isWinner, amountWon, bonus } = gameResultEvent.args;
            return {
                won: isWinner,
                amount: formatUSDe(ethers.formatUnits(amountWon, 18)),
                isBonus: bonus
            };
        }
        return null;
    }

    // Get game statistics
    async getGameStats() {
        const stats = await this.gameContract.getGameStats();
        return {
            totalHeads: stats[0].toString(),
            totalTails: stats[1].toString(),
            totalGames: stats[0].add(stats[1]).toString()
        };
    }
}

// Example usage in React:
/*
import { GameInteraction } from './gameInteraction';

const YourComponent = () => {
    const [game, setGame] = useState(null);
    const [balance, setBalance] = useState('0');
    const [status, setStatus] = useState('');

    // Initialize game interaction
    useEffect(() => {
        if (window.ethereum) {
            const provider = new ethers.BrowserProvider(window.ethereum);
            setGame(new GameInteraction(provider));
        }
    }, []);

    // Place a bet
    const handleBet = async (isHead, amount) => {
        try {
            setStatus(STATUS_MESSAGES.WAITING_CONFIRMATION);
            
            // Approve tokens if needed
            const allowance = await game.getAllowance();
            if (parseFloat(allowance) < amount) {
                await game.approveTokens(amount);
            }

            // Place bet
            setStatus(STATUS_MESSAGES.PROCESSING_BET);
            const tx = await game.placeBet(isHead, amount);
            
            // Get result
            const result = await game.listenForResult(tx);
            if (result.won) {
                setStatus(result.isBonus ? STATUS_MESSAGES.BONUS_WIN : STATUS_MESSAGES.WIN);
            } else {
                setStatus(STATUS_MESSAGES.LOSE);
            }

            // Update balance
            setBalance(await game.getBalance());
        } catch (error) {
            setStatus(error.message);
        }
    };

    return (
        <div>
            <p>Balance: {balance} USDe</p>
            <p>Status: {status}</p>
            <button onClick={() => handleBet(true, 0.1)}>Bet HEAD</button>
            <button onClick={() => handleBet(false, 0.1)}>Bet TAIL</button>
        </div>
    );
};
*/
