"use client"

import { useState } from "react"
import useSWR from "swr"
import { usersApi } from "@/lib/api"
import { toast } from "sonner"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Package,
  Wrench,
  Users,
  ClipboardList,
  FileText,
  NotebookPen,
  MessageSquare,
  Megaphone,
  UserCog,
  User,
  Shield,
  Loader2,
} from "lucide-react"

interface UserProfile {
  id_usuario: number
  nombre_usuario: string
  email: string
  tipo_usuario: string
  phone?: string
  is_staff: boolean
  features_config?: Record<string, boolean>
  persona?: {
    nombre: string
    apellido: string
  }
}

const defaultFeatures = {
  productos: true,
  servicios: true,
  notas: true,
  archivos: true,
  leads: false,
  tareas: false,
  whatsapp: false,
  campanas: false,
}

const featuresList = [
  { key: "productos", label: "Productos", description: "Catálogo y inventario de productos", icon: Package },
  { key: "servicios", label: "Servicios", description: "Catálogo de servicios y configuraciones", icon: Wrench },
  { key: "leads", label: "Leads", description: "Control y seguimiento de clientes potenciales", icon: Users },
  { key: "tareas", label: "Tareas", description: "Tablero de tareas del equipo", icon: ClipboardList },
  { key: "archivos", label: "Archivos", description: "Gestión y almacenamiento de documentos", icon: FileText },
  { key: "notas", label: "Notas", description: "Notas rápidas y notas de servicio", icon: NotebookPen },
  { key: "whatsapp", label: "WhatsApp", description: "Integración de chat y automatizaciones", icon: MessageSquare },
  { key: "campanas", label: "Campañas", description: "Campañas de marketing y difusiones", icon: Megaphone },
]

export default function UsuariosPage() {
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState<string | null>(null)

  const { data: users = [], error, isLoading, mutate } = useSWR<UserProfile[]>("users-list", usersApi.getAll)

  const handleOpenConfig = (user: UserProfile) => {
    // Si no tiene features_config, le asignamos los valores por defecto
    const userWithConfig = {
      ...user,
      features_config: {
        ...defaultFeatures,
        ...(user.features_config || {}),
      },
    }
    setSelectedUser(userWithConfig)
    setIsDialogOpen(true)
  }

  const handleToggleFeature = async (featureKey: string, checked: boolean) => {
    if (!selectedUser) return

    const updatedConfig = {
      ...selectedUser.features_config,
      [featureKey]: checked,
    }

    // Actualización optimista del estado local
    setSelectedUser({
      ...selectedUser,
      features_config: updatedConfig,
    })

    setIsSaving(featureKey)
    try {
      await usersApi.update(selectedUser.id_usuario, {
        features_config: updatedConfig,
      })
      toast.success(`Funcionalidad "${featureKey}" actualizada para ${selectedUser.nombre_usuario}`)
      mutate() // Recargar datos de SWR
    } catch (err: any) {
      toast.error("Error al actualizar la funcionalidad: " + (err.message || "Error desconocido"))
      // Revertir cambio local
      setSelectedUser({
        ...selectedUser,
        features_config: {
          ...selectedUser.features_config,
          [featureKey]: !checked,
        },
      })
    } finally {
      setIsSaving(null)
    }
  }

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center">
        <div className="rounded-full bg-red-100 p-3 text-red-600 dark:bg-red-900/20 dark:text-red-400">
          <Shield className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">Error al cargar usuarios</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          No tienes permisos para ver este módulo o hay un problema de red.
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-4 p-4 lg:p-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <UserCog className="h-6 w-6 text-primary" />
            Gestión de Usuarios
          </h2>
          <p className="text-muted-foreground">
            Administra las limitaciones y activa/desactiva los módulos visibles en el menú de cada usuario.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <Card className="shadow-xs border border-border/80">
            <CardHeader className="px-6 py-4">
              <CardTitle className="text-lg font-medium">Usuarios Registrados</CardTitle>
              <CardDescription>
                Lista completa de usuarios en la plataforma.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-6">Usuario</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol / Tipo</TableHead>
                    <TableHead>Funcionalidades Activas</TableHead>
                    <TableHead className="text-right px-6">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => {
                    const config = user.features_config || defaultFeatures
                    const activeCount = Object.values(config).filter(Boolean).length

                    return (
                      <TableRow key={user.id_usuario} className="hover:bg-muted/30">
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                              {user.nombre_usuario?.charAt(0).toUpperCase() || "U"}
                            </div>
                            <div>
                              <p className="font-semibold text-sm">
                                {user.persona ? `${user.persona.nombre} ${user.persona.apellido}` : user.nombre_usuario}
                              </p>
                              <span className="text-xs text-muted-foreground">ID: {user.id_usuario}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{user.email}</TableCell>
                        <TableCell>
                          <div className="flex gap-1.5 items-center">
                            {user.is_staff ? (
                              <Badge variant="default" className="bg-amber-600 hover:bg-amber-700 text-white font-medium flex items-center gap-1">
                                <Shield className="h-3 w-3" />
                                Superadmin
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="font-medium flex items-center gap-1">
                                <User className="h-3 w-3 text-muted-foreground" />
                                {user.tipo_usuario || "usuario"}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-semibold border-primary/30 text-primary">
                              {activeCount} / 8 Módulos
                            </Badge>
                            <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {Object.entries(config)
                                .filter(([_, val]) => val)
                                .map(([key]) => key)
                                .join(", ")}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right px-6">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenConfig(user)}
                            className="text-xs font-semibold"
                          >
                            Configurar
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  {users.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No hay usuarios registrados.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialog para configurar módulos */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xl p-0 overflow-hidden border border-border/80">
          <DialogHeader className="p-6 pb-4 bg-muted/40 border-b border-border/50">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <UserCog className="h-5 w-5 text-primary" />
              Módulos Activos
            </DialogTitle>
            <DialogDescription className="text-sm">
              Define a qué páginas del menú tiene acceso el usuario{" "}
              <span className="font-semibold text-foreground">
                {selectedUser?.nombre_usuario || selectedUser?.email}
              </span>
              .
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {featuresList.map((feature) => {
                const config = selectedUser?.features_config || defaultFeatures
                const isChecked = config[feature.key] ?? defaultFeatures[feature.key as keyof typeof defaultFeatures]
                const Icon = feature.icon

                return (
                  <div
                    key={feature.key}
                    className={`flex items-start justify-between p-3.5 rounded-xl border transition-all duration-200 ${
                      isChecked
                        ? "border-primary/30 bg-primary/5 dark:bg-primary/5"
                        : "border-border bg-card hover:bg-muted/20"
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                        isChecked ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                      }`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-sm font-semibold leading-none">{feature.label}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2 pr-2">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center self-center shrink-0 pl-2">
                      {isSaving === feature.key ? (
                        <Loader2 className="h-4 w-4 animate-spin text-primary mr-2" />
                      ) : null}
                      <Switch
                        checked={isChecked}
                        disabled={isSaving !== null}
                        onCheckedChange={(checked) => handleToggleFeature(feature.key, checked)}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="p-6 bg-muted/20 border-t border-border/50 flex justify-end gap-2">
            <Button variant="default" size="sm" onClick={() => setIsDialogOpen(false)} className="px-6 font-semibold">
              Listo
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
