import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle, Crown, ArrowRight } from "lucide-react"

const plans = [
  {
    name: "Starter",
    description: "Para comenzar a vender con sistema",
    price: "Gratis",
    period: "para siempre",
    featured: false,
    features: [
      "1 Team",
      "Tienda publica",
      "CRM basico con 100 contactos",
      "Formularios de captura",
      "Soporte por email",
    ],
    cta: "Comenzar gratis",
  },
  {
    name: "Growth",
    description: "Automatiza y escala tus ventas",
    price: "$29",
    period: "/mes",
    featured: true,
    features: [
      "Todo en Starter",
      "Chat inteligente para ventas",
      "Agenda integrada con recordatorios",
      "CRM ilimitado",
      "Hasta 5 miembros en el Team",
      "Integraciones avanzadas",
    ],
    cta: "Probar 30 dias gratis",
  },
  {
    name: "Business",
    description: "Escala con automatizacion avanzada",
    price: "$79",
    period: "/mes",
    featured: false,
    features: [
      "Todo en Growth",
      "Asistente empresarial IA",
      "Gestion de tareas del equipo",
      "Automatizaciones avanzadas",
      "Miembros ilimitados",
      "Soporte prioritario 24/7",
    ],
    cta: "Probar 30 dias gratis",
  },
]

export function Planes() {
  return (
    <section id="planes" className="relative border-t border-border/50">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
            <Crown className="h-3.5 w-3.5" />
            <span>Precios</span>
          </div>

          <h2 className="mt-6 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
            Planes que crecen contigo
          </h2>

          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
            Empieza gratis y escala cuando estes listo. Sin sorpresas ni costos ocultos.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl border p-8 transition-all ${
                plan.featured
                  ? "border-primary/40 bg-card shadow-xl shadow-primary/10"
                  : "border-border/50 bg-card hover:border-border"
              }`}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-bold text-primary-foreground">
                  Mas popular
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-display text-4xl font-bold text-foreground">
                  {plan.price}
                </span>
                <span className="text-sm text-muted-foreground">{plan.period}</span>
              </div>

              <ul className="mt-8 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <Link href="/register" className="block">
                  <Button
                    className={`w-full gap-2 ${
                      plan.featured
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90"
                        : "bg-secondary text-foreground hover:bg-secondary/80"
                    }`}
                    size="lg"
                  >
                    {plan.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
