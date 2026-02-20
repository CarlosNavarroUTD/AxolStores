"use client"

import { useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { archivosApi, type AccesoArchivo } from "@/lib/api"
import { Eye, Download, Edit, Trash2 } from "lucide-react"

interface HistorialDialogProps {
  archivoId: string | null
  archivoNombre: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function HistorialDialog({ 
  archivoId, 
  archivoNombre, 
  open, 
  onOpenChange 
}: HistorialDialogProps) {
  const [historial, setHistorial] = useState<AccesoArchivo[]>([])
  const [loading, setLoading] = useState(false)

  const cargarHistorial = async () => {
    if (!archivoId) return

    setLoading(true)
    try {
      const data = await archivosApi.historial(archivoId)
      setHistorial(data)
    } catch (error) {
      console.error("Error al cargar historial:", error)
    } finally {
      setLoading(false)
    }
  }

  const getIconoAcceso = (tipo: string) => {
    switch (tipo) {
      case "visualizacion": return <Eye className="h-4 w-4" />
      case "descarga": return <Download className="h-4 w-4" />
      case "modificacion": return <Edit className="h-4 w-4" />
      case "eliminacion": return <Trash2 className="h-4 w-4" />
      default: return null
    }
  }

  const getColorAcceso = (tipo: string) => {
    switch (tipo) {
      case "visualizacion": return "bg-blue-100 text-blue-700"
      case "descarga": return "bg-green-100 text-green-700"
      case "modificacion": return "bg-yellow-100 text-yellow-700"
      case "eliminacion": return "bg-red-100 text-red-700"
      default: return "bg-gray-100 text-gray-700"
    }
  }

  const getTituloAcceso = (tipo: string) => {
    switch (tipo) {
      case "visualizacion": return "Visualizado"
      case "descarga": return "Descargado"
      case "modificacion": return "Modificado"
      case "eliminacion": return "Eliminado"
      default: return tipo
    }
  }

  return (
    <Dialog 
      open={open} 
      onOpenChange={(isOpen) => {
        onOpenChange(isOpen)
        if (isOpen) cargarHistorial()
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Historial de accesos</DialogTitle>
          <DialogDescription>
            Archivo: {archivoNombre}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[400px] pr-4">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Cargando historial...
            </div>
          ) : historial.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay accesos registrados
            </div>
          ) : (
            <div className="space-y-4">
              {historial.map((acceso) => (
                <div 
                  key={acceso.id} 
                  className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className={`p-2 rounded-full ${getColorAcceso(acceso.tipo_acceso)}`}>
                    {getIconoAcceso(acceso.tipo_acceso)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">
                        {getTituloAcceso(acceso.tipo_acceso)}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        Usuario #{acceso.usuario}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      {format(new Date(acceso.fecha_acceso), "PPpp", { locale: es })}
                    </p>
                    
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>IP: {acceso.ip_address}</span>
                      <span className="truncate" title={acceso.user_agent}>
                        {acceso.user_agent.substring(0, 50)}...
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {!loading && historial.length > 0 && (
          <div className="pt-4 border-t">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">
                  {historial.filter(h => h.tipo_acceso === "visualizacion").length}
                </p>
                <p className="text-xs text-muted-foreground">Visualizaciones</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {historial.filter(h => h.tipo_acceso === "descarga").length}
                </p>
                <p className="text-xs text-muted-foreground">Descargas</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {historial.filter(h => h.tipo_acceso === "modificacion").length}
                </p>
                <p className="text-xs text-muted-foreground">Modificaciones</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {historial.length}
                </p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}