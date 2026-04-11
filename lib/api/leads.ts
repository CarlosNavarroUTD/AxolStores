import { API_BASE_URL, fetchWithAuth } from "./client"
import type { LeadData } from "./types"

export const leadsApi = {
  getAll: (teamId: number) => fetchWithAuth(`/leads/?team=${teamId}`),
  get: (id: number) => fetchWithAuth(`/leads/${id}/`),
  create: (data: LeadData) => fetchWithAuth("/leads/", { method: "POST", body: JSON.stringify(data) }),

  createPublic: async (data: LeadData) => {
    const response = await fetch(`${API_BASE_URL}/leads/public/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Error al crear lead")
    return response.json()
  },

  update: (id: number, data: Partial<LeadData>) =>
    fetchWithAuth(`/leads/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: number) => fetchWithAuth(`/leads/${id}/`, { method: "DELETE" }),
}