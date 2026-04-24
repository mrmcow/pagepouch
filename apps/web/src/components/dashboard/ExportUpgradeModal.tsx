'use client'

import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { useStripeCheckout } from '@/lib/use-stripe-checkout'
import {
  FileDown,
  Check,
  FileText,
  Table,
  Code,
  BookOpen,
} from 'lucide-react'

interface ExportUpgradeModalProps {
  isOpen: boolean
  onClose: () => void
}

const FORMATS = [
  { icon: BookOpen, label: 'APA / MLA / Chicago', desc: 'Academic citations' },
  { icon: Code, label: 'Markdown', desc: 'Obsidian & docs' },
  { icon: Table, label: 'CSV / Excel', desc: 'Data analysis' },
  { icon: FileText, label: 'HTML / JSON', desc: 'Reports & APIs' },
] as const

const FEATURES = [
  'Bulk export — select clips and download in one click',
  'Auto-formatted citations with metadata',
  'Include screenshots, notes, and timestamps',
  'Flexible sorting by date, title, or folder',
] as const

export function ExportUpgradeModal({ isOpen, onClose }: ExportUpgradeModalProps) {
  const { startCheckout, isLoading } = useStripeCheckout({ source: 'export-upgrade-modal' })

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="
          max-w-lg p-0 overflow-hidden border-slate-200 dark:border-white/10
          gap-0 max-h-[92vh] flex flex-col
          [&>button]:right-3 [&>button]:top-3 [&>button]:h-7 [&>button]:w-7
          [&>button]:rounded-md [&>button]:flex [&>button]:items-center [&>button]:justify-center
          [&>button]:bg-white/10 [&>button:hover]:bg-white/20
          [&>button]:text-white [&>button]:opacity-100 [&>button]:ring-offset-blue-700
        "
      >
        {/* Hero */}
        <div className="relative bg-gradient-to-br from-blue-600 via-blue-600 to-indigo-700 px-6 sm:px-8 pt-8 pb-7 text-center text-white shrink-0">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-white/15 backdrop-blur-sm rounded-2xl mb-4 ring-1 ring-white/20">
            <FileDown className="h-6 w-6" />
          </div>
          <DialogTitle className="text-xl sm:text-2xl font-bold mb-1.5 text-white">
            Professional Export
          </DialogTitle>
          <DialogDescription className="sr-only">
            Upgrade to Pro to export clips as citations, Markdown, CSV, HTML, and JSON with screenshots and notes.
          </DialogDescription>
          <p className="text-blue-100 text-sm leading-relaxed max-w-sm mx-auto">
            Export your research in any format — citations, spreadsheets, reports — with one click.
          </p>
        </div>

        {/* Body (scrollable) */}
        <div className="px-5 sm:px-7 py-5 sm:py-6 space-y-5 overflow-y-auto">
          {/* Formats */}
          <div className="grid grid-cols-2 gap-2.5">
            {FORMATS.map((f) => (
              <div
                key={f.label}
                className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-white/5"
              >
                <f.icon className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-slate-900 dark:text-white leading-tight truncate">
                    {f.label}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Features */}
          <ul className="space-y-1.5">
            {FEATURES.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-2 text-[13px] text-slate-700 dark:text-slate-300"
              >
                <Check className="h-3.5 w-3.5 text-emerald-500 mt-1 shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Pricing footer (sticky to modal bottom for tall content) */}
        <UpgradeFooter
          subtitle="Export + Page Graphs + 1,000 clips/mo"
          startCheckout={startCheckout}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  )
}

interface UpgradeFooterProps {
  subtitle: string
  startCheckout: (plan: 'monthly' | 'annual') => Promise<void> | void
  isLoading: boolean
}

function UpgradeFooter({ subtitle, startCheckout, isLoading }: UpgradeFooterProps) {
  return (
    <div className="border-t border-slate-100 dark:border-white/5 bg-white dark:bg-slate-950 px-5 sm:px-7 py-4 sm:py-5 shrink-0">
      <div className="mb-3">
        <p className="text-[15px] font-bold text-slate-900 dark:text-white leading-tight">
          PageStash Pro
        </p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
      </div>

      <button
        onClick={() => startCheckout('annual')}
        disabled={isLoading}
        className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-70 text-white px-4 py-2.5 text-sm font-semibold transition-all flex flex-col items-center leading-tight"
      >
        <span>{isLoading ? 'Redirecting…' : 'Go Pro — $10/mo'}</span>
        <span className="text-[10px] font-medium opacity-85 mt-0.5">
          billed annually · save 17%
        </span>
      </button>

      <p className="text-[10.5px] text-center text-slate-400 dark:text-slate-500 mt-3">
        30-day money-back guarantee · Cancel anytime · Secured by Stripe
      </p>
    </div>
  )
}
