import { API_BASE_URL, fetchWithAuth } from "./client"

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

  deleteTeam: (id: number) =>
    fetchWithAuth(`/teams/${id}/`, { method: "DELETE" }),

  getMembers: (id: number) => fetchWithAuth(`/teams/${id}/members/`),

  inviteMember: (teamId: number, data: { email?: string; phone?: string }) =>
    fetchWithAuth(`/teams/${teamId}/invite_member/`, { method: "POST", body: JSON.stringify(data) }),
}