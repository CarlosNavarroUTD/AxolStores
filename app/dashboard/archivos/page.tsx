"use client"

import { useEffect, useState, useRef } from "react"
import { useTeam } from "@/contexts/team-context"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

import {
  Upload,
  File,
  ImageIcon,
  FileText,
  Folder,
  Download,
  Trash2,
  Search,
  History,
  Shield,
  MoreVertical,
  Eye,
  Copy,
  Check
} from "lucide-react"

// ✅ IMPORTAR TIPOS Y FUNCIONES CORRECTAS DE LA API
import {
  archivosApi,
  type ArchivoList,  // ⚠️ CAMBIO: usar ArchivoList en lugar de Archivo
  type EstadisticasArchivos,
  formatearTamano,  // ✅ Usar la utilidad de la API
  detectarTipoArchivo,  // ✅ Usar la utilidad de la API
  validarTamanoArchivo,  // ✅ Agregar validación
  validarTipoArchivo,  // ✅ Agregar validación
} from "@/lib/api/archivos"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { HistorialDialog } from "@/components/archivos/historial-dialog"

export default function ArchivosPage() {
  const { activeTeam } = useTeam()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ✅ TIPOS CORRECTOS
  const [archivos, setArchivos] = useState<ArchivoList[]>([])
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<EstadisticasArchivos | null>(null)
  const [busqueda, setBusqueda] = useState("")
  const [tipoFiltro, setTipoFiltro] = useState("")
  const [dragging, setDragging] = useState(false)
  const [copiadoId, setCopiadoId] = useState<string | null>(null)

  // Estado para el diálogo de historial
  const [historialDialog, setHistorialDialog] = useState({
    open: false,
    archivoId: null as string | null,
    archivoNombre: ""
  })

  // Cargar archivos
  const cargarArchivos = async () => {
    if (!activeTeam) return

    setLoading(true)
    try {
      const data = await archivosApi.getAll(activeTeam.id.toString())
      setArchivos(data)
    } catch (error: any) {
      toast.error("Error", { description: error.message })
    } finally {
      setLoading(false)
    }
  }

  // Cargar estadísticas
  const cargarEstadisticas = async () => {
    if (!activeTeam) return
    try {
      const data = await archivosApi.estadisticas(activeTeam.id.toString())
      setStats(data)
    } catch (error) {
      console.error("Error al cargar estadísticas:", error)
    }
  }

  useEffect(() => {
    if (activeTeam) {
      cargarArchivos()
      cargarEstadisticas()
    }
  }, [activeTeam])

  // ✅ SUBIR ARCHIVOS CON VALIDACIONES
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !activeTeam) return

    setLoading(true)
    let exitosos = 0
    let fallidos = 0

    for (const file of Array.from(files)) {
      try {
        // ✅ VALIDAR TAMAÑO (máximo 50MB)
        const validacionTamano = validarTamanoArchivo(file, 50)
        if (!validacionTamano.valido) {
          toast.error("Archivo demasiado grande", {
            description: `${file.name}: ${validacionTamano.mensaje}`
          })
          fallidos++
          continue
        }

        // ✅ DETECTAR TIPO DE ARCHIVO usando la utilidad de la API
        const tipoDetectado = detectarTipoArchivo(file.type)

        // Mapear a los choices válidos del modelo Django
        const tipoArchivo = ["imagen", "documento", "otro"].includes(tipoDetectado)
          ? tipoDetectado
          : "otro"
        // ✅ USAR EL MÉTODO RECOMENDADO uploadWithSignedUrl
        await archivosApi.uploadWithSignedUrl({
          team: activeTeam.id.toString(),
          nombre: file.name,
          archivo: file,
          descripcion: `Archivo subido el ${new Date().toLocaleDateString()}`,
          tipo_archivo: tipoArchivo,
          folder: "archivos", // ✅ Especificar carpeta
        })

        exitosos++
      } catch (error: any) {
        fallidos++
        console.error(`Error al subir ${file.name}:`, error)
      }
    }

    setLoading(false)

    if (exitosos > 0) {
      toast.success("Archivos subidos", {
        description: `${exitosos} archivo(s) subidos correctamente`
      })
      cargarArchivos()
      cargarEstadisticas()
    }

    if (fallidos > 0) {
      toast.error("Error al subir archivos", {
        description: `${fallidos} archivo(s) no se pudieron subir`
      })
    }
  }

  // Buscar archivos
  const handleBuscar = async () => {
    if (!activeTeam) return

    if (!busqueda && !tipoFiltro) {
      cargarArchivos()
      return
    }

    setLoading(true)
    try {
      const data = await archivosApi.buscar({
        q: busqueda,
        tipo: tipoFiltro as any,
        team_id: activeTeam.id.toString(),  // ✅ Convertir a string
      })
      setArchivos(data)
    } catch (error: any) {
      toast.error("Error", { description: error.message })
    } finally {
      setLoading(false)
    }
  }

  // Descargar archivo
  const handleDescargar = async (id: string, nombre: string) => {
    try {
      const data = await archivosApi.descargar(id)
      window.open(data.url, '_blank')

      toast.success("Descargando", { description: nombre })
    } catch (error: any) {
      toast.error("Error", { description: error.message })
    }
  }

  // Ver historial
  const handleVerHistorial = (id: string, nombre: string) => {
    setHistorialDialog({
      open: true,
      archivoId: id,
      archivoNombre: nombre
    })
  }

  // Verificar integridad
  const handleVerificarIntegridad = async (id: string, nombre: string) => {
    try {
      const resultado = await archivosApi.verificarIntegridad(id)

      if (resultado.es_integro) {
        toast.success("✓ Archivo íntegro", {
          description: `"${nombre}" no ha sido modificado`,
        })
      } else {
        toast.error("⚠️ Archivo modificado", {
          description: `"${nombre}" ha sido alterado`,
        })
      }
    } catch (error: any) {
      toast.error("Error", {
        description: error.message,
      })
    }
  }

  // Eliminar archivo
  const handleEliminar = async (id: string, nombre: string) => {
    if (!confirm(`¿Eliminar "${nombre}"?`)) return

    try {
      await archivosApi.delete(id)
      toast.success("Archivo eliminado", { description: nombre })
      // Eliminar del estado inmediatamente sin recargar la lista
      setArchivos(prev => prev.filter(archivo => archivo.id !== id))
      cargarEstadisticas()
    } catch (error: any) {
      toast.error("Error", { description: error.message })
    }
  }

  // Drag & Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    handleFileUpload(e.dataTransfer.files)
  }

  // ✅ USAR LA FUNCIÓN DE LA API en lugar de duplicarla
  // const formatearTamano = (bytes: number) => { ... }  // ❌ ELIMINADO

  // Obtener icono por tipo
  const getIconoTipo = (tipo: string) => {
    switch (tipo) {
      case "imagen": return ImageIcon
      case "documento": return FileText
      case "video": return File
      case "audio": return File
      default: return File
    }
  }

  // Filtrar archivos por tipo
  const getArchivosPorTipo = (tipo: string) => {
    return archivos.filter(a => a.tipo_archivo === tipo).length
  }

  if (!activeTeam) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Selecciona una tienda para ver los archivos</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Estadísticas */}
        {stats && (
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold">{stats.total_archivos}</div>
                <p className="text-xs text-muted-foreground">Total archivos</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold">{stats.total_tamano_mb.toFixed(2)} MB</div>
                <p className="text-xs text-muted-foreground">Espacio usado</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold">{stats.por_tipo.imagen || 0}</div>
                <p className="text-xs text-muted-foreground">Imágenes</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold">{stats.por_tipo.documento || 0}</div>
                <p className="text-xs text-muted-foreground">Documentos</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Zona de carga */}
        <Card>
          <CardContent className="p-6">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"
                }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                Arrastra archivos aquí o haz clic para seleccionar
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files)}
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
              >
                Seleccionar archivos
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Búsqueda y filtros */}
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Buscar archivos..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleBuscar()}
                />
              </div>
              <select
                className="border rounded-md px-3"
                value={tipoFiltro}
                onChange={(e) => setTipoFiltro(e.target.value)}
              >
                <option value="">Todos los tipos</option>
                <option value="imagen">Imágenes</option>
                <option value="documento">Documentos</option>
                <option value="video">Videos</option>
                <option value="audio">Audio</option>
                <option value="otro">Otros</option>
              </select>
              <Button onClick={handleBuscar} disabled={loading}>
                <Search className="h-4 w-4 mr-2" />
                Buscar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de archivos */}
        <Card>
          <CardContent className="p-6">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Cargando archivos...
              </div>
            ) : archivos.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay archivos
              </div>
            ) : (
              <div className="space-y-2">
                {archivos.map((archivo) => {
                  const Icon = getIconoTipo(archivo.tipo_archivo)
                  return (
                    <div
                      key={archivo.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        {archivo.tipo_archivo === "imagen" ? (
                          <img
                            src={archivo.archivo_url}
                            alt={archivo.nombre}
                            className="h-10 w-10 object-cover rounded"
                            loading="lazy"
                          />
                        ) : (
                          <Icon className="h-8 w-8 text-muted-foreground" />
                        )}

                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{archivo.nombre}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatearTamano(archivo.tamano)} •{" "}
                            {new Date(archivo.fecha_subida).toLocaleDateString()} •{" "}
                            {archivo.subido_por_nombre}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="relative group transition-all duration-300 active:scale-95"
                          onClick={() => {
                            navigator.clipboard.writeText(archivo.archivo_url)
                            setCopiadoId(archivo.id)
                            toast.success("URL copiada al portapapeles")
                            setTimeout(() => setCopiadoId(null), 2000)
                          }}
                          title="Copiar URL"
                        >
                          {copiadoId === archivo.id ? (
                            <Check className="h-4 w-4 text-green-500 animate-in zoom-in" />
                          ) : (
                            <Copy className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                          )}
                          {copiadoId === archivo.id && (
                            <span className="absolute -top-8 bg-black text-white text-[10px] px-2 py-1 rounded shadow-lg animate-in fade-in slide-in-from-bottom-2 whitespace-nowrap">
                              Copiado al portapapeles
                            </span>
                          )}
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleDescargar(archivo.id, archivo.nombre)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Descargar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleVerHistorial(archivo.id, archivo.nombre)}
                          >
                            <History className="h-4 w-4 mr-2" />
                            Ver historial
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleVerificarIntegridad(archivo.id, archivo.nombre)}
                          >
                            <Shield className="h-4 w-4 mr-2" />
                            Verificar integridad
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEliminar(archivo.id, archivo.nombre)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Diálogo de historial */}
      {historialDialog.archivoId && (
        <HistorialDialog
          open={historialDialog.open}
          onOpenChange={(open) => setHistorialDialog({ ...historialDialog, open })}
          archivoId={historialDialog.archivoId}
          archivoNombre={historialDialog.archivoNombre}
        />
      )}
    </div>
  )
}