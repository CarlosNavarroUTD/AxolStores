"use client"

import type React from "react"
import { useState, useMemo, useEffect, useCallback } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Search,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
} from "lucide-react"
import { cn } from "@/lib/utils"

export interface Column<T> {
  key: string
  header: string
  cell?: (item: T) => React.ReactNode
  className?: string
  sortType?: "text" | "number" | "date"
  disableSort?: boolean
  editable?: boolean
  editType?: "text" | "number" | "select" | "date" | "boolean"
  editOptions?: { label: string; value: string | number | boolean }[]
}

type SortDirection = "asc" | "desc" | null

interface SortState {
  key: string
  direction: SortDirection
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
  onView?: (item: T) => void
  onInlineEdit?: (item: T, key: string, value: string) => Promise<void> | void
  searchKey?: string
  searchPlaceholder?: string
  itemsPerPage?: number
  /**
   * Clave única para persistir el estado en localStorage.
   * Usa el nombre de la entidad, ej. "servicios", "clientes", "productos".
   * Si se omite, el estado no se guarda entre sesiones.
   */
  storageKey?: string
}

const PAGE_SIZE_OPTIONS = [10, 50, 100]

// ── Hook de persistencia en localStorage ─────────────────────────────────────
function useLocalStorage<T>(key: string | undefined, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (!key || typeof window === "undefined") return initialValue
    try {
      const stored = localStorage.getItem(key)
      return stored !== null ? (JSON.parse(stored) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  const setAndPersist = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof next === "function" ? (next as (p: T) => T)(prev) : next
        if (key) {
          try {
            localStorage.setItem(key, JSON.stringify(resolved))
          } catch {
            // quota exceeded u otro error — ignorar silenciosamente
          }
        }
        return resolved
      })
    },
    [key]
  )

  return [value, setAndPersist] as const
}

// ── Utilidades ────────────────────────────────────────────────────────────────
function getRawValue<T>(item: T, key: string): unknown {
  if (key.includes(".")) {
    return key.split(".").reduce<unknown>((acc, k) => {
      if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[k]
      return undefined
    }, item)
  }
  return (item as Record<string, unknown>)[key]
}

function looksLikeDate(value: unknown): boolean {
  if (typeof value !== "string") return false
  return !isNaN(Date.parse(value)) && /\d{4}/.test(value)
}

function compareValues(a: unknown, b: unknown, direction: "asc" | "desc", sortType?: string): number {
  const mul = direction === "asc" ? 1 : -1
  if (a == null && b == null) return 0
  if (a == null) return 1
  if (b == null) return -1
  if (sortType === "number" || typeof a === "number" || typeof b === "number") {
    return mul * (Number(a) - Number(b))
  }
  if (sortType === "date" || looksLikeDate(a) || looksLikeDate(b)) {
    return mul * (new Date(String(a)).getTime() - new Date(String(b)).getTime())
  }
  return mul * String(a).localeCompare(String(b), "es", { sensitivity: "base" })
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  if (current <= 4) return [1, 2, 3, 4, 5, "...", total]
  if (current >= total - 3) return [1, "...", total - 4, total - 3, total - 2, total - 1, total]
  return [1, "...", current - 1, current, current + 1, "...", total]
}

// ── Editable Cell ──────────────────────────────────────────────────────────────
function EditableCell<T>({
  item,
  column,
  onInlineEdit,
}: {
  item: T
  column: Column<T>
  onInlineEdit?: (item: T, key: string, value: any) => Promise<void> | void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  const rawValue = getRawValue(item, column.key)
  const [value, setValue] = useState(rawValue)

  useEffect(() => {
    setValue(getRawValue(item, column.key))
  }, [item, column.key])

  const handleSave = async (newValue: any) => {
    if (newValue !== rawValue && onInlineEdit) {
      setIsSaving(true)
      try {
        await onInlineEdit(item, column.key, newValue)
      } finally {
        setIsSaving(false)
        setIsEditing(false)
      }
    } else {
      setIsEditing(false)
    }
  }

  const handleBlur = () => {
    if (column.editType !== "boolean" && column.editType !== "select") {
      handleSave(value)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave(value)
    }
    if (e.key === "Escape") {
      setValue(rawValue)
      setIsEditing(false)
    }
  }

  if (isEditing) {
    if (column.editType === "boolean") {
      return (
        <div 
          className="flex items-center h-8 px-1" 
          tabIndex={0} 
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) {
              setIsEditing(false)
            }
          }}
        >
          <Switch
            checked={Boolean(value)}
            onCheckedChange={(checked) => {
              setValue(checked)
              handleSave(checked)
            }}
            disabled={isSaving}
            autoFocus
          />
        </div>
      )
    }

    if (column.editType === "select" && column.editOptions) {
      return (
        <Select
          value={String(value ?? "")}
          onValueChange={(val) => {
            let parsedVal: any = val
            // si era un booleano en las opciones, convertirlo
            if (val === "true") parsedVal = true
            if (val === "false") parsedVal = false
            setValue(parsedVal)
            handleSave(parsedVal)
          }}
          disabled={isSaving}
          defaultOpen={true}
          onOpenChange={(open) => {
            if (!open) {
              setTimeout(() => setIsEditing(false), 200)
            }
          }}
        >
          <SelectTrigger className="h-8 py-1 px-2 min-w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {column.editOptions.map((opt, i) => (
              <SelectItem key={i} value={String(opt.value)}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    }

    const isDate = column.editType === "date"
    const inputType = column.editType === "number" ? "number" : isDate ? "date" : "text"
    const displayValue = isDate && value && typeof value === "string" 
      ? value.split('T')[0] // Truncate to YYYY-MM-DD
      : (value === null || value === undefined ? "" : String(value))

    return (
      <Input
        autoFocus
        type={inputType}
        value={displayValue}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        disabled={isSaving}
        className="h-8 py-1 px-2 min-w-[100px]"
      />
    )
  }

  return (
    <div
      onDoubleClick={() => setIsEditing(true)}
      className="min-h-[1.5rem] cursor-text rounded border border-transparent hover:border-border/50 px-1 -mx-1"
      title="Doble clic para editar"
    >
      {column.cell ? column.cell(item) : String(rawValue ?? "")}
    </div>
  )
}

// ── Componente ────────────────────────────────────────────────────────────────
export function DataTable<T extends { id?: number }>({
  data,
  columns,
  onEdit,
  onDelete,
  onView,
  onInlineEdit,
  searchKey,
  searchPlaceholder = "Buscar...",
  itemsPerPage = 10,
  storageKey,
}: DataTableProps<T>) {
  const sk = storageKey ? `datatable:${storageKey}` : undefined

  // Estado persistido — cada pieza tiene su propia clave para updates independientes
  const [search, setSearch] = useLocalStorage<string>(sk ? `${sk}:search` : undefined, "")
  const [pageSize, setPageSize] = useLocalStorage<number>(sk ? `${sk}:pageSize` : undefined, itemsPerPage)
  const [sort, setSort] = useLocalStorage<SortState>(sk ? `${sk}:sort` : undefined, { key: "", direction: null })

  // La página NO se persiste: al volver siempre empezamos en 1
  const [page, setPage] = useState(1)

  useEffect(() => { setPage(1) }, [search, sort, pageSize])

  // ── Ordenamiento ──────────────────────────────────────────────
  const handleSort = (column: Column<T>) => {
    if (column.disableSort) return
    setSort((prev) => {
      if (prev.key !== column.key) {
        const isDate =
          column.sortType === "date" ||
          data.some((item) => looksLikeDate(getRawValue(item, column.key)))
        return { key: column.key, direction: isDate ? "desc" : "asc" }
      }
      const next: SortDirection =
        prev.direction === "asc" ? "desc" : prev.direction === "desc" ? null : "asc"
      return { key: column.key, direction: next }
    })
  }

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sort.key !== columnKey || sort.direction === null)
      return <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
    if (sort.direction === "desc")
      return <ArrowDown className="h-3.5 w-3.5 text-primary shrink-0" />
    return <ArrowUp className="h-3.5 w-3.5 text-primary shrink-0" />
  }

  // ── Procesado de datos ────────────────────────────────────────
  const processedData = useMemo(() => {
    let result = [...data]
    if (searchKey && search) {
      const q = search.toLowerCase()
      result = result.filter((item) =>
        String(getRawValue(item, searchKey) ?? "").toLowerCase().includes(q)
      )
    }
    if (sort.key && sort.direction) {
      const col = columns.find((c) => c.key === sort.key)
      result.sort((a, b) =>
        compareValues(
          getRawValue(a, sort.key),
          getRawValue(b, sort.key),
          sort.direction as "asc" | "desc",
          col?.sortType
        )
      )
    }
    return result
  }, [data, search, searchKey, sort, columns])

  // ── Paginación ────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(processedData.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const paginatedData = processedData.slice((safePage - 1) * pageSize, safePage * pageSize)
  const startItem = processedData.length === 0 ? 0 : (safePage - 1) * pageSize + 1
  const endItem = Math.min(safePage * pageSize, processedData.length)
  const hasActions = !!(onEdit || onDelete || onView)

  return (
    <div className="space-y-4">
      {/* Barra superior */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {searchKey && (
          <div className="relative max-w-sm flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        )}
        <div className="flex items-center gap-2 ml-auto shrink-0">
          <span className="text-sm text-muted-foreground whitespace-nowrap">Filas por página</span>
          <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
            <SelectTrigger className="w-[80px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabla */}
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => {
                const isSorted = sort.key === column.key && sort.direction !== null
                const sortable = !column.disableSort
                return (
                  <TableHead
                    key={column.key}
                    className={cn(
                      column.className,
                      sortable && "cursor-pointer select-none hover:bg-muted/50 transition-colors"
                    )}
                    onClick={() => sortable && handleSort(column)}
                  >
                    <div className={cn("flex items-center gap-1.5", isSorted && "text-foreground font-semibold")}>
                      {column.header}
                      {sortable && <SortIcon columnKey={column.key} />}
                    </div>
                  </TableHead>
                )
              })}
              {hasActions && (
                <TableHead className="w-[52px] sticky right-0 z-20 bg-card border-l shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.06)]">
                  <span className="sr-only">Acciones</span>
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (hasActions ? 1 : 0)}
                  className="h-24 text-center text-muted-foreground"
                >
                  No se encontraron resultados
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((item, index) => (
                <TableRow key={item.id ?? index} className="group">
                  {columns.map((column) => (
                    <TableCell key={column.key} className={column.className}>
                      {column.editable && onInlineEdit ? (
                        <EditableCell item={item} column={column} onInlineEdit={onInlineEdit} />
                      ) : column.cell ? (
                        column.cell(item)
                      ) : (
                        String(getRawValue(item, column.key) ?? "")
                      )}
                    </TableCell>
                  ))}
                  {hasActions && (
                    <TableCell className="sticky right-0 z-10 bg-background border-l shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.06)] group-hover:bg-muted/50">
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

      {/* Footer */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <p className="text-sm text-muted-foreground">
          {processedData.length === 0
            ? "Sin resultados"
            : `Mostrando ${startItem}–${endItem} de ${processedData.length} registro${processedData.length !== 1 ? "s" : ""}`}
        </p>

        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setPage(1)} disabled={safePage === 1} title="Primera página">
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setPage(safePage - 1)} disabled={safePage === 1} title="Anterior">
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {getPageNumbers(safePage, totalPages).map((p, i) =>
              p === "..." ? (
                <span key={`e-${i}`} className="px-1 text-sm text-muted-foreground">…</span>
              ) : (
                <Button
                  key={p}
                  variant={safePage === p ? "default" : "outline"}
                  size="icon"
                  className="h-8 w-8 text-sm"
                  onClick={() => setPage(p as number)}
                >
                  {p}
                </Button>
              )
            )}

            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setPage(safePage + 1)} disabled={safePage === totalPages} title="Siguiente">
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setPage(totalPages)} disabled={safePage === totalPages} title="Última página">
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}