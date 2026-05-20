export { authApi } from "./auth"
export { teamsApi } from "./teams"
export { productsApi } from "./products"
export { servicesApi } from "./services"
export { leadsApi } from "./leads"
export { tasksApi } from "./tasks"
export { uploadFileToR2 } from "./archivos"
export { notasApi } from "./notas"
export { whatsappApi } from "./whatsapp"
export { googlesheetsApi } from "./googlesheets"
export * from './archivos'

// Re-exporta tipos
export type {
  ProductData,
  ServiceData,
  LeadData,
  TaskData,
  ArchivoUploadData,
  ArchivoUpdateData,
  BuscarArchivosParams,
  NotaData,
  Nota,
  BuscarNotasParams,
} from "./types"