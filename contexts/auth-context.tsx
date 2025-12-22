"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { authApi } from "@/lib/api"

interface User {
  id_usuario: number
  nombre_usuario: string
  email: string
  tipo_usuario: string
  phone?: string
  persona?: {
    id_persona: number
    nombre: string
    apellido: string
  }
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) {
        setUser(null)
        return
      }
      const userData = await authApi.me()
      setUser(userData)
    } catch {
      setUser(null)
      localStorage.removeItem("access_token")
      localStorage.removeItem("refresh_token")
    }
  }

  useEffect(() => {
    const initAuth = async () => {
      await refreshUser()
      setIsLoading(false)
    }
    initAuth()
  }, [])

  const login = async (email: string, password: string) => {
    const { access, refresh } = await authApi.login(email, password)
    localStorage.setItem("access_token", access)
    localStorage.setItem("refresh_token", refresh)
    await refreshUser()
    router.push("/dashboard")
  }

  const logout = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    localStorage.removeItem("activeTeamId")
    setUser(null)
    router.push("/login")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
