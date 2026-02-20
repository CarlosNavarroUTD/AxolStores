const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
const API_BASE_URL =
  BASE_URL.endsWith("/api") || BASE_URL.endsWith("/api/")
    ? BASE_URL.replace(/\/$/, "")
    : `${BASE_URL.replace(/\/$/, "")}/api`

// Helper para obtener el token
function getAuthToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("access_token")
  }
  return null
}

// Fetch wrapper con autenticación
async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken()

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  }

  if (token) {
    ;(headers as Record<string, string>)["Authorization"] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Error de red" }))
    throw new Error(error.detail || "Error en la petición")
  }

  return response.json()
}

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
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

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

// Auth
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

  register: async (data: { email: string; password: string; nombre_usuario: string }) => {
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

// Teams
export const teamsApi = {
  getMyTeams: () => fetchWithAuth("/teams/my_teams/"),
  getTeam: (id: number) => fetchWithAuth(`/teams/${id}/`),
  getTeamBySlug: async (slug: string) => {
    const response = await fetch(`${API_BASE_URL}/teams/?slug=${slug}`)
    if (!response.ok) throw new Error("Team no encontrado")
    const data = await response.json()
    return data.results?.[0] || data[0]
  },
  createTeam: (data: { name: string; description?: string }) =>
    fetchWithAuth("/teams/", { method: "POST", body: JSON.stringify(data) }),
  updateTeam: (id: number, data: Partial<{ name: string; description: string }>) =>
    fetchWithAuth(`/teams/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteTeam: (id: number) => fetchWithAuth(`/teams/${id}/`, { method: "DELETE" }),
  getMembers: (id: number) => fetchWithAuth(`/teams/${id}/members/`),
  inviteMember: (teamId: number, data: { email?: string; phone?: string }) =>
    fetchWithAuth(`/teams/${teamId}/invite_member/`, { method: "POST", body: JSON.stringify(data) }),
}

// Products
export const productsApi = {
  getAll: (teamId: number) => fetchWithAuth(`/productos/?team=${teamId}`),
  
  getPublic: async (teamSlug: string) => {
    const response = await fetch(
      `${API_BASE_URL}/productos/publico/${teamSlug}/`
    )
    if (!response.ok) throw new Error("Error al obtener productos")
    return response.json()
  },
  
  get: (id: number) => fetchWithAuth(`/productos/${id}/`),
  
  create: async (data: ProductData) => {
    if (data.imagenes_files && data.imagenes_files.length > 0) {
      return uploadProductWithImages(data)
    }
    return fetchWithAuth("/productos/", { 
      method: "POST", 
      body: JSON.stringify(data) 
    })
  },
  
  update: async (id: number, data: Partial<ProductData>) => {
    if (data.imagenes_files && data.imagenes_files.length > 0) {
      return uploadProductWithImages(data, id)
    }
    return fetchWithAuth(`/productos/${id}/`, { 
      method: "PATCH", 
      body: JSON.stringify(data) 
    })
  },
  
  delete: (id: number) => 
    fetchWithAuth(`/productos/${id}/`, { method: "DELETE" }),
}

// Services
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

// Leads
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

// Tasks
export const tasksApi = {
  getAll: (teamId: number) => fetchWithAuth(`/tasks/?team=${teamId}`),
  get: (id: number) => fetchWithAuth(`/tasks/${id}/`),
  create: (data: TaskData) => fetchWithAuth("/tasks/", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: Partial<TaskData>) =>
    fetchWithAuth(`/tasks/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: number) => fetchWithAuth(`/tasks/${id}/`, { method: "DELETE" }),
}

// ========== NUEVO: ARCHIVOS API ==========
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
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

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

  // Método simplificado para subir solo imágenes
  uploadImage: async (imagen: File, teamId: number, nombre?: string, descripcion?: string) => {
    const token = getAuthToken()
    const formData = new FormData()

    formData.append("imagen", imagen)
    formData.append("team", String(teamId))
    if (nombre) formData.append("nombre", nombre)
    if (descripcion) formData.append("descripcion", descripcion)

    const headers: HeadersInit = {}
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

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

  update: async (id: string, data: Partial<ArchivoUpdateData>) => {
    return fetchWithAuth(`/archivos/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  },

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

// Accesos API
export const accesosApi = {
  getAll: () => fetchWithAuth("/accesos/"),
  misAccesos: () => fetchWithAuth("/accesos/mis_accesos/"),
  porArchivo: (archivoId: string) =>
    fetchWithAuth(`/accesos/por_archivo/?archivo_id=${archivoId}`),
  estadisticas: () => fetchWithAuth("/accesos/estadisticas/"),
}

// ========== TYPES ==========
export interface ProductData {
  team: number
  nombre: string
  descripcion?: string
  precio: number
  categoria: string
  marca?: number
  imagenes?: string[]
  imagenes_files?: File[]
  activo?: boolean
}

export interface ServiceData {
  team: number
  nombre: string
  descripcion?: string
  precio: number
  duracion?: number
  activo?: boolean
}

export interface LeadData {
  team: number
  nombre: string
  email?: string
  telefono?: string
  mensaje?: string
  estado?: string
}

export interface TaskData {
  team: number
  titulo: string
  descripcion?: string
  estado?: string
  prioridad?: string
  asignado_a?: number
}

export interface ArchivoUploadData {
  team: number
  nombre: string
  archivo: File
  descripcion?: string
  tipo_archivo?: "documento" | "imagen" | "video" | "audio" | "otro"
}

export interface ArchivoUpdateData {
  nombre?: string
  descripcion?: string
  activo?: boolean
}

export interface BuscarArchivosParams {
  q?: string
  tipo?: string
  team_id?: number
}

export interface Archivo {
  id: string
  team: number
  nombre: string
  descripcion: string
  archivo: string
  tipo_archivo: string
  tamano: number
  hash_sha256: string
  subido_por: number
  activo: boolean
  fecha_creacion: string
  fecha_modificacion: string
}

export interface AccesoArchivo {
  id: string
  archivo: string
  usuario: number
  tipo_acceso: "visualizacion" | "descarga" | "modificacion" | "eliminacion"
  fecha_acceso: string
  ip_address: string
  user_agent: string
}