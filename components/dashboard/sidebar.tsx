"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { TeamSwitcher } from "./team-switcher"
import { useAuth } from "@/contexts/auth-context"
import { useTeam } from "@/contexts/team-context"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  LayoutDashboard,
  Package,
  Wrench,
  Users,
  ClipboardList,
  FileText,
  UserCircle,
  Settings,
  LogOut,
  ExternalLink,
  Store,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Productos", href: "/dashboard/productos", icon: Package },
  { name: "Servicios", href: "/dashboard/servicios", icon: Wrench },
  { name: "Leads", href: "/dashboard/leads", icon: Users },
  { name: "Tareas", href: "/dashboard/tareas", icon: ClipboardList },
  { name: "Archivos", href: "/dashboard/archivos", icon: FileText },
]

const bottomNavigation = [
  { name: "Mi equipo", href: "/dashboard/equipo", icon: UserCircle },
  { name: "Configuración", href: "/dashboard/configuracion", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { activeTeam } = useTeam()

  return (
    <div className="flex h-full w-64 flex-col border-r bg-sidebar text-sidebar-foreground">
      {/* Header con Team Switcher */}
      <div className="p-4">
        <TeamSwitcher />
      </div>

      <Separator />

      {/* Navegación principal */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Link a tienda pública */}
        {activeTeam && (
          <div className="mt-6">
            <Separator className="mb-4" />
            <Link
              href={`/tienda/${activeTeam.slug}`}
              target="_blank"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground transition-colors"
            >
              <Store className="h-4 w-4" />
              Ver tienda pública
              <ExternalLink className="ml-auto h-3 w-3" />
            </Link>
          </div>
        )}
      </ScrollArea>

      {/* Navegación inferior */}
      <div className="border-t p-3">
        <nav className="space-y-1">
          {bottomNavigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <Separator className="my-3" />

        {/* Usuario y logout */}
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center">
              <span className="text-xs font-medium">{user?.nombre_usuario?.charAt(0).toUpperCase() || "U"}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium truncate max-w-[120px]">{user?.nombre_usuario}</span>
              <span className="text-xs text-muted-foreground truncate max-w-[120px]">{user?.email}</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={logout} className="h-8 w-8">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
