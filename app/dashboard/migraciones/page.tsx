"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { googlesheetsApi, type GoogleSheetIntegrationData } from "@/lib/api/googlesheets"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Trash2, RefreshCw, Save, Database, AlertCircle, FileSpreadsheet } from "lucide-react"
import { toast } from "sonner"

export default function MigracionesPage() {
  const [integrations, setIntegrations] = useState<GoogleSheetIntegrationData[]>([])
  const [loading, setLoading] = useState(true)
  const [syncingId, setSyncingId] = useState<number | null>(null)
  
  // Form state
  const [spreadsheetId, setSpreadsheetId] = useState("")
  const [sheetName, setSheetName] = useState("Sheet1")
  const [entidad, setEntidad] = useState<"producto" | "servicio">("producto")
  const [mapping, setMapping] = useState<{ sys: string; sheet: string }[]>([{ sys: "", sheet: "" }])
  const [identificadores, setIdentificadores] = useState("")

  const loadIntegrations = async () => {
    try {
      const data = await googlesheetsApi.list()
      setIntegrations(data)
    } catch (error) {
      toast.error("Error al cargar migraciones")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadIntegrations()
  }, [])

  const handleSave = async () => {
    if (!spreadsheetId) {
      toast.error("El ID de la hoja es requerido")
      return
    }

    const mappingObj: Record<string, string> = {}
    mapping.forEach(m => {
      if (m.sys && m.sheet) mappingObj[m.sys] = m.sheet
    })

    if (Object.keys(mappingObj).length === 0) {
      toast.error("Agrega al menos un mapeo válido")
      return
    }

    const idsArray = identificadores.split(",").map(id => id.trim()).filter(Boolean)
    if (idsArray.length === 0) {
      toast.error("Agrega al menos un identificador (ej: sku)")
      return
    }

    try {
      await googlesheetsApi.create({
        spreadsheet_id: spreadsheetId,
        sheet_name: sheetName,
        entidad,
        mapping: mappingObj,
        identificadores: idsArray
      })
      toast.success("Integración guardada exitosamente")
      setSpreadsheetId("")
      setMapping([{ sys: "", sheet: "" }])
      setIdentificadores("")
      loadIntegrations()
    } catch (error) {
      toast.error("Error al guardar la integración")
    }
  }

  const handleSync = async (id: number) => {
    setSyncingId(id)
    try {
      const result = await googlesheetsApi.sync(id)
      toast.success(`Sincronización completa. Creados: ${result.stats?.created}, Actualizados: ${result.stats?.updated}, Errores: ${result.stats?.errors}`)
      loadIntegrations()
    } catch (error: any) {
      toast.error(error.message || "Error durante la sincronización")
    } finally {
      setSyncingId(null)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await googlesheetsApi.delete(id)
      toast.success("Integración eliminada")
      loadIntegrations()
    } catch (error) {
      toast.error("Error al eliminar")
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Migraciones</h1>
        <p className="text-muted-foreground">Sincroniza tus datos desde Google Sheets.</p>
      </div>

      <Alert className="bg-blue-50/50 border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-700">
          Asegúrate de haber iniciado sesión con tu cuenta de Google (Continuar con Google) para que el sistema tenga permisos de lectura en tus hojas de cálculo.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5" /> Nueva Integración
            </CardTitle>
            <CardDescription>Configura una nueva conexión a Google Sheets</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Spreadsheet ID</Label>
              <Input 
                placeholder="1BxiMvs0XRYFgwnLEUKkjJd..." 
                value={spreadsheetId}
                onChange={(e) => setSpreadsheetId(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Lo encuentras en la URL de tu Google Sheet.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre de la Hoja</Label>
                <Input 
                  placeholder="Sheet1" 
                  value={sheetName}
                  onChange={(e) => setSheetName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Entidad</Label>
                <Select value={entidad} onValueChange={(val: any) => setEntidad(val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="producto">Producto</SelectItem>
                    <SelectItem value="servicio">Servicio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t">
              <Label>Mapeo de Campos</Label>
              {mapping.map((m, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <Input 
                    placeholder="Campo AxolStores (ej: nombre)" 
                    value={m.sys}
                    onChange={(e) => {
                      const newMapping = [...mapping]
                      newMapping[idx].sys = e.target.value
                      setMapping(newMapping)
                    }}
                  />
                  <span>=</span>
                  <Input 
                    placeholder="Columna Sheet (ej: Producto)" 
                    value={m.sheet}
                    onChange={(e) => {
                      const newMapping = [...mapping]
                      newMapping[idx].sheet = e.target.value
                      setMapping(newMapping)
                    }}
                  />
                  <Button variant="ghost" size="icon" onClick={() => setMapping(mapping.filter((_, i) => i !== idx))}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => setMapping([...mapping, { sys: "", sheet: "" }])}>
                <Plus className="w-4 h-4 mr-2" /> Agregar Campo
              </Button>
            </div>

            <div className="space-y-2 pt-2 border-t">
              <Label>Identificadores Únicos</Label>
              <Input 
                placeholder="sku, nombre (separados por coma)" 
                value={identificadores}
                onChange={(e) => setIdentificadores(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Si el sistema encuentra un registro con este mismo valor, lo actualizará en lugar de duplicarlo.</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" /> Guardar Integración
            </Button>
          </CardFooter>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Integraciones Activas</h2>
          {loading ? (
            <p className="text-muted-foreground">Cargando...</p>
          ) : integrations.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <Database className="w-12 h-12 mx-auto mb-4 opacity-20" />
                No tienes integraciones configuradas.
              </CardContent>
            </Card>
          ) : (
            integrations.map(integration => (
              <Card key={integration.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4 text-green-600" />
                        {integration.sheet_name} ({integration.entidad})
                      </CardTitle>
                      <CardDescription className="truncate max-w-[200px]" title={integration.spreadsheet_id}>
                        ID: {integration.spreadsheet_id}
                      </CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(integration.id!)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pb-3 text-sm">
                  <div className="flex flex-wrap gap-1 mb-2">
                    {Object.entries(integration.mapping).slice(0, 3).map(([k, v]) => (
                      <span key={k} className="bg-muted px-2 py-1 rounded text-xs">{k} ➔ {v}</span>
                    ))}
                    {Object.keys(integration.mapping).length > 3 && <span className="text-xs text-muted-foreground">+{Object.keys(integration.mapping).length - 3} más</span>}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Última sinc: {integration.last_sync ? new Date(integration.last_sync).toLocaleString() : "Nunca"}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="secondary" 
                    className="w-full" 
                    onClick={() => handleSync(integration.id!)}
                    disabled={syncingId === integration.id}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${syncingId === integration.id ? 'animate-spin' : ''}`} />
                    {syncingId === integration.id ? "Sincronizando..." : "Sincronizar Ahora"}
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
