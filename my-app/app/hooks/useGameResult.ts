import { useState, useEffect, useCallback } from 'react';
import { GameResult } from '../frontend_files_for_contract_integration/gameInteraction';
import { useWeb3Context } from '../context/Web3Context';

export const useGameResult = (gameId: string | null) => {
    const [result, setResult] = useState<GameResult | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);
    const { gameInteraction } = useWeb3Context();

    const checkResult = useCallback(async () => {
        if (!gameId || !gameInteraction) return;

        try {
            setLoading(true);
            const gameResult = await gameInteraction.checkGameResult(gameId);
            setResult(gameResult);
            
            // If the game is still pending, schedule another check
            if (gameResult.pending) {
                setTimeout(() => checkResult(), 5000); // Check every 5 seconds
            }
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to check game result'));
        } finally {
            setLoading(false);
        }
    }, [gameId, gameInteraction]);

    useEffect(() => {
        if (gameId) {
            checkResult();
        }
    }, [gameId, checkResult]);

    return { result, loading, error, refreshResult: checkResult };
};
