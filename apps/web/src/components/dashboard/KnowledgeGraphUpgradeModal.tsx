'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowRight,
  Check,
  X,
  Network,
  Search,
  Sparkles,
  Eye,
  LayoutGrid
} from 'lucide-react'

interface KnowledgeGraphUpgradeModalProps {
  isOpen: boolean
  onClose: () => void
}

export function KnowledgeGraphUpgradeModal({ isOpen, onClose }: KnowledgeGraphUpgradeModalProps) {
  const [isUpgrading, setIsUpgrading] = useState(false)

  const handleUpgrade = async (plan: 'monthly' | 'annual') => {
    setIsUpgrading(true)
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: plan === 'monthly' ? 'price_1SBSLeDFfW8f5SmSgQooVxsd' : 'price_1SBSNpDFfW8f5SmShv3v8v8Q',
          plan,
        }),
      })
      const { url } = await response.json()
      if (url) window.location.href = url
    } catch {
      // Stripe errors handled by checkout page
    } finally {
      setIsUpgrading(false)
    }
  }

  const capabilities = [
    { icon: Network, title: 'Source mapping', desc: 'See which domains and topics cluster across your captures' },
    { icon: Search, title: 'Visual exploration', desc: 'Navigate connections, zoom into clusters, click to open clips' },
    { icon: Eye, title: 'Auto-insights', desc: 'Instant summaries like "Your most-used source: nytimes.com (8 clips)"' },
    { icon: LayoutGrid, title: 'Multiple views', desc: 'Filter by website, topic, tag, or time period' },
  ]

  const proFeatures = [
    'Page Graphs with connection discovery',
    'Professional export (APA, Markdown, CSV, HTML)',
    '1,000 clips per month',
    '5 GB storage',
    'Priority support',
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-0 overflow-hidden border-slate-200 dark:border-white/10">
        {/* Hero */}
        <div className="relative bg-gradient-to-b from-slate-900 to-slate-800 px-8 pt-10 pb-8 text-center text-white">
          <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-white/10 transition-colors">
            <X className="h-4 w-4" />
          </button>
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white/10 backdrop-blur rounded-2xl mb-5">
            <Network className="h-7 w-7" />
          </div>
          <DialogTitle className="text-2xl font-bold mb-2 text-white">Page Graphs</DialogTitle>
          <DialogDescription className="sr-only">
            Upgrade to Pro to visualize connections between your saved pages, sources, and tags.
          </DialogDescription>
          <p className="text-slate-300 text-sm leading-relaxed max-w-sm mx-auto">
            See how your research connects. Discover patterns across everything you've captured.
          </p>

          {/* Abstract graph preview */}
          <div className="mt-6 relative h-24 max-w-xs mx-auto">
            <svg width="100%" height="100%" viewBox="0 0 300 96" fill="none" className="opacity-60">
              <circle cx="150" cy="48" r="12" fill="#3b82f6" />
              <circle cx="70" cy="24" r="8" fill="#60a5fa" />
              <circle cx="230" cy="24" r="8" fill="#60a5fa" />
              <circle cx="50" cy="72" r="6" fill="#93c5fd" />
              <circle cx="250" cy="72" r="6" fill="#93c5fd" />
              <circle cx="110" cy="76" r="7" fill="#60a5fa" />
              <circle cx="190" cy="76" r="7" fill="#60a5fa" />
              <line x1="150" y1="48" x2="70" y2="24" stroke="#475569" strokeWidth="1" />
              <line x1="150" y1="48" x2="230" y2="24" stroke="#475569" strokeWidth="1" />
              <line x1="150" y1="48" x2="110" y2="76" stroke="#475569" strokeWidth="1" />
              <line x1="150" y1="48" x2="190" y2="76" stroke="#475569" strokeWidth="1" />
              <line x1="70" y1="24" x2="50" y2="72" stroke="#334155" strokeWidth="1" />
              <line x1="230" y1="24" x2="250" y2="72" stroke="#334155" strokeWidth="1" />
              <line x1="110" y1="76" x2="50" y2="72" stroke="#334155" strokeWidth="1" />
              <line x1="190" y1="76" x2="250" y2="72" stroke="#334155" strokeWidth="1" />
            </svg>
          </div>
        </div>

        <div className="px-8 py-6 space-y-6">
          {/* Capabilities */}
          <div className="space-y-3">
            {capabilities.map((c) => (
              <div key={c.title} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0 mt-0.5">
                  <c.icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{c.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing */}
          <div className="border-t border-slate-100 dark:border-white/5 pt-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-lg font-bold text-slate-900 dark:text-white">PageStash Pro</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Everything in Free, plus:</p>
              </div>
              <Badge variant="secondary" className="text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                Pro
              </Badge>
            </div>

            <div className="space-y-1.5 mb-5">
              {proFeatures.map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => handleUpgrade('monthly')}
                disabled={isUpgrading}
                className="h-12 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white rounded-xl font-semibold"
              >
                <div className="text-center">
                  <div className="text-sm">{isUpgrading ? 'Processing...' : '$12/month'}</div>
                </div>
              </Button>
              <Button
                onClick={() => handleUpgrade('annual')}
                disabled={isUpgrading}
                className="h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold relative"
              >
                <div className="text-center">
                  <div className="text-sm">{isUpgrading ? 'Processing...' : '$120/year'}</div>
                  <div className="text-[10px] opacity-80 font-normal">Save $24</div>
                </div>
              </Button>
            </div>

            <p className="text-[11px] text-center text-slate-400 dark:text-slate-500 mt-3">
              30-day money-back guarantee · Cancel anytime · Stripe
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
