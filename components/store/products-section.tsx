"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Package, Eye } from "lucide-react"

interface Product {
  id: number
  nombre: string
  descripcion: string
  precio: string  // ⚠️ La API devuelve string, no number
  categoria: string
  marca_nombre?: string
  stock_disponible: boolean  // ⚠️ boolean, no número
  creado_en: string
  imagenes: string[]  // ⚠️ array de URLs
}

interface ProductsSectionProps {
  products: Product[]
}

export function ProductsSection({ products }: ProductsSectionProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  // Los productos públicos siempre son activos (filtrados por la API)
  if (products.length === 0) return null

  return (
    <section id="productos" className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight">Nuestros Productos</h2>
          <p className="mt-2 text-muted-foreground">Descubre nuestra selección de productos</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => {
            const precioNum = parseFloat(product.precio)
            const primeraImagen = product.imagenes?.[0]

            return (
              <Card key={product.id} className="group overflow-hidden">
                <CardHeader className="p-0">
                  <div className="aspect-square bg-muted relative overflow-hidden">
                    {primeraImagen ? (
                      <img
                        src={primeraImagen}
                        alt={product.nombre}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <Package className="h-12 w-12 text-muted-foreground/50" />
                      </div>
                    )}
                    {!product.stock_disponible && (
                      <Badge className="absolute top-2 right-2" variant="destructive">
                        Sin stock
                      </Badge>
                    )}
                    {product.categoria && (
                      <Badge className="absolute top-2 left-2 capitalize" variant="secondary">
                        {product.categoria}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <h3 className="font-semibold line-clamp-1">{product.nombre}</h3>
                  {product.marca_nombre && (
                    <p className="text-xs text-muted-foreground mt-0.5">{product.marca_nombre}</p>
                  )}
                  {product.descripcion && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {product.descripcion}
                    </p>
                  )}
                  <p className="text-lg font-bold mt-2">${precioNum.toLocaleString()}</p>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full gap-2 bg-transparent"
                        onClick={() => setSelectedProduct(product)}
                      >
                        <Eye className="h-4 w-4" />
                        Ver detalles
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>{selectedProduct?.nombre}</DialogTitle>
                        <DialogDescription>Detalles del producto</DialogDescription>
                      </DialogHeader>
                      {selectedProduct && (
                        <div className="space-y-4">
                          {selectedProduct.imagenes?.[0] && (
                            <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                              <img
                                src={selectedProduct.imagenes[0]}
                                alt={selectedProduct.nombre}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          )}
                          {selectedProduct.marca_nombre && (
                            <div>
                              <span className="text-sm font-medium">Marca: </span>
                              <span className="text-sm text-muted-foreground">
                                {selectedProduct.marca_nombre}
                              </span>
                            </div>
                          )}
                          {selectedProduct.descripcion && (
                            <p className="text-muted-foreground">{selectedProduct.descripcion}</p>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold">
                              ${parseFloat(selectedProduct.precio).toLocaleString()}
                            </span>
                            <Badge
                              variant={selectedProduct.stock_disponible ? "secondary" : "destructive"}
                            >
                              {selectedProduct.stock_disponible ? "Disponible" : "Sin stock"}
                            </Badge>
                          </div>
                          <Button
                            className="w-full"
                            disabled={!selectedProduct.stock_disponible}
                            asChild={selectedProduct.stock_disponible}
                          >
                            {selectedProduct.stock_disponible ? (
                              <a href="#contacto">Consultar disponibilidad</a>
                            ) : (
                              <span>Sin stock</span>
                            )}
                          </Button>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}