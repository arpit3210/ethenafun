'use client'

import { Volume2, Info } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Footer from "../components/footer"
import Sidebar from "../components/sidebar"

export default function SingleDice() {
  return (
    <div className="min-h-screen bg-[#13111C] text-white">
      <header className="flex items-center justify-between px-6 py-4 bg-[#1A1825]">
        <div className="text-2xl font-bold tracking-tighter">ETHENAFUN</div>
        <Button className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-medium px-6">
          CONNECT WALLET
        </Button>
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
                  <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((number) => (
                      <Button
                        key={number}
                        variant={number === 1 ? "default" : "outline"}
                        className={`h-16 ${
                          number === 1
                            ? "bg-[#7C3AED] hover:bg-[#6D28D9]"
                            : "border-zinc-700 hover:bg-zinc-800"
                        }`}
                      >
                        <div className="grid grid-cols-3 gap-1 w-full">
                          {Array(number)
                            .fill(null)
                            .map((_, i) => (
                              <div
                                key={i}
                                className="w-2 h-2 rounded-full bg-current"
                              />
                            ))}
                        </div>
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
                    0.59
                  </div>
                </div>
                
                <Button className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] h-12">
                  CONNECT WALLET
                </Button>
              </div>
              
              <div className="flex items-center justify-center">
                <div className="relative w-64 h-64">
                  <div className="absolute inset-0 bg-white rounded-2xl transform rotate-12">
                    <div className="grid grid-cols-2 gap-4 p-8">
                      <div className="w-4 h-4 rounded-full bg-black" />
                      <div className="w-4 h-4 rounded-full bg-black" />
                      <div className="w-4 h-4 rounded-full bg-black" />
                      <div className="w-4 h-4 rounded-full bg-black" />
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
                      <TableCell>4</TableCell>
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
