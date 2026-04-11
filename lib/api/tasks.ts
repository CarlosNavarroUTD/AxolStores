import { fetchWithAuth } from "./client"
import type { TaskData } from "./types"

export const tasksApi = {
  getAll: (teamId: number) => fetchWithAuth(`/tasks/?team=${teamId}`),
  get: (id: number) => fetchWithAuth(`/tasks/${id}/`),
  create: (data: TaskData) => fetchWithAuth("/tasks/", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: Partial<TaskData>) =>
    fetchWithAuth(`/tasks/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: number) => fetchWithAuth(`/tasks/${id}/`, { method: "DELETE" }),
}