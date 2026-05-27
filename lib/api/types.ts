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
    plataforma?: string
    plataforma_id?: string
    fuente?: string
    usuario_asignado?: number | null
    asignado_a?: number | null
    notas?: string
    valor_estimado?: number | null
    probabilidad_conversion?: number
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
  
  export interface NotaData {
    team: number
    titulo: string
    contenido?: string
    color?: string
    etiquetas?: string[]
    fijada?: boolean
    activa?: boolean
  }
  
  export interface Nota {
    id: string
    team: number
    titulo: string
    contenido: string
    color: string
    etiquetas: string[]
    fijada: boolean
    activa: boolean
    creado_por: number
    fecha_creacion: string
    fecha_modificacion: string
  }
  
  export interface BuscarNotasParams {
    q?: string
    team_id?: number
    etiqueta?: string
    fijada?: boolean
  }