"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Store, Menu, Package, Wrench, Mail } from "lucide-react"

interface Team {
  id: number
  name: string
  slug: string
  description?: string
}

interface StoreHeaderProps {
  team: Team
}

const navItems = [
  { name: "Productos", href: "#productos", icon: Package },
  { name: "Servicios", href: "#servicios", icon: Wrench },
  { name: "Contacto", href: "#contacto", icon: Mail },
]

export function StoreHeader({ team }: StoreHeaderProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href={`/tienda/${team.slug}`} className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Store className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold">{team.name}</span>
        </Link>

        {/* Nav desktop */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.name}
            </a>
          ))}
        </nav>

        {/* CTA desktop */}
        <div className="hidden md:block">
          <Button asChild>
            <a href="#contacto">Contáctanos</a>
          </Button>
        </div>

        {/* Menu móvil */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64">
            <nav className="flex flex-col gap-4 mt-8">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 text-lg font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </a>
              ))}
              <Button asChild className="mt-4">
                <a href="#contacto" onClick={() => setIsOpen(false)}>
                  Contáctanos
                </a>
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
