'use client';

import React, { useState } from 'react';
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
}

export default function EventPage() {
  const { account, connect, isConnected } = useWeb3Context();
  const [txHash, setTxHash] = useState('');
  const [events, setEvents] = useState<GameResultEvent[]>([]);
  const [error, setError] = useState<string | null>(null);

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

  async function getEventDetailsFromTxHash() {
    if (!account) {
      setError('Please connect your wallet first');
      return;
    }

    try {
        // Before creating the provider, check if window.ethereum exists
if (!window.ethereum) {
    setError('Ethereum provider not found. Please install MetaMask.');
    return;
  }
      // Use the connected provider from Web3Context
      const provider = new ethers.BrowserProvider(window.ethereum);

      // Validate transaction hash
      if (!txHash || !ethers.isHexString(txHash, 32)) {
        setError('Invalid transaction hash');
        return;
      }

      // Get the transaction receipt
      const receipt = await provider.getTransactionReceipt(txHash);

      if (!receipt) {
        setError('Transaction receipt not found');
        return;
      }

      // Parse logs using contract ABI
      const contractInterface = new ethers.Interface(contractABI);

      // Extract and decode logs
      const parsedEvents = receipt.logs
        .map(log => {
          try {
            // Attempt to parse the log
            const parsedLog = contractInterface.parseLog(log);
            if (!parsedLog) return null; 
            return {
              player: parsedLog.args[0],
              gameId: Number(parsedLog.args[1]),
              isWinner: parsedLog.args[2],
              betAmount: ethers.formatUnits(parsedLog.args[3], 18),
              amountWon: ethers.formatUnits(parsedLog.args[4], 18),
              bonus: parsedLog.args[5],
              isHead: parsedLog.args[6]
            };
          } catch (error) {
            // Log might not match the event we're looking for
            return null;
          }
        })
        .filter(Boolean) as GameResultEvent[];

      if (parsedEvents.length === 0) {
        setError('No matching events found in this transaction');
        return;
      }

      setEvents(parsedEvents);
      setError(null);
    } catch (error: any) {
      setError(error.message || 'Error fetching event details');
      console.error('Event retrieval error:', error);
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Transaction Event Viewer</h1>
      
      {!isConnected ? (
        <Button onClick={connect} className="mb-4">
          Connect Wallet
        </Button>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              placeholder="Enter Transaction Hash"
              className="input input-bordered w-full max-w-xs"
            />
            <Button onClick={getEventDetailsFromTxHash} disabled={!txHash}>
              Fetch Events
            </Button>
          </div>

          {error && (
            <div className="alert alert-error shadow-lg">
              <div>
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>{error}</span>
              </div>
            </div>
          )}

          {events.length > 0 && (
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Player</th>
                    <th>Game ID</th>
                    <th>Result</th>
                    <th>Bet Amount</th>
                    <th>Amount Won</th>
                    <th>Bonus</th>
                    <th>Bet Type</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event, index) => (
                    <tr key={index}>
                      <td>{event.player}</td>
                      <td>{event.gameId}</td>
                      <td>{event.isWinner ? 'Won' : 'Lost'}</td>
                      <td>{event.betAmount} ETH</td>
                      <td>{event.amountWon} ETH</td>
                      <td>{event.bonus ? 'Yes' : 'No'}</td>
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