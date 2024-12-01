import React from 'react';
import { useGameResult } from '../hooks/useGameResult';

interface GameResultDisplayProps {
    gameId: string | null;
}

export const GameResultDisplay: React.FC<GameResultDisplayProps> = ({ gameId }) => {
    const { result, loading, error } = useGameResult(gameId);

    if (!gameId) return null;
    if (error) return <div className="text-red-500">Error: {error.message}</div>;
    if (loading) return <div className="animate-pulse">Checking game result...</div>;

    if (!result) return null;

    if (result.pending) {
        return (
            <div className="text-yellow-500">
                Game is still in progress...
                <div className="mt-2 animate-spin h-5 w-5 border-2 border-yellow-500 rounded-full border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="p-4 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white">
            <h3 className="text-xl font-bold mb-2">Game Result</h3>
            <div className="space-y-2">
                <p>Game ID: {gameId}</p>
                <p>Result: {result.isWin ? 'You Won! 🎉' : 'You Lost 😢'}</p>
                {result.amountWon !== '0' && (
                    <p>Payout: {result.amountWon} tokens</p>
                )}
                <p>Bet Amount: {result.betAmount} tokens</p>
                {result.bonus && <p className="text-yellow-400">🌟 Bonus Win! 🌟</p>}
            </div>
        </div>
    );
};
