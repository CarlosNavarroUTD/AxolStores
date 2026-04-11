import { API_BASE_URL, fetchWithAuth } from "./client"
import type { ServiceData } from "./types"

export const servicesApi = {
  getAll: (teamId: number) => fetchWithAuth(`/servicios/?team=${teamId}`),

  getPublic: async (teamSlug: string) => {
    const response = await fetch(`${API_BASE_URL}/servicios/public/?team_slug=${teamSlug}`)
    if (!response.ok) throw new Error("Error al obtener servicios")
    return response.json()
  },

  get: (id: number) => fetchWithAuth(`/servicios/${id}/`),
  create: (data: ServiceData) => fetchWithAuth("/servicios/", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: Partial<ServiceData>) =>
    fetchWithAuth(`/servicios/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: number) => fetchWithAuth(`/servicios/${id}/`, { method: "DELETE" }),
}