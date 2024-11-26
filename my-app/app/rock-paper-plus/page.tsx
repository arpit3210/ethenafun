'use client'

import { Volume2, Info, Power, Copy, ExternalLink } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Footer from "../components/footer"
import Sidebar from "../components/sidebar"

export default function RockPaperPlus() {
  return (
    <div className="min-h-screen bg-[#13111C] text-white">
      <header className="flex items-center justify-between px-6 py-4 bg-[#1A1825]">
        <div className="text-2xl font-bold tracking-tighter">ETHENAFUN</div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 rounded-lg">
            <div className="flex items-center gap-2">
              <span>0 U2U</span>
              <div className="w-4 h-4 rounded-full bg-[#7C3AED]" />
            </div>
            <div className="text-sm text-zinc-400">
              U2U Chain
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 rounded-lg">
            <span className="text-sm">0x8A....e92D0</span>
            <Copy className="w-4 h-4" />
            <ExternalLink className="w-4 h-4" />
          </div>
          <Button variant="ghost" size="icon">
            <Power className="w-5 h-5" />
          </Button>
        </div>
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
                  <h3 className="text-sm font-medium text-zinc-400">PICK SIDE</h3>
                  <div className="grid grid-cols-5 gap-4">
                    {['ROCK', 'PAPER', 'SCISSORS', 'LIZARD', 'SPOCK'].map((choice, index) => (
                      <Button
                        key={choice}
                        variant={index === 0 ? 'default' : 'outline'}
                        className={`h-16 rounded-full ${
                          index === 0
                            ? 'bg-[#7C3AED] hover:bg-[#6D28D9]'
                            : 'border-zinc-700 hover:bg-zinc-800'
                        }`}
                      >
                        <div className="w-6 h-6 bg-white/10 rounded-full" />
                      </Button>
                    ))}
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
                
                <Button className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] h-12">
                  PICK YOUR HAND
                </Button>
              </div>
              
              <div className="flex items-center justify-center">
                <div className="relative w-full h-96">
                  <div className="absolute inset-0 flex flex-col items-center justify-between py-12">
                    <div className="flex flex-col items-center">
                      <div className="w-32 h-32 rounded-full bg-[#2D2B37] flex items-center justify-center">
                        <span className="text-4xl">?</span>
                      </div>
                      <span className="mt-4 text-xl font-bold">COMPUTER</span>
                    </div>
                    
                    <div className="text-6xl font-bold">VS</div>
                    
                    <div className="flex flex-col items-center">
                      <div className="w-32 h-32 rounded-full bg-[#2D2B37] flex items-center justify-center">
                        <span className="text-4xl">?</span>
                      </div>
                      <span className="mt-4 text-xl font-bold">PLAYER</span>
                    </div>
                  </div>
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
                      <TableCell>ROCK</TableCell>
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
