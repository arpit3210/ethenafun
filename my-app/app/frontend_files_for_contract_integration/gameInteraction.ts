import { ethers } from 'ethers';
import { GAME_CONTRACT_ABI, GAME_CONTRACT_ADDRESS, TOKEN_CONTRACT_ABI, TOKEN_CONTRACT_ADDRESS } from './contractConfig';
import MockVRFCoordinatorV2Simple from './MockVRFCoordinatorV2Simple.json';


export interface GameResult {
    isWin: boolean | undefined;
    betAmount: string;
    amountWon: string;
    bonus: boolean;
    isHead: boolean;
    requestId: string;
    gameId: string;
    transactionDetails?: {
        transactionHash: string;
        from: string;
        to: string;
        tokenTransfer?: {
            from: string;
            to: string;
            amount: string;
        };
        status: boolean;
        blockNumber: number;
        timestamp: number;
    };
    fulfilled?: boolean;
    pending?: boolean;
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

    // async play(choice: boolean, amount: string): Promise<GameResult | undefined> {
    //     try {
    //         // Debug logging
    //         console.log('playGame called with:', { choice, amount });

    //         // Validate game contract
    //         if (!this.gameContract) {
    //             throw new Error('Game contract not initialized');
    //         }

    //         // Step 1: Place bet
    //         const tx = await this.gameContract.play(choice); // Call the play function directly
    //         console.log('Transaction sent:', tx.hash);

    //         // Wait for transaction confirmation
    //         const receipt = await tx.wait();
    //         console.log('Transaction confirmed:', receipt);

    //         // Fetch the game result from the event logs
    //         const gameResult = await this.getGameResultFromEvent(receipt);
    //         console.log('Actual game result:', gameResult);
    //         return gameResult; 
    //     } catch (error) {
    //         console.error('Error in playGame:', error);
    //         throw error;
    //     }
    // }

    // New method to retrieve game result from event logs
    private async getGameResultFromEvent(receipt: ethers.ContractTransactionReceipt): Promise<GameResult> {
        // Create a contract instance
        const contract = new ethers.Contract(GAME_CONTRACT_ADDRESS, GAME_CONTRACT_ABI, this.provider);

        // Filter for the 'GameResult' event
        const gameResultEvent = contract.interface.getEvent("GameResult");
        if (!gameResultEvent) {
            throw new Error('GameResult event not found in contract ABI');
        }
        
        const gameResultEvents = receipt.logs.filter(log => {
            return log.topics[0] === gameResultEvent.topicHash;
        });

        // Parse each event
        for (const gameResultEvent of gameResultEvents) {
            const eventData = contract.interface.parseLog(gameResultEvent);
            if (!eventData?.args) continue;  // Skip if no event data or args
            
            const { player, gameId, isWinner, betAmount, amountWon, bonus, isHead } = eventData.args;

            console.log(`
                Player: ${player}
                Game ID: ${gameId}
                Is Winner: ${isWinner}
                Bet Amount: ${betAmount}
                Amount Won: ${amountWon}
                Bonus: ${bonus}
                Is Head: ${isHead}
            `);

            return {
                isWin: isWinner,
                betAmount: ethers.formatUnits(betAmount, 18),
                amountWon: ethers.formatUnits(amountWon, 18),
                bonus: bonus,
                isHead: isHead,
                requestId: '0', // Not available in the event
                gameId: gameId.toString(),
                fulfilled: true,
                pending: false
            };
        }

        throw new Error('GameResult event not found for the given transaction receipt');
    }



    async play(isHead: boolean, betAmount: bigint): Promise<GameResult> {
        try {
            console.log('Starting play function with:', { isHead, betAmount: betAmount.toString() });
            
            // Check and approve allowance if needed
            const allowance = await this.checkAllowance();
            console.log('Current allowance:', allowance.toString());
            console.log('Bet amount:', betAmount.toString());
            if (allowance < betAmount) {
                const approveTx = await this.approveBet(betAmount);
                await approveTx.wait();
            }
    
            // Place the bet
            const tx = await this.gameContract.play(isHead, betAmount);  
            console.log('Bet transaction sent:', tx.hash);
    
            // Wait for transaction confirmation
            const receipt = await tx.wait();
            console.log('Transaction confirmed:', receipt.hash);
    
            try {
                // Directly retrieve the game result from the transaction receipt
                const gameResult = await this.waitForGameResultEvent(receipt);
                console.log('Game result retrieved:', gameResult);
                return gameResult;
            } catch (resultError) {
                console.error('Error retrieving game result from receipt:', resultError);
                
                // Fallback: Try to fetch event by transaction hash
                try {
                    const events = await this.gameContract.queryFilter(
                        this.gameContract.filters.GameResult(), 
                        receipt.blockNumber, 
                        receipt.blockNumber
                    );
    
                    const matchingEvent = events.find(
                        event => event.transactionHash === receipt.hash
                    );
    
                    if (matchingEvent) {
                        // Parse the event manually
                        
                        const { player, gameId, isWinner, betAmount, amountWon, bonus, isHead } = (matchingEvent as any).args;
                        return {
                            isWin: isWinner,
                            betAmount: ethers.formatUnits(betAmount, 18),
                            amountWon: isWinner ? ethers.formatUnits(amountWon, 18) : '0',
                            bonus: bonus,
                            isHead: isHead,
                            requestId: '0',
                            gameId: gameId.toString(),
                            fulfilled: true,
                            pending: false
                        };
                    }
                } catch (fetchError) {
                    console.error('Error fetching event by query:', fetchError);
                }
    
                // If all else fails, return a pending result
                return {
                    isWin: undefined,
                    betAmount: ethers.formatUnits(betAmount, 18),
                    amountWon: '0',
                    bonus: false,
                    isHead: isHead,
                    requestId: '0',
                    gameId: 'pending',
                    fulfilled: false,
                    pending: true
                };
            }
        } catch (error) {
            console.error('Error in play function:', error);
            throw error;
        }
    }

    async checkGameResult(gameId: string): Promise<GameResult> {
        try {
            console.log('Checking game result for game ID:', gameId);
            const gameStatus = await this.gameContract.gameStatus(BigInt(gameId));
            
            // Log raw game status for debugging
            console.log('Raw game status:', {
                isWinner: gameStatus.isWinner,
                betAmount: gameStatus.betAmount.toString(),
                amountWon: gameStatus.amountWon.toString(),
                isBonus: gameStatus.isBonus,
                isHead: gameStatus.isHead,
                requestId: gameStatus.requestId?.toString(),
                fulfilled: gameStatus.fulfilled
            });

            // Format the result
            const result: GameResult = {
                isWin: gameStatus.isWinner,
                betAmount: ethers.formatUnits(gameStatus.betAmount, 18),
                amountWon: gameStatus.isWinner ? ethers.formatUnits(gameStatus.amountWon, 18) : '0',
                bonus: gameStatus.isBonus,
                isHead: gameStatus.isHead,
                requestId: gameStatus.requestId?.toString() || '0',
                gameId: gameId,
                fulfilled: gameStatus.fulfilled,
                pending: !gameStatus.fulfilled
            };

            console.log('Formatted game result:', result);
            return result;
        } catch (error) {
            console.error('Error checking game result:', {
                gameId,
                error: error instanceof Error ? error.message : error,
                stack: error instanceof Error ? error.stack : undefined
            });
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

    async approveBet(betAmount: bigint): Promise<ethers.ContractTransactionResponse> {
        if (!this.signer) {
            throw new Error('Signer is not available');
        }
const BetAmount = betAmount*BigInt(5);

console.log("This is new bet BetAmount", BetAmount.toString());
        try {
            console.log('Approving bet amount:', betAmount.toString());
            // we just increasing the bet amount by 5 times so user dont need to approve again
            const tx = await this.tokenContract.approve(this.gameContract.target, BetAmount.toString());
            console.log('Approval transaction sent:', tx.hash);
            await tx.wait();
            return tx;
        } catch (error) {
            console.error('Error approving bet:', error);
            throw error;
        }
    }

    async getPlayerHistory(playerAddress: string): Promise<GameResult[]> {
        try {
            // Create filter for GameResult events
            const filter = this.gameContract.filters.GameResult(playerAddress);
            
            // Get all events
            const events = await this.gameContract.queryFilter(filter);
            
            // Map events to GameResult interface
            return events.map(event => {
                // Cast the event to access args
                const parsedEvent = event as ethers.EventLog;
                if (!parsedEvent.args) {
                    throw new Error('Event args not found');
                }
                
                const { player, requestId, gameId, isWinner, betAmount, amountWon, bonus, isHead } = parsedEvent.args;
                return {
                    isWin: isWinner,
                    betAmount: ethers.formatUnits(betAmount, 18),
                    amountWon: isWinner ? ethers.formatUnits(amountWon, 18) : '0',
                    bonus: bonus,
                    isHead: isHead,
                    requestId: requestId,
                    gameId: gameId.toString()
                };
            });
        } catch (error) {
            console.error('Error retrieving player history:', error);
            throw error;
        }
    }

    private async getGameIdFromReceipt(receipt: ethers.ContractTransactionReceipt): Promise<bigint> {
        console.log('Analyzing receipt logs:', JSON.stringify(receipt.logs, null, 2));
        
        // Create a dedicated interface for parsing
        const gameResultInterface = new ethers.Interface([
            "event GameResult(address indexed player, uint256 gameId, bool isWinner, uint256 betAmount, uint256 amountWon, bool bonus, bool isHead)"
        ]);

        // Try parsing each log
        for (const log of receipt.logs) {
            try {
                const parsedLog = gameResultInterface.parseLog({
                    topics: log.topics,
                    data: log.data
                });
               
                // Check if this is a GameResult event
                if (parsedLog && parsedLog.name === 'GameResult') {
                    console.log('Found GameResult event:', {
                        name: parsedLog.name,
                        args: parsedLog.args ? parsedLog.args.map(arg => arg.toString()) : 'No args'
                    });

                    // The gameId is the second argument (index 1)
                    const gameId = parsedLog.args[1];
                    console.log('Successfully extracted game ID:', gameId.toString());

                    return gameId;
                }
            } catch (error) {
                console.log('Parsing log failed:', error);
            }
        }

        // If no GameResult event is found
        throw new Error('GameResult event not found in transaction receipt');
    }
    
    async pollForGameResult(requestId: string, maxAttempts: number = 60): Promise<GameResult> {
        let attempts = 0;
        const POLL_INTERVAL = 5000; // 5 seconds
        
        console.log(`Starting to poll for game result. RequestID: ${requestId}, Max attempts: ${maxAttempts}`);
        
        while (attempts < maxAttempts) {
            try {
                console.log(`Polling attempt ${attempts + 1}/${maxAttempts}`);
                
                // Query for GameResult event
                const filter = this.gameContract.filters.GameResult();
                const events = await this.gameContract.queryFilter(filter, -10000); // Look back 10000 blocks
                
                // Find matching event
                const event = events.find(e => {
                    if (!this.isEventLog(e)) return false;
                    return e.args && e.args.requestId && 
                           e.args.requestId.toString() === requestId;
                });

                if (event && this.isEventLog(event)) {
                    console.log('Found matching game event:', {
                        requestId,
                        blockNumber: event.blockNumber,
                        transactionHash: event.transactionHash
                    });

                    const { player, gameId, isWinner, betAmount, amountWon, bonus, isHead } = event.args;
                    
                    // Get transaction details
                    const txReceipt = await event.getTransactionReceipt();
                    const txDetails = await this.analyzeTransactionReceipt(txReceipt);
                    
                    console.log('Game result details:', {
                        player,
                        requestId,
                        gameId: gameId.toString(),
                        isWinner,
                        betAmount: betAmount.toString(),
                        amountWon: amountWon.toString(),
                        bonus,
                        isHead,
                        blockNumber: txReceipt.blockNumber
                    });

                    return {
                        isWin: isWinner,
                        betAmount: ethers.formatUnits(betAmount, 18),
                        amountWon: isWinner ? ethers.formatUnits(amountWon, 18) : '0',
                        bonus: bonus,
                        isHead: isHead,
                        requestId: requestId,
                        gameId: gameId.toString(),
                        transactionDetails: txDetails
                    };
                }

                attempts++;
                console.log(`No result yet. Waiting ${POLL_INTERVAL/1000} seconds before next attempt...`);
                await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
                
            } catch (error) {
                console.error(`Error in polling attempt ${attempts + 1}:`, error);
                attempts++;
                
                if (attempts >= maxAttempts) {
                    console.error('Max polling attempts reached. Full error details:', {
                        requestId,
                        attempts,
                        maxAttempts,
                        error: error instanceof Error ? {
                            message: error.message,
                            stack: error.stack
                        } : error
                    });
                    throw new Error(`Failed to find game result after ${maxAttempts} attempts. The VRF response may be delayed. Please check the transaction status on the blockchain explorer.`);
                }
                
                await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
            }
        }

        throw new Error(`Timeout waiting for game result. RequestID: ${requestId}. The VRF response may be delayed. Please check the transaction status on the blockchain explorer.`);
    }

    async queryGameStatus(gameId: bigint): Promise<GameResult> {
        try {
            const status = await this.gameContract.gameStatus(gameId);
            
            // Format the result to match our GameResult interface
            const result: GameResult = {
                isWin: status.isWinner,
                betAmount: ethers.formatUnits(status.betAmount, 18),
                amountWon: status.isWinner ? ethers.formatUnits(status.betAmount.mul(17).div(10), 18) : '0', // Using 1.7x multiplier
                bonus: false, // Bonus status is not stored in gameStatus
                isHead: status.isHead,
                requestId: '0', // RequestId is not stored in gameStatus
                gameId: gameId.toString(),
                fulfilled: status.fulfilled
            };

            return result;
        } catch (error) {
            console.error('Error querying game status:', error);
            throw error;
        }
    }

    async waitForGameResult(tx: ethers.ContractTransactionResponse): Promise<GameResult> {
        try {
            console.log('Transaction sent:', tx.hash);
            const receipt = await tx.wait();
            
            if (!receipt) {
                throw new Error('Transaction receipt is null');
            }

            console.log('Transaction confirmed:', receipt);

            // Get the game ID from the transaction receipt
            const gameId = await this.getGameIdFromReceipt(receipt);
            
            // Try to get result from direct query first
            try {
                const directResult = await this.queryGameStatus(gameId);
                if (directResult.fulfilled) {
                    console.log('Game result obtained from direct query:', directResult);
                    return directResult;
                }
            } catch (error) {
                console.log('Direct query failed, falling back to event listener:', error);
            }

            // If direct query didn't work, fall back to event listener
            return await this.waitForGameResultEvent(receipt);
        } catch (error) {
            console.error('Error in waitForGameResult:', {
                error,
                message: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined
            });
            throw error;
        }
    }
    private async waitForGameResultEvent(receipt: ethers.ContractTransactionReceipt): Promise<GameResult> {
        try {
            console.log('Starting waitForGameResultEvent with receipt:', {
                hash: receipt.hash,
                blockNumber: receipt.blockNumber,
                status: receipt.status,
                totalLogs: receipt.logs.length
            });
            
            if (!receipt) {
                throw new Error('Transaction receipt is null');
            }
    
            // Create a dedicated interface for parsing
            const gameResultInterface = new ethers.Interface([
                "event GameResult(address indexed player, uint256 gameId, bool isWinner, uint256 betAmount, uint256 amountWon, bool bonus, bool isHead)"
            ]);
    
            // Log all raw log data for debugging
            console.log('Raw log data:', receipt.logs.map(log => ({
                topics: log.topics,
                data: log.data
            })));
    
            // Try parsing each log
            const gameResultEvents = receipt.logs
                .map(log => {
                    try {
                        const parsedLog = gameResultInterface.parseLog({
                            topics: log.topics,
                            data: log.data
                        });
    
                        if (parsedLog && parsedLog.name === 'GameResult') {
                            console.log('Parsed GameResult event:', parsedLog);
    
                            const [player, gameId, isWinner, betAmount, amountWon, bonus, isHead] = parsedLog.args;
    
                            return {
                                isWin: isWinner,
                                betAmount: ethers.formatUnits(betAmount, 18),
                                amountWon: isWinner ? ethers.formatUnits(amountWon, 18) : '0',
                                bonus: bonus,
                                isHead: isHead,
                                requestId: '0',
                                gameId: gameId.toString(),
                                fulfilled: true,
                                pending: false
                            };
                        }
                        return null;
                    } catch (error) {
                        console.error('Error parsing specific log:', error);
                        return null;
                    }
                })
                .filter(Boolean) as GameResult[];
    
            if (gameResultEvents.length === 0) {
                throw new Error('No GameResult event found in transaction receipt');
            }
    
            const result = gameResultEvents[0];
            console.log('Final game result:', result);
            return result;
    
        } catch (error) {
            console.error('Error in waitForGameResultEvent:', error);
            throw error;
        }
    }

    private async analyzeTransactionReceipt(
        receipt: ethers.ContractTransactionReceipt | ethers.TransactionReceipt | null
    ): Promise<{
        transactionHash: string;
        from: string;
        to: string;
        tokenTransfer?: {
            from: string;
            to: string;
            amount: string;
        };
        status: boolean;
        blockNumber: number;
        timestamp: number;
    }> {
        // Add explicit null check
        if (!receipt) {
            throw new Error('Transaction receipt is null or undefined');
        }

        return new Promise(async (resolve, reject) => {
            try {
                // Ensure we have a valid receipt
                if (!receipt) {
                    throw new Error('No transaction receipt provided');
                }

                // Get block information
                const block = await this.provider.getBlock(receipt.blockNumber);
                if (!block) {
                    throw new Error(`Could not retrieve block ${receipt.blockNumber}`);
                }

                // Prepare transaction details
                const transactionDetails = {
                    transactionHash: receipt.hash,
                    from: receipt.from,
                    to: receipt.to ?? '',
                    status: receipt.status === 1,
                    blockNumber: receipt.blockNumber,
                    timestamp: block.timestamp,
                    tokenTransfer: undefined
                };

                resolve(transactionDetails);
            } catch (error) {
                console.error('Error analyzing transaction receipt:', error);
                reject(error);
            }
        });
    }

    private isEventLog(event: ethers.Log): event is ethers.EventLog {
        return 'args' in event;
    }
}
