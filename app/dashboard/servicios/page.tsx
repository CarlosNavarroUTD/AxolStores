"use client"

import { useState } from "react"
import useSWR from "swr"
import { useTeam } from "@/contexts/team-context"
import { servicesApi, type ServiceData } from "@/lib/api"
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
import { Switch } from "@/components/ui/switch"
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
import { Plus, Wrench } from "lucide-react"

interface Service {
  id: number
  nombre: string
  descripcion?: string
  precio: number
  duracion?: number
  activo: boolean
  team: number
}

const emptyService: Omit<Service, "id"> = {
  nombre: "",
  descripcion: "",
  precio: 0,
  duracion: 60,
  activo: true,
  team: 0,
}

export default function ServiciosPage() {
  const { activeTeam } = useTeam()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [formData, setFormData] = useState<Omit<Service, "id">>(emptyService)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    data: services = [],
    mutate,
    isLoading,
  } = useSWR(activeTeam ? `services-${activeTeam.id}` : null, () =>
    activeTeam ? servicesApi.getAll(activeTeam.id) : [],
  )

  const columns: Column<Service>[] = [
    {
      key: "nombre",
      header: "Nombre",
      cell: (service) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
            <Wrench className="h-5 w-5 text-muted-foreground" />
          </div>
          <span className="font-medium">{service.nombre}</span>
        </div>
      ),
    },
    {
      key: "precio",
      header: "Precio",
      cell: (service) => `$${service.precio.toLocaleString()}`,
    },
    {
      key: "duracion",
      header: "Duración",
      cell: (service) => (service.duracion ? `${service.duracion} min` : "N/A"),
    },
    {
      key: "activo",
      header: "Estado",
      cell: (service) => (
        <Badge variant={service.activo ? "default" : "secondary"}>{service.activo ? "Activo" : "Inactivo"}</Badge>
      ),
    },
  ]

  const handleOpenDialog = (service?: Service) => {
    if (service) {
      setEditingService(service)
      setFormData({
        nombre: service.nombre,
        descripcion: service.descripcion || "",
        precio: service.precio,
        duracion: service.duracion || 60,
        activo: service.activo,
        team: service.team,
      })
    } else {
      setEditingService(null)
      setFormData({ ...emptyService, team: activeTeam?.id || 0 })
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!activeTeam) return

    setIsSubmitting(true)
    try {
      const data: ServiceData = {
        ...formData,
        team: activeTeam.id,
      }

      if (editingService) {
        await servicesApi.update(editingService.id, data)
      } else {
        await servicesApi.create(data)
      }
      await mutate()
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error guardando servicio:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!editingService) return

    setIsSubmitting(true)
    try {
      await servicesApi.delete(editingService.id)
      await mutate()
      setIsDeleteDialogOpen(false)
      setEditingService(null)
    } catch (error) {
      console.error("Error eliminando servicio:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const openDeleteDialog = (service: Service) => {
    setEditingService(service)
    setIsDeleteDialogOpen(true)
  }

  if (!activeTeam) {
    return (
      <div className="flex h-full flex-col">
        <Header title="Servicios" />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Selecciona una tienda para ver los servicios</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <Header title="Servicios" />

      <div className="flex-1 space-y-4 p-4 lg:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Servicios</h2>
            <p className="text-muted-foreground">Gestiona los servicios de {activeTeam.name}</p>
          </div>
          <Button onClick={() => handleOpenDialog()} className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo servicio
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <DataTable
            data={services}
            columns={columns}
            onEdit={handleOpenDialog}
            onDelete={openDeleteDialog}
            searchKey="nombre"
            searchPlaceholder="Buscar servicios..."
          />
        )}
      </div>

      {/* Dialog crear/editar */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingService ? "Editar servicio" : "Nuevo servicio"}</DialogTitle>
            <DialogDescription>
              {editingService ? "Actualiza la información del servicio" : "Completa los datos del nuevo servicio"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Nombre del servicio"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Descripción del servicio"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="precio">Precio</Label>
                <Input
                  id="precio"
                  type="number"
                  value={formData.precio}
                  onChange={(e) => setFormData({ ...formData, precio: Number.parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duracion">Duración (min)</Label>
                <Input
                  id="duracion"
                  type="number"
                  value={formData.duracion}
                  onChange={(e) => setFormData({ ...formData, duracion: Number.parseInt(e.target.value) || 60 })}
                  placeholder="60"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="activo">Servicio activo</Label>
              <Switch
                id="activo"
                checked={formData.activo}
                onCheckedChange={(checked) => setFormData({ ...formData, activo: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting || !formData.nombre}>
              {isSubmitting ? "Guardando..." : editingService ? "Guardar cambios" : "Crear servicio"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog confirmar eliminación */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar servicio?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El servicio &quot;{editingService?.nombre}&quot; será eliminado
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
