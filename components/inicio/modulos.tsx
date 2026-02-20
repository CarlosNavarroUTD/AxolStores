import {
  Store,
  MessageSquare,
  Users,
  Calendar,
  Bot,
  Zap,
} from "lucide-react"

const features = [
  {
    icon: Store,
    title: "Tienda Inteligente",
    description:
      "Publica productos y servicios con paginas optimizadas para convertir visitantes en clientes.",
    tag: "E-commerce",
  },
  {
    icon: MessageSquare,
    title: "Chat para Vender",
    description:
      "Flujos conversacionales que guian al cliente hasta la compra de forma automatica, 24/7.",
    tag: "Automatizacion",
  },
  {
    icon: Users,
    title: "CRM Automatico",
    description:
      "Cada conversacion y formulario genera contactos organizados con historial completo y etiquetas.",
    tag: "Gestion",
  },
  {
    icon: Calendar,
    title: "Agenda Integrada",
    description:
      "Tus clientes reservan servicios facilmente con confirmaciones y recordatorios automaticos.",
    tag: "Reservas",
  },
  {
    icon: Bot,
    title: "Asistente Empresarial",
    description:
      "Recordatorios, tareas y notificaciones automaticas que mantienen a tu equipo sincronizado.",
    tag: "Productividad",
  },
  {
    icon: Zap,
    title: "Automatizaciones",
    description:
      "Conecta acciones entre modulos: cuando un cliente compra, se crea seguimiento automatico.",
    tag: "Flujos",
  },
]

export function Modulos() {
  return (
    <section id="modulos" className="relative border-t border-border/50">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
            <Zap className="h-3.5 w-3.5" />
            <span>{"Modulos"}</span>
          </div>

          <h2 className="mt-6 max-w-xl font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
            Un sistema completo para vender
          </h2>

          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Cada modulo esta disenado para trabajar en conjunto. No necesitas
            herramientas externas: todo se conecta dentro de AxolStores.
          </p>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative flex flex-col rounded-2xl border border-border/50 bg-card p-6 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/15">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
                  {feature.tag}
                </span>
              </div>

              <h3 className="mt-5 text-base font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>

              <div className="mt-4 h-px w-full bg-border/50 transition-colors group-hover:bg-primary/20" />
              <p className="mt-3 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                {"Explorar modulo →"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
