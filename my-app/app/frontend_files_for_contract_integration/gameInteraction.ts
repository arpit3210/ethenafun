import { ethers } from 'ethers';
import { GAME_CONTRACT_ABI, GAME_CONTRACT_ADDRESS, TOKEN_CONTRACT_ABI, TOKEN_CONTRACT_ADDRESS } from './contractConfig';

interface GameResult {
    isWin: boolean;
    betAmount: string;
    amountWon: string;
    bonus: boolean;
}

export class GameInteraction {
    gameContract: ethers.Contract;
    tokenContract: ethers.Contract;
    provider: ethers.Provider;
    signer?: ethers.Signer;

    constructor(provider: ethers.Provider, signer?: ethers.Signer) {
        try {
            // Debug logging
            console.log('GameInteraction constructor called with:', {
                provider: !!provider,
                signer: !!signer,
                providerType: provider?.constructor?.name,
                signerType: signer?.constructor?.name
            });

            // Validate provider
            if (!provider) {
                throw new Error('Provider is required');
            }
            this.provider = provider;

            // Validate signer
            if (!signer) {
                throw new Error('Signer is required');
            }
            if (!signer.provider) {
                throw new Error('Signer must be connected to a provider');
            }
            this.signer = signer;

            // Validate contract configuration
            if (!GAME_CONTRACT_ABI || !TOKEN_CONTRACT_ABI) {
                throw new Error('Contract ABIs are not defined');
            }

            // Create interfaces with error checking
            let gameInterface: ethers.Interface;
            let tokenInterface: ethers.Interface;

            try {
                console.log('Creating game interface...');
                gameInterface = new ethers.Interface(GAME_CONTRACT_ABI);
                console.log('Game interface created successfully');
            } catch (error) {
                console.error('Failed to create game interface:', error);
                throw new Error('Invalid game contract ABI');
            }

            try {
                console.log('Creating token interface...');
                tokenInterface = new ethers.Interface(TOKEN_CONTRACT_ABI);
                console.log('Token interface created successfully');
            } catch (error) {
                console.error('Failed to create token interface:', error);
                throw new Error('Invalid token contract ABI');
            }

            // Validate and format addresses
            try {
                console.log('Validating addresses...');
                const gameAddress = ethers.getAddress(GAME_CONTRACT_ADDRESS);
                const tokenAddress = ethers.getAddress(TOKEN_CONTRACT_ADDRESS);
                console.log('Addresses validated:', { gameAddress, tokenAddress });
            } catch (error) {
                console.error('Invalid contract address:', error);
                throw new Error('Invalid contract address format');
            }

            // Create contract instances
            console.log('Creating game contract...');
            this.gameContract = new ethers.Contract(
                GAME_CONTRACT_ADDRESS,
                gameInterface,
                signer
            );

            console.log('Creating token contract...');
            this.tokenContract = new ethers.Contract(
                TOKEN_CONTRACT_ADDRESS,
                tokenInterface,
                signer
            );

            // Verify contract instances
            if (!this.gameContract || !this.tokenContract) {
                throw new Error('Contract instances not properly initialized');
            }

            console.log('Contract initialization complete:', {
                hasGameContract: !!this.gameContract,
                hasTokenContract: !!this.tokenContract,
                gameAddress: this.gameContract.target,
                tokenAddress: this.tokenContract.target
            });

        } catch (error: any) {
            console.error('GameInteraction initialization error:', {
                message: error.message,
                code: error.code,
                stack: error.stack,
                type: error.constructor.name
            });
            throw error;
        }
    }

    async initialize(): Promise<this> {
        console.log('Starting initialize method');
        
        if (!this.signer) {
            throw new Error('No signer available. Please connect your wallet.');
        }

        try {
            // Basic validation of contract instances
            if (!this.gameContract || !this.tokenContract) {
                throw new Error('Contracts not properly initialized');
            }

            const address = await this.signer.getAddress();
            console.log('Signer address:', address);

            // Test basic contract calls
            try {
                console.log('Testing token contract...');
                const symbol = await this.tokenContract.symbol();
                console.log('Token symbol:', symbol);
            } catch (error) {
                console.error('Token contract test failed:', error);
                throw new Error('Token contract verification failed');
            }

            try {
                console.log('Testing game contract...');
                const totalHead = await this.gameContract.getTotalHead();
                console.log('Total head count retrieved:', totalHead.toString());
            } catch (error) {
                console.error('Game contract test failed:', error);
                throw new Error('Game contract verification failed');
            }

            return this;
        } catch (error: any) {
            console.error('Contract verification error:', {
                message: error.message,
                code: error.code,
                stack: error.stack
            });
            throw error;
        }
    }

    async getBalance(): Promise<string> {
        if (!this.signer) {
            throw new Error('No signer available');
        }
        try {
            const address = await this.signer.getAddress();
            const balance = await this.tokenContract.balanceOf(address);
            return ethers.formatUnits(balance, 18);
        } catch (error) {
            console.error('Error getting balance:', error);
            throw error;
        }
    }

    async play(choice: boolean, betAmount: bigint): Promise<ethers.ContractTransactionResponse> {
        if (!this.signer) {
            throw new Error('No signer available');
        }
        try {
            const tx = await this.gameContract.play(choice, betAmount);
            return tx;
        } catch (error) {
            console.error('Error playing game:', error);
            throw error;
        }
    }

    async checkAllowance(): Promise<bigint> {
        if (!this.signer) {
            throw new Error('No signer available');
        }
        try {
            const address = await this.signer.getAddress();
            const allowance = await this.tokenContract.allowance(address, GAME_CONTRACT_ADDRESS);
            return allowance;
        } catch (error) {
            console.error('Error checking allowance:', error);
            throw error;
        }
    }

    async approveTokenSpending(amount: string): Promise<void> {
        if (!this.signer) {
            throw new Error('No signer available');
        }
        try {
            const tx = await this.tokenContract.approve(GAME_CONTRACT_ADDRESS, amount);
            await tx.wait();
        } catch (error) {
            console.error('Error approving token spending:', error);
            throw error;
        }
    }

    async getPlayerHistory(): Promise<any[]> {
        try {
            // Add a null check for signer
            if (!this.signer) {
                throw new Error('No signer available for retrieving player history');
            }
            const address = await this.signer.getAddress();
            const filter = this.gameContract.filters.GameResult(address);
            const events = await this.gameContract.queryFilter(filter);
            
            return events.map(event => {
                // Type assertion to handle the event's structure
                const eventLog = event as unknown as {
                    args: {
                        player: string;
                        gameId: bigint;
                        isWinner: boolean;
                        betAmount: bigint;
                        amountWon: bigint;
                        bonus: boolean;
                    }
                };

                return {
                    player: eventLog.args.player,
                    gameId: eventLog.args.gameId.toString(),
                    isWinner: eventLog.args.isWinner,
                    betAmount: eventLog.args.betAmount.toString(),
                    amountWon: eventLog.args.amountWon.toString(),
                    bonus: eventLog.args.bonus,
                };
            });
        } catch (error) {
            console.error('Error retrieving player history:', error);
            throw error;
        }
    }

    async waitForGameResult(tx: ethers.ContractTransactionResponse): Promise<GameResult> {
        try {
            const receipt = await tx.wait();
            if (!receipt) {
                throw new Error('Transaction receipt not found');
            }

            // Find the GamePlayed event in the logs
            const iface = new ethers.Interface(GAME_CONTRACT_ABI);
            const gamePlayedEvent = iface.getEvent('GamePlayed');
            
            if (!gamePlayedEvent) {
                throw new Error('GamePlayed event not found in contract ABI');
            }
            
            const eventTopic = gamePlayedEvent.topicHash;
            
            const gamePlayedLog = receipt.logs.find(
                log => log.topics[0] === eventTopic
            );

            if (!gamePlayedLog) {
                throw new Error('Game result event not found');
            }

            // Parse the event log
            const parsedLog = iface.parseLog({
                topics: gamePlayedLog.topics,
                data: gamePlayedLog.data
            });

            if (!parsedLog || !parsedLog.args) {
                throw new Error('Failed to parse game result event');
            }

            // Extract values from the parsed log
            const [player, choice, betAmount, won, amountWon, bonus] = [
                parsedLog.args[0],
                parsedLog.args[1],
                parsedLog.args[2],
                parsedLog.args[3],
                parsedLog.args[4],
                parsedLog.args[5]
            ];

            return {
                isWin: won,
                betAmount: ethers.formatUnits(betAmount, 18),
                amountWon: ethers.formatUnits(amountWon, 18),
                bonus: bonus || false
            };
        } catch (error) {
            console.error('Error waiting for game result:', error);
            throw error;
        }
    }
}
