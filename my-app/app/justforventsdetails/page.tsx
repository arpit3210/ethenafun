'use client';

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWeb3Context } from '../context/Web3Context';
import { Button } from '@/components/ui/button';

// Define the event interface for type safety
interface GameResultEvent {
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

export default function EventPage() {
  const { account, connect, isConnected } = useWeb3Context();
  const [events, setEvents] = useState<GameResultEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Contract details
  const CONTRACT_ADDRESS = '0x81AAdF737Dc270F3C53B0a02C266d60Cd39Ca250';

  // Contract ABI for parsing events
  const contractABI = [
    "event GameResult(" +
      "address indexed player, " +
      "uint256 gameId, " +
      "bool isWinner, " +
      "uint256 betAmount, " +
      "uint256 amountWon, " +
      "bool bonus, " +
      "bool isHead" +
    ")"
  ];

  useEffect(() => {
    connect();   
    if (isConnected) {
      fetchContractEvents();
    }
  }, [isConnected]);

  async function fetchContractEvents() {
    if (!account) {
      setError('Please connect your wallet first');
      return;
    }

    try {
      // Check if Ethereum provider exists
      if (!window.ethereum) {
        setError('Ethereum provider not found. Please install MetaMask.');
        return;
      }

      setIsLoading(true);
      setError(null);

      // Use the connected provider from Web3Context
      const provider = new ethers.BrowserProvider(window.ethereum);

      // Create contract interface
      const contractInterface = new ethers.Interface(contractABI);

      // Safely get the event signature
      const gameResultEvent = contractInterface.getEvent('GameResult');
      
      if (!gameResultEvent) {
        throw new Error('GameResult event not found in ABI');
      }

      // Get the topic hash
      const eventSignature = gameResultEvent.topicHash;

      // Fetch events in batches (you might want to adjust the fromBlock and toBlock)
      const fromBlock = 0; // Starting block number
      const toBlock = 'latest'; // Latest block

      // Fetch logs
      const logs = await provider.getLogs({
        address: CONTRACT_ADDRESS,
        topics: [eventSignature],
        fromBlock,
        toBlock
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

      // Sort events by block number in descending order and take the first 10
      const sortedAndLimitedEvents = parsedEvents
        .sort((a, b) => b.blockNumber - a.blockNumber)
        .slice(0, 10);

      if (sortedAndLimitedEvents.length === 0) {
        setError('No events found for this contract');
        return;
      }

      setEvents(sortedAndLimitedEvents);
    } catch (error: any) {
      setError(error.message || 'Error fetching contract events');
      console.error('Event retrieval error:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Contract Events Viewer</h1>
      
      {!isConnected ? (
        <Button onClick={connect} className="mb-4">
          Connect Wallet
        </Button>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Button 
              onClick={fetchContractEvents} 
              disabled={isLoading}
              className="mb-4"
            >
              {isLoading ? 'Fetching Events...' : 'Fetch Contract Events'}
            </Button>
          </div>

          {error && (
            <div className="alert alert-error shadow-lg">
              <div>
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}

          {events.length > 0 && (
            <div className="overflow-x-auto">
              <table className="table text-center w-full">
                <thead className='text-gray-500'>
                  <tr>
                    <th>Tx Hash</th>
                    <th>Player</th>
                    <th>Result</th>
                    <th>Amount Won</th>
                    <th>Bet Type</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event, index) => (
                    <tr key={index}>
                      <td>
                        <a 
                          href={`https://testnet.explorer.ethena.fi/tx/${event.transactionHash}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {event.transactionHash.slice(0, 4)}... {event.transactionHash.slice(-4)}
                        </a>
                      </td>
                      <td>0x{event.player.slice(2, 4)}...{event.player.slice(-4)}</td>
                      <td className={event.isWinner ? 'text-green-600' : 'text-red-600'}>{event.isWinner ? 'Won' : 'Lost'}</td>
                      <td className={event.isWinner ? 'text-green-600' : 'text-red-600'}>{event.isWinner ? `+${event.amountWon} USDe` : `-${event.amountWon} ETH`}</td>
                      <td>{event.isHead ? 'Heads' : 'Tails'}</td>
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