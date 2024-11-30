import { ethers } from 'ethers';
import { GAME_CONTRACT_ABI, GAME_CONTRACT_ADDRESS, TOKEN_CONTRACT_ABI, TOKEN_CONTRACT_ADDRESS } from './contractConfig';

interface GameResult {
    isWin: boolean;
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

    async playGame(choice: boolean, amount: string): Promise<GameResult> {
        try {
            // Debug logging
            console.log('playGame called with:', { choice, amount });

            // Validate game contract
            if (!this.gameContract) {
                throw new Error('Game contract not initialized');
            }

            // Step 1: Place bet and request randomness
            const tx = await this.gameContract.playGame(choice, ethers.parseUnits(amount, 18));
            console.log('Transaction sent:', tx.hash);

            // Wait for transaction confirmation
            const receipt = await tx.wait();
            console.log('Transaction confirmed:', receipt);

            // Find the RequestedRandomNumber event
            const requestEvent = receipt.events?.find(
                (event: any) => event.event === 'RequestedRandomNumber'
            );

            if (!requestEvent) {
                throw new Error('RequestedRandomNumber event not found');
            }

            const requestId = requestEvent.args.requestId;
            console.log('Random number requested with ID:', requestId);

            // Step 2: Wait for VRF fulfillment
            return new Promise((resolve, reject) => {
                console.log('Setting up GameResult event listener...');
                
                // Create the listener function
                const listener = (
                    player: string,
                    reqId: bigint,
                    gameId: bigint,
                    isWinner: boolean,
                    betAmount: bigint,
                    amountWon: bigint,
                    isBonus: boolean,
                    resultIsHead: boolean
                ) => {
                    // Only process if this event is for our request
                    if (reqId.toString() !== requestId.toString()) {
                        console.log('Ignoring event for different request ID');
                        return;
                    }

                    clearTimeout(timeout);
                    this.gameContract.removeListener('GameResult', listener);
                    
                    console.log('Game result received:', {
                        player,
                        requestId: reqId.toString(),
                        gameId: gameId.toString(),
                        isWinner,
                        betAmount: betAmount.toString(),
                        amountWon: amountWon.toString(),
                        isBonus,
                        resultIsHead
                    });

                    resolve({
                        isWin: isWinner,
                        betAmount: ethers.formatUnits(betAmount, 18),
                        amountWon: isWinner ? ethers.formatUnits(amountWon, 18) : '0',
                        bonus: isBonus,
                        isHead: resultIsHead,
                        requestId: reqId.toString(),
                        gameId: gameId.toString()
                    });
                };
                
                // Set timeout for VRF fulfillment (3 minutes)
                const timeout = setTimeout(() => {
                    this.gameContract.removeListener('GameResult', listener);
                    console.error('Timeout waiting for game result. Request ID:', requestId);
                    reject(new Error('Timeout waiting for game result'));
                }, 180000); // 3 minute timeout

                // Listen for GameResult event
                this.gameContract.on('GameResult', listener);
                console.log('GameResult event listener set up successfully');
            });
        } catch (error) {
            console.error('Error in playGame:', error);
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

    private async pollForGameResult(requestId: string, maxAttempts: number = 30): Promise<GameResult> {
        console.log(`Starting to poll for game result. Request ID: ${requestId}`);
        let attempts = 0;
        
        while (attempts < maxAttempts) {
            try {
                // Query past events
                const filter = this.gameContract.filters.GameResult(null, requestId);
                const events = await this.gameContract.queryFilter(filter, -10000); // Look back 10000 blocks

                if (events.length > 0) {
                    const event = events[0];
                    
                    // Type guard to check if event has args
                    const isEventLog = (event: any): event is { args: any } => {
                        return event && typeof event === 'object' && 'args' in event;
                    };

                    if (!isEventLog(event)) {
                        throw new Error('Invalid event log type');
                    }

                    const { player, gameId, isWinner, betAmount, amountWon, bonus, isHead } = event.args;
                    
                    // Get transaction details
                    const txReceipt = await event.getTransactionReceipt();
                    const txDetails = await this.analyzeTransactionReceipt(txReceipt);
                    
                    console.log('Game result found:', {
                        player,
                        requestId,
                        gameId: gameId.toString(),
                        isWinner,
                        betAmount: betAmount.toString(),
                        amountWon: amountWon.toString(),
                        bonus,
                        isHead
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

                // Increment attempts and wait before next poll
                attempts++;
                await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds between attempts
            } catch (error) {
                console.error(`Error polling for game result (Attempt ${attempts + 1}):`, error);
                attempts++;
                
                if (attempts >= maxAttempts) {
                    throw new Error(`Failed to find game result after ${maxAttempts} attempts`);
                }
                
                await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds between attempts
            }
        }

        throw new Error(`Failed to find game result for request ID ${requestId} after ${maxAttempts} attempts`);
    }

    async waitForGameResult(tx: ethers.ContractTransactionResponse): Promise<GameResult> {
        try {
            console.log('Transaction sent:', tx.hash);
            const receipt = await tx.wait();
            
            // Add null check before analyzing the receipt
            if (!receipt) {
                throw new Error('Transaction receipt is null');
            }

            console.log('Transaction confirmed:', receipt);

            // Analyze initial transaction
            const txDetails = await this.analyzeTransactionReceipt(receipt);
            console.log('Transaction details:', txDetails);

            // Find RequestedRandomNumber event
            const requestEvent = receipt.logs.find(
                (log: any) => {
                    try {
                        const parsedLog = this.gameContract.interface.parseLog(log as any);
                        return parsedLog?.name === 'RequestedRandomNumber';
                    } catch {
                        return false;
                    }
                }
            );

            if (!requestEvent) {
                throw new Error('RequestedRandomNumber event not found');
            }

            // Add null check and type assertion
            const parsedRequestEvent = this.gameContract.interface.parseLog(requestEvent as any);
            if (!parsedRequestEvent || !parsedRequestEvent.args) {
                throw new Error('Unable to parse RequestedRandomNumber event');
            }

            const requestId = parsedRequestEvent.args.requestId;
            console.log('Random number requested with ID:', requestId);

            // Use polling to get game result
            return await this.pollForGameResult(requestId);

        } catch (error) {
            console.error('Error in waitForGameResult:', error);
            throw error;
        }
    }

    async play(isHead: boolean, betAmount: bigint): Promise<GameResult> {
        if (!this.signer) {
            throw new Error('Signer is not available');
        }
        
        try {
            // First approve the bet amount
            await this.approveBet(betAmount);
            
            console.log('Calling play with:', { isHead, betAmount: betAmount.toString() });
            const tx = await this.gameContract.play(isHead);
            console.log('Transaction sent:', tx.hash);
            
            // Wait for transaction confirmation
            const receipt = await tx.wait();
            console.log('Transaction confirmed:', receipt);

            if (!receipt) {
                throw new Error('Transaction receipt not found');
            }

            // Find RequestedRandomNumber event
            const requestEvent = receipt.logs.find((log: ethers.Log) => {
                try {
                    const parsedLog = this.gameContract.interface.parseLog({
                        topics: [...log.topics],
                        data: log.data
                    });
                    return parsedLog?.name === 'RequestedRandomNumber';
                } catch (e) {
                    return false;
                }
            });

            if (!requestEvent) {
                throw new Error('RequestedRandomNumber event not found');
            }

            // Parse the request ID from the event
            const parsedRequestEvent = this.gameContract.interface.parseLog({
                topics: [...requestEvent.topics],
                data: requestEvent.data
            });
            const requestId = parsedRequestEvent?.args[0];

            console.log('Waiting for game result with requestId:', requestId.toString());

            // Wait for GameResult event
            return new Promise((resolve, reject) => {
                let gameResultReceived = false;
                
                const timeout = setTimeout(() => {
                    if (!gameResultReceived) {
                        this.gameContract.removeListener('GameResult', gameResultHandler);
                        reject(new Error('Timeout waiting for game result'));
                    }
                }, 120000); // Increased to 120 seconds

                const gameResultHandler = async (
                    player: string,
                    eventRequestId: bigint,
                    gameId: bigint,
                    isWinner: boolean,
                    betAmount: bigint,
                    amountWon: bigint,
                    bonus: boolean,
                    resultIsHead: boolean
                ) => {
                    try {
                        console.log('Received game result event:', {
                            player,
                            eventRequestId: eventRequestId.toString(),
                            requestId: requestId.toString(),
                            gameId: gameId.toString(),
                            isWinner,
                            betAmount: betAmount.toString(),
                            amountWon: amountWon.toString(),
                            bonus,
                            resultIsHead
                        });

                        if (eventRequestId.toString() === requestId.toString()) {
                            gameResultReceived = true;
                            clearTimeout(timeout);
                            this.gameContract.removeListener('GameResult', gameResultHandler);
                            
                            const result: GameResult = {
                                isWin: isWinner,
                                betAmount: ethers.formatUnits(betAmount, 18),
                                amountWon: isWinner ? ethers.formatUnits(amountWon, 18) : '0',
                                bonus: bonus,
                                isHead: resultIsHead,
                                requestId: eventRequestId.toString(),
                                gameId: gameId.toString()
                            };

                            console.log('Resolving with game result:', result);
                            resolve(result);
                        } else {
                            console.log('Received event for different requestId, waiting...');
                        }
                    } catch (error) {
                        console.error('Error in game result handler:', error);
                        reject(error);
                    }
                };

                // Start listening for GameResult events
                console.log('Setting up GameResult event listener...');
                this.gameContract.on('GameResult', gameResultHandler);
            });
        } catch (error) {
            console.error('Error placing bet:', error);
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

        try {
            console.log('Approving bet amount:', betAmount.toString());
            const tx = await this.tokenContract.approve(this.gameContract.target, betAmount);
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
}
