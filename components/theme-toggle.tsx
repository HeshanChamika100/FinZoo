"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

interface ThemeToggleProps {
  className?: string
  isOverHero?: boolean
  variant?: string
}

export function ThemeToggle({ className, isOverHero, variant }: ThemeToggleProps) {
  const { setTheme, theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={`${className || ''} ${
          variant === 'white'
            ? 'text-foreground hover:bg-accent'
            : isOverHero
              ? 'text-white hover:text-white hover:bg-white/10'
              : 'text-foreground hover:bg-accent'
        }`}
      >
        <div className="h-5 w-5" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className={`relative ${className || ''} ${
        variant === 'white'
          ? 'text-foreground hover:bg-accent'
          : isOverHero
            ? 'text-white hover:text-white hover:bg-white/10'
            : 'text-foreground hover:bg-accent'
      }`}
      onClick={() => setTheme(resolvedTheme === "light" ? "dark" : "light")}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
