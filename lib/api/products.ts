import { API_BASE_URL, fetchWithAuth, getAuthToken } from "./client"
import type { ProductData } from "./types"

async function uploadProductWithImages(data: Partial<ProductData>, id?: number) {
  const token = getAuthToken()
  const formData = new FormData()

  if (data.nombre) formData.append("nombre", data.nombre)
  if (data.team) formData.append("team", String(data.team))
  if (data.descripcion) formData.append("descripcion", data.descripcion)
  if (data.precio !== undefined) formData.append("precio", String(data.precio))
  if (data.categoria) formData.append("categoria", data.categoria)
  if (data.marca) formData.append("marca", String(data.marca))
  if (data.activo !== undefined) formData.append("activo", String(data.activo))

  if (data.imagenes_files && data.imagenes_files.length > 0) {
    data.imagenes_files.forEach((file) => {
      formData.append("imagenes_files", file)
    })
  }

  const headers: HeadersInit = {}
  if (token) headers["Authorization"] = `Bearer ${token}`

  const url = id
    ? `${API_BASE_URL}/productos/${id}/`
    : `${API_BASE_URL}/productos/`

  const response = await fetch(url, {
    method: id ? "PATCH" : "POST",
    headers,
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Error de red" }))
    throw new Error(error.detail || "Error en la petición")
  }

  return response.json()
}

export const productsApi = {
  getAll: (teamId: number) => fetchWithAuth(`/productos/?team=${teamId}`),

  getPublic: async (teamSlug: string) => {
    const response = await fetch(`${API_BASE_URL}/productos/publico/${teamSlug}/`)
    if (!response.ok) throw new Error("Error al obtener productos")
    return response.json()
  },

  get: (id: number) => fetchWithAuth(`/productos/${id}/`),

  create: async (data: ProductData) => {
    if (data.imagenes_files && data.imagenes_files.length > 0) {
      return uploadProductWithImages(data)
    }
    return fetchWithAuth("/productos/", { method: "POST", body: JSON.stringify(data) })
  },

  update: async (id: number, data: Partial<ProductData>) => {
    if (data.imagenes_files && data.imagenes_files.length > 0) {
      return uploadProductWithImages(data, id)
    }
    return fetchWithAuth(`/productos/${id}/`, { method: "PATCH", body: JSON.stringify(data) })
  },

  delete: (id: number) => fetchWithAuth(`/productos/${id}/`, { method: "DELETE" }),
}