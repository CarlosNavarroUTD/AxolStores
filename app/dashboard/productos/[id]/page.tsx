"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import useSWR from "swr"
import { productsApi } from "@/lib/api"
import { useTeam } from "@/contexts/team-context"
import { Header } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  ArrowLeft,
  Edit,
  Trash2,
  Package,
  DollarSign,
  Boxes,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface Product {
  id: number
  nombre: string
  descripcion?: string
  precio: number
  stock?: number
  categoria?: string
  imagen?: string
  imagenes?: string[]
  activo: boolean
  team: number
  created_at?: string
  updated_at?: string
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { activeTeam } = useTeam()
  const productId = Number(params.id)

  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // ✅ FIX: Usar fetcher correcto con la función de la API
  const {
    data: product,
    isLoading,
    error,
    mutate,
  } = useSWR<Product>(
    productId ? `product-${productId}` : null,
    async () => {
      if (!productId) throw new Error("No product ID")
      return productsApi.get(productId) // ✅ Esto ya usa fetchWithAuth internamente
    },
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  )

  const handleDelete = async () => {
    if (!product) return

    setIsDeleting(true)
    try {
      await productsApi.delete(product.id)
      router.push("/dashboard/productos")
    } catch (error) {
      console.error("Error eliminando producto:", error)
      alert("Error al eliminar el producto")
    } finally {
      setIsDeleting(false)
    }
  }

  // Combinar imagen principal con array de imágenes
  const allImages = product?.imagenes?.length ? product.imagenes : product?.imagen ? [product.imagen] : []

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0))
  }

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1))
  }

  if (isLoading) {
    return (
      <div className="flex h-full flex-col">
        <Header title="Cargando..." />
        <div className="flex-1 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="flex h-full flex-col">
        <Header title="Producto no encontrado" />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <Package className="h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">
            {error ? "Error al cargar el producto" : "El producto no existe o no tienes acceso"}
          </p>
          {error && (
            <p className="text-sm text-muted-foreground">
              {error instanceof Error ? error.message : "Error desconocido"}
            </p>
          )}
          <Link href="/dashboard/productos">
            <Button variant="outline" className="gap-2 bg-transparent">
              <ArrowLeft className="h-4 w-4" />
              Volver a productos
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <Header title={product.nombre} />

      <div className="flex-1 p-4 lg:p-6 space-y-6 overflow-y-auto">
        {/* Breadcrumb y acciones */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard/productos"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a productos
          </Link>

          <div className="flex items-center gap-2">
            {/* ✅ FIX: Mejor manejo de edición - podrías implementar un modal de edición aquí */}
            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-transparent"
              onClick={() => {
                // Navegar a la lista y abrir el diálogo de edición
                router.push(`/dashboard/productos?edit=${product.id}`)
              }}
            >
              <Edit className="h-4 w-4" />
              Editar
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-destructive hover:text-destructive bg-transparent"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
              Eliminar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Galería de imágenes */}
          <Card>
            <CardContent className="p-4">
              {allImages.length > 0 ? (
                <div className="space-y-4">
                  {/* Imagen principal */}
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                    <img
                      src={allImages[selectedImageIndex] || "/placeholder.svg"}
                      alt={`${product.nombre} - imagen ${selectedImageIndex + 1}`}
                      className="w-full h-full object-contain"
                    />

                    {/* Controles de navegación */}
                    {allImages.length > 1 && (
                      <>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full opacity-80 hover:opacity-100"
                          onClick={prevImage}
                        >
                          <ChevronLeft className="h-6 w-6" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full opacity-80 hover:opacity-100"
                          onClick={nextImage}
                        >
                          <ChevronRight className="h-6 w-6" />
                        </Button>

                        {/* Indicador de posición */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/60 rounded-full text-white text-sm">
                          {selectedImageIndex + 1} / {allImages.length}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Thumbnails */}
                  {allImages.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {allImages.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={cn(
                            "flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors",
                            selectedImageIndex === index
                              ? "border-primary"
                              : "border-transparent hover:border-muted-foreground/50",
                          )}
                        >
                          <img
                            src={image || "/placeholder.svg"}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-square rounded-lg bg-muted flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Package className="h-16 w-16 mx-auto mb-2" />
                    <p>Sin imágenes</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Información del producto */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{product.nombre}</CardTitle>
                    <CardDescription className="mt-1">ID: #{product.id}</CardDescription>
                  </div>
                  <Badge variant={product.activo ? "default" : "secondary"}>
                    {product.activo ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Precio y stock */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                    <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Precio</p>
                      <p className="text-xl font-bold">${product.precio.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                    <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <Boxes className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Stock</p>
                      <p className="text-xl font-bold">{product.stock ?? "N/A"}</p>
                    </div>
                  </div>
                </div>

                {product.categoria && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground">Categoría</p>
                      <p className="font-medium">{product.categoria}</p>
                    </div>
                  </>
                )}

                <Separator />

                {/* Descripción */}
                <div>
                  <h3 className="font-medium mb-2">Descripción</h3>
                  {product.descripcion ? (
                    <p className="text-muted-foreground whitespace-pre-wrap">{product.descripcion}</p>
                  ) : (
                    <p className="text-muted-foreground italic">Sin descripción</p>
                  )}
                </div>

                <Separator />

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {product.created_at && (
                    <div>
                      <p className="text-muted-foreground">Creado</p>
                      <p className="font-medium">
                        {new Date(product.created_at).toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  )}
                  {product.updated_at && (
                    <div>
                      <p className="text-muted-foreground">Actualizado</p>
                      <p className="font-medium">
                        {new Date(product.updated_at).toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Link a tienda pública */}
            {activeTeam?.slug && product.activo && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Ver en tienda pública</p>
                      <p className="text-sm text-muted-foreground">Este producto está visible en tu tienda</p>
                    </div>
                    <Link href={`/tienda/${activeTeam.slug}`} target="_blank">
                      <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                        <ExternalLink className="h-4 w-4" />
                        Ver tienda
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Dialog de confirmación de eliminación */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El producto &quot;{product.nombre}&quot; será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}