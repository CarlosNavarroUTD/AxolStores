export const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/, "")
export const API_BASE_URL = `${BASE_URL}/api`

export function getAuthToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("access_token")
  }
  return null
}

export function getRefreshToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("refresh_token")
  }
  return null
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return null

  try {
    const response = await fetch(`${API_BASE_URL}/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    })

    if (!response.ok) {
      // Refresh token also expired — clear everything
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
      }
      return null
    }

    const data = await response.json()
    if (typeof window !== "undefined" && data.access) {
      localStorage.setItem("access_token", data.access)
    }
    return data.access || null
  } catch {
    return null
  }
}

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  let token = getAuthToken()

  const isFormData = options.body instanceof FormData

  const buildHeaders = (authToken: string | null): HeadersInit => {
    const headers: Record<string, string> = {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers as Record<string, string> || {}),
    }
    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`
    }
    return headers
  }

  let response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: buildHeaders(token),
  })

  // If 401, try refreshing the token and retry once
  if (response.status === 401) {
    const newToken = await refreshAccessToken()
    if (newToken) {
      token = newToken
      response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: buildHeaders(newToken),
      })
    } else {
      // Could not refresh — redirect to login
      if (typeof window !== "undefined") {
        window.location.href = "/login"
      }
      throw new Error("Sesión expirada. Inicia sesión nuevamente.")
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Error de red" }))
    // Extract the most useful error message from DRF responses
    if (error.detail) {
      throw new Error(error.detail)
    }
    if (error.non_field_errors) {
      throw new Error(Array.isArray(error.non_field_errors) ? error.non_field_errors[0] : error.non_field_errors)
    }
    // Handle field-level errors like {slug: ["message"], name: ["message"]}
    for (const key of Object.keys(error)) {
      const val = error[key]
      if (Array.isArray(val) && val.length > 0) {
        throw new Error(val[0])
      }
      if (typeof val === "string") {
        throw new Error(val)
      }
    }
    throw new Error(JSON.stringify(error))
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null
  }

  return response.json()
}