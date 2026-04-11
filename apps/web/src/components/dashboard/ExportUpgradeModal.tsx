'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  FileDown,
  ArrowRight,
  Check,
  X,
  FileText,
  Table,
  Code,
  BookOpen,
  Sparkles
} from 'lucide-react'

interface ExportUpgradeModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ExportUpgradeModal({ isOpen, onClose }: ExportUpgradeModalProps) {
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

  const formats = [
    { icon: BookOpen, label: 'APA / MLA / Chicago', desc: 'Academic citations' },
    { icon: Code, label: 'Markdown', desc: 'For Obsidian & docs' },
    { icon: Table, label: 'CSV / Excel', desc: 'Data analysis' },
    { icon: FileText, label: 'HTML / JSON', desc: 'Reports & APIs' },
  ]

  const features = [
    'Bulk export — select clips and download in one click',
    'Auto-formatted citations with metadata',
    'Include screenshots, notes, and timestamps',
    'Flexible sorting by date, title, or folder',
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-0 overflow-hidden border-slate-200 dark:border-white/10">
        {/* Hero */}
        <div className="relative bg-gradient-to-b from-blue-600 to-blue-700 px-8 pt-10 pb-8 text-center text-white">
          <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-white/10 transition-colors">
            <X className="h-4 w-4" />
          </button>
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white/15 backdrop-blur rounded-2xl mb-5">
            <FileDown className="h-7 w-7" />
          </div>
          <DialogTitle className="text-2xl font-bold mb-2 text-white">Professional Export</DialogTitle>
          <p className="text-blue-100 text-sm leading-relaxed max-w-sm mx-auto">
            Export your research in any format — citations, spreadsheets, reports — with one click.
          </p>
        </div>

        <div className="px-8 py-6 space-y-6">
          {/* Formats */}
          <div className="grid grid-cols-2 gap-3">
            {formats.map((f) => (
              <div key={f.label} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-white/5">
                <f.icon className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">{f.label}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Features */}
          <div className="space-y-2">
            {features.map((f) => (
              <div key={f} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <span>{f}</span>
              </div>
            ))}
          </div>

          {/* Pricing */}
          <div className="border-t border-slate-100 dark:border-white/5 pt-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-lg font-bold text-slate-900 dark:text-white">PageStash Pro</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Export + Page Graphs + 1,000 clips/mo</p>
              </div>
              <Badge variant="secondary" className="text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                Pro
              </Badge>
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
