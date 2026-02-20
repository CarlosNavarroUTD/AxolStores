import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CtaFinal() {
  return (
    <section className="relative border-t border-border/50">
      {/* Gradient shadow — bottom to top, coral/orange */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[420px]"
        style={{
          background:
            "linear-gradient(to top, oklch(0.62 0.195 28 / 18%) 0%, oklch(0.62 0.195 28 / 8%) 40%, transparent 100%)",
        }}
      />

      {/* Soft radial bloom at the very bottom center for depth */}
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 h-[300px] w-[700px] -translate-x-1/2"
        style={{
          background:
            "radial-gradient(ellipse at bottom center, oklch(0.62 0.195 28 / 22%) 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 py-24">
        <div className="flex flex-col items-center text-center">
          <h2 className="max-w-lg font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl text-balance">
            Es momento de vender con sistema
          </h2>

          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
            Centraliza tu negocio, automatiza tu equipo y convierte mas
            clientes. Empieza hoy sin costo.
          </p>

          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row">
            <Link href="/register">
              <Button
                size="lg"
                className="h-12 gap-2.5 rounded-xl bg-primary px-8 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30"
              >
                Crear mi Team ahora
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            {"Sin tarjeta de credito. Cancela cuando quieras."}
          </p>
        </div>
      </div>
    </section>
  )
}