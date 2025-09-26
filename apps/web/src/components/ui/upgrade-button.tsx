'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { createCheckoutSession } from '@/lib/stripe-client'
import { Loader2, Crown } from 'lucide-react'

interface UpgradeButtonProps {
  plan: 'monthly' | 'annual'
  children?: React.ReactNode
  className?: string
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function UpgradeButton({ 
  plan, 
  children, 
  className,
  variant = 'default',
  size = 'default'
}: UpgradeButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleUpgrade = async () => {
    try {
      setIsLoading(true)
      
      const { url } = await createCheckoutSession(plan)
      
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Upgrade error:', error)
      // TODO: Show error toast
      alert('Failed to start upgrade process. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleUpgrade}
      disabled={isLoading}
      className={className}
      variant={variant}
      size={size}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          {children || (
            <>
              <Crown className="mr-2 h-4 w-4" />
              Upgrade to Pro
            </>
          )}
        </>
      )}
    </Button>
  )
}
