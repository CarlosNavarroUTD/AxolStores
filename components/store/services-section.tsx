"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Wrench } from "lucide-react"

interface Service {
  id: number
  nombre: string
  descripcion: string
  precio: string  // ⚠️ La API devuelve string, no number
  duracion: number
  duracion_formateada: string  // ⚠️ Nuevo campo de la API
  fecha_creacion: string
  url_img: string | null
}

interface ServicesSectionProps {
  services: Service[]
}

export function ServicesSection({ services }: ServicesSectionProps) {
  // Los servicios públicos siempre son activos (filtrados por la API)
  if (services.length === 0) return null

  return (
    <section id="servicios" className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight">Nuestros Servicios</h2>
          <p className="mt-2 text-muted-foreground">Soluciones profesionales para tus necesidades</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const precioNum = parseFloat(service.precio)

            return (
              <Card key={service.id} className="flex flex-col">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    {service.url_img ? (
                      <img
                        src={service.url_img}
                        alt={service.nombre}
                        className="h-full w-full object-cover rounded-lg"
                      />
                    ) : (
                      <Wrench className="h-6 w-6 text-primary" />
                    )}
                  </div>
                  <CardTitle>{service.nombre}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  {service.descripcion && (
                    <p className="text-muted-foreground">{service.descripcion}</p>
                  )}
                  <div className="flex items-center gap-4 mt-4 flex-wrap">
                    <span className="text-2xl font-bold">${precioNum.toLocaleString()}</span>
                    {service.duracion_formateada && (
                      <Badge variant="outline" className="gap-1">
                        <Clock className="h-3 w-3" />
                        {service.duracion_formateada}
                      </Badge>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" asChild>
                    <a href="#contacto">Solicitar servicio</a>
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}