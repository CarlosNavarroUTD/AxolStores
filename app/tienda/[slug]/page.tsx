import { Suspense } from "react"
import { notFound } from "next/navigation"
import { StoreHeader } from "@/components/store/store-header"
import { ProductsSection } from "@/components/store/products-section"
import { ServicesSection } from "@/components/store/services-section"
import { ContactSection } from "@/components/store/contact-section"
import { StoreFooter } from "@/components/store/store-footer"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

async function getTeam(slug: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/teams/?slug=${slug}`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.results?.[0] || data[0] || null
  } catch {
    return null
  }
}

async function getProducts(teamSlug: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/productos/public/?team_slug=${teamSlug}`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

async function getServices(teamSlug: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/servicios/public/?team_slug=${teamSlug}`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function StorePage({ params }: PageProps) {
  const { slug } = await params
  const team = await getTeam(slug)

  if (!team) {
    notFound()
  }

  const [products, services] = await Promise.all([getProducts(slug), getServices(slug)])

  return (
    <div className="min-h-screen bg-background">
      <StoreHeader team={team} />

      <main>
        {/* Hero */}
        <section className="bg-muted/30 py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl text-balance">{team.name}</h1>
            {team.description && (
              <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground text-pretty">{team.description}</p>
            )}
          </div>
        </section>

        {/* Productos */}
        {products.length > 0 && (
          <Suspense fallback={<div className="py-16 text-center">Cargando productos...</div>}>
            <ProductsSection products={products} />
          </Suspense>
        )}

        {/* Servicios */}
        {services.length > 0 && (
          <Suspense fallback={<div className="py-16 text-center">Cargando servicios...</div>}>
            <ServicesSection services={services} />
          </Suspense>
        )}

        {/* Contacto */}
        <ContactSection teamId={team.id} teamSlug={slug} />
      </main>

      <StoreFooter team={team} />
    </div>
  )
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const team = await getTeam(slug)

  if (!team) {
    return {
      title: "Tienda no encontrada",
    }
  }

  return {
    title: `${team.name} | Tienda`,
    description: team.description || `Visita la tienda de ${team.name}`,
  }
}
