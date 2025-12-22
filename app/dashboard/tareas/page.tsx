"use client"

import { useState } from "react"
import useSWR from "swr"
import { useTeam } from "@/contexts/team-context"
import { tasksApi, type TaskData } from "@/lib/api"
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
import { Plus, ClipboardList } from "lucide-react"

interface Task {
  id: number
  titulo: string
  descripcion?: string
  estado: string
  prioridad: string
  asignado_a?: number
  team: number
  created_at?: string
}

const estadosTarea = [
  { value: "pendiente", label: "Pendiente", variant: "secondary" as const },
  { value: "en_progreso", label: "En progreso", variant: "default" as const },
  { value: "completada", label: "Completada", variant: "outline" as const },
]

const prioridades = [
  { value: "baja", label: "Baja", color: "text-muted-foreground" },
  { value: "media", label: "Media", color: "text-yellow-600" },
  { value: "alta", label: "Alta", color: "text-red-600" },
]

const emptyTask: Omit<Task, "id"> = {
  titulo: "",
  descripcion: "",
  estado: "pendiente",
  prioridad: "media",
  team: 0,
}

export default function TareasPage() {
  const { activeTeam } = useTeam()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [formData, setFormData] = useState<Omit<Task, "id">>(emptyTask)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    data: tasks = [],
    mutate,
    isLoading,
  } = useSWR(activeTeam ? `tasks-${activeTeam.id}` : null, () => (activeTeam ? tasksApi.getAll(activeTeam.id) : []))

  const getEstadoBadge = (estado: string) => {
    const estadoInfo = estadosTarea.find((e) => e.value === estado) || estadosTarea[0]
    return <Badge variant={estadoInfo.variant}>{estadoInfo.label}</Badge>
  }

  const getPrioridadBadge = (prioridad: string) => {
    const prioridadInfo = prioridades.find((p) => p.value === prioridad) || prioridades[1]
    return <span className={`text-sm font-medium ${prioridadInfo.color}`}>{prioridadInfo.label}</span>
  }

  const columns: Column<Task>[] = [
    {
      key: "titulo",
      header: "Tarea",
      cell: (task) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
            <ClipboardList className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">{task.titulo}</p>
            {task.descripcion && <p className="text-sm text-muted-foreground line-clamp-1">{task.descripcion}</p>}
          </div>
        </div>
      ),
    },
    {
      key: "prioridad",
      header: "Prioridad",
      cell: (task) => getPrioridadBadge(task.prioridad),
    },
    {
      key: "estado",
      header: "Estado",
      cell: (task) => getEstadoBadge(task.estado),
    },
  ]

  const handleOpenDialog = (task?: Task) => {
    if (task) {
      setEditingTask(task)
      setFormData({
        titulo: task.titulo,
        descripcion: task.descripcion || "",
        estado: task.estado,
        prioridad: task.prioridad,
        team: task.team,
      })
    } else {
      setEditingTask(null)
      setFormData({ ...emptyTask, team: activeTeam?.id || 0 })
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!activeTeam) return

    setIsSubmitting(true)
    try {
      const data: TaskData = {
        ...formData,
        team: activeTeam.id,
      }

      if (editingTask) {
        await tasksApi.update(editingTask.id, data)
      } else {
        await tasksApi.create(data)
      }
      await mutate()
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error guardando tarea:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!editingTask) return

    setIsSubmitting(true)
    try {
      await tasksApi.delete(editingTask.id)
      await mutate()
      setIsDeleteDialogOpen(false)
      setEditingTask(null)
    } catch (error) {
      console.error("Error eliminando tarea:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const openDeleteDialog = (task: Task) => {
    setEditingTask(task)
    setIsDeleteDialogOpen(true)
  }

  if (!activeTeam) {
    return (
      <div className="flex h-full flex-col">
        <Header title="Tareas" />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Selecciona una tienda para ver las tareas</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <Header title="Tareas" />

      <div className="flex-1 space-y-4 p-4 lg:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Tareas</h2>
            <p className="text-muted-foreground">Gestiona las tareas de {activeTeam.name}</p>
          </div>
          <Button onClick={() => handleOpenDialog()} className="gap-2">
            <Plus className="h-4 w-4" />
            Nueva tarea
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <DataTable
            data={tasks}
            columns={columns}
            onEdit={handleOpenDialog}
            onDelete={openDeleteDialog}
            searchKey="titulo"
            searchPlaceholder="Buscar tareas..."
          />
        )}
      </div>

      {/* Dialog crear/editar */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingTask ? "Editar tarea" : "Nueva tarea"}</DialogTitle>
            <DialogDescription>
              {editingTask ? "Actualiza la información de la tarea" : "Completa los datos de la nueva tarea"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título</Label>
              <Input
                id="titulo"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                placeholder="Título de la tarea"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Descripción de la tarea..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Select value={formData.estado} onValueChange={(value) => setFormData({ ...formData, estado: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {estadosTarea.map((estado) => (
                      <SelectItem key={estado.value} value={estado.value}>
                        {estado.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prioridad">Prioridad</Label>
                <Select
                  value={formData.prioridad}
                  onValueChange={(value) => setFormData({ ...formData, prioridad: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Prioridad" />
                  </SelectTrigger>
                  <SelectContent>
                    {prioridades.map((prioridad) => (
                      <SelectItem key={prioridad.value} value={prioridad.value}>
                        {prioridad.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting || !formData.titulo}>
              {isSubmitting ? "Guardando..." : editingTask ? "Guardar cambios" : "Crear tarea"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog confirmar eliminación */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar tarea?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La tarea &quot;{editingTask?.titulo}&quot; será eliminada
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
