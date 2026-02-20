import { Hero } from "@/components/inicio/hero"
import { Problema } from "@/components/inicio/problema"
import { Modulos } from "@/components/inicio/modulos"
import { ComoFunciona } from "@/components/inicio/como-funciona"
import { Planes } from "@/components/inicio/planes"
import { CtaFinal } from "@/components/inicio/cta-final"

export default function Page() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main>
        <Hero />
        <Problema />
        <Modulos />
        <ComoFunciona />
        <Planes />
        <CtaFinal />
      </main>
    </div>
  )
}
