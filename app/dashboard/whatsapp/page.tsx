"use client"

import { useState, useEffect, useCallback } from "react"
import { useTeam } from "@/contexts/team-context"
import { whatsappApi } from "@/lib/api"
import type { WhatsappInstance, QrCodeResponse } from "@/lib/api/whatsapp"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import {
  MessageSquare,
  Plus,
  QrCode,
  Trash2,
  Smartphone,
  Wifi,
  WifiOff,
  Loader2,
  RefreshCw,
  Phone,
} from "lucide-react"

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
  connected: {
    label: "Conectado",
    variant: "default",
    icon: <Wifi className="h-3 w-3" />,
  },
  disconnected: {
    label: "Desconectado",
    variant: "destructive",
    icon: <WifiOff className="h-3 w-3" />,
  },
  qr_pending: {
    label: "Esperando QR",
    variant: "secondary",
    icon: <QrCode className="h-3 w-3" />,
  },
}

export default function WhatsappPage() {
  const { activeTeam } = useTeam()
  const [instances, setInstances] = useState<WhatsappInstance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [newInstanceName, setNewInstanceName] = useState("")
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [qrDialogOpen, setQrDialogOpen] = useState(false)
  const [activeQr, setActiveQr] = useState<QrCodeResponse | null>(null)
  const [qrLoading, setQrLoading] = useState(false)
  const [selectedInstance, setSelectedInstance] = useState<WhatsappInstance | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadInstances = useCallback(async () => {
    if (!activeTeam) return
    setIsLoading(true)
    try {
      const data = await whatsappApi.getInstances(activeTeam.id)
      setInstances(Array.isArray(data) ? data : (data as any).results || [])
    } catch (err: any) {
      console.error("Error loading instances:", err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [activeTeam])

  useEffect(() => {
    loadInstances()
  }, [loadInstances])

  const handleCreate = async () => {
    if (!activeTeam || !newInstanceName.trim()) return
    setIsCreating(true)
    setError(null)
    try {
      await whatsappApi.createInstance(activeTeam.id, newInstanceName.trim())
      setNewInstanceName("")
      setCreateDialogOpen(false)
      await loadInstances()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsCreating(false)
    }
  }

  const handleDelete = async (instance: WhatsappInstance) => {
    try {
      await whatsappApi.deleteInstance(instance.id)
      await loadInstances()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleGetQr = async (instance: WhatsappInstance) => {
    setSelectedInstance(instance)
    setQrLoading(true)
    setActiveQr(null)
    setQrDialogOpen(true)
    try {
      const qr = await whatsappApi.getQrCode(instance.id)
      setActiveQr(qr)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setQrLoading(false)
    }
  }

  const handleRefreshQr = async () => {
    if (!selectedInstance) return
    setQrLoading(true)
    try {
      const qr = await whatsappApi.getQrCode(selectedInstance.id)
      setActiveQr(qr)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setQrLoading(false)
    }
  }

  if (!activeTeam) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Selecciona un equipo para gestionar tus cuentas de WhatsApp</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">

      <div className="flex-1 space-y-6 p-4 lg:p-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-green-500" />
              Cuentas de WhatsApp
            </h2>
            <p className="text-muted-foreground">
              Conecta y administra las cuentas de WhatsApp de {activeTeam.name}
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={loadInstances} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Actualizar
            </Button>

            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva cuenta
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-green-500" />
                    Conectar nueva cuenta de WhatsApp
                  </DialogTitle>
                  <DialogDescription>
                    Asigna un nombre descriptivo a esta conexión. Después de crearla, podrás escanear el código QR para vincular tu cuenta.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="instance-name">Nombre de la cuenta</Label>
                    <Input
                      id="instance-name"
                      placeholder="Ej: Ventas principal, Soporte técnico..."
                      value={newInstanceName}
                      onChange={(e) => setNewInstanceName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                    />
                  </div>
                  {error && (
                    <p className="text-sm text-destructive">{error}</p>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setCreateDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleCreate}
                    disabled={isCreating || !newInstanceName.trim()}
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creando...
                      </>
                    ) : (
                      "Crear cuenta"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Separator />

        {/* Error banner */}
        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <p className="text-sm text-destructive">{error}</p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2"
              onClick={() => setError(null)}
            >
              Cerrar
            </Button>
          </div>
        )}

        {/* Loading state */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : instances.length === 0 ? (
          /* Empty state */
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-full bg-green-500/10 p-4 mb-4">
                <MessageSquare className="h-10 w-10 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Sin cuentas de WhatsApp</h3>
              <p className="text-muted-foreground max-w-sm mb-6">
                Aún no has conectado ninguna cuenta de WhatsApp. Crea tu primera conexión para empezar a enviar y recibir mensajes.
              </p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Conectar primera cuenta
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* Instances grid */
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {instances.map((instance) => {
              const status = statusConfig[instance.status] || statusConfig.disconnected
              return (
                <Card key={instance.id} className="relative overflow-hidden transition-all hover:shadow-md">
                  {/* Subtle top-bar color */}
                  <div
                    className={`absolute top-0 left-0 right-0 h-1 ${
                      instance.status === "connected"
                        ? "bg-green-500"
                        : instance.status === "qr_pending"
                          ? "bg-yellow-500"
                          : "bg-muted-foreground/30"
                    }`}
                  />

                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-base">{instance.instance_name}</CardTitle>
                        <CardDescription className="text-xs font-mono">
                          {instance.instance_id || "—"}
                        </CardDescription>
                      </div>
                      <Badge variant={status.variant} className="flex items-center gap-1 text-xs">
                        {status.icon}
                        {status.label}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {instance.phone_number && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        {instance.phone_number}
                      </div>
                    )}

                    <Separator />

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleGetQr(instance)}
                      >
                        <QrCode className="h-4 w-4 mr-2" />
                        {instance.status === "connected" ? "Reconectar" : "Escanear QR"}
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar esta cuenta?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Se desconectará y eliminará permanentemente la cuenta &quot;{instance.instance_name}&quot;. Esta acción no se puede deshacer.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(instance)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* QR Code Dialog */}
        <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-green-500" />
                Escanear código QR
              </DialogTitle>
              <DialogDescription>
                Abre WhatsApp en tu teléfono → Dispositivos vinculados → Vincular un dispositivo → Escanea este código QR.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col items-center justify-center py-6">
              {qrLoading ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Generando código QR...</p>
                </div>
              ) : activeQr?.base64 ? (
                <div className="space-y-4 flex flex-col items-center">
                  <div className="rounded-xl border p-3 bg-white">
                    <img
                      src={activeQr.base64.startsWith("data:") ? activeQr.base64 : `data:image/png;base64,${activeQr.base64}`}
                      alt="QR Code para conectar WhatsApp"
                      className="h-64 w-64"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-center max-w-xs">
                    El código se actualizará automáticamente. Si expira, presiona &quot;Actualizar QR&quot;.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 text-center">
                  <QrCode className="h-16 w-16 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">
                    No se pudo generar el código QR. Intenta de nuevo.
                  </p>
                </div>
              )}
            </div>

            <DialogFooter className="flex-col gap-2 sm:flex-row">
              <Button variant="outline" onClick={handleRefreshQr} disabled={qrLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${qrLoading ? "animate-spin" : ""}`} />
                Actualizar QR
              </Button>
              <Button variant="secondary" onClick={() => setQrDialogOpen(false)}>
                Cerrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
