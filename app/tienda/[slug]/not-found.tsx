import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Store } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-6">
          <Store className="h-8 w-8 text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-bold">Tienda no encontrada</h1>
        <p className="mt-2 text-muted-foreground max-w-md mx-auto">
          La tienda que buscas no existe o ha sido eliminada. Verifica la URL e intenta de nuevo.
        </p>
        <Button asChild className="mt-6">
          <Link href="/">Volver al inicio</Link>
        </Button>
      </div>
    </div>
  )
}
