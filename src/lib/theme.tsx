'use client'
import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light'
const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({ theme: 'dark', toggle: () => {} })

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Dark by default; a visitor's saved choice (set via the toggle) wins.
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    let saved: string | null = null
    try { saved = localStorage.getItem('theme') } catch {}
    if (saved === 'light' || saved === 'dark') { setTheme(saved); document.documentElement.setAttribute('data-theme', saved) }
  }, [])

  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    try { localStorage.setItem('theme', next) } catch {}
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
