import { fetchWithAuth } from "./client"

// ==================== TIPOS ====================

export type TipoArchivo = "imagen" | "video" | "audio" | "documento" | "contrato" | "otro"

export type TipoAcceso = "visualizacion" | "descarga" | "modificacion" | "eliminacion"

export interface Archivo {
  id: string
  team: string
  nombre: string
  descripcion: string
  archivo_url: string
  archivo_key: string
  tipo_archivo: TipoArchivo
  tamano: number
  hash_sha256: string
  subido_por: string
  subido_por_info: {
    id: string
    email: string
    nombre: string
  }
  fecha_subida: string
  fecha_modificacion: string
  es_privado: boolean
  requiere_autenticacion: boolean
}

export interface ArchivoList {
  id: string
  nombre: string
  tipo_archivo: TipoArchivo
  tamano: number
  fecha_subida: string
  subido_por_nombre: string
  es_privado: boolean
  archivo_url: string
}

export interface AccesoArchivo {
  id: string
  archivo: string
  archivo_nombre: string
  usuario: string
  usuario_email: string
  tipo_acceso: TipoAcceso
  ip_address: string
  user_agent: string
  fecha_acceso: string
}

export interface EstadisticasArchivos {
  total_archivos: number
  total_tamano_bytes: number
  total_tamano_mb: number
  por_tipo: Record<TipoArchivo, number>
  archivos_subidos_por_usuario: number
}

export interface EstadisticasAccesos {
  total_accesos: number
  por_tipo: Record<TipoAcceso, number>
  archivos_mas_accedidos: Array<{
    archivo__nombre: string
    total: number
  }>
}

export interface SignedUrlResponse {
  uploadUrl: string
  publicUrl: string
  key: string
}

export interface VerificarIntegridadResponse {
  es_integro: boolean
  hash_original: string
  hash_actual: string
  fecha_verificacion: string
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

// ==================== FUNCIONES HELPER ====================

type UploadOptions = {
  file: File
  folder?: string
}

type UploadResponse = {
  url: string
  key: string
}

/**
 * Sube un archivo directamente a R2 usando signed URLs
 */
export async function uploadFileToR2({
  file,
  folder = "general",
}: UploadOptions): Promise<UploadResponse> {
  // 1. Pedir signed URL al backend autenticado
  
  const response = await fetchWithAuth("/archivos/signed-url/", {
    method: "POST",
    body: JSON.stringify({
      file_name: file.name,
      file_type: file.type,
      folder,
    }),
  })

  const { uploadUrl, publicUrl, key } = response as SignedUrlResponse
  console.log("UPLOAD URL:", uploadUrl)

  // 2. Subir directo a R2
  const upload = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
    },
    body: file,
  })
  console.log("UPLOAD STATUS:", upload.status)
  console.log("UPLOAD TEXT:", await upload.text())

  if (!upload.ok) {
    throw new Error("Error al subir archivo a R2")
  }

  return { url: publicUrl, key }
}

// ==================== API ARCHIVOS ====================

export const archivosApi = {
  /**
   * Obtener lista de archivos
   */
  async getAll(teamId?: string): Promise<ArchivoList[]> {
    const params = new URLSearchParams()
    if (teamId) params.append("team_id", teamId)
    
    const url = `/archivos/${params.toString() ? `?${params}` : ""}`
    const response = await fetchWithAuth(url)
    
    // Puede venir paginado o no
    if (response.results) {
      return response.results
    }
    return response
  },

  /**
   * Obtener un archivo por ID
   */
  async getById(id: string): Promise<Archivo> {
    return await fetchWithAuth(`/archivos/${id}/`)
  },

  /**
   * Subir archivo usando el método tradicional (multipart/form-data)
   * @deprecated Usar uploadWithSignedUrl en su lugar
   */
  async upload(data: {
    team: string
    nombre: string
    archivo: File
    descripcion?: string
    tipo_archivo: TipoArchivo
    es_privado?: boolean
    requiere_autenticacion?: boolean
  }): Promise<Archivo> {
    const formData = new FormData()
    formData.append("team", data.team)
    formData.append("nombre", data.nombre)
    formData.append("archivo", data.archivo)
    formData.append("tipo_archivo", data.tipo_archivo)
    
    if (data.descripcion) {
      formData.append("descripcion", data.descripcion)
    }
    if (data.es_privado !== undefined) {
      formData.append("es_privado", String(data.es_privado))
    }
    if (data.requiere_autenticacion !== undefined) {
      formData.append("requiere_autenticacion", String(data.requiere_autenticacion))
    }

    return await fetchWithAuth("/archivos/", {
      method: "POST",
      body: formData,
      // No establecer Content-Type, fetch lo hace automáticamente con boundary
      headers: undefined,
    })
  },

  /**
   * Subir archivo usando signed URLs (recomendado)
   * Este método sube directamente a R2 y luego crea el registro
   */
async uploadWithSignedUrl(data: {
  team: string
  nombre: string
  archivo: File
  descripcion?: string
  tipo_archivo: TipoArchivo
  es_privado?: boolean
  requiere_autenticacion?: boolean
  folder?: string
}): Promise<Archivo> {

  // 1. Subir archivo a R2
  const { key } = await uploadFileToR2({
    file: data.archivo,
    folder: data.folder || "archivos",
  })

  // 2. Tamaño
  const tamano = data.archivo.size

  // 3. URL correcta (SIEMPRE con https)
const archivo_url = `https://r2.eabmodel.com/${key.split("/").map(encodeURIComponent).join("/")}`

  // 4. Crear registro en backend
  return await fetchWithAuth("/archivos/", {
    method: "POST",
    body: JSON.stringify({
      team: data.team,
      nombre: data.nombre,
      descripcion: data.descripcion || "",
      tipo_archivo: data.tipo_archivo,
      es_privado: data.es_privado || false,
      requiere_autenticacion: data.requiere_autenticacion !== false,
      archivo_url,
      archivo_key: key,
      tamano,
    }),
  })
},

  /**
   * Actualizar archivo
   */
  async update(
    id: string,
    data: Partial<{
      nombre: string
      descripcion: string
      es_privado: boolean
      requiere_autenticacion: boolean
    }>
  ): Promise<Archivo> {
    return await fetchWithAuth(`/archivos/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  },

  /**
   * Eliminar archivo
   */
  async delete(id: string): Promise<void> {
    await fetchWithAuth(`/archivos/${id}/`, {
      method: "DELETE",
    })
  },

  /**
   * Descargar archivo (registra el acceso)
   */
  async descargar(id: string): Promise<{
    url: string
    nombre: string
    tamano: number
  }> {
    return await fetchWithAuth(`/archivos/${id}/descargar/`, {
      method: "POST",
    })
  },

  /**
   * Obtener historial de accesos de un archivo
   */
  async historial(id: string): Promise<AccesoArchivo[]> {
    return await fetchWithAuth(`/archivos/${id}/historial/`)
  },

  /**
   * Buscar archivos
   */
  async buscar(params: {
    q?: string
    tipo?: TipoArchivo
    team_id?: string
  }): Promise<ArchivoList[]> {
    const searchParams = new URLSearchParams()
    if (params.q) searchParams.append("q", params.q)
    if (params.tipo) searchParams.append("tipo", params.tipo)
    if (params.team_id) searchParams.append("team_id", params.team_id)

    return await fetchWithAuth(`/archivos/buscar/?${searchParams}`)
  },

  /**
   * Verificar integridad del archivo mediante hash
   */
  async verificarIntegridad(id: string): Promise<VerificarIntegridadResponse> {
    return await fetchWithAuth(`/archivos/${id}/verificar_integridad/`, {
      method: "POST",
    })
  },

  /**
   * Subir imagen simplificado
   */
  async subirImagen(data: {
    team: string
    imagen: File
    nombre?: string
    descripcion?: string
  }): Promise<{
    id: string
    url: string
    nombre: string
    tamano: number
  }> {
    const formData = new FormData()
    formData.append("team", data.team)
    formData.append("imagen", data.imagen)
    if (data.nombre) formData.append("nombre", data.nombre)
    if (data.descripcion) formData.append("descripcion", data.descripcion)

    return await fetchWithAuth("/archivos/subir-imagen/", {
      method: "POST",
      body: formData,
      headers: undefined,
    })
  },

  /**
   * Obtener estadísticas de archivos
   */
  async estadisticas(): Promise<EstadisticasArchivos> {
    return await fetchWithAuth("/archivos/estadisticas/")
  },
}

// ==================== API ACCESOS ====================

export const accesosApi = {
  /**
   * Obtener todos los accesos (filtrados por equipos del usuario)
   */
  async getAll(): Promise<AccesoArchivo[]> {
    const response = await fetchWithAuth("/archivos/accesos/")
    if (response.results) {
      return response.results
    }
    return response
  },

  /**
   * Obtener accesos del usuario actual
   */
  async misAccesos(): Promise<AccesoArchivo[]> {
    return await fetchWithAuth("/archivos/accesos/mis_accesos/")
  },

  /**
   * Obtener accesos de un archivo específico
   */
  async porArchivo(archivoId: string): Promise<AccesoArchivo[]> {
    return await fetchWithAuth(
      `/archivos/accesos/por_archivo/?archivo_id=${archivoId}`
    )
  },

  /**
   * Obtener estadísticas de accesos
   */
  async estadisticas(): Promise<EstadisticasAccesos> {
    return await fetchWithAuth("/archivos/accesos/estadisticas/")
  },
}

// ==================== UTILIDADES ====================

/**
 * Formatea el tamaño de un archivo en bytes a una representación legible
 */
export function formatearTamano(bytes: number): string {
  if (bytes === 0) return "0 B"
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

/**
 * Obtiene el tipo de archivo basado en el MIME type
 */
export function detectarTipoArchivo(mimeType: string): TipoArchivo {
  if (mimeType.startsWith("image/")) return "imagen"
  if (mimeType.startsWith("video/")) return "video"
  if (mimeType.startsWith("audio/")) return "audio"
  if (
    mimeType.includes("pdf") ||
    mimeType.includes("word") ||
    mimeType.includes("text") ||
    mimeType.includes("document") ||
    mimeType.includes("sheet") ||
    mimeType.includes("presentation")
  ) {
    return "documento"
  }
  return "otro"
}

/**
 * Valida el tamaño del archivo
 */
export function validarTamanoArchivo(
  file: File,
  maxSizeMB: number = 50
): { valido: boolean; mensaje?: string } {
  const maxBytes = maxSizeMB * 1024 * 1024
  if (file.size > maxBytes) {
    return {
      valido: false,
      mensaje: `El archivo no puede superar los ${maxSizeMB}MB`,
    }
  }
  return { valido: true }
}

/**
 * Valida el tipo de archivo
 */
export function validarTipoArchivo(
  file: File,
  tiposPermitidos?: string[]
): { valido: boolean; mensaje?: string } {
  if (!tiposPermitidos || tiposPermitidos.length === 0) {
    return { valido: true }
  }

  const esPermitido = tiposPermitidos.some((tipo) => {
    if (tipo.endsWith("/*")) {
      const categoria = tipo.split("/")[0]
      return file.type.startsWith(`${categoria}/`)
    }
    return file.type === tipo
  })

  if (!esPermitido) {
    return {
      valido: false,
      mensaje: `Tipo de archivo no permitido. Se aceptan: ${tiposPermitidos.join(", ")}`,
    }
  }

  return { valido: true }
}