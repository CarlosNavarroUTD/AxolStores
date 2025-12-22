"use client"

import { useState } from "react"
import { useTeam } from "@/contexts/team-context"
import { teamsApi } from "@/lib/api"
import { Header } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Store, Trash2, ExternalLink } from "lucide-react"

export default function ConfiguracionPage() {
  const { activeTeam, refreshTeams } = useTeam()
  const [formData, setFormData] = useState({
    name: activeTeam?.name || "",
    description: activeTeam?.description || "",
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleSave = async () => {
    if (!activeTeam) return

    setIsSaving(true)
    try {
      await teamsApi.updateTeam(activeTeam.id, formData)
      await refreshTeams()
    } catch (error) {
      console.error("Error guardando:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!activeTeam) return

    setIsDeleting(true)
    try {
      await teamsApi.deleteTeam(activeTeam.id)
      await refreshTeams()
    } catch (error) {
      console.error("Error eliminando:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  if (!activeTeam) {
    return (
      <div className="flex h-full flex-col">
        <Header title="Configuración" />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Selecciona una tienda para ver la configuración</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <Header title="Configuración" />

      <div className="flex-1 space-y-6 p-4 lg:p-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Configuración</h2>
          <p className="text-muted-foreground">Administra la configuración de {activeTeam.name}</p>
        </div>

        {/* Información general */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Información general
            </CardTitle>
            <CardDescription>Datos básicos de tu tienda</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la tienda</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Slug</Label>
              <div className="flex items-center gap-2">
                <Input value={activeTeam.slug} disabled className="font-mono" />
                <Button variant="outline" size="icon" asChild>
                  <a href={`/tienda/${activeTeam.slug}`} target="_blank" rel="noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">URL pública: /tienda/{activeTeam.slug}</p>
            </div>

            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Guardando..." : "Guardar cambios"}
            </Button>
          </CardContent>
        </Card>

        {/* Zona de peligro */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Zona de peligro
            </CardTitle>
            <CardDescription>Acciones irreversibles para tu tienda</CardDescription>
          </CardHeader>
          <CardContent>
            <Separator className="mb-4" />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Eliminar tienda</p>
                <p className="text-sm text-muted-foreground">
                  Esta acción eliminará permanentemente tu tienda y todos sus datos
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Eliminar tienda</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción no se puede deshacer. Esto eliminará permanentemente la tienda &quot;{activeTeam.name}
                      &quot; y todos sus datos asociados.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isDeleting ? "Eliminando..." : "Sí, eliminar tienda"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
