import Link from "next/link"
import { Store } from "lucide-react"

const footerLinks = {
  Producto: [
    { label: "Funciones", href: "#modulos" },
    { label: "Precios", href: "#planes" },
    { label: "Como funciona", href: "#como-funciona" },
  ],
  Empresa: [
    { label: "Acerca de", href: "https://axolmarketing.com" },
    { label: "Blog", href: "#" },
    { label: "Contacto", href: "#" },
  ],
  Legal: [
    { label: "Privacidad", href: "/privacidad" },
    { label: "Terminos", href: "/terminos" },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-border/50">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <Store className="h-5 w-5 text-primary" />
              </div>
              <span className="text-lg font-bold font-display tracking-tight text-foreground">
                AxolStores
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              La plataforma todo-en-uno que ayuda a negocios a vender mas,
              automatizar procesos y crecer sin complicaciones.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-foreground">{category}</h4>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/50 pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            {"© 2026 AxolStores. Todos los derechos reservados."}
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/terminos"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Twitter
            </Link>
            <Link
              href="#"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              LinkedIn
            </Link>
            <Link
              href="#"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Instagram
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
