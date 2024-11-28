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

export default function HeadOrTail() {
  const { account, walletConnected, connectWallet } = useWalletConnection();

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
                    <Button className="bg-[#7C3AED] hover:bg-[#6D28D9] h-12">HEAD</Button>
                    <Button variant="outline" className="border-zinc-700 hover:bg-zinc-800 h-12">TAIL</Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-zinc-400">AMOUNT</h3>
                  <div className="relative">
                    <input
                      type="text"
                      value="0.1"
                      className="w-full h-12 bg-zinc-900 rounded-lg px-4 pr-16"
                    />
                    <Button
                      className="absolute right-1 top-1 bottom-1 px-4 bg-zinc-800 hover:bg-zinc-700"
                    >
                      MAX
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-zinc-400">POTENTIAL PROFIT</h3>
                  <div className="h-12 bg-zinc-900 rounded-lg px-4 flex items-center">
                    0.20
                  </div>
                </div>

                {walletConnected ? (
                  <Button className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] h-12">
                    FLIP
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
                <div className="relative w-64 h-64">
                  {/* <div className="absolute inset-0 rounded-full bg-yellow-100" /> */}
                  <Image src="/home_images/head-or-tail.png" alt="coin" fill />


                  <Image src="/home_images/head.png" alt="coin" fill />

                  <Image src="/home_images/tail.png" alt="coin" fill />


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
                    <TableRow>
                      <TableCell>00:00</TableCell>
                      <TableCell>0.00</TableCell>
                      <TableCell>HEAD</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>0x123...abc</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </Tabs>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  )
}
