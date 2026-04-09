'use client'

import { useEffect } from 'react'
import { ToastProvider } from '@/components/ui/toast'

export function GlobalProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
    }

    document.addEventListener('contextmenu', handleContextMenu)
    return () => document.removeEventListener('contextmenu', handleContextMenu)
  }, [])

  return <ToastProvider>{children}</ToastProvider>
}
