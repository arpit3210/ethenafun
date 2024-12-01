'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import { GameInteraction } from '../frontend_files_for_contract_integration/gameInteraction';
import { NETWORK_CONFIG, GAME_CONTRACT_ADDRESS, TOKEN_CONTRACT_ADDRESS } from '../frontend_files_for_contract_integration/contractConfig';

interface Web3ContextType {
  account: string | null;
  chainId: number | null;
  balance: string;
  gameInteraction: GameInteraction | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: () => Promise<void>;
  isCorrectNetwork: boolean;
  isConnected: boolean;
}

const Web3Context = createContext<Web3ContextType | null>(null);

export function Web3Provider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [balance, setBalance] = useState('0');
  const [gameInteraction, setGameInteraction] = useState<GameInteraction | null>(null);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const updateBalance = async (gameInteraction: GameInteraction) => {
    try {
      const balance = await gameInteraction.getBalance();
      setBalance(balance);
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const connect = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        console.log('Starting wallet connection process...');
        
        // Reset any existing state first
        setAccount(null);
        setChainId(null);
        setGameInteraction(null);
        setIsCorrectNetwork(false);
        setIsConnected(false);

        // Initialize provider
        console.log('Initializing provider...');
        const provider = new ethers.BrowserProvider(window.ethereum);
        if (!provider) {
          throw new Error('Failed to initialize provider');
        }

        // Request accounts
        console.log('Requesting accounts...');
        const accounts = await provider.send('eth_requestAccounts', []);
        if (!accounts || accounts.length === 0) {
          throw new Error('No accounts returned from wallet');
        }
        console.log('Account connected:', accounts[0]);

        // Get signer
        console.log('Getting signer...');
        const signer = await provider.getSigner();
        if (!signer) {
          throw new Error('Failed to get signer');
        }
        console.log('Signer obtained');

        // Get network
        console.log('Getting network info...');
        const network = await provider.getNetwork();
        const currentChainId = Number(network.chainId);
        console.log('Current chain ID:', currentChainId);

        // Verify we're on the correct network
        const isCorrectChain = currentChainId.toString() === NETWORK_CONFIG.chainId;
        setIsCorrectNetwork(isCorrectChain);
        
        if (!isCorrectChain) {
          throw new Error(`Please switch to ${NETWORK_CONFIG.networkName} (Chain ID: ${NETWORK_CONFIG.chainId})`);
        }

        // Create and initialize game interaction
        try {
          // Validate provider and network
          if (!provider) {
            throw new Error('Provider is not initialized');
          }

          const network = await provider.getNetwork();
          console.log('Connected to network:', {
            chainId: network.chainId.toString(),
            name: network.name,
            targetNetwork: NETWORK_CONFIG.chainId,
            matches: network.chainId.toString() === NETWORK_CONFIG.chainId
          });

          // Validate signer
          if (!signer) {
            throw new Error('Signer is not initialized');
          }
          
          const signerAddress = await signer.getAddress();
          const signerBalance = await provider.getBalance(signerAddress);
          
          console.log('Signer details:', {
            address: signerAddress,
            balance: ethers.formatEther(signerBalance),
            provider: !!signer.provider,
          });

          // Validate contract addresses
          console.log('Contract addresses:', {
            game: GAME_CONTRACT_ADDRESS,
            token: TOKEN_CONTRACT_ADDRESS,
            isGameAddressValid: ethers.isAddress(GAME_CONTRACT_ADDRESS),
            isTokenAddressValid: ethers.isAddress(TOKEN_CONTRACT_ADDRESS)
          });

          // Create GameInteraction instance
          console.log('Creating GameInteraction instance...');
          const gameInteractionInstance = new GameInteraction(provider, signer);
          console.log('GameInteraction instance created:', {
            hasGameContract: !!gameInteractionInstance.gameContract,
            hasTokenContract: !!gameInteractionInstance.tokenContract,
            hasProvider: !!gameInteractionInstance.provider,
            hasSigner: !!gameInteractionInstance.signer
          });

          // Initialize game interaction
          console.log('Initializing GameInteraction...');
          await gameInteractionInstance.initialize();
          console.log('GameInteraction initialized successfully');

          // Update state only after successful initialization
          setAccount(accounts[0]);
          setChainId(currentChainId);
          console.log('Chain ID set:', currentChainId);
          setGameInteraction(gameInteractionInstance);
          console.log('GameInteraction set in state');
          setIsConnected(true);

          // Get initial balance
          console.log('Fetching initial balance...');
          await updateBalance(gameInteractionInstance);
          console.log('Initial balance fetched');
        } catch (error: any) {
          console.error('Game interaction initialization error:', {
            message: error.message,
            code: error.code,
            stack: error.stack,
            type: error.constructor.name
          });
          throw new Error(`Failed to initialize game contracts: ${error.message}`);
        }
      } catch (error: any) {
        console.error('Wallet connection error:', {
          message: error.message,
          code: error.code,
          stack: error.stack
        });
        
        // Reset state on error
        setAccount(null);
        setChainId(null);
        setGameInteraction(null);
        setIsCorrectNetwork(false);
        setIsConnected(false);
        
        // Throw a user-friendly error message
        throw error;
      }
    } else {
      window.open('https://metamask.io/download.html', '_blank');
    }
  };

  const disconnect = () => {
    setAccount(null);
    setChainId(null);
    setGameInteraction(null);
    setIsCorrectNetwork(false);
    setIsConnected(false);
  };

  const switchNetwork = async () => {
    if (!window.ethereum) return;
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${parseInt(NETWORK_CONFIG.chainId).toString(16)}` }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${parseInt(NETWORK_CONFIG.chainId).toString(16)}`,
                chainName: NETWORK_CONFIG.networkName,
                rpcUrls: [NETWORK_CONFIG.rpcUrl],
                nativeCurrency: {
                  name: NETWORK_CONFIG.nativeCurrency.symbol,
                  symbol: NETWORK_CONFIG.nativeCurrency.symbol,
                  decimals: 18,
                },
              },
            ],
          });
        } catch (addError) {
          console.error('Error adding network:', addError);
        }
      }
    }
  };

  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect();
        } else {
          setAccount(accounts[0]);
        }
      };
      const handleChainChanged = (newChainId: string) => {
        setChainId(Number(newChainId));
        setIsCorrectNetwork(newChainId === NETWORK_CONFIG.chainId);
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        if (window.ethereum) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, []);

  return (
    <Web3Context.Provider
      value={{
        account,
        chainId,
        balance,
        gameInteraction,
        connect,
        disconnect,
        switchNetwork,
        isCorrectNetwork,
        isConnected,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3Context() {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3Context must be used within a Web3Provider');
  }
  return context;
}
