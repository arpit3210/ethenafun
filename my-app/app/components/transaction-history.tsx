import Link from "next/link"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Transaction {
  game: string
  gameIcon: string
  address: string
  profit: number
  txHash: string
  time: string
}

const transactions: Transaction[] = [
  {
    game: "Single Dice",
    gameIcon: "🎲",
    address: "0x6f...b637f",
    profit: 4.88,
    txHash: "0xcd...ef3ea",
    time: "57 mins ago"
  },
  {
    game: "Head or Tail",
    gameIcon: "🎯",
    address: "0x6f...b637f",
    profit: 0.96,
    txHash: "0x38...72672",
    time: "57 mins ago"
  },
  {
    game: "Rock Paper ++",
    gameIcon: "✂️",
    address: "0x7a...7c5e4",
    profit: -2,
    txHash: "0x05...3f01a",
    time: "1 hr ago"
  },
  // Add more transactions as needed
]

export default function TransactionHistory() {
  return (
    <div className="p-6 glass-effect rounded-lg">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-600 rounded"></div>
        <h2 className="text-2xl font-bold gradient-text">HISTORY</h2>
      </div>
      
      <Tabs defaultValue="all-transactions">
        <TabsList className="bg-white/5 mb-4">
          <TabsTrigger value="all-transactions" className="data-[state=active]:bg-white/10">All Transactions</TabsTrigger>
          <TabsTrigger value="leader-board" className="data-[state=active]:bg-white/10">Leader Board</TabsTrigger>
        </TabsList>
        
        <div className="space-y-2">
          <div className="grid grid-cols-5 gap-4 px-4 py-2 text-sm text-zinc-400">
            <div>GAME</div>
            <div>ADDRESS</div>
            <div>PROFIT</div>
            <div>TX HASH</div>
            <div>TIMER</div>
          </div>
          
          <div className="space-y-2">
            {transactions.map((tx, index) => (
              <div key={index} className="grid grid-cols-5 gap-4 px-4 py-3 text-sm hover:bg-white/5 rounded-lg transition-all duration-300">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{tx.gameIcon}</span>
                  <span>{tx.game}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-r from-purple-400 to-pink-600"></div>
                  <Link href="#" className="text-blue-400 hover:underline transition-all duration-300">
                    {tx.address}
                  </Link>
                </div>
                <div className={`${tx.profit >= 0 ? "text-green-500" : "text-red-500"} font-medium`}>
                  {tx.profit >= 0 ? "+" : ""}{tx.profit} USDe
                </div>
                <div>
                  <Link href="#" className="text-blue-400 hover:underline transition-all duration-
300">
                    {tx.txHash}
                  </Link>
                </div>
                <div className="text-zinc-400">{tx.time}</div>
              </div>
            ))}
          </div>
        </div>
      </Tabs>
    </div>
  )
}

