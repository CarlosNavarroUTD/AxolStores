"use client"

import { useState } from "react"
import useSWR from "swr"
import { useTeam } from "@/contexts/team-context"
import { teamsApi } from "@/lib/api"
import { Header } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import { UserPlus, Crown, User } from "lucide-react"

interface TeamMember {
  id: number
  nombre: string
  apellido: string
  email: string
  telefono?: string
  role: string
  joined_at: string
}

export default function EquipoPage() {
  const { activeTeam } = useTeam()
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: members = [], mutate } = useSWR(activeTeam ? `team-members-${activeTeam.id}` : null, () =>
    activeTeam ? teamsApi.getMembers(activeTeam.id) : [],
  )

  const handleInvite = async () => {
    if (!activeTeam || !inviteEmail.trim()) return

    setIsSubmitting(true)
    try {
      await teamsApi.inviteMember(activeTeam.id, { email: inviteEmail })
      await mutate()
      setIsInviteDialogOpen(false)
      setInviteEmail("")
    } catch (error) {
      console.error("Error invitando miembro:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!activeTeam) {
    return (
      <div className="flex h-full flex-col">
        <Header title="Mi equipo" />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Selecciona una tienda para ver el equipo</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <Header title="Mi equipo" />

      <div className="flex-1 space-y-4 p-4 lg:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Equipo</h2>
            <p className="text-muted-foreground">Miembros de {activeTeam.name}</p>
          </div>
          <Button onClick={() => setIsInviteDialogOpen(true)} className="gap-2">
            <UserPlus className="h-4 w-4" />
            Invitar miembro
          </Button>
        </div>

        {/* Lista de miembros */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {members.map((member: TeamMember) => (
            <Card key={member.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      {member.role === "ADMIN" ? (
                        <Crown className="h-5 w-5 text-primary" />
                      ) : (
                        <User className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        {member.nombre} {member.apellido}
                      </CardTitle>
                      <CardDescription>{member.email}</CardDescription>
                    </div>
                  </div>
                  <Badge variant={member.role === "ADMIN" ? "default" : "secondary"}>
                    {member.role === "ADMIN" ? "Admin" : "Miembro"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Desde{" "}
                  {new Date(member.joined_at).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {members.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">No hay miembros en este equipo</div>
        )}
      </div>

      {/* Dialog invitar */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invitar miembro</DialogTitle>
            <DialogDescription>Envía una invitación por email para unirse a {activeTeam.name}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleInvite} disabled={isSubmitting || !inviteEmail.trim()}>
              {isSubmitting ? "Enviando..." : "Enviar invitación"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
