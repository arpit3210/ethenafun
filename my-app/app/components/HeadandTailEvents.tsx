'use client';

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Button } from '@/components/ui/button';

// Define the event interface for type safety
export interface GameResultEvent {
  player: string;
  gameId: number;
  isWinner: boolean;
  betAmount: string;
  amountWon: string;
  bonus: boolean;
  isHead: boolean;
  transactionHash: string;
  blockNumber: number;
}

// Props interface for the component
interface ContractEventsViewerProps {
  contractAddress: string;
  contractABI: string[];
  eventName: string;
  limit?: number;
  onError?: (error: string) => void;
  showConnectButton?: boolean;
  connectWallet?: () => Promise<void>;
}

export function ContractEventsViewer({
  contractAddress,
  contractABI,
  eventName,
  limit = 11,
  onError,
  showConnectButton = true,
  connectWallet
}: ContractEventsViewerProps) {
  const [events, setEvents] = useState<GameResultEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  
  // Handle connection
  const handleConnect = async () => {
    try {
      if (connectWallet) {
        await connectWallet();
        setIsConnected(true);
      } else if (window.ethereum) {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        setIsConnected(true);
      } else {
        setError('No Ethereum wallet found. Please install MetaMask.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
      onError?.(err.message);
    }
  };




  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchContractEvents();
    }, 10000);

    return () => clearInterval(intervalId);
  }, []);



  // Fetch contract events
  const fetchContractEvents = async () => {
    try {
      // Check if Ethereum provider exists
      if (!window.ethereum) {
        throw new Error('Ethereum provider not found. Please install MetaMask.');
      }

      setIsLoading(true);
      setError(null);

      // Use the connected provider
      const provider = new ethers.BrowserProvider(window.ethereum);

      // Create contract interface
      const contractInterface = new ethers.Interface(contractABI);

      // Safely get the event signature
      const contractEvent = contractInterface.getEvent(eventName);
      
      if (!contractEvent) {
        throw new Error(`${eventName} event not found in ABI`);
      }

      // Get the topic hash
      const eventSignature = contractEvent.topicHash;

      // Fetch logs
      const logs = await provider.getLogs({
        address: contractAddress,
        topics: [eventSignature],
        fromBlock: 0,
        toBlock: 'latest'
      });

      // Parse logs
      const parsedEvents = logs
        .map(log => {
          try {
            const parsedLog = contractInterface.parseLog(log);
            if (!parsedLog) return null;

            return {
              player: parsedLog.args[0],
              gameId: Number(parsedLog.args[1]),
              isWinner: parsedLog.args[2],
              betAmount: ethers.formatUnits(parsedLog.args[3], 18),
              amountWon: ethers.formatUnits(parsedLog.args[4], 18),
              bonus: parsedLog.args[5],
              isHead: parsedLog.args[6],
              transactionHash: log.transactionHash,
              blockNumber: log.blockNumber
            };
          } catch (error) {
            return null;
          }
        })
        .filter(Boolean) as GameResultEvent[];

      // Sort events by block number in descending order and limit
      const sortedAndLimitedEvents = parsedEvents
        .sort((a, b) => b.blockNumber - a.blockNumber)
        .slice(0, limit);

      if (sortedAndLimitedEvents.length === 0) {
        throw new Error('No events found for this contract');
      }

      setEvents(sortedAndLimitedEvents);
    } catch (error: any) {
      const errorMessage = error.message || 'Error fetching contract events';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch events on component mount or when connected
  useEffect(() => {
    handleConnect();
    // Check if wallet is already connected
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          setIsConnected(accounts.length > 0);
          
          if (accounts.length > 0) {
            await fetchContractEvents();
          }
        } catch (error) {
          setError('Error checking wallet connection');
        }
      }
    };

    checkConnection();
  }, []);

  // Render the component
  return (
    <div className="container mx-auto p-4">
      {/* <h1 className="text-2xl font-bold mb-4">Contract Events Viewer</h1> */}
      
      {!isConnected && showConnectButton ? (
        <Button onClick={handleConnect} className="mb-4">
         Please Connect Wallet For Latest Events
        </Button>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Button 
              onClick={fetchContractEvents} 
              disabled={isLoading}
              className="mb-4"
            >
              {/* {isLoading ? 'Fetching Events...' : 'Refresh'} */}
            </Button>
          </div>

          {error && (
            <div className="alert alert-error shadow-lg text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          {events.length > 0 && (
            <div className="overflow-x-auto">
              <table className="table text-center w-full">
                <thead className='text-gray-500   hover:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-800'>
                  <tr className='border-b my-10 py-10 transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted'>
                    <th>TXHASH</th>
                    <th>PLAYER</th>
                    <th>RESULT</th>
                    <th>AMOUNT WON</th>
                    <th>BET TYPE</th>
                  </tr>
                </thead>
                <tbody>
            
                  {events.map((event, index) => (
                    <tr className='border-b my-10 py-10 transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted' key={index}>
                      <td>
                        <a 
                          href={`https://testnet.explorer.ethena.fi/tx/${event.transactionHash}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-800 hover:underline"
                        >
                          {event.transactionHash.slice(0, 4)}... {event.transactionHash.slice(-4)}
                        </a>
                      </td>
                      <td className='text-gray-700 '>🟣0x{event.player.slice(2, 4)}...{event.player.slice(-4)}</td>
                      <td className={event.isWinner ? 'text-green-600' : 'text-red-600'}>
                        {event.isWinner ? 'Won' : 'Lost'}
                      </td>
                      <td className={event.isWinner ? 'text-green-600' : 'text-red-600'}>
                        {event.isWinner ? `+${event.amountWon} USDe 🏆` : `-${event.betAmount} USDe`}
                      </td>
                      <td className='text-gray-500 '>{event.isHead ? 'Tails' : 'Heads'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}



