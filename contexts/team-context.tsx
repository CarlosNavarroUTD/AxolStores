"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import useSWR from "swr"
import { teamsApi } from "@/lib/api"

interface Team {
  id: number
  name: string
  slug: string
  description?: string
  created_at: string
}

interface TeamContextType {
  teams: Team[]
  activeTeam: Team | null
  setActiveTeam: (team: Team) => void
  isLoading: boolean
  error: Error | null
  refreshTeams: () => void
}

const TeamContext = createContext<TeamContextType | undefined>(undefined)

export function TeamProvider({ children }: { children: ReactNode }) {
  const [activeTeam, setActiveTeamState] = useState<Team | null>(null)

  const {
    data: teams = [],
    error,
    isLoading,
    mutate,
  } = useSWR("my-teams", () => teamsApi.getMyTeams(), { revalidateOnFocus: false })

  // Cargar team activo desde localStorage al iniciar
  useEffect(() => {
    if (teams.length > 0 && !activeTeam) {
      const savedTeamId = localStorage.getItem("activeTeamId")
      const savedTeam = savedTeamId ? teams.find((t: Team) => t.id === Number.parseInt(savedTeamId)) : teams[0]
      setActiveTeamState(savedTeam || teams[0])
    }
  }, [teams, activeTeam])

  const setActiveTeam = (team: Team) => {
    setActiveTeamState(team)
    localStorage.setItem("activeTeamId", team.id.toString())
  }

  return (
    <TeamContext.Provider
      value={{
        teams,
        activeTeam,
        setActiveTeam,
        isLoading,
        error,
        refreshTeams: mutate,
      }}
    >
      {children}
    </TeamContext.Provider>
  )
}

export function useTeam() {
  const context = useContext(TeamContext)
  if (!context) {
    throw new Error("useTeam must be used within TeamProvider")
  }
  return context
}
