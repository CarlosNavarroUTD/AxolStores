import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/contexts/theme-provider"
import { Header } from "@/components/inicio/header"
import { Footer } from "@/components/inicio/footer"

export const metadata: Metadata = {
  title: "AxolStores — Plataforma todo-en-uno para tu negocio",
  description:
    "Vende más. Automatiza tu negocio. AxolStores integra tienda, CRM, chat inteligente y asistente para tu equipo en una plataforma moderna.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <Header />
          {children}
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}