'use client'

import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { useStripeCheckout } from '@/lib/use-stripe-checkout'
import {
  Check,
  Network,
  Search,
  Eye,
  LayoutGrid,
} from 'lucide-react'

interface KnowledgeGraphUpgradeModalProps {
  isOpen: boolean
  onClose: () => void
}

const CAPABILITIES = [
  { icon: Network,    title: 'Source mapping',     desc: 'See which domains and topics cluster across your captures.' },
  { icon: Search,     title: 'Visual exploration', desc: 'Navigate connections, zoom into clusters, click to open clips.' },
  { icon: Eye,        title: 'Auto-insights',      desc: 'Instant summaries — “Your most-used source: nytimes.com (8 clips)”.' },
  { icon: LayoutGrid, title: 'Multiple views',     desc: 'Filter by website, topic, tag, or time period.' },
] as const

const PRO_FEATURES = [
  'Page Graphs with connection discovery',
  'Professional export (APA, Markdown, CSV, HTML)',
  '1,000 clips per month · 5 GB storage',
  'Priority support',
] as const

export function KnowledgeGraphUpgradeModal({ isOpen, onClose }: KnowledgeGraphUpgradeModalProps) {
  const { startCheckout, isLoading } = useStripeCheckout({ source: 'knowledge-graph-upgrade-modal' })

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="
          max-w-lg p-0 overflow-hidden border-slate-200 dark:border-white/10
          gap-0 max-h-[92vh] flex flex-col
          [&>button]:right-3 [&>button]:top-3 [&>button]:h-7 [&>button]:w-7
          [&>button]:rounded-md [&>button]:flex [&>button]:items-center [&>button]:justify-center
          [&>button]:bg-white/10 [&>button:hover]:bg-white/15
          [&>button]:text-white [&>button]:opacity-100 [&>button]:ring-offset-slate-900
        "
      >
        {/* Hero */}
        <div className="relative bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 px-6 sm:px-8 pt-8 pb-6 text-center text-white shrink-0 overflow-hidden">
          {/* Faint grid backdrop */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.06] bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:24px_24px]"
          />
          <div className="relative">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl mb-4 ring-1 ring-white/15">
              <Network className="h-6 w-6 text-blue-300" />
            </div>
            <DialogTitle className="text-xl sm:text-2xl font-bold mb-1.5 text-white">
              Page Graphs
            </DialogTitle>
            <DialogDescription className="sr-only">
              Upgrade to Pro to visualize connections between your saved pages, sources, and tags.
            </DialogDescription>
            <p className="text-slate-300 text-sm leading-relaxed max-w-sm mx-auto">
              See how your research connects. Discover patterns across everything you’ve captured.
            </p>

            {/* Abstract preview */}
            <div className="mt-5 mx-auto max-w-[260px] sm:max-w-xs">
              <svg viewBox="0 0 300 96" className="w-full h-20" fill="none" aria-hidden>
                <line x1="150" y1="48" x2="70"  y2="24" stroke="#475569" strokeWidth="1" />
                <line x1="150" y1="48" x2="230" y2="24" stroke="#475569" strokeWidth="1" />
                <line x1="150" y1="48" x2="110" y2="76" stroke="#475569" strokeWidth="1" />
                <line x1="150" y1="48" x2="190" y2="76" stroke="#475569" strokeWidth="1" />
                <line x1="70"  y1="24" x2="50"  y2="72" stroke="#334155" strokeWidth="1" />
                <line x1="230" y1="24" x2="250" y2="72" stroke="#334155" strokeWidth="1" />
                <line x1="110" y1="76" x2="50"  y2="72" stroke="#334155" strokeWidth="1" />
                <line x1="190" y1="76" x2="250" y2="72" stroke="#334155" strokeWidth="1" />
                <circle cx="150" cy="48" r="11" fill="#3b82f6" />
                <circle cx="70"  cy="24" r="7"  fill="#60a5fa" />
                <circle cx="230" cy="24" r="7"  fill="#60a5fa" />
                <circle cx="50"  cy="72" r="5"  fill="#93c5fd" />
                <circle cx="250" cy="72" r="5"  fill="#93c5fd" />
                <circle cx="110" cy="76" r="6"  fill="#60a5fa" />
                <circle cx="190" cy="76" r="6"  fill="#60a5fa" />
              </svg>
            </div>
          </div>
        </div>

        {/* Body (scrollable) */}
        <div className="px-5 sm:px-7 py-5 sm:py-6 space-y-5 overflow-y-auto">
          <ul className="space-y-3">
            {CAPABILITIES.map((c) => (
              <li key={c.title} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0 mt-0.5">
                  <c.icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-slate-900 dark:text-white">
                    {c.title}
                  </p>
                  <p className="text-[12px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    {c.desc}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <ul className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-white/5">
            <li className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 pt-3 mb-1">
              Everything in Free, plus
            </li>
            {PRO_FEATURES.map((f) => (
              <li
                key={f}
                className="flex items-center gap-2 text-[13px] text-slate-700 dark:text-slate-300"
              >
                <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Pricing footer */}
        <div className="border-t border-slate-100 dark:border-white/5 bg-white dark:bg-slate-950 px-5 sm:px-7 py-4 sm:py-5 shrink-0">
          <div className="mb-3">
            <p className="text-[15px] font-bold text-slate-900 dark:text-white leading-tight">
              PageStash Pro
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Page Graphs + Export + 1,000 clips/mo
            </p>
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
      </DialogContent>
    </Dialog>
  )
}
