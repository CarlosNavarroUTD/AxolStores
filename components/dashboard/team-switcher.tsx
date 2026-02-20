"use client"

import { useState } from "react"
import { useTeam } from "@/contexts/team-context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ChevronsUpDown, Plus, Check, Store } from "lucide-react"
import { teamsApi } from "@/lib/api"

export function TeamSwitcher() {
  const { teams, activeTeam, setActiveTeam, refreshTeams } = useTeam()
  const [isOpen, setIsOpen] = useState(false)
  const [showNewTeamDialog, setShowNewTeamDialog] = useState(false)
  const [newTeam, setNewTeam] = useState({ name: "", description: "" })
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateTeam = async () => {
    if (!newTeam.name.trim()) return

    setIsCreating(true)
    try {
      const created = await teamsApi.createTeam(newTeam)
      await refreshTeams()
      setActiveTeam(created)
      setShowNewTeamDialog(false)
      setNewTeam({ name: "", description: "" })
    } catch (error) {
      console.error("Error creando team:", error)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between gap-2 px-3 bg-transparent">
            <div className="flex items-center gap-2 truncate">
              <Store className="h-4 w-4 shrink-0" />
              <span className="truncate">{activeTeam?.name || "Seleccionar tienda"}</span>
            </div>
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="start">
          <DropdownMenuLabel>Mis tiendas</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {teams.map((team) => (
            <DropdownMenuItem
              key={team.id}
              onClick={() => {
                setActiveTeam(team)
                setIsOpen(false)
              }}
              className="flex items-center justify-between"
            >
              <span className="truncate">{team.name}</span>
              {activeTeam?.id === team.id && <Check className="h-4 w-4 shrink-0" />}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowNewTeamDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Crear nueva tienda
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showNewTeamDialog} onOpenChange={setShowNewTeamDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear nueva tienda</DialogTitle>
            <DialogDescription>Crea una nueva tienda para gestionar productos y servicios</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la tienda</Label>
              <Input
                id="name"
                placeholder="Mi Tienda"
                value={newTeam.name}
                onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                placeholder="Describe tu tienda..."
                value={newTeam.description}
                onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewTeamDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateTeam} disabled={isCreating || !newTeam.name.trim()}>
              {isCreating ? "Creando..." : "Crear tienda"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
