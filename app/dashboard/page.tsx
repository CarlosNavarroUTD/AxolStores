"use client"

import { useTeam } from "@/contexts/team-context"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Wrench, Users, ClipboardList, TrendingUp, DollarSign } from "lucide-react"
import Link from "next/link"

const stats = [
  { name: "Productos", value: "24", icon: Package, href: "/dashboard/productos", change: "+12%" },
  { name: "Servicios", value: "8", icon: Wrench, href: "/dashboard/servicios", change: "+4%" },
  { name: "Leads", value: "156", icon: Users, href: "/dashboard/leads", change: "+23%" },
  { name: "Tareas", value: "12", icon: ClipboardList, href: "/dashboard/tareas", change: "-2%" },
]

export default function DashboardPage() {
  const { activeTeam, isLoading } = useTeam()

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

  return (
    <div className="flex flex-col">
      <Header title="Dashboard" />

      <div className="flex-1 space-y-6 p-4 lg:p-6">
        {/* Estadísticas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Link key={stat.name} href={stat.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.name}</CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3" />
                    {stat.change} desde el mes pasado
                  </p>
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
                <p className="text-lg text-primary">/tienda/{activeTeam.slug}</p>
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
