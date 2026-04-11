'use client'

import { useState, useEffect } from 'react'

const STORAGE_KEY = 'pagestash-theme'

export function useDarkMode(): [boolean, () => void] {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    // Default light for marketing + first visit; only dark if user explicitly chose it
    const initial = stored === 'dark'
    setIsDark(initial)
    if (initial) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  const toggle = () => {
    setIsDark(prev => {
      const next = !prev
      localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light')
      if (next) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      return next
    })
  }

  return [isDark, toggle]
}
