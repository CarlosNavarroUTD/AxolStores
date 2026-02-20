import Link from "next/link"
import { Store } from "lucide-react"

interface Team {
  id: number
  name: string
  slug: string
}

interface StoreFooterProps {
  team: Team
}

export function StoreFooter({ team }: StoreFooterProps) {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Logo y descripción */}
          <div>
            <Link href={`/tienda/${team.slug}`} className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Store className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">{team.name}</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Tu tienda de confianza para productos y servicios de calidad.
            </p>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h3 className="font-semibold mb-4">Enlaces rápidos</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#productos" className="text-muted-foreground hover:text-foreground transition-colors">
                  Productos
                </a>
              </li>
              <li>
                <a href="#servicios" className="text-muted-foreground hover:text-foreground transition-colors">
                  Servicios
                </a>
              </li>
              <li>
                <a href="#contacto" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contacto
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Términos y condiciones
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Política de privacidad
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          © {currentYear} {team.name}. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  )
}
