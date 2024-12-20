"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"


export function ModeToggle() {
  const { setTheme: applyTheme } = useTheme()
  const [theme, setTheme] = React.useState('system')

  const commitTheme = React.useCallback((theme: string) => {
    setTheme(theme)
    applyTheme(theme)
    localStorage.setItem('theme', theme)
  }, [applyTheme])

  React.useEffect(() => {
    const currentTheme = localStorage.getItem('theme')
    if (currentTheme) {
      commitTheme(currentTheme)
    } else {
      commitTheme('system')
    }
  }, [commitTheme])


  const handleThemeChange = () => {
    if (theme === 'light') {
      commitTheme('dark')
    } else {
      commitTheme('light')
    }
  }

  return (
    <Button variant="outline" size="icon" onClick={handleThemeChange} className="w-8 h-8 bg-transparent border-transparent text-foreground hover:bg-transparent hover:text-foreground md:shadow-none"
    >
      <Sun className="md:h-[1.2rem] md:w-[1.2rem] h-2 w-2 rotate-0 scale-0 transition-all dark:-rotate-0 dark:scale-110" size={32}/>
      <Moon className="absolute md:h-[1.2rem] md:w-[1.2rem] h-2 w-2 rotate-0 scale-110 transition-all dark:rotate-90 dark:scale-0" size={32}/>
      <span className="sr-only">Toggle theme</span>
    </Button >

  )
}
