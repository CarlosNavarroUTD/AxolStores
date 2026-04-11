"use client"

import { useState, useEffect, useRef } from "react"
import { notasApi } from "@/lib/api"
import type { Nota, NotaData, BuscarNotasParams } from "@/lib/api"
import { useTeam } from "@/contexts/team-context"

// ─── Palette & tokens ──────────────────────────────────────────────────────
const COLORS = [
  { value: "#FFFBEB", label: "Vainilla" },
  { value: "#FEF2F2", label: "Rosa" },
  { value: "#F0FDF4", label: "Menta" },
  { value: "#EFF6FF", label: "Cielo" },
  { value: "#FDF4FF", label: "Lavanda" },
  { value: "#FFFBF0", label: "Durazno" },
]

// ─── Helpers ───────────────────────────────────────────────────────────────
function formatDate(iso: string) {
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso))
}

// ─── Sub-components ────────────────────────────────────────────────────────

function TagBadge({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="tag-badge"
      style={{
        background: "rgba(0,0,0,0.06)",
        border: "none",
        borderRadius: "999px",
        padding: "2px 10px",
        fontSize: "11px",
        fontFamily: "inherit",
        cursor: onClick ? "pointer" : "default",
        letterSpacing: "0.03em",
        color: "#444",
        transition: "background 0.15s",
      }}
    >
      #{label}
    </button>
  )
}

function ColorPicker({
  value,
  onChange,
}: {
  value: string
  onChange: (c: string) => void
}) {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      {COLORS.map((c) => (
        <button
          key={c.value}
          title={c.label}
          onClick={() => onChange(c.value)}
          style={{
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: c.value,
            border: value === c.value ? "2px solid #333" : "2px solid #ccc",
            cursor: "pointer",
            transition: "transform 0.1s",
            transform: value === c.value ? "scale(1.25)" : "scale(1)",
          }}
        />
      ))}
    </div>
  )
}

// ─── Modal / Drawer for create & edit ─────────────────────────────────────

interface NoteEditorProps {
  note?: Nota | null
  teamId: number
  onSave: (data: NotaData) => Promise<void>
  onClose: () => void
}

function NoteEditor({ note, teamId, onSave, onClose }: NoteEditorProps) {
  const [titulo, setTitulo] = useState(note?.titulo ?? "")
  const [contenido, setContenido] = useState(note?.contenido ?? "")
  const [color, setColor] = useState(note?.color ?? COLORS[0].value)
  const [etiquetasRaw, setEtiquetasRaw] = useState(
    (note?.etiquetas ?? []).join(", ")
  )
  const [saving, setSaving] = useState(false)
  const titleRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    titleRef.current?.focus()
  }, [])

  async function handleSubmit() {
    if (!titulo.trim()) return
    setSaving(true)
    const etiquetas = etiquetasRaw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
    await onSave({ team: teamId, titulo, contenido, color, etiquetas })
    setSaving(false)
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(10,10,10,0.45)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        animation: "fadeIn 0.18s ease",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: color,
          borderRadius: 20,
          padding: "32px 36px",
          width: "min(540px, 92vw)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.18), 0 4px 12px rgba(0,0,0,0.08)",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          animation: "slideUp 0.22s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 13, color: "#888", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            {note ? "Editar nota" : "Nueva nota"}
          </span>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#999", lineHeight: 1 }}
          >
            ×
          </button>
        </div>

        <input
          ref={titleRef}
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Título…"
          style={{
            background: "transparent",
            border: "none",
            borderBottom: "2px solid rgba(0,0,0,0.12)",
            fontSize: 22,
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontWeight: 700,
            color: "#1a1a1a",
            outline: "none",
            padding: "4px 0",
            width: "100%",
          }}
        />

        <textarea
          value={contenido}
          onChange={(e) => setContenido(e.target.value)}
          placeholder="Escribe aquí tu nota…"
          rows={6}
          style={{
            background: "transparent",
            border: "none",
            resize: "none",
            fontSize: 15,
            fontFamily: "'Palatino Linotype', Palatino, Georgia, serif",
            color: "#333",
            outline: "none",
            lineHeight: 1.7,
            width: "100%",
          }}
        />

        <div>
          <label style={{ fontSize: 11, color: "#888", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>ETIQUETAS (separadas por coma)</label>
          <input
            value={etiquetasRaw}
            onChange={(e) => setEtiquetasRaw(e.target.value)}
            placeholder="diseño, urgente, ideas…"
            style={{
              background: "rgba(255,255,255,0.5)",
              border: "1.5px solid rgba(0,0,0,0.1)",
              borderRadius: 8,
              padding: "6px 10px",
              fontSize: 13,
              width: "100%",
              outline: "none",
              fontFamily: "inherit",
            }}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <ColorPicker value={color} onChange={setColor} />
          <button
            onClick={handleSubmit}
            disabled={saving || !titulo.trim()}
            style={{
              background: "#1a1a1a",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "10px 24px",
              fontSize: 14,
              cursor: saving || !titulo.trim() ? "not-allowed" : "pointer",
              opacity: saving || !titulo.trim() ? 0.5 : 1,
              fontFamily: "inherit",
              letterSpacing: "0.04em",
              transition: "opacity 0.15s, transform 0.1s",
            }}
          >
            {saving ? "Guardando…" : note ? "Actualizar" : "Crear nota"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── NoteCard ───────────────────────────────────────────────────────────────

interface NoteCardProps {
  nota: Nota
  onEdit: () => void
  onDelete: () => void
  onPin: () => void
  onTagClick: (tag: string) => void
}

function NoteCard({ nota, onEdit, onDelete, onPin, onTagClick }: NoteCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  return (
    <div
      style={{
        background: nota.color || "#FFFBEB",
        borderRadius: 16,
        padding: "20px 20px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        transition: "transform 0.18s, box-shadow 0.18s",
        cursor: "pointer",
        position: "relative",
        breakInside: "avoid",
      }}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)"
        ;(e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)"
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"
        ;(e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)"
      }}
      onClick={onEdit}
    >
      {/* Pin indicator */}
      {nota.fijada && (
        <span
          style={{
            position: "absolute",
            top: 12,
            right: 40,
            fontSize: 14,
            filter: "grayscale(0.2)",
          }}
          title="Nota fijada"
        >
          📌
        </span>
      )}

      {/* Menu */}
      <div
        ref={menuRef}
        style={{ position: "absolute", top: 10, right: 12 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setMenuOpen((o) => !o)}
          style={{
            background: "rgba(0,0,0,0.06)",
            border: "none",
            borderRadius: 8,
            width: 28,
            height: 28,
            cursor: "pointer",
            fontSize: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#666",
          }}
        >
          ⋯
        </button>
        {menuOpen && (
          <div
            style={{
              position: "absolute",
              right: 0,
              top: 32,
              background: "#fff",
              borderRadius: 10,
              boxShadow: "0 8px 24px rgba(0,0,0,0.14)",
              overflow: "hidden",
              zIndex: 10,
              minWidth: 140,
            }}
          >
            {[
              { label: nota.fijada ? "Desfijar" : "Fijar", action: onPin, icon: "📌" },
              { label: "Editar", action: onEdit, icon: "✏️" },
              { label: "Eliminar", action: onDelete, icon: "🗑️", danger: true },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => { item.action(); setMenuOpen(false) }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  width: "100%",
                  background: "none",
                  border: "none",
                  padding: "10px 14px",
                  fontSize: 13,
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: "inherit",
                  color: (item as any).danger ? "#e53e3e" : "#333",
                  transition: "background 0.12s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f5f5")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
              >
                <span>{item.icon}</span> {item.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Title */}
      <h3
        style={{
          margin: 0,
          fontSize: 16,
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontWeight: 700,
          color: "#1a1a1a",
          lineHeight: 1.3,
          paddingRight: 48,
        }}
      >
        {nota.titulo}
      </h3>

      {/* Content preview */}
      {nota.contenido && (
        <p
          style={{
            margin: 0,
            fontSize: 13.5,
            color: "#555",
            fontFamily: "'Palatino Linotype', Palatino, Georgia, serif",
            lineHeight: 1.6,
            display: "-webkit-box",
            WebkitLineClamp: 4,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {nota.contenido}
        </p>
      )}

      {/* Tags */}
      {nota.etiquetas?.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {nota.etiquetas.map((tag) => (
            <TagBadge key={tag} label={tag} onClick={() => onTagClick(tag)} />
          ))}
        </div>
      )}

      {/* Date */}
      <span
        style={{
          fontSize: 11,
          color: "#aaa",
          fontFamily: "inherit",
          letterSpacing: "0.04em",
          marginTop: 4,
        }}
      >
        {formatDate(nota.fecha_modificacion)}
      </span>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────

export default function NotasPage() {
  const { activeTeam, isLoading: teamLoading } = useTeam()

  const [notas, setNotas] = useState<Nota[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [allTags, setAllTags] = useState<string[]>([])
  const [showPinned, setShowPinned] = useState(false)
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Nota | null>(null)

  const teamId = activeTeam?.id

  // Load notes
  async function loadNotas() {
    if (!teamId) return
    try {
      setLoading(true)
      const params: BuscarNotasParams = { team_id: teamId }
      if (search) params.q = search
      if (activeTag) params.etiqueta = activeTag
      if (showPinned) params.fijada = true
      const data = search || activeTag || showPinned
        ? await notasApi.buscar(params)
        : await notasApi.getAll(teamId)
      setNotas(data)
      setError(null)
    } catch {
      setError("No se pudieron cargar las notas.")
    } finally {
      setLoading(false)
    }
  }

  async function loadTags() {
    if (!teamId) return
    try {
      const data = await notasApi.getEtiquetas(teamId)
      setAllTags(data)
    } catch {
      // silently ignore
    }
  }

  useEffect(() => {
    if (teamId) loadNotas()
  }, [teamId, search, activeTag, showPinned])

  useEffect(() => {
    if (teamId) loadTags()
  }, [teamId])

  async function handleSave(data: NotaData) {
    if (editingNote) {
      await notasApi.update(editingNote.id, data)
    } else {
      await notasApi.create(data)
    }
    setEditorOpen(false)
    setEditingNote(null)
    await loadNotas()
    await loadTags()
  }

  async function handleDelete(nota: Nota) {
    if (!confirm(`¿Eliminar "${nota.titulo}"?`)) return
    await notasApi.delete(nota.id)
    setNotas((prev) => prev.filter((n) => n.id !== nota.id))
  }

  async function handlePin(nota: Nota) {
    await notasApi.fijar(nota.id)
    setNotas((prev) =>
      prev.map((n) => (n.id === nota.id ? { ...n, fijada: !n.fijada } : n))
    )
  }

  const pinnedNotas = notas.filter((n) => n.fijada)
  const unpinnedNotas = notas.filter((n) => !n.fijada)

  // Guard: wait for team context
  if (teamLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "'DM Sans', sans-serif", color: "#bbb", fontSize: 15 }}>
        Cargando equipo…
      </div>
    )
  }

  if (!activeTeam) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "'DM Sans', sans-serif", color: "#bbb", fontSize: 15 }}>
        No hay equipo activo. Selecciona uno para continuar.
      </div>
    )
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;600;700&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        body {
          margin: 0;
          background: #F7F5F0;
          font-family: 'DM Sans', sans-serif;
        }

        .notas-root {
          min-height: 100vh;
          background: #F7F5F0;
        }

        @keyframes fadeIn {
          from { opacity: 0 }
          to { opacity: 1 }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px) scale(0.97) }
          to { opacity: 1; transform: translateY(0) scale(1) }
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(10px) }
          to { opacity: 1; transform: translateY(0) }
        }

        .masonry-grid {
          columns: 4 280px;
          column-gap: 16px;
        }
        .masonry-grid > * {
          margin-bottom: 16px;
          animation: cardIn 0.3s ease both;
        }

        .search-input {
          background: #fff;
          border: 2px solid transparent;
          border-radius: 12px;
          padding: 10px 16px;
          font-size: 15px;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          width: 280px;
          transition: border-color 0.2s, box-shadow 0.2s;
          color: #1a1a1a;
        }
        .search-input:focus {
          border-color: #1a1a1a;
          box-shadow: 0 0 0 4px rgba(0,0,0,0.06);
        }
        .search-input::placeholder { color: #aaa; }

        .filter-chip {
          border: 1.5px solid rgba(0,0,0,0.15);
          border-radius: 999px;
          padding: 5px 14px;
          background: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 12.5px;
          cursor: pointer;
          transition: all 0.15s;
          letter-spacing: 0.03em;
          color: #444;
        }
        .filter-chip:hover { background: #f0f0f0; }
        .filter-chip.active {
          background: #1a1a1a;
          color: #fff;
          border-color: #1a1a1a;
        }

        .fab {
          position: fixed;
          bottom: 32px;
          right: 32px;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #1a1a1a;
          color: #fff;
          font-size: 28px;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(0,0,0,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.18s, box-shadow 0.18s;
          z-index: 50;
        }
        .fab:hover {
          transform: scale(1.08);
          box-shadow: 0 8px 24px rgba(0,0,0,0.25);
        }

        .section-label {
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #aaa;
          margin: 0 0 12px;
        }
      `}</style>

      <div className="notas-root">
        {/* Header */}
        <header
          style={{
            background: "#fff",
            borderBottom: "1.5px solid #ede9e3",
            padding: "0 32px",
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 40,
          }}
        >
          <h1
            style={{
              margin: 0,
              fontFamily: "'Lora', Georgia, serif",
              fontSize: 24,
              fontWeight: 700,
              color: "#1a1a1a",
              letterSpacing: "-0.5px",
            }}
          >
            Notas
            <span style={{ fontSize: 13, fontFamily: "'DM Sans', sans-serif", fontWeight: 400, color: "#aaa", marginLeft: 10, letterSpacing: 0 }}>
              {activeTeam.name}
            </span>
          </h1>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <input
              className="search-input"
              placeholder="Buscar notas…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </header>

        {/* Sidebar + Content layout */}
        <div style={{ display: "flex", gap: 0, maxWidth: 1400, margin: "0 auto", padding: "32px 24px" }}>
          {/* Sidebar filters */}
          <aside style={{ width: 200, flexShrink: 0, marginRight: 32 }}>
            <p className="section-label">Filtros</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <button
                className={`filter-chip${!showPinned && !activeTag ? " active" : ""}`}
                onClick={() => { setShowPinned(false); setActiveTag(null) }}
              >
                Todas
              </button>
              <button
                className={`filter-chip${showPinned ? " active" : ""}`}
                onClick={() => { setShowPinned((v) => !v); setActiveTag(null) }}
              >
                📌 Fijadas
              </button>
            </div>

            {allTags.length > 0 && (
              <>
                <p className="section-label" style={{ marginTop: 24 }}>Etiquetas</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      className={`filter-chip${activeTag === tag ? " active" : ""}`}
                      onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </>
            )}
          </aside>

          {/* Notes grid */}
          <main style={{ flex: 1, minWidth: 0 }}>
            {loading ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, color: "#bbb", fontSize: 15 }}>
                Cargando notas…
              </div>
            ) : error ? (
              <div style={{ color: "#e53e3e", textAlign: "center", padding: 40 }}>{error}</div>
            ) : notas.length === 0 ? (
              <div style={{ textAlign: "center", padding: 80, color: "#ccc" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📝</div>
                <p style={{ fontSize: 16, fontFamily: "'Lora', serif" }}>No hay notas aún</p>
                <p style={{ fontSize: 13, color: "#bbb" }}>Crea tu primera nota con el botón +</p>
              </div>
            ) : (
              <>
                {pinnedNotas.length > 0 && (
                  <section style={{ marginBottom: 32 }}>
                    <p className="section-label">📌 Fijadas</p>
                    <div className="masonry-grid">
                      {pinnedNotas.map((nota) => (
                        <NoteCard
                          key={nota.id}
                          nota={nota}
                          onEdit={() => { setEditingNote(nota); setEditorOpen(true) }}
                          onDelete={() => handleDelete(nota)}
                          onPin={() => handlePin(nota)}
                          onTagClick={(tag) => { setActiveTag(tag); setShowPinned(false) }}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {unpinnedNotas.length > 0 && (
                  <section>
                    {pinnedNotas.length > 0 && <p className="section-label">Otras notas</p>}
                    <div className="masonry-grid">
                      {unpinnedNotas.map((nota) => (
                        <NoteCard
                          key={nota.id}
                          nota={nota}
                          onEdit={() => { setEditingNote(nota); setEditorOpen(true) }}
                          onDelete={() => handleDelete(nota)}
                          onPin={() => handlePin(nota)}
                          onTagClick={(tag) => { setActiveTag(tag); setShowPinned(false) }}
                        />
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* FAB */}
      <button
        className="fab"
        title="Nueva nota"
        onClick={() => { setEditingNote(null); setEditorOpen(true) }}
      >
        +
      </button>

      {/* Editor modal */}
      {editorOpen && (
        <NoteEditor
          note={editingNote}
          teamId={activeTeam.id}
          onSave={handleSave}
          onClose={() => { setEditorOpen(false); setEditingNote(null) }}
        />
      )}
    </>
  )
}