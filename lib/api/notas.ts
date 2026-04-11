import { fetchWithAuth } from "./client"
import type { NotaData, BuscarNotasParams } from "./types"

export const notasApi = {
  getAll: (teamId: number) => fetchWithAuth(`/notas/?team=${teamId}`),

  get: (id: string) => fetchWithAuth(`/notas/${id}/`),

  create: (data: NotaData) =>
    fetchWithAuth("/notas/", { method: "POST", body: JSON.stringify(data) }),

  update: (id: string, data: Partial<NotaData>) =>
    fetchWithAuth(`/notas/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),

  delete: (id: string) => fetchWithAuth(`/notas/${id}/`, { method: "DELETE" }),

  fijar: (id: string) =>
    fetchWithAuth(`/notas/${id}/fijar/`, { method: "POST" }),

  buscar: (params: BuscarNotasParams) => {
    const query = new URLSearchParams()
    if (params.q) query.append("q", params.q)
    if (params.team_id) query.append("team_id", String(params.team_id))
    if (params.etiqueta) query.append("etiqueta", params.etiqueta)
    if (params.fijada !== undefined) query.append("fijada", String(params.fijada))
    return fetchWithAuth(`/notas/buscar/?${query.toString()}`)
  },

  getEtiquetas: (teamId: number) => fetchWithAuth(`/notas/etiquetas/?team=${teamId}`),
}