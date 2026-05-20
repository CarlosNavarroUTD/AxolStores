"use client"

import { useRouter } from "next/navigation"
import useSWR from "swr"
import { useTeam } from "@/contexts/team-context"
import { servicesApi } from "@/lib/api"
import { Header } from "@/components/dashboard/header"
import { DataTable, type Column } from "@/components/dashboard/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Wrench } from "lucide-react"

interface Service {
  id: number
  nombre: string
  descripcion?: string
  precio?: number | null
  duracion?: number
  activo: boolean
  team: number
  personalizados?: Record<string, unknown>
}

export default function ServiciosPage() {
  const router = useRouter()
  const { activeTeam } = useTeam()

  const { data: services = [], isLoading, mutate } = useSWR(
    activeTeam ? `services-${activeTeam.id}` : null,
    () => (activeTeam ? servicesApi.getAll(activeTeam.id) : []),
  )

  const columns: Column<Service>[] = [
    {
      key: "nombre",
      header: "Nombre",
      cell: (service) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
            <Wrench className="h-5 w-5 text-muted-foreground" />
          </div>
          <span className="font-medium">{service.nombre}</span>
        </div>
      ),
    },
    {
      key: "descripcion",
      header: "Descripción",
      cell: (service) => (
        <span className="text-muted-foreground text-sm line-clamp-2">
          {service.descripcion || "—"}
        </span>
      ),
    },
    {
      key: "precio",
      header: "Precio",
      cell: (service) => `$${(service.precio ?? 0).toLocaleString()}`,
      editable: true,
      editType: "number",
    },
    {
      key: "duracion",
      header: "Duración",
      cell: (service) => {
        if (!service.duracion) return "N/A"
        if (service.duracion < 60) return `${service.duracion} min`
        const h = Math.floor(service.duracion / 60)
        const m = service.duracion % 60
        return m === 0 ? `${h}h` : `${h}h ${m}min`
      },
      editable: true,
      editType: "number",
    },
    {
      key: "activo",
      header: "Estado",
      cell: (service) => (
        <Badge variant={service.activo ? "default" : "secondary"}>
          {service.activo ? "Activo" : "Inactivo"}
        </Badge>
      ),
      editable: true,
      editType: "boolean",
    },
    // Columnas dinámicas para campos personalizados
    ...getPersonalizadosColumns(services),
  ]

  if (!activeTeam) {
    return (
      <div className="flex h-full flex-col">
        <Header title="Servicios" />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Selecciona una tienda para ver los servicios</p>
        </div>
      </div>
    )
  }

  const handleInlineEdit = async (item: Service, key: string, value: any) => {
    if (!activeTeam) return

    let finalValue: any = value
    if (key === "precio" || key === "duracion") {
      finalValue = Number.parseFloat(String(value).replace(/[^0-9.-]+/g, ""))
      if (isNaN(finalValue)) return
    }

    try {
      // Si la key es personalizada (ej: "personalizados.color"),
      // deberíamos parsearlo, pero por simplicidad de momento lo 
      // actualizaremos si está en el root.
      // Ojo: si es key "personalizados.loquesea" habría que mutar personalizados.
      if (key.startsWith("personalizados.")) {
        const pKey = key.split(".")[1]
        const pData = { ...(item.personalizados || {}) }
        pData[pKey] = finalValue
        await servicesApi.update(item.id, { personalizados: pData } as any)
      } else {
        await servicesApi.update(item.id, { [key]: finalValue } as any)
      }
      await mutate()
    } catch (error) {
      console.error("Error actualizando servicio:", error)
      alert("Error al guardar el cambio")
    }
  }

  return (
    <div className="flex h-full flex-col">
      <Header title="Servicios" />
      <div className="flex-1 space-y-4 p-4 lg:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Servicios</h2>
            <p className="text-muted-foreground">Gestiona los servicios de {activeTeam.name}</p>
          </div>
          <Button onClick={() => router.push("/dashboard/servicios/nuevo")} className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo servicio
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <DataTable
            data={services}
            columns={columns}
            onEdit={(service) => router.push(`/dashboard/servicios/${service.id}`)}
            onDelete={(service) => router.push(`/dashboard/servicios/${service.id}?delete=1`)}
            onInlineEdit={handleInlineEdit}
            storageKey="servicios"
            searchKey="nombre"
            searchPlaceholder="Buscar servicios..."
          />
        )}
      </div>
    </div>
  )
}

// Genera columnas extra a partir de las claves de `personalizados`
function getPersonalizadosColumns(services: Service[]): Column<Service>[] {
  const keys = new Set<string>()
  for (const s of services) {
    if (s.personalizados && typeof s.personalizados === "object") {
      Object.keys(s.personalizados).forEach((k) => keys.add(k))
    }
  }
  return Array.from(keys).map((key) => ({
    key: `personalizados.${key}` as keyof Service,
    header: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " "),
    cell: (service) => {
      const val = service.personalizados?.[key]
      if (val == null) return "—"
      if (typeof val === "boolean") return val ? "Sí" : "No"
      return String(val)
    },
  }))
}