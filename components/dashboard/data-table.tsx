"use client"

import type React from "react"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react"

export interface Column<T> {
  key: string
  header: string
  cell?: (item: T) => React.ReactNode
  className?: string
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
  onView?: (item: T) => void
  searchKey?: string
  searchPlaceholder?: string
  itemsPerPage?: number
}

export function DataTable<T extends { id?: number }>({
  data,
  columns,
  onEdit,
  onDelete,
  onView,
  searchKey,
  searchPlaceholder = "Buscar...",
  itemsPerPage = 10,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  // Filtrar datos
  const filteredData = searchKey
    ? data.filter((item) => {
        const value = (item as Record<string, unknown>)[searchKey]
        return String(value || "")
          .toLowerCase()
          .includes(search.toLowerCase())
      })
    : data

  // Paginación
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const paginatedData = filteredData.slice((page - 1) * itemsPerPage, page * itemsPerPage)

  return (
    <div className="space-y-4">
      {/* Búsqueda */}
      {searchKey && (
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="pl-8"
          />
        </div>
      )}

      {/* Tabla */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key} className={column.className}>
                  {column.header}
                </TableHead>
              ))}
              {(onEdit || onDelete || onView) && <TableHead className="w-[70px]">Acciones</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="h-24 text-center">
                  No se encontraron resultados
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((item, index) => (
                <TableRow key={item.id || index}>
                  {columns.map((column) => (
                    <TableCell key={column.key} className={column.className}>
                      {column.cell ? column.cell(item) : String((item as Record<string, unknown>)[column.key] ?? "")}
                    </TableCell>
                  ))}
                  {(onEdit || onDelete || onView) && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {onView && <DropdownMenuItem onClick={() => onView(item)}>Ver detalles</DropdownMenuItem>}
                          {onEdit && <DropdownMenuItem onClick={() => onEdit(item)}>Editar</DropdownMenuItem>}
                          {onDelete && (
                            <DropdownMenuItem
                              onClick={() => onDelete(item)}
                              className="text-destructive focus:text-destructive"
                            >
                              Eliminar
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {(page - 1) * itemsPerPage + 1} a {Math.min(page * itemsPerPage, filteredData.length)} de{" "}
            {filteredData.length}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setPage(page - 1)} disabled={page === 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Página {page} de {totalPages}
            </span>
            <Button variant="outline" size="icon" onClick={() => setPage(page + 1)} disabled={page === totalPages}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
