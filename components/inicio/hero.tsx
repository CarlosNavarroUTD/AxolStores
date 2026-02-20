import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/8 blur-[120px] animate-glow-pulse" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-20 sm:pb-32 sm:pt-28">
        {/* Badge */}
        <div className="flex justify-center animate-fade-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Plataforma todo-en-uno para tu negocio</span>
          </div>
        </div>

        {/* Heading */}
        <h1 className="mx-auto mt-8 max-w-4xl text-center font-display text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-6xl lg:text-7xl animate-fade-up-delay-1">
          <span className="text-balance">
            Vende mas.{" "}
            <span className="text-primary">Automatiza</span> tu negocio.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-relaxed text-muted-foreground animate-fade-up-delay-2">
          AxolStores integra tienda, CRM, chat inteligente y asistente para tu
          equipo en una plataforma moderna. Vende mas sin complicaciones.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row animate-fade-up-delay-3">
          <Link href="/register">
            <Button
              size="lg"
              className="h-12 gap-2.5 rounded-xl bg-primary px-8 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30"
            >
              Comenzar prueba gratis
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="#como-funciona">
            <Button
              size="lg"
              variant="outline"
              className="h-12 rounded-xl border-border/60 px-8 text-base text-foreground hover:bg-secondary"
            >
              Ver como funciona
            </Button>
          </Link>
        </div>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          30 dias gratis. Sin tarjeta de credito.
        </p>

        {/* Stats bar */}
        <div className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border/50 bg-border/50 sm:grid-cols-3">
          {[
            { value: "98%", label: "Satisfaccion" },
            { value: "3x", label: "Mas ventas" },
            { value: "24/7", label: "Automatizado" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center gap-1 bg-background px-6 py-5"
            >
              <span className="text-2xl font-bold font-display text-primary">
                {stat.value}
              </span>
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
