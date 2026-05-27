import { fetchWithAuth } from "./client"

// --- Types ---

export interface Plantilla {
  id: number
  nombre: string
  team: number
  contenido: string
  creado_en: string
  actualizado_en: string
}

export interface CampanaEstadisticas {
  total: number
  pendientes: number
  enviados: number
  errores: number
}

export interface CampanaLead {
  id: number
  campana: number
  lead: number
  lead_detalle: {
    id: number
    nombre: string
    telefono?: string
    estado: string
  }
  estado_envio: string
  estado_envio_display: string
  mensaje_error?: string
  enviado_en?: string
}

export interface Campana {
  id: number
  nombre: string
  team: number
  plantilla: number | null
  plantilla_detalle: Plantilla | null
  whatsapp_instance: number | null
  whatsapp_instance_detalle: {
    id: number
    instance_name: string
    status: string
  } | null
  estado: string
  estado_display: string
  estadisticas: CampanaEstadisticas
  creado_en: string
  actualizado_en: string
}

export interface CampanaCreateData {
  nombre: string
  team: number
  plantilla: number
  whatsapp_instance: number
  leads: number[]
}

export interface PlantillaData {
  nombre: string
  team: number
  contenido: string
}

// --- API ---

export const campaignsApi = {
  // Plantillas
  getPlantillas: (teamId: number): Promise<Plantilla[]> =>
    fetchWithAuth(`/plantillas/?team=${teamId}`),

  createPlantilla: (data: PlantillaData): Promise<Plantilla> =>
    fetchWithAuth("/plantillas/", { method: "POST", body: JSON.stringify(data) }),

  updatePlantilla: (id: number, data: Partial<PlantillaData>): Promise<Plantilla> =>
    fetchWithAuth(`/plantillas/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),

  deletePlantilla: (id: number): Promise<void> =>
    fetchWithAuth(`/plantillas/${id}/`, { method: "DELETE" }),

  // Campañas
  getCampanas: (teamId: number): Promise<Campana[]> =>
    fetchWithAuth(`/campanas/?team=${teamId}`),

  getCampana: (id: number): Promise<Campana> =>
    fetchWithAuth(`/campanas/${id}/`),

  createCampana: (data: CampanaCreateData): Promise<Campana> =>
    fetchWithAuth("/campanas/", { method: "POST", body: JSON.stringify(data) }),

  deleteCampana: (id: number): Promise<void> =>
    fetchWithAuth(`/campanas/${id}/`, { method: "DELETE" }),

  startCampana: (id: number): Promise<{ message: string }> =>
    fetchWithAuth(`/campanas/${id}/start/`, { method: "POST" }),
}
