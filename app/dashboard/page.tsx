"use client"

import { useEffect, useState, useRef } from "react"
import { useTeam } from "@/contexts/team-context"
import { useAuth } from "@/contexts/auth-context"
import { teamsApi } from "@/lib/api"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Package, Wrench, Users, ClipboardList, TrendingUp, Pencil, Check, X, FileText, ExternalLink } from "lucide-react"
import Link from "next/link"

interface DashboardStats {
  productos: number
  servicios: number
  miembros: number
  archivos: number
}

export default function DashboardPage() {
  const { activeTeam, isLoading, refreshTeams, setActiveTeam } = useTeam()
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    productos: 0,
    servicios: 0,
    miembros: 0,
    archivos: 0,
  })
  const [loadingStats, setLoadingStats] = useState(true)

  // Inline edit state
  const [editingName, setEditingName] = useState(false)
  const [editingSlug, setEditingSlug] = useState(false)
  const [nameValue, setNameValue] = useState("")
  const [slugValue, setSlugValue] = useState("")
  const [saving, setSaving] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)
  const slugInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (activeTeam) {
      setNameValue(activeTeam.name)
      setSlugValue(activeTeam.slug)
    }
  }, [activeTeam])

  useEffect(() => {
    if (editingName && nameInputRef.current) {
      nameInputRef.current.focus()
      nameInputRef.current.select()
    }
  }, [editingName])

  useEffect(() => {
    if (editingSlug && slugInputRef.current) {
      slugInputRef.current.focus()
      slugInputRef.current.select()
    }
  }, [editingSlug])

  useEffect(() => {
    async function fetchStats() {
      if (!activeTeam?.slug) return

      setLoadingStats(true)
      try {
        const token = localStorage.getItem("access_token")
        const headers: HeadersInit = {
          "Content-Type": "application/json",
        }
        if (token) {
          headers["Authorization"] = `Bearer ${token}`
        }

        const apiBase = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/, "")

        // Fetch productos, servicios, miembros y archivos en paralelo
        const fetches: Promise<Response>[] = [
          fetch(`${apiBase}/api/productos/publico/${activeTeam.slug}/`, { headers }),
          fetch(`${apiBase}/api/servicios/publico/${activeTeam.slug}/`, { headers }),
        ]

        // Members (authenticated)
        if (activeTeam.id) {
          fetches.push(
            fetch(`${apiBase}/api/teams/${activeTeam.id}/members/`, { headers })
          )
        }

        // Archivos (authenticated)
        fetches.push(
          fetch(`${apiBase}/api/archivos/?team_id=${activeTeam.id}`, { headers })
        )

        const [productosRes, serviciosRes, membersRes, archivosRes] = await Promise.all(fetches)

        const productosData = productosRes.ok ? await productosRes.json() : null
        const serviciosData = serviciosRes.ok ? await serviciosRes.json() : null
        const membersData = membersRes?.ok ? await membersRes.json() : null
        const archivosData = archivosRes?.ok ? await archivosRes.json() : null

        // Members can be an array directly
        const membersCount = Array.isArray(membersData) ? membersData.length : 0

        // Archivos can be paginated or array
        let archivosCount = 0
        if (archivosData) {
          if (Array.isArray(archivosData)) {
            archivosCount = archivosData.length
          } else if (archivosData.results) {
            archivosCount = archivosData.count || archivosData.results.length
          }
        }

        setStats({
          productos: productosData?.productos?.length || 0,
          servicios: serviciosData?.servicios?.length || 0,
          miembros: membersCount,
          archivos: archivosCount,
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoadingStats(false)
      }
    }

    fetchStats()
  }, [activeTeam?.slug, activeTeam?.id])

  const handleSaveName = async () => {
    if (!activeTeam || !nameValue.trim() || nameValue === activeTeam.name) {
      setEditingName(false)
      setNameValue(activeTeam?.name || "")
      setEditError(null)
      return
    }

    setSaving(true)
    setEditError(null)
    try {
      const updated = await teamsApi.updateTeam(activeTeam.id, { name: nameValue.trim() })
      setActiveTeam({ ...activeTeam, name: updated.name })
      refreshTeams()
      setEditingName(false)
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Error al actualizar el nombre"
      setEditError(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleSaveSlug = async () => {
    if (!activeTeam || !slugValue.trim() || slugValue === activeTeam.slug) {
      setEditingSlug(false)
      setSlugValue(activeTeam?.slug || "")
      setEditError(null)
      return
    }

    setSaving(true)
    setEditError(null)
    try {
      const updated = await teamsApi.updateTeam(activeTeam.id, { slug: slugValue.trim() })
      setActiveTeam({ ...activeTeam, slug: updated.slug })
      refreshTeams()
      setEditingSlug(false)
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Error al actualizar el slug"
      // Show friendly messages for common errors
      if (msg.includes("already exists") || msg.includes("ya existe") || msg.includes("unique")) {
        setEditError("Este slug ya está en uso, elige otro.")
      } else if (msg.includes("Sesión expirada")) {
        setEditError("Tu sesión expiró. Inicia sesión nuevamente.")
      } else {
        setEditError(msg)
      }
    } finally {
      setSaving(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, saveHandler: () => void, cancelHandler: () => void) => {
    if (e.key === "Enter") {
      saveHandler()
    } else if (e.key === "Escape") {
      setEditError(null)
      cancelHandler()
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!activeTeam) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Bienvenido</h2>
          <p className="text-muted-foreground mt-2">
            Crea tu primera tienda para comenzar a gestionar productos y servicios
          </p>
        </div>
      </div>
    )
  }

  const statsCards = [
    {
      name: "Productos",
      value: loadingStats ? "..." : stats.productos.toString(),
      icon: Package,
      href: "/dashboard/productos",
      feature: "productos",
    },
    {
      name: "Servicios",
      value: loadingStats ? "..." : stats.servicios.toString(),
      icon: Wrench,
      href: "/dashboard/servicios",
      feature: "servicios",
    },
    {
      name: "Miembros",
      value: loadingStats ? "..." : stats.miembros.toString(),
      icon: Users,
      href: "/dashboard/equipo",
      feature: "equipo",
    },
    {
      name: "Archivos",
      value: loadingStats ? "..." : stats.archivos.toString(),
      icon: FileText,
      href: "/dashboard/archivos",
      feature: "archivos",
    },
  ].filter((card) => {
    if (user?.is_staff) return true
    // Always show miembros and archivos
    if (card.feature === "equipo" || card.feature === "archivos") return true
    return user?.features_config?.[card.feature] === true
  })

  return (
    <div className="flex flex-col">


      <div className="flex-1 space-y-6 p-4 lg:p-6">
        {/* Estadísticas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsCards.map((stat) => (
            <Link key={stat.name} href={stat.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.name}
                  </CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  {!loadingStats && parseInt(stat.value) > 0 && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <TrendingUp className="h-3 w-3" />
                      Activos en tu tienda
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Info de la tienda */}
        <Card>
          <CardHeader>
            <CardTitle>Información de la tienda</CardTitle>
            <CardDescription>Detalles de {activeTeam.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              {/* Nombre - editable */}
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Nombre</p>
                {editingName ? (
                  <div className="flex items-center gap-1">
                    <Input
                      ref={nameInputRef}
                      value={nameValue}
                      onChange={(e) => setNameValue(e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, handleSaveName, () => {
                        setEditingName(false)
                        setNameValue(activeTeam.name)
                      })}
                      disabled={saving}
                      className="h-8 text-base"
                    />
                    <button
                      onClick={handleSaveName}
                      disabled={saving}
                      className="p-1.5 rounded-md hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 transition-colors"
                      title="Guardar"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingName(false)
                        setNameValue(activeTeam.name)
                        setEditError(null)
                      }}
                      disabled={saving}
                      className="p-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-colors"
                      title="Cancelar"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 group">
                    <p className="text-lg">{activeTeam.name}</p>
                    <button
                      onClick={() => setEditingName(true)}
                      className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-muted transition-all"
                      title="Editar nombre"
                    >
                      <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  </div>
                )}
                {editingName && editError && (
                  <p className="text-sm text-red-500 mt-1">{editError}</p>
                )}
              </div>

              {/* Slug - editable */}
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Slug</p>
                {editingSlug ? (
                  <div className="flex items-center gap-1">
                    <Input
                      ref={slugInputRef}
                      value={slugValue}
                      onChange={(e) => setSlugValue(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ""))}
                      onKeyDown={(e) => handleKeyDown(e, handleSaveSlug, () => {
                        setEditingSlug(false)
                        setSlugValue(activeTeam.slug)
                      })}
                      disabled={saving}
                      className="h-8 text-base font-mono"
                    />
                    <button
                      onClick={handleSaveSlug}
                      disabled={saving}
                      className="p-1.5 rounded-md hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 transition-colors"
                      title="Guardar"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingSlug(false)
                        setSlugValue(activeTeam.slug)
                        setEditError(null)
                      }}
                      disabled={saving}
                      className="p-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-colors"
                      title="Cancelar"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 group">
                    <p className="text-lg font-mono">{activeTeam.slug}</p>
                    <button
                      onClick={() => setEditingSlug(true)}
                      className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-muted transition-all"
                      title="Editar slug"
                    >
                      <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  </div>
                )}
                {editingSlug && editError && (
                  <p className="text-sm text-red-500 mt-1">{editError}</p>
                )}
              </div>

              {/* URL pública - se actualiza dinámicamente */}
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">URL pública</p>
                <Link
                  href={`/tienda/${editingSlug ? slugValue : activeTeam.slug}`}
                  target="_blank"
                  className="text-lg text-primary hover:underline inline-flex items-center gap-1.5"
                >
                  /tienda/{editingSlug ? slugValue : activeTeam.slug}
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
            {activeTeam.description && (
              <div className="mt-4">
                <p className="text-sm font-medium text-muted-foreground">Descripción</p>
                <p className="text-sm mt-1">{activeTeam.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resumen rápido */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Equipo
              </CardTitle>
              <CardDescription>Miembros de {activeTeam.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {loadingStats ? "..." : stats.miembros}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {loadingStats ? "" : stats.miembros === 1 ? "miembro en el equipo" : "miembros en el equipo"}
              </p>
              <Link
                href="/dashboard/equipo"
                className="text-sm text-primary hover:underline mt-3 inline-block"
              >
                Gestionar equipo →
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Archivos
              </CardTitle>
              <CardDescription>Archivos subidos al equipo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {loadingStats ? "..." : stats.archivos}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {loadingStats ? "" : stats.archivos === 1 ? "archivo almacenado" : "archivos almacenados"}
              </p>
              <Link
                href="/dashboard/archivos"
                className="text-sm text-primary hover:underline mt-3 inline-block"
              >
                Ver archivos →
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}