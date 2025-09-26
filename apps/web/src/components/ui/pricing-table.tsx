'use client'

import { Check, Crown } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UpgradeButton } from '@/components/ui/upgrade-button'

interface PricingTableProps {
  currentTier?: 'free' | 'pro'
  showFree?: boolean
}

export function PricingTable({ currentTier = 'free', showFree = true }: PricingTableProps) {
  const plans = [
    ...(showFree ? [{
      id: 'free',
      name: 'Free',
      description: 'Perfect for trying PagePouch',
      price: '$0',
      period: 'forever',
      features: [
        '50 clips per month',
        '100MB storage',
        'Basic folders & tags',
        'Full-text search',
        'Chrome & Firefox extensions',
      ],
      current: currentTier === 'free',
    }] : []),
    {
      id: 'pro-monthly',
      name: 'Pro',
      description: 'For serious researchers & analysts',
      price: '$4',
      period: 'month',
      originalPrice: null,
      features: [
        '1,000 clips per month',
        '5GB storage',
        'Unlimited folders & tags',
        'Advanced search & filters',
        'Export & backup',
        'Priority support',
      ],
      popular: true,
      current: currentTier === 'pro',
    },
    {
      id: 'pro-annual',
      name: 'Pro Annual',
      description: 'Save 2 months with annual billing',
      price: '$40',
      period: 'year',
      originalPrice: '$48',
      features: [
        '1,000 clips per month',
        '5GB storage',
        'Unlimited folders & tags',
        'Advanced search & filters',
        'Export & backup',
        'Priority support',
        '2 months free',
      ],
      badge: 'Best Value',
      current: currentTier === 'pro',
    },
  ]

  return (
    <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
      {plans.map((plan) => (
        <Card 
          key={plan.id} 
          className={`relative ${plan.popular ? 'border-blue-500 shadow-lg scale-105' : ''} ${plan.current ? 'border-green-500' : ''}`}
        >
          {plan.badge && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge variant="default" className="bg-blue-500 text-white">
                {plan.badge}
              </Badge>
            </div>
          )}
          
          {plan.current && (
            <div className="absolute -top-3 right-4">
              <Badge variant="default" className="bg-green-500 text-white">
                Current Plan
              </Badge>
            </div>
          )}

          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl">
              {plan.name}
              {plan.popular && <Crown className="inline ml-2 h-5 w-5 text-yellow-500" />}
            </CardTitle>
            <CardDescription>{plan.description}</CardDescription>
            
            <div className="mt-4">
              <div className="flex items-baseline justify-center">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground ml-1">/{plan.period}</span>
              </div>
              
              {plan.originalPrice && (
                <div className="text-sm text-muted-foreground mt-1">
                  <span className="line-through">{plan.originalPrice}/year</span>
                  <span className="text-green-600 ml-2 font-medium">Save $8</span>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="pt-2">
            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="h-4 w-4 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            {plan.id === 'free' ? (
              <div className="text-center text-sm text-muted-foreground">
                {currentTier === 'free' ? 'Your current plan' : 'Always free'}
              </div>
            ) : plan.current ? (
              <div className="text-center">
                <Badge variant="outline" className="text-green-600 border-green-600">
                  Current Plan
                </Badge>
              </div>
            ) : (
              <UpgradeButton
                plan={plan.id === 'pro-annual' ? 'annual' : 'monthly'}
                className="w-full"
                variant={plan.popular ? 'default' : 'outline'}
              >
                {plan.id === 'pro-annual' ? 'Upgrade to Annual' : 'Upgrade to Pro'}
              </UpgradeButton>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
