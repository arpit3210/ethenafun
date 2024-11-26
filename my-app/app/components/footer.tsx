import { Facebook, Twitter, TextIcon as Telegram, Linkedin } from 'lucide-react'
import Link from "next/link"

export default function Footer() {
  return (
    <footer className="glass-effect text-white py-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="text-2xl font-bold tracking-tighter gradient-text mb-4">ETHENAFUN</div>
            <p className="text-sm text-gray-400">
              Copyright 2023 EthenaFun. All rights reserved.
            </p>
          </div>
          
          {[
            { title: "PLATFORM", links: ["Support", "FAQs"] },
            { title: "ABOUT US", links: ["Cookies Policy", "Privacy Policy"] },
          ].map((section, index) => (
            <div key={index}>
              <h3 className="text-lg font-semibold mb-4 gradient-text">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link href="#" className="text-zinc-400 hover:text-white transition-all duration-300">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          
          <div>
            <h3 className="text-lg font-semibold mb-4 gradient-text">COMMUNITY BUILD</h3>
            <div className="flex gap-4">
              {[Facebook, Telegram, Twitter, Linkedin].map((Icon, index) => (
                <Link key={index} href="#" className="text-zinc-400 hover:text-white transition-all duration-300 transform hover:scale-110">
                  <Icon className="h-6 w-6" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
