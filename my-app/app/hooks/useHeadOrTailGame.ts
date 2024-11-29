import { useState, useCallback, useEffect } from 'react';
import { useWeb3Context } from '../context/Web3Context';
import { formatNumberForContract } from '../utils/format';
import { GAME_CONFIG } from '../constants/gameConfig';
import { GameInteraction } from '../frontend_files_for_contract_integration/gameInteraction';
import { ethers } from 'ethers';

interface GameResult {
  isWin: boolean;
  amount: string;
  multiplier: number;
}

export const useHeadOrTailGame = () => {
  const { account, chainId, gameInteraction } = useWeb3Context();
  const [balance, setBalance] = useState<string>('0');
  const [selectedSide, setSelectedSide] = useState<'HEAD' | 'TAIL' | null>(null);
  const [amount, setAmount] = useState<string>('0.1');
  const [isFlipping, setIsFlipping] = useState(false);
  const [gameHistory, setGameHistory] = useState<any[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [potentialProfit, setPotentialProfit] = useState<string>('0.0');
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!gameInteraction || !account) return;
    try {
      const balance = await gameInteraction.getBalance();
      setBalance(balance);
      setError(null);
    } catch (error) {
      console.error('Error fetching balance:', error);
      setBalance('0');
      setError('Failed to fetch balance');
    }
  }, [gameInteraction, account]);

  const fetchGameHistory = useCallback(async () => {
    if (!gameInteraction || !account) return;
    try {
      const history = await gameInteraction.getPlayerHistory();
      setGameHistory(history);
      setError(null);
    } catch (error) {
      console.error('Error fetching game history:', error);
      setGameHistory([]);
      setError('Failed to fetch game history');
    }
  }, [gameInteraction, account]);

  useEffect(() => {
    if (gameInteraction && account) {
      fetchBalance();
      fetchGameHistory();
    }
  }, [gameInteraction, account, fetchBalance, fetchGameHistory]);

  const calculatePotentialProfit = useCallback(() => {
    if (!amount || !selectedSide) {
      setPotentialProfit('0.0');
      return;
    }
    const multiplier = GAME_CONFIG.NORMAL_MULTIPLIER;
    const profit = parseFloat(amount) * multiplier;
    setPotentialProfit(profit.toFixed(2));
  }, [amount, selectedSide]);

  useEffect(() => {
    calculatePotentialProfit();
  }, [amount, selectedSide, calculatePotentialProfit]);

  const handleSelectSide = useCallback((side: 'HEAD' | 'TAIL') => {
    setSelectedSide(side);
    setError(null);
  }, []);

  const handleAmountChange = useCallback((value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setAmount(value);
      setError(null);
    }
  }, []);

  const handleMaxAmount = useCallback(() => {
    setAmount(balance);
    setError(null);
  }, [balance]);

  const placeBet = async () => {
    if (!gameInteraction || !account || !selectedSide) {
      setError('Please connect wallet and select a side');
      return;
    }

    try {
      setIsFlipping(true);
      setError(null);
      
      // Validate bet amount
      const betAmount = parseFloat(amount);
      if (betAmount < 0.1 || betAmount > 0.5) {
        throw new Error('Bet amount must be between 0.1 and 0.5 USDe');
      }
      
      // Format amount for contract
      const formattedAmount = formatNumberForContract(amount);
      
      // Check allowance
      const currentAllowance = await gameInteraction.checkAllowance();
      if (currentAllowance < BigInt(formattedAmount)) {
        await gameInteraction.approveTokenSpending(formattedAmount);
      }
      
      // Place bet
      const tx = await gameInteraction.play(selectedSide === 'HEAD', BigInt(formattedAmount));
      
      // Wait for result
      const result = await gameInteraction.waitForGameResult(tx);
      
      // Update game result
      setGameResult({
        isWin: result.isWin,
        amount: result.isWin ? result.amountWon : result.betAmount,
        multiplier: result.bonus ? GAME_CONFIG.BONUS_MULTIPLIER : GAME_CONFIG.NORMAL_MULTIPLIER
      });
      setShowResult(true);
      
      // Refresh data
      await Promise.all([fetchBalance(), fetchGameHistory()]);
    } catch (error: any) {
      console.error('Error placing bet:', error);
      setError(error.message || 'Failed to place bet');
    } finally {
      setIsFlipping(false);
    }
  };

  const closeResultModal = useCallback(() => {
    setShowResult(false);
    setGameResult(null);
    setError(null);
  }, []);

  return {
    balance,
    selectedSide,
    amount,
    isFlipping,
    gameHistory,
    showResult,
    gameResult,
    potentialProfit,
    error,
    handleSelectSide,
    handleAmountChange,
    handleMaxAmount,
    placeBet,
    closeResultModal
  };
};
