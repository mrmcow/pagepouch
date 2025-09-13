'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { LogoIcon } from '@/components/ui/logo'

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      fallback || (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <LogoIcon size={64} />
            </div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      )
    )
  }

  if (!user) {
    return null // Will redirect via useEffect
  }

  return <>{children}</>
}
