import { API_BASE_URL, fetchWithAuth } from "./client"

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/token/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    const result = await response.json()
    if (!response.ok) {
      throw new Error(result.detail || "Credenciales inválidas")
    }
    return result
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
    
    const result = await response.json()
    if (!response.ok) throw new Error(result.detail || "Error al registrar")
    return result
  },

  verifyEmail: async (key: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/registration/verify-email/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    })
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      const detail = err.detail || err.key?.[0] || JSON.stringify(err)
      throw new Error(detail || "Error al verificar el correo electrónico.")
    }
    return response.json()
  },

  resendVerification: async (email: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/registration/resend-email/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
    if (!response.ok) throw new Error("No se pudo reenviar el correo de verificación.")
    return response.json()
  },



  googleLogin: async (code: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/google/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    })
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      const message =
        err.detail ||
        err.non_field_errors?.[0] ||
        (typeof err === "object" ? JSON.stringify(err) : "Error al autenticar con Google")
      console.error("Google login error:", err)
      throw new Error(message)
    }
    return response.json()
  },

  me: () => fetchWithAuth("/users/me/"),

}