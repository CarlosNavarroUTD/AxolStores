import { Layers, Settings, Share2, Rocket } from "lucide-react"

const steps = [
  {
    icon: Layers,
    number: "01",
    title: "Crea tu Team",
    description:
      "Registra tu negocio, invita a tu equipo y configura tu espacio de trabajo en minutos.",
  },
  {
    icon: Settings,
    number: "02",
    title: "Configura tu sistema",
    description:
      "Agrega productos, servicios, flujos de chat y automatizaciones con nuestro editor visual.",
  },
  {
    icon: Share2,
    number: "03",
    title: "Comparte tu enlace",
    description:
      "Tu tienda y chat quedan listos para compartir por redes sociales, WhatsApp o donde prefieras.",
  },
  {
    icon: Rocket,
    number: "04",
    title: "El sistema vende por ti",
    description:
      "AxolStores atiende, organiza y convierte clientes mientras tu equipo se enfoca en crecer.",
  },
]

export function ComoFunciona() {
  return (
    <section id="como-funciona" className="relative border-t border-border/50">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
            <Rocket className="h-3.5 w-3.5" />
            <span>Proceso simple</span>
          </div>

          <h2 className="mt-6 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
            Empieza en minutos
          </h2>

          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
            Sin configuraciones complejas. Sin curva de aprendizaje. Solo conecta y comienza a vender.
          </p>
        </div>

        <div className="relative mt-16">
          {/* Connector line */}
          <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-border/50 lg:block" />

          <div className="grid gap-6 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div key={step.title} className="relative flex flex-col items-center text-center">
                {/* Connector dot */}
                <div className="relative z-10 mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-card shadow-lg shadow-primary/5">
                  <step.icon className="h-6 w-6 text-primary" />
                </div>

                {/* Step number */}
                <span className="text-xs font-bold uppercase tracking-widest text-primary">
                  Paso {step.number}
                </span>

                <h3 className="mt-2 text-base font-semibold text-foreground">
                  {step.title}
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>

                {/* Arrow for desktop */}
                {index < steps.length - 1 && (
                  <div className="absolute -right-3 top-7 hidden text-muted-foreground/30 lg:block">
                    <svg
                      width="24"
                      height="24"
                      fill="none"
                      viewBox="0 0 24 24"
                      className="text-border"
                    >
                      <path
                        d="M5 12h14M13 6l6 6-6 6"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
