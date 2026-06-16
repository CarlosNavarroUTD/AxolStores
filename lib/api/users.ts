import { fetchWithAuth } from "./client"

export const usersApi = {
  getAll: async () => {
    return fetchWithAuth("/users/")
  },
  update: async (id_usuario: number, data: any) => {
    return fetchWithAuth(`/users/${id_usuario}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  },
}
