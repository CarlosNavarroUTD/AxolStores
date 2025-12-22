import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Store, ArrowRight, Package, Wrench, Users, BarChart } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Store className="h-6 w-6" />
            <span className="text-xl font-bold">StoreSystem</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Iniciar sesión</Button>
            </Link>
            <Link href="/register">
              <Button>Comenzar gratis</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-balance">
          Gestiona múltiples tiendas
          <br />
          <span className="text-muted-foreground">desde un solo lugar</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground text-pretty">
          Sistema completo para administrar productos, servicios, leads y más. Crea tiendas públicas con su propio
          dominio y gestiona todo tu negocio.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link href="/register">
            <Button size="lg" className="gap-2">
              Empezar ahora <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/tienda/demo">
            <Button size="lg" variant="outline">
              Ver demo
            </Button>
          </Link>
        </div>
      </section>

      {/* Características */}
      <section className="border-t bg-muted/30 py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-3xl font-bold">Todo lo que necesitas</h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-muted-foreground">
            Herramientas completas para gestionar tu negocio de manera eficiente
          </p>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Package,
                title: "Productos",
                description: "Gestiona tu inventario, precios y stock de manera sencilla",
              },
              {
                icon: Wrench,
                title: "Servicios",
                description: "Ofrece servicios con precios y duraciones personalizadas",
              },
              {
                icon: Users,
                title: "Leads",
                description: "Captura y gestiona leads desde tu tienda pública",
              },
              {
                icon: BarChart,
                title: "Analíticas",
                description: "Visualiza el rendimiento de tu negocio en tiempo real",
              },
            ].map((feature) => (
              <div key={feature.title} className="rounded-lg border bg-card p-6">
                <feature.icon className="h-10 w-10 text-primary" />
                <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2025 StoreSystem. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  )
}
