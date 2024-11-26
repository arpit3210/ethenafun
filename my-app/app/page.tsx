import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { MobileNav } from "./components/mobile-nav"
import Sidebar from "./components/sidebar"
import GameCard from "./components/game-card"
import Banner from "./components/banner"
import TransactionHistory from "./components/transaction-history"
import Footer from "./components/footer"

export default function Home() {
  return (
    <div className="min-h-screen text-white">
      <header className="flex items-center justify-between px-4 lg:px-6 py-4 glass-effect">
        <div className="flex items-center gap-2">
          <MobileNav />
          <div className="text-xl lg:text-2xl font-bold tracking-tighter gradient-text">ETHENAFUN</div>
        </div>
        <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium px-4 lg:px-6 transition-all duration-300 ease-in-out transform hover:scale-105">
          CONNECT WALLET
        </Button>
      </header>
      
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 lg:p-6 space-y-6 lg:space-y-8">
          <Banner />
          
          <div className="space-y-4 lg:space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 lg:w-6 lg:h-6 rounded bg-gradient-to-r from-purple-400 to-pink-600"></div>
                <h2 className="text-xl lg:text-2xl font-bold gradient-text">GAMES</h2>
              </div>
              <div className="flex gap-2 ml-auto">
                <Button variant="outline" size="icon" className="glass-effect hover:bg-white/20 transition-all duration-300">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="glass-effect hover:bg-white/20 transition-all duration-300">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              <GameCard
                title="HEAD OR TAIL"
                bgColor="from-purple-500 to-indigo-500"
                image="/placeholder.svg?height=200&width=200"
                href="/head-or-tail"
              />
              <GameCard
                title="SINGLE DICE"
                bgColor="from-green-500 to-teal-500"
                image="/placeholder.svg?height=200&width=200"
                href="/single-dice"
              />
              <GameCard
                title="DOUBLE DICE"
                bgColor="from-blue-500 to-cyan-500"
                image="/placeholder.svg?height=200&width=200"
                href="/double-dice"
              />
              <GameCard
                title="ROCK-PAPER-SCISSORS"
                bgColor="from-red-500 to-orange-500"
                image="/placeholder.svg?height=200&width=200"
                href="/rock-paper"
              />
            </div>
          </div>
          
          <TransactionHistory />
        </main>
      </div>
      
      <Footer />
    </div>
  )
}
