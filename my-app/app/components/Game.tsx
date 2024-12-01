import React, { useState } from 'react';
import { useWeb3Context } from '../context/Web3Context';
import { GameResultDisplay } from './GameResultDisplay';
import { ethers } from 'ethers';

export const Game: React.FC = () => {
    const [currentGameId, setCurrentGameId] = useState<string | null>(null);
    const [betAmount, setBetAmount] = useState('0.1');
    const [error, setError] = useState<string | null>(null);
    const { gameInteraction, isConnected, balance } = useWeb3Context();

    const handlePlay = async (choice: 'heads' | 'tails') => {
        if (!gameInteraction || !isConnected) return;

        try {
            setError(null);
            const amount = ethers.parseEther(betAmount);
            const { gameId } = await gameInteraction.play(choice === 'heads', amount);
            setCurrentGameId(gameId);
        } catch (error) {
            console.error('Error playing game:', error);
            setError(error instanceof Error ? error.message : 'Failed to play game');
        }
    };

    return (
        <div className="max-w-lg mx-auto p-6 space-y-6">
            <h2 className="text-2xl font-bold text-center mb-6">Heads or Tails</h2>
            
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                    Bet Amount (ETH)
                </label>
                <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                    Your balance: {balance} ETH
                </p>
            </div>

            <div className="flex justify-center space-x-4">
                <button
                    onClick={() => handlePlay('heads')}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!isConnected || Number(betAmount) <= 0}
                >
                    Heads
                </button>
                <button
                    onClick={() => handlePlay('tails')}
                    className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!isConnected || Number(betAmount) <= 0}
                >
                    Tails
                </button>
            </div>

            {!isConnected && (
                <p className="text-center text-red-500">
                    Please connect your wallet to play
                </p>
            )}

            {error && (
                <p className="text-center text-red-500">
                    {error}
                </p>
            )}

            {currentGameId && (
                <GameResultDisplay gameId={currentGameId} />
            )}
        </div>
    );
};
