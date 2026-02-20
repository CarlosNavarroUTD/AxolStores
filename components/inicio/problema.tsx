import { AlertTriangle, MessagesSquare, FileSpreadsheet, Users } from "lucide-react"

const painPoints = [
  {
    icon: MessagesSquare,
    title: "WhatsApp desordenado",
    description:
      "Mensajes perdidos, conversaciones sin seguimiento y clientes que nunca reciben respuesta.",
  },
  {
    icon: FileSpreadsheet,
    title: "Formularios sin tracking",
    description:
      "Leads que llegan pero nadie sabe de donde vinieron ni en que etapa estan.",
  },
  {
    icon: Users,
    title: "Equipo sin claridad",
    description:
      "Tareas sin asignar, procesos duplicados y cero visibilidad sobre que pasa con cada cliente.",
  },
]

export function Problema() {
  return (
    <section className="relative border-t border-border/50">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-destructive/20 bg-destructive/5 px-4 py-1.5 text-sm text-destructive">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>El problema</span>
          </div>

          <h2 className="mt-6 max-w-xl font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
            Demasiadas herramientas. Pocas ventas.
          </h2>

          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Tu negocio no necesita mas apps. Necesita un sistema que conecte
            todo y te deje enfocarte en lo que importa: vender.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {painPoints.map((point) => (
            <div
              key={point.title}
              className="group relative rounded-2xl border border-border/50 bg-card p-6 transition-all hover:border-border hover:bg-card/80"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-destructive/10">
                <point.icon className="h-5 w-5 text-destructive" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-foreground">
                {point.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {point.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
