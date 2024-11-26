import './globals.css'
import { Inter } from 'next/font/google'
import { MobileNav } from './components/mobile-nav'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'EthenaFun - Blockchain Gaming',
  description: 'Experience the future of gaming with EthenaFun',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800 relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="jumbo absolute -inset-[10px] opacity-50"></div>
          </div>
          {children}
        </div>
      </body>
    </html>
  )
}
