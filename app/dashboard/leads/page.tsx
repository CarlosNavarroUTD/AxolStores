"use client"

import { useState } from "react"
import useSWR from "swr"
import { useTeam } from "@/contexts/team-context"
import { leadsApi, type LeadData } from "@/lib/api"
import { Header } from "@/components/dashboard/header"
import { DataTable, type Column } from "@/components/dashboard/data-table"
import { Button } from "@/components/ui/button"
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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Plus, User } from "lucide-react"

interface Lead {
  id: number
  nombre: string
  email?: string
  telefono?: string
  mensaje?: string
  estado: string
  team: number
  created_at?: string
}

const estadosLead = [
  { value: "nuevo", label: "Nuevo", variant: "default" as const },
  { value: "contactado", label: "Contactado", variant: "secondary" as const },
  { value: "en_proceso", label: "En proceso", variant: "outline" as const },
  { value: "convertido", label: "Convertido", variant: "default" as const },
  { value: "perdido", label: "Perdido", variant: "destructive" as const },
]

const emptyLead: Omit<Lead, "id"> = {
  nombre: "",
  email: "",
  telefono: "",
  mensaje: "",
  estado: "nuevo",
  team: 0,
}

export default function LeadsPage() {
  const { activeTeam } = useTeam()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [formData, setFormData] = useState<Omit<Lead, "id">>(emptyLead)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    data: leads = [],
    mutate,
    isLoading,
  } = useSWR(activeTeam ? `leads-${activeTeam.id}` : null, () => (activeTeam ? leadsApi.getAll(activeTeam.id) : []))

  const getEstadoBadge = (estado: string) => {
    const estadoInfo = estadosLead.find((e) => e.value === estado) || estadosLead[0]
    return <Badge variant={estadoInfo.variant}>{estadoInfo.label}</Badge>
  }

  const columns: Column<Lead>[] = [
    {
      key: "nombre",
      header: "Nombre",
      cell: (lead) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
            <User className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">{lead.nombre}</p>
            <p className="text-sm text-muted-foreground">{lead.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "telefono",
      header: "Teléfono",
      cell: (lead) => lead.telefono || "—",
    },
    {
      key: "estado",
      header: "Estado",
      cell: (lead) => getEstadoBadge(lead.estado),
    },
    {
      key: "created_at",
      header: "Fecha",
      cell: (lead) =>
        lead.created_at
          ? new Date(lead.created_at).toLocaleDateString("es-ES", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "—",
    },
  ]

  const handleOpenDialog = (lead?: Lead) => {
    if (lead) {
      setEditingLead(lead)
      setFormData({
        nombre: lead.nombre,
        email: lead.email || "",
        telefono: lead.telefono || "",
        mensaje: lead.mensaje || "",
        estado: lead.estado,
        team: lead.team,
      })
    } else {
      setEditingLead(null)
      setFormData({ ...emptyLead, team: activeTeam?.id || 0 })
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!activeTeam) return

    setIsSubmitting(true)
    try {
      const data: LeadData = {
        ...formData,
        team: activeTeam.id,
      }

      if (editingLead) {
        await leadsApi.update(editingLead.id, data)
      } else {
        await leadsApi.create(data)
      }
      await mutate()
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error guardando lead:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!editingLead) return

    setIsSubmitting(true)
    try {
      await leadsApi.delete(editingLead.id)
      await mutate()
      setIsDeleteDialogOpen(false)
      setEditingLead(null)
    } catch (error) {
      console.error("Error eliminando lead:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const openDeleteDialog = (lead: Lead) => {
    setEditingLead(lead)
    setIsDeleteDialogOpen(true)
  }

  if (!activeTeam) {
    return (
      <div className="flex h-full flex-col">
        <Header title="Leads" />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Selecciona una tienda para ver los leads</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <Header title="Leads" />

      <div className="flex-1 space-y-4 p-4 lg:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Leads</h2>
            <p className="text-muted-foreground">Gestiona los leads de {activeTeam.name}</p>
          </div>
          <Button onClick={() => handleOpenDialog()} className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo lead
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <DataTable
            data={leads}
            columns={columns}
            onEdit={handleOpenDialog}
            onDelete={openDeleteDialog}
            searchKey="nombre"
            searchPlaceholder="Buscar leads..."
          />
        )}
      </div>

      {/* Dialog crear/editar */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingLead ? "Editar lead" : "Nuevo lead"}</DialogTitle>
            <DialogDescription>
              {editingLead ? "Actualiza la información del lead" : "Completa los datos del nuevo lead"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Nombre completo"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@ejemplo.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  placeholder="+1 234 567 890"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Select value={formData.estado} onValueChange={(value) => setFormData({ ...formData, estado: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un estado" />
                </SelectTrigger>
                <SelectContent>
                  {estadosLead.map((estado) => (
                    <SelectItem key={estado.value} value={estado.value}>
                      {estado.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mensaje">Mensaje</Label>
              <Textarea
                id="mensaje"
                value={formData.mensaje}
                onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                placeholder="Notas o mensaje del lead..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting || !formData.nombre}>
              {isSubmitting ? "Guardando..." : editingLead ? "Guardar cambios" : "Crear lead"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog confirmar eliminación */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar lead?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El lead &quot;{editingLead?.nombre}&quot; será eliminado
              permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
