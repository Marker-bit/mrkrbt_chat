"use client"

import { createContext, useContext, useEffect, useState } from "react"

type Color = "pink" | "neutral"

type ColorProviderProps = {
  children: React.ReactNode
  defaultColor?: Color
  storageKey?: string
}

type ColorProviderState = {
  color: Color
  setColor: (color: Color) => void
}

const initialState: ColorProviderState = {
  color: "neutral",
  setColor: () => null,
}

const ColorProviderContext = createContext<ColorProviderState>(initialState)

export function ColorProvider({
  children,
  defaultColor = "neutral",
  storageKey = "chat-color",
  ...props
}: ColorProviderProps) {
  const [color, setColor] = useState<Color>(defaultColor)

  useEffect(() => {
    setColor((window.localStorage.getItem(storageKey) as Color) || defaultColor)
  }, [])

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove("pink", "neutral")

    root.classList.add(color)
  }, [color])

  const value = {
    color,
    setColor: (color: Color) => {
      localStorage.setItem(storageKey, color)
      setColor(color)
    },
  }

  return (
    <ColorProviderContext.Provider {...props} value={value}>
      {children}
    </ColorProviderContext.Provider>
  )
}

export const useColor = () => {
  const context = useContext(ColorProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
