import { API_BASE_URL, fetchWithAuth, getAuthToken } from "./client"
import type { ArchivoUploadData, ArchivoUpdateData, BuscarArchivosParams } from "./types"

export const archivosApi = {
  getAll: (teamId?: number) => {
    const query = teamId ? `?team_id=${teamId}` : ""
    return fetchWithAuth(`/archivos/${query}`)
  },

  get: (id: string) => fetchWithAuth(`/archivos/${id}/`),

  upload: async (data: ArchivoUploadData) => {
    const token = getAuthToken()
    const formData = new FormData()

    formData.append("team", String(data.team))
    formData.append("nombre", data.nombre)
    formData.append("archivo", data.archivo)
    if (data.descripcion) formData.append("descripcion", data.descripcion)
    if (data.tipo_archivo) formData.append("tipo_archivo", data.tipo_archivo)

    const headers: HeadersInit = {}
    if (token) headers["Authorization"] = `Bearer ${token}`

    const response = await fetch(`${API_BASE_URL}/archivos/`, {
      method: "POST",
      headers,
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Error al subir archivo" }))
      throw new Error(error.detail || "Error al subir archivo")
    }

    return response.json()
  },

  uploadImage: async (imagen: File, teamId: number, nombre?: string, descripcion?: string) => {
    const token = getAuthToken()
    const formData = new FormData()

    formData.append("imagen", imagen)
    formData.append("team", String(teamId))
    if (nombre) formData.append("nombre", nombre)
    if (descripcion) formData.append("descripcion", descripcion)

    const headers: HeadersInit = {}
    if (token) headers["Authorization"] = `Bearer ${token}`

    const response = await fetch(`${API_BASE_URL}/archivos/subir-imagen/`, {
      method: "POST",
      headers,
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Error al subir imagen" }))
      throw new Error(error.detail || "Error al subir imagen")
    }

    return response.json()
  },

  update: (id: string, data: Partial<ArchivoUpdateData>) =>
    fetchWithAuth(`/archivos/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),

  delete: (id: string) => fetchWithAuth(`/archivos/${id}/`, { method: "DELETE" }),

  descargar: (id: string) => fetchWithAuth(`/archivos/${id}/descargar/`, { method: "POST" }),

  buscar: (params: BuscarArchivosParams) => {
    const query = new URLSearchParams()
    if (params.q) query.append("q", params.q)
    if (params.tipo) query.append("tipo", params.tipo)
    if (params.team_id) query.append("team_id", String(params.team_id))
    return fetchWithAuth(`/archivos/buscar/?${query.toString()}`)
  },

  historial: (id: string) => fetchWithAuth(`/archivos/${id}/historial/`),

  verificarIntegridad: (id: string) =>
    fetchWithAuth(`/archivos/${id}/verificar_integridad/`, { method: "POST" }),

  estadisticas: () => fetchWithAuth("/archivos/estadisticas/"),
}

export const accesosApi = {
  getAll: () => fetchWithAuth("/accesos/"),
  misAccesos: () => fetchWithAuth("/accesos/mis_accesos/"),
  porArchivo: (archivoId: string) =>
    fetchWithAuth(`/accesos/por_archivo/?archivo_id=${archivoId}`),
  estadisticas: () => fetchWithAuth("/accesos/estadisticas/"),
}