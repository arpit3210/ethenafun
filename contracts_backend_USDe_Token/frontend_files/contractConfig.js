// Contract Addresses
export const CONTRACT_ADDRESSES = {
    GAME_CONTRACT: "0x7D1A99766f38e09ccE1936EC22eE3B6C55d8902c",
    USDE_TOKEN: "0x426E7d03f9803Dd11cb8616C65b99a3c0AfeA6dE",
    VRF_COORDINATOR: "0x170fabBC54Dd3A056f4c0eB2ceA035BE74F5e0D7"
};

// Network Configuration
export const NETWORK_CONFIG = {
    chainId: "52085143",
    chainIdHex: "0x31B5677", // Hexadecimal representation
    rpcUrl: "https://testnet.rpc.ethena.fi",
    networkName: "Ethena Testnet",
    symbol: "ETH",
    blockExplorer: "https://testnet.explorer.ethena.fi"
};

// Game Configuration
export const GAME_CONFIG = {
    MIN_BET: "0.1",
    MAX_BET: "0.5",
    NORMAL_MULTIPLIER: 1.7,
    BONUS_MULTIPLIER: 2.2,
    BONUS_CHANCE: 4,
    BET_OPTIONS: [0.1, 0.2, 0.3, 0.4, 0.5]
};

// Contract Events
export const GAME_EVENTS = {
    GAME_RESULT: "GameResult",
    FUNDS_WITHDRAWN: "FundsWithdrawn",
    OWNERSHIP_TRANSFERRED: "OwnershipTransferred"
};

// Helper Functions
export const formatUSDe = (amount) => {
    return parseFloat(amount).toFixed(2);
};

export const parseUSDe = (amount) => {
    return ethers.parseUnits(amount.toString(), 18);
};

// Error Messages
export const ERROR_MESSAGES = {
    INSUFFICIENT_BALANCE: "Insufficient USDe balance",
    INSUFFICIENT_ALLOWANCE: "Please approve USDe tokens first",
    INVALID_BET_AMOUNT: "Bet amount must be between 0.1 and 0.5 USDe",
    NETWORK_ERROR: "Please connect to Ethena Testnet",
    WALLET_ERROR: "Please connect your wallet"
};

// Game Status Messages
export const STATUS_MESSAGES = {
    WAITING_CONFIRMATION: "Waiting for transaction confirmation...",
    PROCESSING_BET: "Processing your bet...",
    WIN: "Congratulations! You won!",
    LOSE: "Better luck next time!",
    BONUS_WIN: "🎉 Bonus Win! 2.2x Multiplier!"
};
