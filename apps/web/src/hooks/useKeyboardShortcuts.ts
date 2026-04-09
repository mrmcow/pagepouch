'use client'

import { useEffect } from 'react'

interface ShortcutHandlers {
  focusSearch?: () => void
  escape?: () => void
  prev?: () => void
  next?: () => void
  toggleFavorite?: () => void
  viewerOpen?: boolean
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers): void {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const isInInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)

      // Cmd/Ctrl+K → focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        handlers.focusSearch?.()
        return
      }

      // Escape → close viewer or clear search
      if (e.key === 'Escape') {
        handlers.escape?.()
        return
      }

      // Viewer-only shortcuts — skip when focus is in an input
      if (!handlers.viewerOpen) return

      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        handlers.prev?.()
        return
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault()
        handlers.next?.()
        return
      }

      if ((e.key === 'f' || e.key === 'F') && !isInInput && !e.metaKey && !e.ctrlKey) {
        handlers.toggleFavorite?.()
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handlers])
}
