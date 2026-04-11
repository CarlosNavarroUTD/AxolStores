// /lib/api/index.ts

export { authApi } from "./auth"
export { teamsApi } from "./teams"
export { productsApi } from "./products"
export { servicesApi } from "./services"
export { leadsApi } from "./leads"
export { tasksApi } from "./tasks"
export { archivosApi, accesosApi } from "./archivos"
export { notasApi } from "./notas"

// Re-exporta tipos
export type {
  ProductData,
  ServiceData,
  LeadData,
  TaskData,
  ArchivoUploadData,
  ArchivoUpdateData,
  BuscarArchivosParams,
  Archivo,
  AccesoArchivo,
  NotaData,
  Nota,
  BuscarNotasParams,
} from "./types"