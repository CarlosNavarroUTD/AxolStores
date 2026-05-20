import Link from "next/link"
import { Shield, ArrowLeft, Mail, Lock, Eye, Database, Users, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

const sections = [
  {
    id: "informacion-recopilada",
    icon: Database,
    title: "Información que recopilamos",
    content: [
      {
        subtitle: "Información de cuenta",
        text: "Cuando creas una cuenta en AxolStores, recopilamos tu nombre, dirección de correo electrónico, contraseña cifrada y datos de facturación necesarios para procesar pagos. Esta información es esencial para brindarte acceso a la plataforma.",
      },
      {
        subtitle: "Datos de uso",
        text: "Registramos cómo interactúas con nuestra plataforma: páginas visitadas, módulos utilizados, frecuencia de acceso y acciones realizadas dentro del sistema. Esto nos permite mejorar la experiencia y detectar problemas técnicos.",
      },
      {
        subtitle: "Datos de tus clientes",
        text: "A través del CRM y los formularios de tu tienda, tu negocio recopila información de tus propios clientes. AxolStores actúa como procesador de datos en este caso; tú eres el responsable de obtener los consentimientos necesarios.",
      },
    ],
  },
  {
    id: "uso-informacion",
    icon: Eye,
    title: "Cómo usamos tu información",
    content: [
      {
        subtitle: "Prestación del servicio",
        text: "Usamos tus datos para operar y mejorar AxolStores, procesar transacciones, enviarte notificaciones importantes del servicio y brindarte soporte técnico cuando lo necesites.",
      },
      {
        subtitle: "Comunicaciones",
        text: "Podemos enviarte correos sobre actualizaciones de producto, nuevas funciones o contenido educativo relacionado con tu negocio. Puedes cancelar la suscripción a comunicaciones de marketing en cualquier momento desde tu perfil.",
      },
      {
        subtitle: "Análisis y mejora",
        text: "Analizamos patrones de uso de forma agregada y anonimizada para entender qué funciones son más útiles y cómo podemos mejorar la plataforma. Nunca vendemos datos individuales a terceros.",
      },
    ],
  },
  {
    id: "proteccion",
    icon: Lock,
    title: "Protección de datos",
    content: [
      {
        subtitle: "Cifrado en tránsito y reposo",
        text: "Toda la comunicación entre tu navegador y nuestros servidores está cifrada con TLS 1.3. Los datos almacenados en nuestra base de datos utilizan cifrado AES-256. Tus contraseñas nunca se almacenan en texto plano.",
      },
      {
        subtitle: "Acceso restringido",
        text: "Solo el personal autorizado de AxolStores tiene acceso a datos de producción, bajo estrictos controles de acceso y registros de auditoría. Realizamos revisiones periódicas de permisos y capacitaciones en seguridad.",
      },
      {
        subtitle: "Infraestructura segura",
        text: "Operamos sobre infraestructura en la nube con certificaciones de seguridad reconocidas. Realizamos copias de seguridad automáticas cada 24 horas con retención de 30 días.",
      },
    ],
  },
  {
    id: "compartir",
    icon: Users,
    title: "Compartir información",
    content: [
      {
        subtitle: "Proveedores de servicio",
        text: "Trabajamos con proveedores de confianza para procesar pagos (Stripe), enviar correos transaccionales y alojar nuestra infraestructura. Estos proveedores solo reciben la información mínima necesaria y están sujetos a acuerdos de confidencialidad.",
      },
      {
        subtitle: "Requisitos legales",
        text: "Podemos divulgar información cuando sea requerido por ley, orden judicial o para proteger los derechos, seguridad o propiedad de AxolStores, nuestros usuarios o el público en general.",
      },
      {
        subtitle: "Lo que nunca hacemos",
        text: "No vendemos, alquilamos ni comercializamos tu información personal a terceros con fines publicitarios. Tu información no se usa para perfilado publicitario externo.",
      },
    ],
  },
  {
    id: "derechos",
    icon: Shield,
    title: "Tus derechos",
    content: [
      {
        subtitle: "Acceso y portabilidad",
        text: "Puedes solicitar en cualquier momento una copia de todos los datos que tenemos sobre ti en formato legible por máquina. Procesamos estas solicitudes en un plazo máximo de 30 días.",
      },
      {
        subtitle: "Corrección y eliminación",
        text: "Tienes derecho a corregir datos incorrectos o incompletos, y a solicitar la eliminación de tu cuenta y datos asociados. Algunas categorías de datos pueden retenerse por obligaciones legales o contables.",
      },
      {
        subtitle: "Oposición al tratamiento",
        text: "Puedes oponerte al uso de tus datos para comunicaciones de marketing o para ciertos tipos de análisis. Para ejercer cualquier derecho, escríbenos a privacidad@axolstores.com.",
      },
    ],
  },
  {
    id: "actualizaciones",
    icon: RefreshCw,
    title: "Actualizaciones a esta política",
    content: [
      {
        subtitle: "Notificación de cambios",
        text: "Cuando realicemos cambios materiales a esta política, te notificaremos por correo electrónico y mediante un aviso destacado en la plataforma con al menos 30 días de anticipación antes de que los cambios entren en vigor.",
      },
      {
        subtitle: "Historial de versiones",
        text: "Mantenemos un historial de versiones anteriores de esta política disponible bajo solicitud. La fecha de última actualización siempre está visible al pie de esta página.",
      },
    ],
  },
]

export default function PrivacidadPage() {
  return (
    <div className="relative min-h-screen bg-background">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-0 h-[500px] w-[600px] -translate-y-1/2 rounded-full bg-primary/6 blur-[140px]" />
        <div className="absolute right-1/4 bottom-0 h-[400px] w-[500px] translate-y-1/2 rounded-full bg-primary/4 blur-[140px]" />
      </div>

      <main className="relative z-10">
        {/* Hero */}
        <section className="mx-auto max-w-4xl px-6 pb-16 pt-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
            <Shield className="h-3.5 w-3.5" />
            <span>Documento legal</span>
          </div>

          <h1 className="mx-auto mt-8 max-w-2xl font-display text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
            Política de{" "}
            <span className="text-primary">Privacidad</span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
            En AxolStores tomamos la privacidad de tus datos en serio. Esta política
            explica qué información recopilamos, cómo la usamos y cómo la protegemos.
          </p>

          <div className="mt-6 flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <span>Última actualización: 1 de enero de 2026</span>
            <span className="h-1 w-1 rounded-full bg-border" />
            <span>Versión 2.0</span>
          </div>
        </section>

        {/* Quick nav */}
        <section className="mx-auto max-w-4xl px-6 pb-12">
          <div className="rounded-2xl border border-border/50 bg-secondary/30 p-6">
            <p className="mb-4 text-sm font-medium text-foreground">En esta página</p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
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

        {/* Contact CTA */}
        <section className="mx-auto max-w-4xl px-6 pb-24">
          <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-primary/5 p-10 text-center">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute left-1/2 top-1/2 h-[300px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[80px]" />
            </div>
            <div className="relative">
              <Mail className="mx-auto mb-4 h-8 w-8 text-primary" />
              <h3 className="font-display text-2xl font-bold text-foreground">
                ¿Tienes preguntas sobre tu privacidad?
              </h3>
              <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
                Nuestro equipo está disponible para responder cualquier duda sobre cómo
                manejamos tus datos o para ayudarte a ejercer tus derechos.
              </p>
              <a href="mailto:privacidad@axolstores.com">
                <Button
                  className="mt-7 h-11 gap-2 rounded-xl bg-primary px-7 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90"
                >
                  privacidad@axolstores.com
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