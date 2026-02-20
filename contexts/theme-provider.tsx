"use client"

import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light"

interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  toggleTheme: () => {},
})

export function useTheme() {
  return useContext(ThemeContext)
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark")
  const [mounted, setMounted] = useState(false)

  // On mount: read from localStorage (or default to dark)
  useEffect(() => {
    const stored = localStorage.getItem("axol-theme") as Theme | null
    const resolved = stored ?? "dark"
    setTheme(resolved)
    applyTheme(resolved)
    setMounted(true)
  }, [])

  function applyTheme(t: Theme) {
    const html = document.documentElement
    if (t === "dark") {
      html.classList.add("dark")
    } else {
      html.classList.remove("dark")
    }
  }

  function toggleTheme() {
    const next: Theme = theme === "dark" ? "light" : "dark"
    setTheme(next)
    applyTheme(next)
    localStorage.setItem("axol-theme", next)
  }

  // Avoid hydration mismatch: render children only after mount
  if (!mounted) {
    return (
      <div style={{ visibility: "hidden" }} aria-hidden>
        {children}
      </div>
    )
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}