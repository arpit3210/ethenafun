import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'EthenaFun - Web3 Gaming Platform',
  description: 'Play and earn on the Ethena network',
  viewport: 'width=device-width, initial-scale=1',
  formatDetection: {
    telephone: false,
    date: false,
    email: false,
    address: false,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <meta name="format-detection" content="telephone=no, date=no, email=no, address=no" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800 relative overflow-hidden">
          {children}
        </div>
      </body>
    </html>
  )
}
