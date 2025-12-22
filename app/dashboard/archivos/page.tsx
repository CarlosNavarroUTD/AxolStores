"use client"

import { useTeam } from "@/contexts/team-context"
import { Header } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, File, ImageIcon, FileText, Folder } from "lucide-react"

export default function ArchivosPage() {
  const { activeTeam } = useTeam()

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
          <Button className="gap-2">
            <Upload className="h-4 w-4" />
            Subir archivo
          </Button>
        </div>

        {/* Área de drop */}
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Upload className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium">Arrastra archivos aquí</p>
            <p className="text-sm text-muted-foreground mt-1">o haz clic para seleccionar</p>
            <Button variant="outline" className="mt-4 bg-transparent">
              Seleccionar archivos
            </Button>
          </CardContent>
        </Card>

        {/* Grid de tipos de archivo */}
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { icon: ImageIcon, label: "Imágenes", count: 12, color: "text-blue-500" },
            { icon: FileText, label: "Documentos", count: 8, color: "text-green-500" },
            { icon: File, label: "Otros", count: 3, color: "text-orange-500" },
            { icon: Folder, label: "Carpetas", count: 5, color: "text-yellow-500" },
          ].map((item) => (
            <Card key={item.label} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="flex items-center gap-4 p-4">
                <div className={`${item.color}`}>
                  <item.icon className="h-8 w-8" />
                </div>
                <div>
                  <p className="font-medium">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.count} archivos</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Lista de archivos recientes */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Archivos recientes</h3>
          <div className="text-center py-12 text-muted-foreground">No hay archivos subidos todavía</div>
        </div>
      </div>
    </div>
  )
}
