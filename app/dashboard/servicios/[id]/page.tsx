"use client"

import { useEffect, useState, useRef } from "react"  // ← useRef agregado
import { useParams, useRouter, useSearchParams } from "next/navigation"
import useSWR from "swr"
import { useTeam } from "@/contexts/team-context"
import { servicesApi, type ServiceData } from "@/lib/api"
import { archivosApi, validarTamanoArchivo, detectarTipoArchivo } from "@/lib/api/archivos"  // ← nuevo
import { Header } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"  // ← nuevo
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
import { ArrowLeft, Trash2, Upload, X } from "lucide-react"  // ← Upload y X agregados

interface FormData {
  nombre: string
  descripcion: string
  precio: number
  duracion: number
  activo: boolean
  url_img: string           // ← nuevo
  personalizados: Record<string, unknown>
}

const emptyForm: FormData = {
  nombre: "",
  descripcion: "",
  precio: 0,
  duracion: 60,
  activo: true,
  url_img: "",              // ← nuevo
  personalizados: {},
}

export default function ServicioFormPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { activeTeam } = useTeam()

  const isNew = params.id === "nuevo"
  const serviceId = isNew ? null : Number(params.id)

  const [formData, setFormData] = useState<FormData>(emptyForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(searchParams.get("delete") === "1")
  const [newKey, setNewKey] = useState("")
  const [newValue, setNewValue] = useState("")

  // ← nuevos estados para la imagen
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadingImg, setUploadingImg] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const { data: service, isLoading } = useSWR(
    serviceId ? `service-${serviceId}` : null,
    () => servicesApi.get(serviceId!),
  )

  useEffect(() => {
    if (service) {
      setFormData({
        nombre: service.nombre ?? "",
        descripcion: service.descripcion ?? "",
        precio: service.precio ?? 0,
        duracion: service.duracion ?? 60,
        activo: service.activo ?? true,
        url_img: service.url_img ?? "",   // ← nuevo
        personalizados: service.personalizados ?? {},
      })
      // ← sincronizar preview al cargar el servicio
      if (service.url_img) setPreviewUrl(service.url_img)
    }
  }, [service])

  // ← función para subir imagen
  const handleImageUpload = async (file: File) => {
    if (!activeTeam) return

    const validacion = validarTamanoArchivo(file, 10)
    if (!validacion.valido) {
      toast.error("Imagen demasiado grande", { description: validacion.mensaje })
      return
    }

    const tipo = detectarTipoArchivo(file.type)
    if (tipo !== "imagen") {
      toast.error("Solo se permiten imágenes")
      return
    }

    setUploadingImg(true)
    try {
      const resultado = await archivosApi.uploadWithSignedUrl({
        team: activeTeam.id.toString(),
        nombre: file.name,
        archivo: file,
        tipo_archivo: "imagen",
        folder: "servicios",
      })
      const url = resultado.archivo_url
      setFormData((prev) => ({ ...prev, url_img: url }))
      setPreviewUrl(url)
      toast.success("Imagen subida correctamente")
    } catch (error: any) {
      toast.error("Error al subir imagen", { description: error.message })
    } finally {
      setUploadingImg(false)
    }
  }

  const handleSubmit = async () => {
    if (!activeTeam) return
    setIsSubmitting(true)
    try {
      const data: ServiceData & { personalizados?: Record<string, unknown> } = {
        ...formData,
        team: activeTeam.id,
      }
      if (isNew) {
        await servicesApi.create(data)
      } else {
        await servicesApi.update(serviceId!, data)
      }
      router.push("/dashboard/servicios")
    } catch (error) {
      console.error("Error guardando servicio:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!serviceId) return
    setIsSubmitting(true)
    try {
      await servicesApi.delete(serviceId)
      router.push("/dashboard/servicios")
    } catch (error) {
      console.error("Error eliminando servicio:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const addPersonalizado = () => {
    if (!newKey.trim()) return
    setFormData((prev) => ({
      ...prev,
      personalizados: { ...prev.personalizados, [newKey.trim()]: newValue },
    }))
    setNewKey("")
    setNewValue("")
  }

  const removePersonalizado = (key: string) => {
    setFormData((prev) => {
      const next = { ...prev.personalizados }
      delete next[key]
      return { ...prev, personalizados: next }
    })
  }

  const updatePersonalizado = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      personalizados: { ...prev.personalizados, [key]: value },
    }))
  }

  if (isLoading) {
    return (
      <div className="flex h-full flex-col">
        <Header title="Servicio" />
        <div className="flex-1 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <Header title={isNew ? "Nuevo servicio" : "Editar servicio"} />

      <div className="flex-1 p-4 lg:p-6 max-w-2xl mx-auto w-full space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/servicios")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          {!isNew && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDeleteOpen(true)}
              className="gap-2 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              Eliminar
            </Button>
          )}
        </div>

        <div className="rounded-lg border bg-card p-6 space-y-4">
          <h3 className="font-medium">Información general</h3>

          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              value={formData.nombre ?? ""}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Nombre del servicio"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion ?? ""}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="Descripción del servicio"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="precio">Precio</Label>
              <Input
                id="precio"
                type="number"
                value={formData.precio ?? 0}
                onChange={(e) => setFormData({ ...formData, precio: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duracion">Duración (min)</Label>
              <Input
                id="duracion"
                type="number"
                value={formData.duracion ?? 60}
                onChange={(e) => setFormData({ ...formData, duracion: parseInt(e.target.value) || 60 })}
                placeholder="60"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Label htmlFor="activo">Servicio activo</Label>
            <Switch
              id="activo"
              checked={formData.activo}
              onCheckedChange={(checked) => setFormData({ ...formData, activo: checked })}
            />
          </div>

          {/* ← Imagen: va aquí, después del switch */}
          <div className="space-y-2 pt-2 border-t">
            <Label>Imagen del servicio</Label>

            {previewUrl ? (
              <div className="relative w-full aspect-video rounded-lg overflow-hidden border bg-muted">
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 bg-background/80 hover:bg-background"
                  onClick={() => {
                    setPreviewUrl(null)
                    setFormData((prev) => ({ ...prev, url_img: "" }))
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div
                className="w-full aspect-video rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  const file = e.dataTransfer.files?.[0]
                  if (file) handleImageUpload(file)
                }}
              >
                {uploadingImg ? (
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Arrastra una imagen o haz clic para seleccionar</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG, WEBP — máx. 10MB</p>
                  </>
                )}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleImageUpload(file)
              }}
            />
          </div>
          <div className="flex items-center justify-between pt-2">
            <Label htmlFor="url_img">url_img</Label>
            <Input
              id="url_img"
              value={formData.url_img ?? ""}
              onChange={(e) => setFormData({ ...formData, url_img: e.target.value })}
            />
          </div>
        </div>

        {/* Campos personalizados */}
        <div className="rounded-lg border bg-card p-6 space-y-4">
          <h3 className="font-medium">Campos personalizados</h3>

          {Object.entries(formData.personalizados).length > 0 && (
            <div className="space-y-2">
              {Object.entries(formData.personalizados).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground w-32 shrink-0 truncate">{key}</span>
                  <Input
                    value={String(value ?? "")}
                    onChange={(e) => updatePersonalizado(key, e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removePersonalizado(key)}
                    className="text-destructive hover:text-destructive px-2"
                  >
                    ✕
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2 pt-2 border-t">
            <Input
              placeholder="Nombre del campo"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              className="w-36"
              onKeyDown={(e) => e.key === "Enter" && addPersonalizado()}
            />
            <Input
              placeholder="Valor"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => e.key === "Enter" && addPersonalizado()}
            />
            <Button variant="outline" size="sm" onClick={addPersonalizado} disabled={!newKey.trim()}>
              Agregar
            </Button>
          </div>
        </div>

        <div className="flex justify-end gap-2 pb-6">
          <Button variant="outline" onClick={() => router.push("/dashboard/servicios")}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !formData.nombre}>
            {isSubmitting ? "Guardando..." : isNew ? "Crear servicio" : "Guardar cambios"}
          </Button>
        </div>
      </div>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar servicio?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El servicio &quot;{service?.nombre}&quot; será eliminado permanentemente.
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