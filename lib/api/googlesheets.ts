import { API_BASE_URL, fetchWithAuth } from "./client"

export interface GoogleSheetIntegrationData {
  id?: number
  team?: number
  spreadsheet_id: string
  sheet_name: string
  entidad: "producto" | "servicio"
  mapping: Record<string, string>
  identificadores: string[]
  last_sync?: string
  activo?: boolean
}

export const googlesheetsApi = {
  list: () => fetchWithAuth("/googlesheets/"),
  
  create: (data: GoogleSheetIntegrationData) =>
    fetchWithAuth("/googlesheets/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
    
  update: (id: number, data: Partial<GoogleSheetIntegrationData>) =>
    fetchWithAuth(`/googlesheets/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
    
  delete: (id: number) =>
    fetchWithAuth(`/googlesheets/${id}/`, {
      method: "DELETE",
    }),
    
  sync: (id: number) =>
    fetchWithAuth(`/googlesheets/${id}/sync/`, {
      method: "POST",
    }),
}
