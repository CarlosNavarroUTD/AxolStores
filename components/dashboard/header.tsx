"use client"

import { useAuth } from "@/contexts/auth-context"
import { useTeam } from "@/contexts/team-context"
import { useTheme } from "@/contexts/theme-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Sun, Moon, Bell, Menu, User, LogOut, Search } from "lucide-react"

import { useState } from "react"
import { usePathname } from "next/navigation"
import useSWR from "swr"
import { teamsApi } from "@/lib/api"

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/productos": "Productos",
  "/dashboard/servicios": "Servicios",
  "/dashboard/leads": "Leads",
  "/dashboard/tareas": "Tareas",
  "/dashboard/archivos": "Archivos",
  "/dashboard/notas": "Notas",
  "/dashboard/whatsapp": "WhatsApp",
  "/dashboard/campanas": "Campañas",
  "/dashboard/equipo": "Mi equipo",
  "/dashboard/configuracion": "Configuración",
  "/dashboard/migraciones": "Migraciones",
}

export interface HeaderProps {
  onMenuClick?: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth()
  const { activeTeam, refreshTeams } = useTeam()
  const { theme, toggleTheme } = useTheme()
  const [isProcessing, setIsProcessing] = useState(false)
  const pathname = usePathname()
  const pageTitle = pageTitles[pathname] || "Dashboard"

  const { data: invitations = [], mutate: mutateInvitations } = useSWR(
    user ? "my-invitations" : null,
    teamsApi.getMyInvitations,
    { refreshInterval: 60000 } // Polling every minute
  )

  const handleAcceptInvitation = async (id: number) => {
    setIsProcessing(true)
    try {
      await teamsApi.acceptInvitation(id)
      await mutateInvitations()
      await refreshTeams() // Refresh teams after accepting
    } catch (error) {
      console.error("Error aceptando invitación:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRejectInvitation = async (id: number) => {
    setIsProcessing(true)
    try {
      await teamsApi.rejectInvitation(id)
      await mutateInvitations()
    } catch (error) {
      console.error("Error rechazando invitación:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const initials = user?.nombre_usuario?.substring(0, 2).toUpperCase() || "U"

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border/50 bg-background/95 px-4 lg:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-4">
        {onMenuClick && (
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        )}
        <h1 className="text-lg font-semibold">{activeTeam?.name || "Dashboard"}<span className="text-muted-foreground font-normal"> - {pageTitle}</span></h1>
      </div>

      <div className="flex items-center gap-2 lg:gap-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Buscar..." className="w-64 pl-8" />
        </div>

        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          <span className="sr-only">Toggle theme</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {invitations.length > 0 && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
              )}
              <span className="sr-only">Notificaciones</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {invitations.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">No tienes notificaciones nuevas</div>
            ) : (
              invitations.map((invitation: any) => (
                <div key={invitation.id} className="p-3 border-b last:border-0">
                  <p className="text-sm font-medium mb-1">
                    Te han invitado al equipo <strong>{invitation.team?.name || "Equipo"}</strong>
                  </p>
                  <p className="text-xs text-muted-foreground mb-2">Por: {invitation.created_by?.email || "Usuario"}</p>
                  <div className="flex gap-2">
                    <Button size="sm" className="w-full" onClick={() => handleAcceptInvitation(invitation.id)} disabled={isProcessing}>Aceptar</Button>
                    <Button size="sm" variant="outline" className="w-full text-red-500 hover:text-red-600" onClick={() => handleRejectInvitation(invitation.id)} disabled={isProcessing}>Rechazar</Button>
                  </div>
                </div>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.nombre_usuario}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-red-600 dark:text-red-400">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
