"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu } from 'lucide-react'

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
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

export function MobileNav() {
  const pathname = usePathname()
  const [open, setOpen] = React.useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 lg:hidden"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold tracking-tighter gradient-text">ETHENAFUN</SheetTitle>
        </SheetHeader>
        <nav className="mt-8">
          <div className="flex flex-col space-y-3">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
                  pathname === route.href
                    ? "text-foreground"
                    : "text-foreground/60"
                )}
              >
                <span className="text-xl">{route.icon}</span>
                {route.label}
              </Link>
            ))}
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  )
}
