'use client'

import { Volume2, Info } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import Image from 'next/image'
import { MobileNav } from '../components/mobile-nav'
import Sidebar from '../components/sidebar'
import ConnectButton from '../components/ConnectButton'
import Footer from '../components/footer'
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useWalletConnection } from '../hooks/useWalletConnection'
import { useHeadOrTailGame } from '../hooks/useHeadOrTailGame'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import ResultModal from '../components/ResultModal';

export default function HeadOrTail() {
  const { account, walletConnected, connectWallet } = useWalletConnection();
  const {
    selectedSide,
    amount,
    potentialProfit,
    isFlipping,
    gameHistory,
    balance,
    handleSelectSide,
    handleAmountChange,
    handleMaxAmount,
    placeBet,
    showResult,
    gameResult,
    closeResultModal
  } = useHeadOrTailGame();

  const [isRotating, setIsRotating] = useState(false);

  useEffect(() => {
    if (isFlipping) {
      setIsRotating(true);
      const timer = setTimeout(() => {
        setIsRotating(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isFlipping]);

  return (
    <div className="min-h-screen bg-[#13111C] text-white">
      <header className="flex justify-between items-center p-4 lg:p-6 bg-[#1A1825]">
        <div className="flex items-center gap-2">
          <MobileNav />
          <div className="text-2xl font-bold tracking-tighter">ETHENAFUN</div>
        </div>
        <ConnectButton />
      </header>

      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="relative min-h-[600px] rounded-lg overflow-hidden bg-[#1A1825] p-8">
            <div className="absolute top-4 right-4 flex gap-2">
              <Button variant="ghost" size="icon" className="text-white">
                <Volume2 className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-white">
                <Info className="h-5 w-5" />
              </Button>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <div className="space-y-8">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-zinc-400">PICK NUMBER</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      className={cn(
                        "h-12",
                        selectedSide === 'HEAD' 
                          ? "bg-[#7C3AED] hover:bg-[#6D28D9]" 
                          : "border-zinc-700 hover:bg-zinc-800"
                      )}
                      onClick={() => handleSelectSide('HEAD')}
                    >
                      HEAD
                    </Button>
                    <Button 
                      className={cn(
                        "h-12",
                        selectedSide === 'TAIL' 
                          ? "bg-[#7C3AED] hover:bg-[#6D28D9]" 
                          : "border-zinc-700 hover:bg-zinc-800"
                      )}
                      onClick={() => handleSelectSide('TAIL')}
                    >
                      TAIL
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-zinc-400">AMOUNT</h3>
                  <div className="relative">
                    <input
                      type="text"
                      value={amount}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      className="w-full h-12 bg-zinc-900 rounded-lg px-4 pr-16"
                    />
                    <Button
                      className="absolute right-1 top-1 bottom-1 px-4 bg-zinc-800 hover:bg-zinc-700"
                      onClick={handleMaxAmount}
                    >
                      MAX
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-zinc-400">POTENTIAL PROFIT</h3>
                  <div className="h-12 bg-zinc-900 rounded-lg px-4 flex items-center">
                    {potentialProfit}
                  </div>
                </div>

                {walletConnected ? (
                  <Button 
                    className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] h-12"
                    onClick={placeBet}
                    disabled={!selectedSide || !amount || isFlipping}
                  >
                    {isFlipping ? 'FLIPPING...' : 'FLIP'}
                  </Button>
                ) : (
                  <Button 
                    className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] h-12"
                    onClick={connectWallet}
                  >
                    CONNECT WALLET
                  </Button>
                )}
              </div>

              <div className="flex items-center justify-center">
                <div className={cn(
                  "relative w-64 h-64 transition-transform duration-1000",
                  isRotating && "animate-spin"
                )}>
                  {selectedSide === null && (
                    <Image src="/home_images/head-or-tail.png" alt="coin" fill />
                  )}
                  {selectedSide === 'HEAD' && (
                    <Image src="/home_images/head.png" alt="head" fill />
                  )}
                  {selectedSide === 'TAIL' && (
                    <Image src="/home_images/tail.png" alt="tail" fill />
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-6 h-6 bg-[#7C3AED]" />
              <h2 className="text-2xl font-bold">HISTORY</h2>
            </div>

            <Tabs defaultValue="my-transactions">
              <TabsList className="bg-zinc-900">
                <TabsTrigger value="my-transactions">My Transactions</TabsTrigger>
                <TabsTrigger value="all-transactions">All Transactions</TabsTrigger>
                <TabsTrigger value="leader-board">Leader Board</TabsTrigger>
              </TabsList>

              <div className="mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>TIMER</TableHead>
                      <TableHead>PROFIT</TableHead>
                      <TableHead>PICKED</TableHead>
                      <TableHead>RESULT</TableHead>
                      <TableHead>TXHASH</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {gameHistory.map((game, index) => (
                      <TableRow key={index}>
                        <TableCell>{game.timestamp ? new Date(Number(game.timestamp) * 1000).toLocaleTimeString() : '-'}</TableCell>
                        <TableCell>{game.amountWon ? (Number(game.amountWon) / 1e18).toFixed(2) : '-'}</TableCell>
                        <TableCell>{game.picked ? 'HEAD' : 'TAIL'}</TableCell>
                        <TableCell>{game.isWinner ? 'WIN' : 'LOSE'}</TableCell>
                        <TableCell>
                          {game.txHash && game.txHash !== '-'
                            ? `${game.txHash.slice(0, 6)}...${game.txHash.slice(-4)}`
                            : '-'
                          }
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Tabs>
          </div>
        </main>
      </div>

      <ResultModal
        isOpen={showResult}
        onClose={closeResultModal}
        result={gameResult}
      />

      <Footer />
    </div>
  )
}
