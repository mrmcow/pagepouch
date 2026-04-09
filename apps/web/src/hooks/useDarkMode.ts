'use client'

import { useState, useEffect } from 'react'

const STORAGE_KEY = 'pagestash-theme'

export function useDarkMode(): [boolean, () => void] {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const initial = stored ? stored === 'dark' : prefersDark
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
