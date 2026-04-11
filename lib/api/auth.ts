import { API_BASE_URL, fetchWithAuth } from "./client"

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/token/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    if (!response.ok) throw new Error("Credenciales inválidas")
    return response.json()
  },

  register: async (data: {
    email: string
    password: string
    nombre_usuario: string
    tipo_usuario?: string 
  }) => {
    const response = await fetch(`${API_BASE_URL}/users/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Error al registrar")
    return response.json()
  },

  me: () => fetchWithAuth("/users/me/"),
}