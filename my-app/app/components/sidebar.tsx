"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const routes = [
  {
    href: "/",
    label: "Home",
    icon: "🏠"
  },
  {
    href: "/head-or-tail",
    label: "Head or Tail",
    icon: "🎯"
  },
  {
    href: "/single-dice",
    label: "Single Dice",
    icon: "🎲"
  },
  {
    href: "/double-dice",
    label: "Double Dice",
    icon: "🎲"
  },
  {
    href: "/rock-paper",
    label: "Rock Paper",
    icon: "✂️"
  },
  {
    href: "/rock-paper-plus",
    label: "Rock Paper ++",
    icon: "✂️"
  }
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden lg:block w-64 glass-effect min-h-[calc(100vh-73px)] p-4">
      <nav className="space-y-2">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex items-center gap-3 px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-all duration-300 group",
              pathname === route.href && "bg-white/10 gradient-text"
            )}
          >
            <span className="text-xl">{route.icon}</span>
            <span className="group-hover:gradient-text transition-all duration-300">
              {route.label}
            </span>
          </Link>
        ))}
      </nav>
    </div>
  )
}

