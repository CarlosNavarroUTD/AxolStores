"use client"

import { useEffect, useState } from "react"
import { useTeam } from "@/contexts/team-context"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Wrench, Users, ClipboardList, TrendingUp, DollarSign } from "lucide-react"
import Link from "next/link"

interface DashboardStats {
  productos: number
  servicios: number
  leads: number
  tareas: number
}

export default function DashboardPage() {
  const { activeTeam, isLoading } = useTeam()
  const [stats, setStats] = useState<DashboardStats>({
    productos: 0,
    servicios: 0,
    leads: 0,
    tareas: 0,
  })
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      if (!activeTeam?.slug) return

      setLoadingStats(true)
      try {
        const token = localStorage.getItem("token")
        const headers: HeadersInit = {
          "Content-Type": "application/json",
        }
        if (token) {
          headers["Authorization"] = `Token ${token}`
        }

        // Fetch productos y servicios en paralelo usando endpoints públicos
        const [productosRes, serviciosRes] = await Promise.all([
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/productos/publico/${activeTeam.slug}/`,
            { headers }
          ),
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/servicios/publico/${activeTeam.slug}/`,
            { headers }
          ),
        ])

        // Los endpoints públicos devuelven: {team_slug, total, productos: [...]}
        const productosData = productosRes.ok ? await productosRes.json() : null
        const serviciosData = serviciosRes.ok ? await serviciosRes.json() : null

        setStats({
          productos: productosData?.productos?.length || 0,
          servicios: serviciosData?.servicios?.length || 0,
          leads: 0, // Por ahora mantener en 0 hasta tener el endpoint
          tareas: 0, // Por ahora mantener en 0 hasta tener el endpoint
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoadingStats(false)
      }
    }

    fetchStats()
  }, [activeTeam?.slug])

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
    },
    {
      name: "Servicios",
      value: loadingStats ? "..." : stats.servicios.toString(),
      icon: Wrench,
      href: "/dashboard/servicios",
    },
    {
      name: "Leads",
      value: loadingStats ? "..." : stats.leads.toString(),
      icon: Users,
      href: "/dashboard/leads",
    },
    {
      name: "Tareas",
      value: loadingStats ? "..." : stats.tareas.toString(),
      icon: ClipboardList,
      href: "/dashboard/tareas",
    },
  ]

  return (
    <div className="flex flex-col">
      <Header title="Dashboard" />

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

        {/* Resumen de ventas */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Resumen de ventas
              </CardTitle>
              <CardDescription>Ventas del mes actual</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">$12,450</div>
              <p className="text-sm text-muted-foreground mt-1">+18% comparado con el mes anterior</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actividad reciente</CardTitle>
              <CardDescription>Últimas acciones en tu tienda</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { action: "Nuevo lead registrado", time: "Hace 5 min" },
                  { action: "Producto actualizado", time: "Hace 1 hora" },
                  { action: "Servicio creado", time: "Hace 2 horas" },
                ].map((activity, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span>{activity.action}</span>
                    <span className="text-muted-foreground">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info de la tienda */}
        <Card>
          <CardHeader>
            <CardTitle>Información de la tienda</CardTitle>
            <CardDescription>Detalles de {activeTeam.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nombre</p>
                <p className="text-lg">{activeTeam.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Slug</p>
                <p className="text-lg font-mono">{activeTeam.slug}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">URL pública</p>
                <Link
                  href={`/tienda/${activeTeam.slug}`}
                  target="_blank"
                  className="text-lg text-primary hover:underline"
                >
                  /tienda/{activeTeam.slug}
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
      </div>
    </div>
  )
}