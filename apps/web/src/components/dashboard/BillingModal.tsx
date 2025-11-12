'use client'

import { useState } from 'react'
import { CreditCard, ExternalLink, Calendar, DollarSign } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
// import { Separator } from '@/components/ui/separator'

interface BillingModalProps {
  isOpen: boolean
  onClose: () => void
  user: {
    id: string
    email: string
  }
  subscriptionData?: {
    subscriptionTier: 'free' | 'pro'
    subscriptionStatus: string
    clipsThisMonth: number
    clipsLimit: number
  }
}

export function BillingModal({ isOpen, onClose, user, subscriptionData }: BillingModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleManageBilling = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to create billing portal session')
      }

      const { url } = await response.json()
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Billing portal error:', error)
      alert('Failed to open billing portal. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpgrade = async (plan: 'monthly' | 'annual') => {
    setIsLoading(true)
    try {
      const priceId = plan === 'monthly' 
        ? 'price_1SBSLeDFfW8f5SmSgQooVxsd' // Monthly price ID
        : 'price_1SBSNpDFfW8f5SmShv3v8v8Q' // Annual price ID

      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          plan,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { url } = await response.json()
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Upgrade error:', error)
      alert('Failed to start upgrade process. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (tier: string, status: string) => {
    if (tier === 'pro' && status === 'active') {
      return <Badge variant="default">Pro - Active</Badge>
    }
    if (tier === 'pro' && status !== 'active') {
      return <Badge variant="destructive">Pro - {status}</Badge>
    }
    return <Badge variant="secondary">Free Plan</Badge>
  }

  const getPlanFeatures = (tier: 'free' | 'pro') => {
    if (tier === 'pro') {
      return [
        '1,000 clips per month',
        '5GB storage',
        'Priority support',
        'Advanced features'
      ]
    }
    return [
      '10 clips per month',
      '100MB storage',
      'Basic features'
    ]
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Billing & Subscription</DialogTitle>
          <DialogDescription>
            Manage your subscription and billing information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Plan */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Current Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                {subscriptionData && getStatusBadge(subscriptionData.subscriptionTier, subscriptionData.subscriptionStatus)}
              </div>

              {subscriptionData && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Usage this month</span>
                    <span className="text-sm text-muted-foreground">
                      {subscriptionData.clipsThisMonth}/{subscriptionData.clipsLimit} clips
                    </span>
                  </div>

                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ 
                        width: `${Math.min((subscriptionData.clipsThisMonth / subscriptionData.clipsLimit) * 100, 100)}%` 
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Plan Features:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {getPlanFeatures(subscriptionData.subscriptionTier).map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Billing Management */}
          {subscriptionData?.subscriptionTier === 'pro' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Billing Management</CardTitle>
                <CardDescription>
                  Manage your payment methods, view invoices, and update billing information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={handleManageBilling}
                  disabled={isLoading}
                  className="w-full"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  {isLoading ? 'Opening...' : 'Manage Billing & Invoices'}
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  This will open Stripe's secure billing portal where you can update payment methods, 
                  view invoices, and manage your subscription.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Upgrade Options */}
          {subscriptionData?.subscriptionTier === 'free' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upgrade to Pro</CardTitle>
                <CardDescription>
                  Get more clips, storage, and advanced features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border-2">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Monthly</CardTitle>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold">$12</span>
                        <span className="text-sm text-muted-foreground">/month</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        onClick={() => handleUpgrade('monthly')}
                        disabled={isLoading}
                        className="w-full"
                      >
                        Upgrade Monthly
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-primary">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        Annual
                        <Badge variant="secondary" className="text-xs">Save 17%</Badge>
                      </CardTitle>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold">$120</span>
                        <span className="text-sm text-muted-foreground">/year</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        $10/month
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        onClick={() => handleUpgrade('annual')}
                        disabled={isLoading}
                        className="w-full"
                      >
                        Upgrade Annual
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
