import { fetchWithAuth, getAuthToken, API_BASE_URL } from "./client"

export interface WhatsappInstance {
  id: number
  team: number
  instance_name: string
  instance_id: string | null
  token: string | null
  status: string // connected, disconnected, qr_pending
  phone_number: string | null
  activo: boolean
  creado_en: string
  actualizado_en: string
}

export interface QrCodeResponse {
  base64: string | null
  code: string | null
}

export const whatsappApi = {
  getInstances: (teamId: number): Promise<WhatsappInstance[]> =>
    fetchWithAuth(`/whatsapp/instances/?team_id=${teamId}`),

  createInstance: (teamId: number, instanceName: string): Promise<WhatsappInstance> =>
    fetchWithAuth("/whatsapp/instances/", {
      method: "POST",
      body: JSON.stringify({ team: teamId, instance_name: instanceName }),
    }),

  deleteInstance: async (id: number): Promise<void> => {
    const token = getAuthToken()
    const headers: HeadersInit = { "Content-Type": "application/json" }
    if (token) headers["Authorization"] = `Bearer ${token}`
    const response = await fetch(`${API_BASE_URL}/whatsapp/instances/${id}/`, {
      method: "DELETE",
      headers,
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Error de red" }))
      throw new Error(error.detail || "Error al eliminar")
    }
  },

  getQrCode: (id: number): Promise<QrCodeResponse> =>
    fetchWithAuth(`/whatsapp/instances/${id}/get_qr/`),
}
