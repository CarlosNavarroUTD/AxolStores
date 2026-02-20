"use client"

import { useState } from "react"
import useSWR from "swr"
import { useTeam } from "@/contexts/team-context"
import { productsApi, type ProductData } from "@/lib/api"
import { Header } from "@/components/dashboard/header"
import { DataTable, type Column } from "@/components/dashboard/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
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
import { Plus, Package, Eye } from "lucide-react"
import { ImageUploader } from "@/components/dashboard/image-uploader"
import Link from "next/link"

interface Product {
  id: number
  nombre: string
  descripcion?: string
  precio: number
  stock?: number
  categoria: string
  imagenes?: string[] // URLs de imágenes existentes
  activo: boolean
  team: number
}

// Tipo para el formulario (maneja Files)
interface ProductFormData {
  nombre: string
  descripcion?: string
  precio: number
  stock?: number
  categoria: string
  imagenes?: string[] // URLs existentes
  imagenes_files?: File[] // Archivos nuevos
  activo: boolean
  team: number
}

const emptyProduct: ProductFormData = {
  nombre: "",
  descripcion: "",
  precio: 0,
  stock: 0,
  categoria: "",
  imagenes: [],
  imagenes_files: [],
  activo: true,
  team: 0,
}

export default function ProductosPage() {
  const { activeTeam } = useTeam()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState<ProductFormData>(emptyProduct)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    data: products = [],
    mutate,
    isLoading,
  } = useSWR(activeTeam ? `products-${activeTeam.id}` : null, () =>
    activeTeam ? productsApi.getAll(activeTeam.id) : [],
  )

  const columns: Column<Product>[] = [
    {
      key: "nombre",
      header: "Nombre",
      cell: (product) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
            {product.imagenes?.[0] ? (
              <img
                src={product.imagenes[0]}
                alt={product.nombre}
                className="h-10 w-10 rounded-lg object-cover"
              />
            ) : (
              <Package className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <div>
            <span className="font-medium">{product.nombre}</span>
            {product.imagenes && product.imagenes.length > 1 && (
              <p className="text-xs text-muted-foreground">{product.imagenes.length} imágenes</p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "precio",
      header: "Precio",
      cell: (product) => `$${product.precio.toLocaleString()}`,
    },
    {
      key: "stock",
      header: "Stock",
      cell: (product) => product.stock ?? "N/A",
    },
    {
      key: "categoria",
      header: "Categoría",
      cell: (product) => product.categoria || "Sin categoría",
    },
    {
      key: "activo",
      header: "Estado",
      cell: (product) => (
        <Badge variant={product.activo ? "default" : "secondary"}>
          {product.activo ? "Activo" : "Inactivo"}
        </Badge>
      ),
    },
    {
      key: "acciones",
      header: "",
      cell: (product) => (
        <Link href={`/dashboard/productos/${product.id}`}>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Eye className="h-4 w-4" />
          </Button>
        </Link>
      ),
    },
  ]

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product)
      setFormData({
        nombre: product.nombre,
        descripcion: product.descripcion || "",
        precio: product.precio,
        stock: product.stock || 0,
        categoria: product.categoria || "",
        imagenes: product.imagenes || [],
        imagenes_files: [], // Vacío al editar
        activo: product.activo,
        team: product.team,
      })
    } else {
      setEditingProduct(null)
      setFormData({ ...emptyProduct, team: activeTeam?.id || 0 })
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!activeTeam) return

    setIsSubmitting(true)
    try {
      const data: ProductData = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        precio: formData.precio,
        categoria: formData.categoria,
        team: activeTeam.id,
        activo: formData.activo,
      }

      // Solo incluir imagenes_files si hay archivos nuevos
      if (formData.imagenes_files && formData.imagenes_files.length > 0) {
        data.imagenes_files = formData.imagenes_files
      }

      if (editingProduct) {
        await productsApi.update(editingProduct.id, data)
      } else {
        await productsApi.create(data)
      }
      
      await mutate()
      setIsDialogOpen(false)
      setFormData(emptyProduct) // Limpiar formulario
    } catch (error) {
      console.error("Error guardando producto:", error)
      alert(`Error: ${error instanceof Error ? error.message : "No se pudo guardar el producto"}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!editingProduct) return

    setIsSubmitting(true)
    try {
      await productsApi.delete(editingProduct.id)
      await mutate()
      setIsDeleteDialogOpen(false)
      setEditingProduct(null)
    } catch (error) {
      console.error("Error eliminando producto:", error)
      alert("Error al eliminar el producto")
    } finally {
      setIsSubmitting(false)
    }
  }

  const openDeleteDialog = (product: Product) => {
    setEditingProduct(product)
    setIsDeleteDialogOpen(true)
  }

  if (!activeTeam) {
    return (
      <div className="flex h-full flex-col">
        <Header title="Productos" />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Selecciona una tienda para ver los productos</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <Header title="Productos" />

      <div className="flex-1 space-y-4 p-4 lg:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Productos</h2>
            <p className="text-muted-foreground">Gestiona los productos de {activeTeam.name}</p>
          </div>
          <Button onClick={() => handleOpenDialog()} className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo producto
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <DataTable
            data={products}
            columns={columns}
            onEdit={handleOpenDialog}
            onDelete={openDeleteDialog}
            searchKey="nombre"
            searchPlaceholder="Buscar productos..."
          />
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Editar producto" : "Nuevo producto"}</DialogTitle>
            <DialogDescription>
              {editingProduct ? "Actualiza la información del producto" : "Completa los datos del nuevo producto"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Nombre del producto"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoria">Categoría *</Label>
                <Input
                  id="categoria"
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  placeholder="Ej: Electrónica, Ropa, Alimentos"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="precio">Precio *</Label>
                <Input
                  id="precio"
                  type="number"
                  step="0.01"
                  value={formData.precio}
                  onChange={(e) => setFormData({ ...formData, precio: Number.parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: Number.parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Descripción del producto"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Imágenes del producto</Label>
              <ImageUploader
                images={formData.imagenes_files || []}
                onImagesChange={(files) => setFormData({ 
                  ...formData, 
                  imagenes_files: files 
                })}
                maxImages={10}
                disabled={isSubmitting}
              />
              {formData.imagenes && formData.imagenes.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground">
                    Imágenes actuales: {formData.imagenes.length}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label htmlFor="activo" className="font-medium">
                  Producto activo
                </Label>
                <p className="text-sm text-muted-foreground">
                  Los productos activos se muestran en la tienda pública
                </p>
              </div>
              <Switch
                id="activo"
                checked={formData.activo}
                onCheckedChange={(checked) => setFormData({ ...formData, activo: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || !formData.nombre || !formData.categoria}
            >
              {isSubmitting ? "Guardando..." : editingProduct ? "Guardar cambios" : "Crear producto"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El producto &quot;{editingProduct?.nombre}&quot; será eliminado
              permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}