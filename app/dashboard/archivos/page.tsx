"use client"

import { useEffect, useState, useRef } from "react"
import { useTeam } from "@/contexts/team-context"
import { Header } from "@/components/dashboard/header"
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
  Eye
} from "lucide-react"
import { archivosApi, type Archivo } from "@/lib/api"
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

  const [archivos, setArchivos] = useState<Archivo[]>([])
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<any>(null)
  const [busqueda, setBusqueda] = useState("")
  const [tipoFiltro, setTipoFiltro] = useState("")
  const [dragging, setDragging] = useState(false)
  
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
      const data = await archivosApi.getAll(activeTeam.id)
      setArchivos(data.results || data)
    } catch (error: any) {
      toast.error("Error", {description: error.message})
    } finally {
      setLoading(false)
    }
  }

  // Cargar estadísticas
  const cargarEstadisticas = async () => {
    try {
      const data = await archivosApi.estadisticas()
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

  // Subir archivos
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !activeTeam) return

    setLoading(true)
    let exitosos = 0
    let fallidos = 0

    for (const file of Array.from(files)) {
      try {
        // Detectar tipo de archivo
        let tipoArchivo: any = "otro"
        if (file.type.startsWith("image/")) tipoArchivo = "imagen"
        else if (file.type.startsWith("video/")) tipoArchivo = "video"
        else if (file.type.startsWith("audio/")) tipoArchivo = "audio"
        else if (
          file.type.includes("pdf") || 
          file.type.includes("word") || 
          file.type.includes("text") ||
          file.type.includes("document")
        ) {
          tipoArchivo = "documento"
        }

        await archivosApi.upload({
          team: activeTeam.id,
          nombre: file.name,
          archivo: file,
          descripcion: `Archivo subido el ${new Date().toLocaleDateString()}`,
          tipo_archivo: tipoArchivo,
        })

        exitosos++
      } catch (error: any) {
        fallidos++
        console.error(`Error al subir ${file.name}:`, error)
      }
    }

    setLoading(false)

    if (exitosos > 0) {
      toast.success("Archivos subidos", { description: `${exitosos} archivo(s) subidos correctamente` })
      cargarArchivos()
      cargarEstadisticas()
    }

    if (fallidos > 0) {
      toast.error("Error al subir archivos", { description: `${fallidos} archivo(s) no se pudieron subir` })  
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
        tipo: tipoFiltro,
        team_id: activeTeam.id,
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
      toast.success("Archivo eliminado", { description: nombre });
      cargarArchivos()
      cargarEstadisticas()
    } catch (error: any) {
      toast.error("Error", { description: error.message });
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

  // Formatear tamaño
  const formatearTamano = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

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
        <Header title="Archivos" />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Selecciona una tienda para ver los archivos</p>
        </div>
      </div>
    )
  }
  

  return (
    <div className="flex h-full flex-col">
      <Header title="Archivos" />

      <div className="flex-1 space-y-4 p-4 lg:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Archivos</h2>
            <p className="text-muted-foreground">Gestiona los archivos de {activeTeam.name}</p>
          </div>
          <Button 
            className="gap-2"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
          >
            <Upload className="h-4 w-4" />
            {loading ? "Subiendo..." : "Subir archivo"}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleFileUpload(e.target.files)}
          />
        </div>

        {/* Estadísticas */}
        {stats && (
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <File className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">{stats.total_archivos}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Folder className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tamaño</p>
                    <p className="text-2xl font-bold">{stats.total_tamano_mb} MB</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <Upload className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Mis archivos</p>
                    <p className="text-2xl font-bold">{stats.archivos_subidos_por_usuario}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <ImageIcon className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Imágenes</p>
                    <p className="text-2xl font-bold">{stats.por_tipo?.imagen || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Área de drop */}
        <Card 
          className={`border-2 border-dashed transition-colors ${
            dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Upload className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium">Arrastra archivos aquí</p>
            <p className="text-sm text-muted-foreground mt-1">o haz clic en el botón superior</p>
          </CardContent>
        </Card>

        {/* Filtros por tipo */}
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { tipo: "imagen", icon: ImageIcon, label: "Imágenes", color: "text-blue-500" },
            { tipo: "documento", icon: FileText, label: "Documentos", color: "text-green-500" },
            { tipo: "video", icon: File, label: "Videos", color: "text-purple-500" },
            { tipo: "audio", icon: File, label: "Audio", color: "text-orange-500" },
          ].map((item) => (
            <Card 
              key={item.tipo} 
              className={`cursor-pointer hover:shadow-md transition-shadow ${
                tipoFiltro === item.tipo ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => {
                setTipoFiltro(tipoFiltro === item.tipo ? "" : item.tipo)
                setBusqueda("")
              }}
            >
              <CardContent className="flex items-center gap-4 p-4">
                <div className={item.color}>
                  <item.icon className="h-8 w-8" />
                </div>
                <div>
                  <p className="font-medium">{item.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {getArchivosPorTipo(item.tipo)} archivos
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Búsqueda */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar archivos..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleBuscar()}
              className="pl-10"
            />
          </div>
          <Button onClick={handleBuscar} disabled={loading}>
            Buscar
          </Button>
          {(busqueda || tipoFiltro) && (
            <Button 
              variant="outline" 
              onClick={() => {
                setBusqueda("")
                setTipoFiltro("")
                cargarArchivos()
              }}
            >
              Limpiar
            </Button>
          )}
        </div>

        {/* Lista de archivos */}
        <div>
          <h3 className="text-lg font-semibold mb-4">
            {tipoFiltro ? `Archivos - ${tipoFiltro}` : "Todos los archivos"}
          </h3>
          
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Cargando archivos...</p>
            </div>
          ) : archivos.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No hay archivos {tipoFiltro ? `de tipo "${tipoFiltro}"` : 'todavía'}
            </div>
          ) : (
            <div className="grid gap-4">
              {archivos.map((archivo) => {
                const IconoTipo = getIconoTipo(archivo.tipo_archivo)
                return (
                  <Card key={archivo.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="flex items-center gap-4 p-4">
                      {/* Miniatura o icono */}
                      <div className="flex-shrink-0">
                        {archivo.tipo_archivo === "imagen" ? (
                          <img
                            src={archivo.archivo}
                            alt={archivo.nombre}
                            className="w-16 h-16 object-cover rounded"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded bg-muted flex items-center justify-center">
                            <IconoTipo className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Información */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{archivo.nombre}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {archivo.descripcion}
                        </p>
                        <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                          <span className="capitalize">{archivo.tipo_archivo}</span>
                          <span>{formatearTamano(archivo.tamano)}</span>
                          <span>{new Date(archivo.fecha_creacion).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Acciones */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(archivo.archivo, '_blank')}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="ghost">
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
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Diálogo de historial */}
      <HistorialDialog
        archivoId={historialDialog.archivoId}
        archivoNombre={historialDialog.archivoNombre}
        open={historialDialog.open}
        onOpenChange={(open) => setHistorialDialog(prev => ({ ...prev, open }))}
      />
    </div>
  )
}