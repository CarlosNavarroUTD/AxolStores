"use client"

import { useState } from "react"
import useSWR from "swr"
import { useTeam } from "@/contexts/team-context"
import { campaignsApi, leadsApi, whatsappApi } from "@/lib/api"
import type { Plantilla, Campana, PlantillaData, CampanaCreateData } from "@/lib/api"
import type { WhatsappInstance } from "@/lib/api/whatsapp"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Play, Trash2, FileText, Megaphone, Send, AlertCircle, CheckCircle2, Clock, Search } from "lucide-react"

// ─── Plantillas Tab ───

function PlantillasTab({ teamId }: { teamId: number }) {
  const { data: plantillas = [], mutate } = useSWR(`plantillas-${teamId}`, () => campaignsApi.getPlantillas(teamId))
  const [isOpen, setIsOpen] = useState(false)
  const [editing, setEditing] = useState<Plantilla | null>(null)
  const [form, setForm] = useState({ nombre: "", contenido: "" })
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Plantilla | null>(null)

  const openNew = () => { setEditing(null); setForm({ nombre: "", contenido: "" }); setIsOpen(true) }
  const openEdit = (p: Plantilla) => { setEditing(p); setForm({ nombre: p.nombre, contenido: p.contenido }); setIsOpen(true) }

  const handleSave = async () => {
    setSaving(true)
    try {
      const data: PlantillaData = { ...form, team: teamId }
      if (editing) await campaignsApi.updatePlantilla(editing.id, data)
      else await campaignsApi.createPlantilla(data)
      await mutate()
      setIsOpen(false)
    } catch (e) { console.error(e) }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try { await campaignsApi.deletePlantilla(deleteTarget.id); await mutate() }
    catch (e) { console.error(e) }
    finally { setDeleteTarget(null) }
  }

  // Preview: replace {{nombre}} visually
  const previewText = (text: string) => text.replace(/\{\{nombre\}\}/g, "Juan Pérez")

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-muted-foreground text-sm">Crea plantillas de mensaje con variables como {"{{nombre}}"}</p>
        <Button onClick={openNew} className="gap-2"><Plus className="h-4 w-4" />Nueva plantilla</Button>
      </div>

      {plantillas.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium">Sin plantillas</p>
          <p className="text-sm text-muted-foreground mt-1">Crea tu primera plantilla para enviar mensajes masivos</p>
        </CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plantillas.map((p) => (
            <Card key={p.id} className="group relative hover:shadow-md transition-shadow cursor-pointer" onClick={() => openEdit(p)}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base">{p.nombre}</CardTitle>
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => { e.stopPropagation(); setDeleteTarget(p) }}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <CardDescription className="text-xs">{new Date(p.creado_en).toLocaleDateString("es-ES")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 rounded-lg p-3 text-sm whitespace-pre-wrap line-clamp-4">{p.contenido}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog crear/editar plantilla */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar plantilla" : "Nueva plantilla"}</DialogTitle>
            <DialogDescription>Las variables como {"{{nombre}}"} se reemplazan al enviar.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Oferta de bienvenida" />
            </div>
            <div className="space-y-2">
              <Label>Contenido del mensaje</Label>
              <Textarea value={form.contenido} onChange={(e) => setForm({ ...form, contenido: e.target.value })}
                placeholder={"Hola {{nombre}}, tenemos una oferta especial para ti..."} rows={5} />
            </div>
            {form.contenido && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Vista previa</Label>
                <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3 text-sm whitespace-pre-wrap">
                  {previewText(form.contenido)}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving || !form.nombre || !form.contenido}>
              {saving ? "Guardando..." : editing ? "Guardar cambios" : "Crear plantilla"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmar eliminar */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar plantilla?</AlertDialogTitle>
            <AlertDialogDescription>Se eliminará &quot;{deleteTarget?.nombre}&quot; permanentemente.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ─── Campañas Tab ───

interface LeadItem {
  id: number
  nombre: string
  telefono?: string
  estado: string
  estado_display?: string
}

function CampanasTab({ teamId }: { teamId: number }) {
  const { data: campanas = [], mutate } = useSWR(`campanas-${teamId}`, () => campaignsApi.getCampanas(teamId))
  const { data: plantillas = [] } = useSWR(`plantillas-${teamId}`, () => campaignsApi.getPlantillas(teamId))
  const { data: instances = [] } = useSWR<WhatsappInstance[]>(`wa-inst-${teamId}`, () => whatsappApi.getInstances(teamId))
  const { data: leads = [] } = useSWR<LeadItem[]>(`leads-${teamId}`, () => leadsApi.getAll(teamId))

  const [isOpen, setIsOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [starting, setStarting] = useState<number | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Campana | null>(null)
  const [searchLeads, setSearchLeads] = useState("")
  const [form, setForm] = useState({ nombre: "", plantilla: "", whatsapp_instance: "", selectedLeads: [] as number[] })

  const connectedInstances = instances.filter((i) => i.status === "connected")

  const filteredLeads = leads.filter((l) =>
    (l.nombre?.toLowerCase().includes(searchLeads.toLowerCase()) || l.telefono?.includes(searchLeads))
  )

  const toggleLead = (id: number) => {
    setForm((f) => ({
      ...f,
      selectedLeads: f.selectedLeads.includes(id) ? f.selectedLeads.filter((x) => x !== id) : [...f.selectedLeads, id],
    }))
  }

  const selectAll = () => {
    const allIds = filteredLeads.filter((l) => l.telefono).map((l) => l.id)
    setForm((f) => ({ ...f, selectedLeads: allIds }))
  }

  const openNew = () => {
    setForm({ nombre: "", plantilla: "", whatsapp_instance: "", selectedLeads: [] })
    setSearchLeads("")
    setIsOpen(true)
  }

  const handleCreate = async () => {
    setSaving(true)
    try {
      const data: CampanaCreateData = {
        nombre: form.nombre,
        team: teamId,
        plantilla: parseInt(form.plantilla),
        whatsapp_instance: parseInt(form.whatsapp_instance),
        leads: form.selectedLeads,
      }
      await campaignsApi.createCampana(data)
      await mutate()
      setIsOpen(false)
    } catch (e) { console.error(e) }
    finally { setSaving(false) }
  }

  const handleStart = async (id: number) => {
    setStarting(id)
    try { await campaignsApi.startCampana(id); await mutate() }
    catch (e) { console.error(e) }
    finally { setStarting(null) }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try { await campaignsApi.deleteCampana(deleteTarget.id); await mutate() }
    catch (e) { console.error(e) }
    finally { setDeleteTarget(null) }
  }

  const estadoBadge = (estado: string) => {
    const map: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      borrador: { label: "Borrador", variant: "secondary" },
      enviando: { label: "Enviando...", variant: "default" },
      completado: { label: "Completado", variant: "outline" },
      error: { label: "Error", variant: "destructive" },
    }
    const info = map[estado] || map.borrador
    return <Badge variant={info.variant}>{info.label}</Badge>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-muted-foreground text-sm">Envía mensajes masivos a tus leads por WhatsApp</p>
        <Button onClick={openNew} className="gap-2" disabled={plantillas.length === 0 || connectedInstances.length === 0}>
          <Plus className="h-4 w-4" />Nueva campaña
        </Button>
      </div>

      {(plantillas.length === 0 || connectedInstances.length === 0) && (
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
            <p className="text-sm text-amber-800 dark:text-amber-200">
              {plantillas.length === 0 && "Necesitas al menos una plantilla. "}
              {connectedInstances.length === 0 && "Necesitas una instancia de WhatsApp conectada."}
            </p>
          </CardContent>
        </Card>
      )}

      {campanas.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Megaphone className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium">Sin campañas</p>
          <p className="text-sm text-muted-foreground mt-1">Crea tu primera campaña para enviar mensajes masivos</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {campanas.map((c) => {
            const stats = c.estadisticas
            const progress = stats.total > 0 ? ((stats.enviados + stats.errores) / stats.total) * 100 : 0
            return (
              <Card key={c.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold truncate">{c.nombre}</h3>
                        {estadoBadge(c.estado)}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><FileText className="h-3 w-3" />{c.plantilla_detalle?.nombre || "—"}</span>
                        <span>{new Date(c.creado_en).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}</span>
                      </div>
                      {stats.total > 0 && (
                        <div className="mt-3 space-y-1">
                          <Progress value={progress} className="h-2" />
                          <div className="flex gap-4 text-xs">
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{stats.pendientes} pendientes</span>
                            <span className="flex items-center gap-1 text-emerald-600"><CheckCircle2 className="h-3 w-3" />{stats.enviados} enviados</span>
                            {stats.errores > 0 && <span className="flex items-center gap-1 text-destructive"><AlertCircle className="h-3 w-3" />{stats.errores} errores</span>}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {c.estado === "borrador" && (
                        <Button size="sm" className="gap-1" onClick={() => handleStart(c.id)} disabled={starting === c.id}>
                          <Play className="h-3 w-3" />{starting === c.id ? "Iniciando..." : "Enviar"}
                        </Button>
                      )}
                      {c.estado !== "enviando" && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteTarget(c)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Dialog nueva campaña */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Nueva campaña</DialogTitle>
            <DialogDescription>Configura y selecciona los leads para tu envío masivo</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Nombre de la campaña</Label>
              <Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Promo Mayo 2026" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Plantilla</Label>
                <Select value={form.plantilla} onValueChange={(v) => setForm({ ...form, plantilla: v })}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar plantilla" /></SelectTrigger>
                  <SelectContent>
                    {plantillas.map((p) => (<SelectItem key={p.id} value={p.id.toString()}>{p.nombre}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Instancia WhatsApp</Label>
                <Select value={form.whatsapp_instance} onValueChange={(v) => setForm({ ...form, whatsapp_instance: v })}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar instancia" /></SelectTrigger>
                  <SelectContent>
                    {connectedInstances.map((i) => (<SelectItem key={i.id} value={i.id.toString()}>{i.instance_name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Preview de plantilla seleccionada */}
            {form.plantilla && (() => {
              const selected = plantillas.find((p) => p.id === parseInt(form.plantilla))
              return selected ? (
                <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3 text-sm whitespace-pre-wrap">
                  <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 mb-1">Vista previa:</p>
                  {selected.contenido.replace(/\{\{nombre\}\}/g, "Juan Pérez")}
                </div>
              ) : null
            })()}

            {/* Selección de leads */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Leads ({form.selectedLeads.length} seleccionados)</Label>
                <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={selectAll}>Seleccionar todos con teléfono</Button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input className="pl-9" placeholder="Buscar lead..." value={searchLeads} onChange={(e) => setSearchLeads(e.target.value)} />
              </div>
              <ScrollArea className="h-48 rounded-md border">
                <div className="p-2 space-y-1">
                  {filteredLeads.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No hay leads disponibles</p>
                  ) : filteredLeads.map((lead) => (
                    <label key={lead.id} className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-muted/50 cursor-pointer transition-colors">
                      <Checkbox checked={form.selectedLeads.includes(lead.id)} onCheckedChange={() => toggleLead(lead.id)} disabled={!lead.telefono} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{lead.nombre || "Sin nombre"}</p>
                        <p className="text-xs text-muted-foreground">{lead.telefono || "Sin teléfono"}</p>
                      </div>
                      {!lead.telefono && <span className="text-xs text-destructive">Sin tel.</span>}
                    </label>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={saving || !form.nombre || !form.plantilla || !form.whatsapp_instance || form.selectedLeads.length === 0} className="gap-2">
              <Send className="h-4 w-4" />{saving ? "Creando..." : "Crear campaña"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmar eliminar */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar campaña?</AlertDialogTitle>
            <AlertDialogDescription>Se eliminará &quot;{deleteTarget?.nombre}&quot; y todos sus registros.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ─── Main Page ───

export default function CampanasPage() {
  const { activeTeam } = useTeam()

  if (!activeTeam) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Selecciona una tienda para gestionar campañas</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-4 p-4 lg:p-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Campañas</h2>
          <p className="text-muted-foreground">Envío masivo de mensajes por WhatsApp para {activeTeam.name}</p>
        </div>

        <Tabs defaultValue="campanas" className="space-y-4">
          <TabsList>
            <TabsTrigger value="campanas" className="gap-2"><Megaphone className="h-4 w-4" />Campañas</TabsTrigger>
            <TabsTrigger value="plantillas" className="gap-2"><FileText className="h-4 w-4" />Plantillas</TabsTrigger>
          </TabsList>
          <TabsContent value="campanas"><CampanasTab teamId={activeTeam.id} /></TabsContent>
          <TabsContent value="plantillas"><PlantillasTab teamId={activeTeam.id} /></TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
