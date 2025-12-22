"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { X, Upload, ImageIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ImageUploaderProps {
  images: File[] // Cambiado de string[] a File[]
  onImagesChange: (images: File[]) => void
  maxImages?: number
  disabled?: boolean
  existingImages?: string[] // URLs de imágenes ya guardadas (opcional)
  onRemoveExisting?: (url: string) => void // Callback para eliminar imágenes existentes
}

export function ImageUploader({ 
  images, 
  onImagesChange, 
  maxImages = 10, 
  disabled = false,
  existingImages = [],
  onRemoveExisting
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [previewUrls, setPreviewUrls] = useState<string[]>([])

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return

      const totalImages = existingImages.length + images.length
      const remainingSlots = maxImages - totalImages
      if (remainingSlots <= 0) return

      const newFiles: File[] = []
      const newPreviews: string[] = []

      // Procesar archivos
      const filesToProcess = Array.from(files).slice(0, remainingSlots)

      for (const file of filesToProcess) {
        if (!file.type.startsWith("image/")) continue
        
        newFiles.push(file)
        // Crear preview URL para el archivo
        const previewUrl = URL.createObjectURL(file)
        newPreviews.push(previewUrl)
      }

      if (newFiles.length > 0) {
        onImagesChange([...images, ...newFiles])
        setPreviewUrls([...previewUrls, ...newPreviews])
      }
    },
    [images, maxImages, onImagesChange, previewUrls, existingImages.length],
  )

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      if (!disabled) setIsDragging(true)
    },
    [disabled],
  )

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      if (!disabled) {
        handleFiles(e.dataTransfer.files)
      }
    },
    [disabled, handleFiles],
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files)
      e.target.value = "" // Reset para permitir subir el mismo archivo
    },
    [handleFiles],
  )

  const removeNewImage = useCallback(
    (index: number) => {
      // Revocar la URL del preview para liberar memoria
      if (previewUrls[index]) {
        URL.revokeObjectURL(previewUrls[index])
      }
      
      const newImages = images.filter((_, i) => i !== index)
      const newPreviews = previewUrls.filter((_, i) => i !== index)
      
      onImagesChange(newImages)
      setPreviewUrls(newPreviews)
    },
    [images, previewUrls, onImagesChange],
  )

  const removeExistingImage = useCallback(
    (url: string) => {
      if (onRemoveExisting) {
        onRemoveExisting(url)
      }
    },
    [onRemoveExisting],
  )

  const totalImages = existingImages.length + images.length

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          disabled && "opacity-50 cursor-not-allowed",
          totalImages >= maxImages && "opacity-50",
        )}
      >
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleInputChange}
          disabled={disabled || totalImages >= maxImages}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />

        <div className="flex flex-col items-center gap-2 text-center">
          <Upload className="h-10 w-10 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">
              Arrastra imágenes aquí o haz clic para seleccionar
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {totalImages} de {maxImages} imágenes • PNG, JPG, WEBP
            </p>
          </div>
        </div>
      </div>

      {/* Preview de imágenes */}
      {totalImages > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {/* Imágenes existentes (ya guardadas) */}
          {existingImages.map((url, index) => (
            <div key={`existing-${index}`} className="relative group aspect-square rounded-lg overflow-hidden border bg-muted">
              <img
                src={url}
                alt={`Imagen existente ${index + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Badge de guardada */}
              <div className="absolute top-2 left-2 px-2 py-0.5 bg-green-500 text-white text-xs font-medium rounded">
                Guardada
              </div>

              {/* Controles */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="h-8 w-8"
                  onClick={() => removeExistingImage(url)}
                  disabled={!onRemoveExisting}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          {/* Nuevas imágenes (aún no guardadas) */}
          {previewUrls.map((previewUrl, index) => (
            <div key={`new-${index}`} className="relative group aspect-square rounded-lg overflow-hidden border bg-muted">
              <img
                src={previewUrl}
                alt={`Nueva imagen ${index + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Badge de nueva */}
              <div className="absolute top-2 left-2 px-2 py-0.5 bg-blue-500 text-white text-xs font-medium rounded">
                Nueva
              </div>

              {/* Controles */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="h-8 w-8"
                  onClick={() => removeNewImage(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}