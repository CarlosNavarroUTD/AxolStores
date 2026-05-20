import Link from "next/link"
import { FileText, ArrowLeft, Mail, Scale, AlertTriangle, CreditCard, Ban, Globe, RefreshCw, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

const sections = [
  {
    id: "aceptacion",
    icon: CheckCircle,
    title: "Aceptación de los términos",
    content: [
      {
        subtitle: "Acuerdo vinculante",
        text: "Al crear una cuenta, acceder o utilizar AxolStores, aceptas estos Términos de Servicio en su totalidad. Si no estás de acuerdo con alguna parte de estos términos, no debes usar la plataforma.",
      },
      {
        subtitle: "Capacidad legal",
        text: "Debes tener al menos 18 años o la mayoría de edad legal en tu jurisdicción para aceptar estos términos. Si usas AxolStores en nombre de una empresa, declaras que tienes autorización para vincular a dicha empresa.",
      },
      {
        subtitle: "Actualizaciones",
        text: "AxolStores puede actualizar estos términos periódicamente. Te notificaremos de cambios materiales con al menos 30 días de anticipación. El uso continuado de la plataforma después de esa fecha constituye aceptación de los nuevos términos.",
      },
    ],
  },
  {
    id: "descripcion-servicio",
    icon: Globe,
    title: "Descripción del servicio",
    content: [
      {
        subtitle: "Qué es AxolStores",
        text: "AxolStores es una plataforma SaaS (Software como Servicio) que proporciona herramientas de e-commerce, CRM, automatización de chat, agenda y gestión de equipos para negocios. El servicio se presta a través de internet bajo un modelo de suscripción.",
      },
      {
        subtitle: "Disponibilidad",
        text: "Nos comprometemos a mantener una disponibilidad del 99.5% mensual (excluyendo mantenimientos programados). En caso de incumplimiento, ofrecemos créditos de servicio proporcionales según nuestra política de SLA disponible en el Centro de Ayuda.",
      },
      {
        subtitle: "Modificaciones al servicio",
        text: "Podemos modificar, agregar o discontinuar funciones de la plataforma. Para cambios significativos que eliminen funcionalidades clave, notificaremos con al menos 60 días de anticipación a usuarios activos.",
      },
    ],
  },
  {
    id: "cuentas",
    icon: Scale,
    title: "Cuentas y responsabilidades",
    content: [
      {
        subtitle: "Seguridad de la cuenta",
        text: "Eres responsable de mantener la confidencialidad de tus credenciales de acceso y de todas las actividades que ocurran bajo tu cuenta. Notifícanos inmediatamente si sospechas de acceso no autorizado a support@axolstores.com.",
      },
      {
        subtitle: "Información precisa",
        text: "Te comprometes a proporcionar información veraz y actualizada durante el registro y el uso del servicio. AxolStores puede suspender cuentas que contengan información falsa o engañosa.",
      },
      {
        subtitle: "Uso en equipo",
        text: "Los miembros que agregues a tu Team están sujetos a estos mismos términos. Como titular de la cuenta, eres responsable de las acciones de los miembros de tu equipo dentro de la plataforma.",
      },
    ],
  },
  {
    id: "pagos",
    icon: CreditCard,
    title: "Pagos y suscripciones",
    content: [
      {
        subtitle: "Ciclo de facturación",
        text: "Los planes de pago se facturan mensualmente o anualmente según la opción elegida, a partir de la fecha de activación. Los cargos se realizan automáticamente a la tarjeta o método de pago registrado.",
      },
      {
        subtitle: "Periodo de prueba",
        text: "Los planes Growth y Business incluyen 30 días de prueba gratuita. No se requiere tarjeta de crédito para iniciar la prueba. Al finalizar el periodo, se te solicitará un método de pago para continuar; si no lo proporcionas, la cuenta pasará automáticamente al plan Starter.",
      },
      {
        subtitle: "Reembolsos",
        text: "Ofrecemos reembolso completo si cancelas dentro de los primeros 7 días después de tu primer cargo. Fuera de este período, los pagos no son reembolsables pero puedes cancelar en cualquier momento para evitar cargos futuros.",
      },
      {
        subtitle: "Cambios de precio",
        text: "Cualquier cambio en los precios de suscripción se notificará con al menos 30 días de anticipación. Los precios actuales siempre están disponibles en nuestra página de planes.",
      },
    ],
  },
  {
    id: "uso-aceptable",
    icon: Ban,
    title: "Uso aceptable",
    content: [
      {
        subtitle: "Lo que está permitido",
        text: "Puedes usar AxolStores para gestionar y hacer crecer tu negocio legítimo: vender productos o servicios, gestionar clientes, automatizar comunicaciones y administrar tu equipo, siempre dentro del marco legal aplicable.",
      },
      {
        subtitle: "Actividades prohibidas",
        text: "Está prohibido usar la plataforma para enviar spam, distribuir malware, realizar fraudes, infringir derechos de propiedad intelectual, acosar usuarios, vender productos ilegales, o cualquier actividad que viole leyes locales o internacionales.",
      },
      {
        subtitle: "Consecuencias",
        text: "El incumplimiento de esta política puede resultar en la suspensión o cancelación inmediata de la cuenta sin reembolso. Nos reservamos el derecho de reportar actividades ilegales a las autoridades competentes.",
      },
    ],
  },
  {
    id: "propiedad-intelectual",
    icon: FileText,
    title: "Propiedad intelectual",
    content: [
      {
        subtitle: "Propiedad de AxolStores",
        text: "AxolStores y todo su contenido, incluyendo código, diseño, marca, logotipos y funcionalidades, son propiedad exclusiva de AxolStores o sus licenciantes. No se concede ninguna licencia implícita más allá del uso del servicio.",
      },
      {
        subtitle: "Tu contenido",
        text: "Conservas todos los derechos sobre el contenido que publicas en tu tienda, tus datos de CRM y los materiales que subes a la plataforma. Al usar el servicio, nos otorgas una licencia limitada para alojar y procesar tu contenido únicamente con el fin de prestarte el servicio.",
      },
      {
        subtitle: "Feedback",
        text: "Si nos envías sugerencias o feedback sobre el servicio, puedes hacerlo libremente; sin embargo, AxolStores podrá usar esas ideas sin obligación de compensación ni atribución.",
      },
    ],
  },
  {
    id: "limitaciones",
    icon: AlertTriangle,
    title: "Limitación de responsabilidad",
    content: [
      {
        subtitle: "Exclusión de garantías",
        text: "AxolStores se proporciona 'tal cual' y 'según disponibilidad'. No garantizamos que el servicio sea ininterrumpido, libre de errores, o que cumpla con todos tus requisitos específicos de negocio.",
      },
      {
        subtitle: "Límite de responsabilidad",
        text: "En ningún caso la responsabilidad total de AxolStores hacia ti excederá el monto que hayas pagado por el servicio en los 12 meses anteriores al evento que originó el reclamo. Esta limitación aplica en la máxima medida permitida por la ley aplicable.",
      },
      {
        subtitle: "Daños indirectos",
        text: "AxolStores no será responsable por pérdidas de ingresos, pérdida de datos, daños indirectos, incidentales o consecuentes que resulten del uso o la imposibilidad de usar la plataforma.",
      },
    ],
  },
  {
    id: "cancelacion",
    icon: RefreshCw,
    title: "Cancelación y terminación",
    content: [
      {
        subtitle: "Cancelación por el usuario",
        text: "Puedes cancelar tu suscripción en cualquier momento desde la configuración de tu cuenta. La cancelación es efectiva al final del período de facturación actual; conservarás acceso hasta esa fecha.",
      },
      {
        subtitle: "Cancelación por AxolStores",
        text: "Podemos suspender o terminar tu acceso por incumplimiento de estos términos, falta de pago o actividades que dañen a otros usuarios o a la plataforma. En casos de incumplimiento grave, la terminación puede ser inmediata.",
      },
      {
        subtitle: "Exportación de datos",
        text: "Tras la cancelación, tienes 30 días para exportar tus datos. Pasado ese período, los datos pueden ser eliminados permanentemente de nuestros sistemas de producción.",
      },
    ],
  },
]

export default function TerminosPage() {
  return (
    <div className="relative min-h-screen bg-background">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute right-1/4 top-0 h-[500px] w-[600px] -translate-y-1/2 rounded-full bg-primary/6 blur-[140px]" />
        <div className="absolute left-1/4 bottom-0 h-[400px] w-[500px] translate-y-1/2 rounded-full bg-primary/4 blur-[140px]" />
      </div>

      <main className="relative z-10">
        {/* Hero */}
        <section className="mx-auto max-w-4xl px-6 pb-16 pt-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
            <FileText className="h-3.5 w-3.5" />
            <span>Documento legal</span>
          </div>

          <h1 className="mx-auto mt-8 max-w-2xl font-display text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
            Términos de{" "}
            <span className="text-primary">Servicio</span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
            Estos términos describen las reglas y condiciones bajo las cuales puedes
            usar AxolStores. Te recomendamos leerlos con detenimiento.
          </p>

          <div className="mt-6 flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <span>Última actualización: 1 de enero de 2026</span>
            <span className="h-1 w-1 rounded-full bg-border" />
            <span>Versión 2.0</span>
          </div>
        </section>

        {/* Summary cards */}
        <section className="mx-auto max-w-4xl px-6 pb-12">
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              {
                icon: CheckCircle,
                title: "30 días de prueba",
                desc: "Sin tarjeta de crédito requerida para comenzar.",
              },
              {
                icon: RefreshCw,
                title: "Cancela cuando quieras",
                desc: "Sin contratos ni penalizaciones por cancelar.",
              },
              {
                icon: Scale,
                title: "Tus datos son tuyos",
                desc: "Exporta todo tu contenido en cualquier momento.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-3 rounded-xl border border-border/50 bg-secondary/30 p-4"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <item.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick nav */}
        <section className="mx-auto max-w-4xl px-6 pb-12">
          <div className="rounded-2xl border border-border/50 bg-secondary/30 p-6">
            <p className="mb-4 text-sm font-medium text-foreground">En esta página</p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-primary/5 hover:text-primary"
                >
                  <s.icon className="h-3.5 w-3.5 shrink-0" />
                  {s.title}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Content sections */}
        <section className="mx-auto max-w-4xl px-6 pb-24">
          <div className="space-y-12">
            {sections.map((section, i) => (
              <div
                key={section.id}
                id={section.id}
                className="scroll-mt-24 rounded-2xl border border-border/50 bg-background/60 p-8 backdrop-blur-sm"
              >
                <div className="mb-7 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                    <section.icon className="h-4.5 w-4.5 text-primary" />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-display text-xs font-semibold text-primary/60">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h2 className="font-display text-xl font-bold text-foreground">
                      {section.title}
                    </h2>
                  </div>
                </div>

                <div className="space-y-6">
                  {section.content.map((item) => (
                    <div key={item.subtitle}>
                      <h3 className="mb-2 text-sm font-semibold text-foreground">
                        {item.subtitle}
                      </h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Also see */}
        <section className="mx-auto max-w-4xl px-6 pb-12">
          <div className="rounded-2xl border border-border/50 bg-secondary/20 p-8">
            <h3 className="font-display text-lg font-bold text-foreground">
              Documentos relacionados
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Estos términos deben leerse junto con nuestra Política de Privacidad y
              cualquier acuerdo adicional específico de tu plan.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/legal/privacidad">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 rounded-xl border-border/60 text-sm"
                >
                  Política de Privacidad
                  <ArrowLeft className="h-3.5 w-3.5 rotate-180" />
                </Button>
              </Link>
              <a href="mailto:legal@axolstores.com">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 rounded-xl border-border/60 text-sm"
                >
                  <Mail className="h-3.5 w-3.5" />
                  Contacto legal
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="mx-auto max-w-4xl px-6 pb-24">
          <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-primary/5 p-10 text-center">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute left-1/2 top-1/2 h-[300px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[80px]" />
            </div>
            <div className="relative">
              <Scale className="mx-auto mb-4 h-8 w-8 text-primary" />
              <h3 className="font-display text-2xl font-bold text-foreground">
                ¿Tienes dudas legales?
              </h3>
              <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
                Si necesitas aclaraciones sobre estos términos o tienes una consulta
                legal específica, nuestro equipo puede orientarte.
              </p>
              <a href="mailto:legal@axolstores.com">
                <Button className="mt-7 h-11 gap-2 rounded-xl bg-primary px-7 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90">
                  legal@axolstores.com
                  <ArrowLeft className="h-4 w-4 rotate-180" />
                </Button>
              </a>
            </div>
          </div>
        </section>
      </main>

    </div>
  )
}