'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LogoIcon } from '@/components/ui/logo'
import {
  SearchIcon,
  FolderIcon,
  DownloadIcon,
  ArrowRightIcon,
  CheckIcon,
  Star,
  X,
  Copy,
  ExternalLink,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type LpProductClipDef = {
  title: string
  domain: string
  folder: string
  date: string
  letter: string
  favClass: string
  starred: boolean
  mode: 'gradient' | 'html'
  gradient: string
  /** Unsplash (or other allowed) photo — reads like a real capture thumbnail. */
  thumbSrc: string
  thumbAlt: string
  sourceUrl: string
  captured: string
  nav: string
  previewTab: 'screenshot' | 'html' | 'text'
  kind: 'bbc' | 'techcrunch' | 'bloomberg'
}

const LP_PRODUCT_CLIPS: readonly LpProductClipDef[] = [
  {
    title: 'Starbucks to close some US and UK stores',
    domain: 'bbc.com',
    folder: 'Inbox',
    date: 'Apr 24',
    letter: 'B',
    favClass: 'bg-[#c80000]',
    starred: true,
    mode: 'gradient',
    gradient: 'from-zinc-800 via-stone-700 to-amber-950/60',
    thumbSrc:
      'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=800&q=80',
    thumbAlt: 'Coffee shop interior',
    sourceUrl: 'https://www.bbc.com/news/business-12345678',
    captured: '4/24/2026, 9:32:28 PM',
    nav: '1 of 50',
    previewTab: 'screenshot',
    kind: 'bbc',
  },
  {
    title: 'The Future of AI Research: Breaking New Ground',
    domain: 'techcrunch.com',
    folder: 'Research',
    date: 'Apr 22',
    letter: 'T',
    favClass: 'bg-emerald-600',
    starred: false,
    mode: 'html',
    gradient: '',
    thumbSrc:
      'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80',
    thumbAlt: 'Abstract AI visualization',
    sourceUrl: 'https://techcrunch.com/2026/04/22/future-ai-research',
    captured: '4/22/2026, 2:34:11 PM',
    nav: '6 of 10',
    previewTab: 'html',
    kind: 'techcrunch',
  },
  {
    title: 'Tech Stocks Rally on Strong Earnings Reports',
    domain: 'bloomberg.com',
    folder: 'Market Analysis',
    date: 'Apr 18',
    letter: 'B',
    favClass: 'bg-blue-800',
    starred: true,
    mode: 'gradient',
    gradient: 'from-slate-900 via-indigo-950/80 to-slate-800',
    thumbSrc:
      'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
    thumbAlt: 'Financial charts on monitors',
    sourceUrl: 'https://www.bloomberg.com/news/articles/2026-04-18/tech-stocks',
    captured: '4/18/2026, 11:05:00 AM',
    nav: '3 of 50',
    previewTab: 'screenshot',
    kind: 'bloomberg',
  },
]

function ProductClipPreviewPanel({
  clip,
  compact,
  onClose,
}: {
  clip: LpProductClipDef
  compact: boolean
  onClose: () => void
}) {
  const c = compact
  const [tab, setTab] = useState<'screenshot' | 'html' | 'text' | 'md' | 'entities'>(clip.previewTab)

  const tabs = (
    [
      { id: 'screenshot' as const, label: 'Screenshot' },
      { id: 'html' as const, label: 'HTML' },
      { id: 'text' as const, label: 'Text' },
      { id: 'md' as const, label: '.md' },
      { id: 'entities' as const, label: 'Entities' },
    ] as const
  ).map((t) => (
    <button
      key={t.id}
      type="button"
      onClick={() => setTab(t.id)}
      className={cn(
        'shrink-0 border-b-2 px-2 py-1.5 text-left font-medium transition sm:px-3',
        c ? 'text-[10px]' : 'text-xs',
        tab === t.id
          ? 'border-blue-600 text-slate-900 dark:border-blue-400 dark:text-white'
          : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200',
      )}
    >
      {t.label}
    </button>
  ))

  return (
    <div
      className={cn(
        'absolute inset-0 z-[35] flex flex-col bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100',
        c ? 'min-h-[min(520px,72vh)]' : 'min-h-[560px]',
      )}
      role="dialog"
      aria-modal="true"
      aria-label="Clip preview"
    >
      <div
        className={cn(
          'flex shrink-0 items-center justify-between gap-2 border-b border-slate-200 bg-slate-50/90 dark:border-white/10 dark:bg-slate-900/90',
          c ? 'px-2 py-2 sm:px-3' : 'px-4 py-3',
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <div className={cn('flex items-center gap-1 text-slate-500 dark:text-slate-400', c ? 'text-[10px]' : 'text-xs')}>
            <button type="button" className="rounded p-0.5 hover:bg-slate-200 dark:hover:bg-slate-800" aria-label="Previous clip">
              <ChevronLeft className={c ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
            </button>
            <span className="tabular-nums">{clip.nav}</span>
            <button type="button" className="rounded p-0.5 hover:bg-slate-200 dark:hover:bg-slate-800" aria-label="Next clip">
              <ChevronRight className={c ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
            </button>
          </div>
          <div className={cn('flex min-w-0 items-center gap-1.5 text-slate-600 dark:text-slate-300', c ? 'text-[10px]' : 'text-xs')}>
            <FolderIcon className={cn('shrink-0 text-slate-400', c ? 'h-3 w-3' : 'h-3.5 w-3.5')} aria-hidden />
            <span className="truncate font-medium">{clip.folder}</span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
          <button
            type="button"
            className={cn('rounded-lg p-1.5 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800', c && 'p-1')}
            aria-label="Copy"
          >
            <Copy className={c ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
          </button>
          <button
            type="button"
            className={cn(
              'hidden items-center gap-1 rounded-lg px-2 py-1 text-slate-600 hover:bg-slate-200 sm:inline-flex dark:text-slate-300 dark:hover:bg-slate-800',
              c ? 'text-[10px]' : 'text-xs',
            )}
          >
            <span>Open Original</span>
            <ExternalLink className="h-3 w-3" />
          </button>
          <button type="button" className={cn('rounded-lg p-1.5 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800', c && 'p-1')} aria-label="More">
            <MoreHorizontal className={c ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
          </button>
          <button
            type="button"
            onClick={onClose}
            className={cn('rounded-lg p-1.5 text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800', c && 'p-1')}
            aria-label="Close preview"
          >
            <X className={c ? 'h-4 w-4' : 'h-5 w-5'} />
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col border-slate-200 dark:border-white/10 lg:border-r">
          <div className={cn('flex flex-wrap gap-0 border-b border-slate-200 dark:border-white/10', c ? 'px-1' : 'px-2')}>{tabs}</div>
          {tab === 'screenshot' ? (
            <div className={cn('border-b border-slate-100 bg-slate-50/80 px-3 py-2 dark:border-white/5 dark:bg-slate-900/50', c && 'px-2 py-1.5')}>
              <p className={cn('text-slate-500 dark:text-slate-400', c ? 'text-[9px]' : 'text-[11px]')}>
                Draw on image to annotate — same tools as in the app.
              </p>
            </div>
          ) : null}
          <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/50 p-3 dark:bg-slate-900/40 sm:p-4">
            {tab === 'html' || tab === 'text' || tab === 'md' || tab === 'entities' ? (
              <div className="mx-auto max-w-lg rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <p className={cn('font-semibold text-slate-900 dark:text-white', c ? 'text-sm' : 'text-base')}>{clip.title}</p>
                <p className={cn('mt-2 text-slate-600 dark:text-slate-400', c ? 'text-xs' : 'text-sm')}>
                  {tab === 'html'
                    ? 'HTML capture — structure and styles preserved from the live page.'
                    : tab === 'text'
                      ? 'Plain text extracted for search and quoting.'
                      : tab === 'md'
                        ? 'Markdown export preview — headings, links, and lists preserved.'
                        : 'Entities panel — dates, people, and places the app detected (illustrative).'}
                </p>
              </div>
            ) : clip.kind === 'bbc' ? (
              <div className="mx-auto max-w-xl overflow-hidden rounded border border-slate-200 bg-white shadow-md dark:border-slate-700 dark:bg-slate-900">
                <div className="bg-[#bb1919] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white">Breaking</div>
                <div className="border-b border-slate-100 px-3 py-2 dark:border-slate-700">
                  <span className="text-lg font-black text-black dark:text-white">BBC</span>
                </div>
                <div className="p-4">
                  <h2 className={cn('font-bold leading-tight text-slate-900 dark:text-white', c ? 'text-base' : 'text-lg')}>{clip.title}</h2>
                  <p className={cn('mt-2 text-slate-600 dark:text-slate-400', c ? 'text-xs' : 'text-sm')}>
                    Screenshot tab — how saved pages look in PageStash.
                  </p>
                  <div className={cn('relative mt-4 aspect-[16/10] overflow-hidden rounded bg-slate-200', c && 'mt-3')}>
                    <Image
                      src={clip.thumbSrc}
                      alt={clip.thumbAlt}
                      fill
                      className="object-cover"
                      sizes="(max-width:768px) 100vw, 640px"
                    />
                  </div>
                </div>
              </div>
            ) : clip.kind === 'techcrunch' ? (
              <div className="mx-auto max-w-xl overflow-hidden rounded border border-slate-200 bg-white shadow-md dark:border-slate-700 dark:bg-slate-900">
                <div className="relative aspect-[2/1] w-full max-h-48 sm:max-h-none sm:aspect-[21/9]">
                  <Image src={clip.thumbSrc} alt={clip.thumbAlt} fill className="object-cover" sizes="(max-width:768px) 100vw, 640px" />
                </div>
                <div className="border-t border-slate-100 px-4 py-3 dark:border-slate-700">
                  <p className="text-xs font-semibold text-emerald-600">TechCrunch · Technology</p>
                  <h2 className={cn('mt-1 font-bold text-slate-900 dark:text-white', c ? 'text-base' : 'text-lg')}>{clip.title}</h2>
                  <p className="mt-1 text-xs text-slate-500">By Sarah Johnson · 8 min read</p>
                </div>
                <div className="p-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  Reader layout with hero image — switch to HTML or Text to compare.
                </div>
              </div>
            ) : (
              <div className="mx-auto max-w-xl overflow-hidden rounded border border-slate-200 bg-white shadow-md dark:border-slate-700 dark:bg-slate-900">
                <div className="relative aspect-[16/10] w-full">
                  <Image src={clip.thumbSrc} alt={clip.thumbAlt} fill className="object-cover" sizes="(max-width:768px) 100vw, 640px" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-200">Markets</p>
                    <h2 className={cn('font-bold', c ? 'text-base' : 'text-lg')}>{clip.title}</h2>
                  </div>
                </div>
                <div className={cn('border-t border-slate-100 p-4 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-300', c && 'p-3')}>
                  Capture preserves charts and headlines for later search.
                </div>
              </div>
            )}
          </div>
        </div>

        <div
          className={cn(
            'w-full shrink-0 border-t border-slate-200 bg-white dark:border-white/10 dark:bg-slate-950 lg:w-[min(100%,280px)] lg:border-l lg:border-t-0 xl:w-[300px]',
            c ? 'p-3' : 'p-4',
          )}
        >
          <p className={cn('font-semibold text-slate-800 dark:text-slate-100', c ? 'text-[11px]' : 'text-xs')}>Title</p>
          <div
            className={cn(
              'mt-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100',
              c ? 'text-xs' : 'text-sm',
            )}
          >
            {clip.title}
          </div>
          <p className={cn('mt-3 font-semibold text-slate-800 dark:text-slate-100', c ? 'text-[11px]' : 'text-xs')}>Source URL</p>
          <p className={cn('mt-1 break-all text-blue-600 dark:text-blue-400', c ? 'text-[10px]' : 'text-xs')}>{clip.sourceUrl}</p>
          <p className={cn('mt-3 font-semibold text-slate-800 dark:text-slate-100', c ? 'text-[11px]' : 'text-xs')}>Captured</p>
          <p className={cn('mt-1 text-slate-600 dark:text-slate-400', c ? 'text-[10px]' : 'text-xs')}>{clip.captured}</p>
          <p className={cn('mt-3 font-semibold text-slate-800 dark:text-slate-100', c ? 'text-[11px]' : 'text-xs')}>Folder</p>
          <div className="mt-1 flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 dark:border-slate-700 dark:bg-slate-900">
            <FolderIcon className="h-3.5 w-3.5 text-slate-400" aria-hidden />
            <span className={cn('text-slate-800 dark:text-slate-200', c ? 'text-xs' : 'text-sm')}>{clip.folder}</span>
          </div>
          <p className={cn('mt-3 font-semibold text-slate-800 dark:text-slate-100', c ? 'text-[11px]' : 'text-xs')}>Notes</p>
          <div className={cn('mt-1 rounded-md border border-dashed border-slate-200 bg-slate-50/80 px-2 py-3 text-slate-400 dark:border-slate-700 dark:bg-slate-900/60', c ? 'text-[10px]' : 'text-xs')}>
            Add your notes…
          </div>
          <p className={cn('mt-3 font-semibold text-slate-800 dark:text-slate-100', c ? 'text-[11px]' : 'text-xs')}>Tags</p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">research</span>
            <button type="button" className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white" aria-label="Add tag">
              <span className="text-sm leading-none">+</span>
            </button>
          </div>
          <p className={cn('mt-4 border-t border-slate-100 pt-3 text-slate-400 dark:border-slate-800', c ? 'text-[9px] leading-relaxed' : 'text-[10px] leading-relaxed')}>
            ← → Navigate · 1–5 Tabs · Esc Close
          </p>
        </div>
      </div>
    </div>
  )
}

/** High-fidelity dashboard mock — same markup as homepage “Features” hero visual. */
export function MarketingDashboardMockup({
  className,
  density = 'default',
  showAmbientGlow = true,
  embeddedInFrame = false,
  clipCardsVariant = 'marketing',
}: {
  className?: string
  density?: 'default' | 'compact'
  /** Soft halo behind the window; turn off when the mock sits inside a framed LP hero. */
  showAmbientGlow?: boolean
  /** Flatten outer chrome when wrapped by a parent frame (avoids double border / shadow). */
  embeddedInFrame?: boolean
  /** `product` matches library grid: thumbnail on top, title, favicon + domain + folder + date. */
  clipCardsVariant?: 'marketing' | 'product'
}) {
  const c = density === 'compact'
  const product = clipCardsVariant === 'product'
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)

  useEffect(() => {
    if (previewIndex === null || !product) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPreviewIndex(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [previewIndex, product])

  return (
    <div className={cn('max-w-6xl mx-auto', className)}>
      <div className="relative group">
        {showAmbientGlow ? (
          <div
            className={cn(
              'absolute bg-gradient-to-r from-blue-500/15 via-cyan-400/10 to-transparent blur-3xl opacity-40 transition-all duration-500 hidden sm:block',
              c ? '-inset-3 opacity-30' : '-inset-6 group-hover:opacity-70',
            )}
          />
        ) : null}
        <div
          className={cn(
            'relative border border-slate-200 bg-white shadow-[0_50px_120px_-50px_rgba(15,23,42,0.8)] dark:border-white/10 dark:bg-slate-950',
            embeddedInFrame &&
              'border-0 shadow-none sm:rounded-none dark:border-0 rounded-none sm:shadow-none',
            !embeddedInFrame && (c ? 'rounded-xl sm:rounded-2xl' : 'rounded-2xl sm:rounded-[40px]'),
          )}
        >
          <div
            className={cn(
              'flex items-center gap-2 border-b border-slate-100 dark:border-white/5',
              c ? 'px-3 py-2 sm:px-5 sm:py-3' : 'px-6 py-4',
            )}
          >
            <div className="flex shrink-0 gap-1.5 sm:gap-2">
              <span className={cn('rounded-full bg-[#FF5F57]', c ? 'h-2.5 w-2.5' : 'w-3 h-3')} />
              <span className={cn('rounded-full bg-[#FEBC2E]', c ? 'h-2.5 w-2.5' : 'w-3 h-3')} />
              <span className={cn('rounded-full bg-[#28C840]', c ? 'h-2.5 w-2.5' : 'w-3 h-3')} />
            </div>
            <div className="min-w-0 flex-1 text-center">
              <div
                className={cn(
                  'inline-flex max-w-full truncate rounded-full bg-slate-100 font-medium text-slate-600 dark:bg-slate-900 dark:text-slate-300',
                  c ? 'px-2.5 py-0.5 text-[10px] sm:text-xs' : 'px-4 py-1 text-xs',
                )}
              >
                pagestash.app/dashboard
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="flex flex-col lg:flex-row">
            <div
              className={cn(
                'hidden border-slate-100 bg-slate-50/70 dark:border-white/5 dark:bg-slate-950/40 sm:block lg:border-b-0 lg:border-r sm:rounded-bl-none',
                c ? 'lg:w-52 p-4 sm:p-5 lg:rounded-bl-[32px]' : 'lg:w-64 p-6 sm:p-8 lg:rounded-bl-[40px]',
              )}
            >
              <p className={cn('uppercase tracking-[0.3em] text-slate-400', c ? 'mb-2 text-[10px]' : 'mb-4 text-xs')}>
                Folders
              </p>
              <div className="space-y-2">
                {product ? (
                  <>
                    <div
                      className={cn(
                        'flex items-center justify-between rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900',
                        c ? 'px-2.5 py-1.5' : 'px-3 py-2',
                      )}
                    >
                      <span className={cn('font-semibold text-slate-900 dark:text-white', c ? 'text-xs' : 'text-sm')}>All Clips</span>
                      <span className={cn('text-slate-400', c ? 'text-[10px]' : 'text-xs')}>135</span>
                    </div>
                    <div className={cn('flex items-center justify-between rounded-2xl transition hover:bg-white/70', c ? 'gap-2 px-2 py-1.5' : 'gap-3 px-3 py-2')}>
                      <span className="flex min-w-0 items-center gap-2">
                        <span className="w-2 h-2 shrink-0 rounded-full bg-blue-500" />
                        <span className={cn('truncate text-slate-600 dark:text-slate-300', c ? 'text-xs' : 'text-sm')}>Inbox</span>
                      </span>
                      <span className={cn('shrink-0 text-slate-400', c ? 'text-[10px]' : 'text-xs')}>6</span>
                    </div>
                    <div className={cn('flex items-center rounded-2xl transition hover:bg-white/70', c ? 'gap-2 px-2 py-1.5' : 'gap-3 px-3 py-2')}>
                      <span className="w-2 h-2 shrink-0 rounded-full bg-blue-500" />
                      <span className={cn('text-slate-600 dark:text-slate-300', c ? 'truncate text-xs' : 'text-sm')}>Research Projects</span>
                    </div>
                    <div className={cn('flex items-center rounded-2xl transition hover:bg-white/70', c ? 'gap-2 px-2 py-1.5' : 'gap-3 px-3 py-2')}>
                      <span className="w-2 h-2 shrink-0 rounded-full bg-orange-500" />
                      <span className={cn('text-slate-600 dark:text-slate-300', c ? 'truncate text-xs' : 'text-sm')}>Market Analysis</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      className={cn(
                        'flex items-center justify-between rounded-2xl border border-slate-100 bg-white shadow-sm',
                        c ? 'px-2.5 py-1.5' : 'px-3 py-2',
                      )}
                    >
                      <span className={cn('font-semibold text-slate-900', c ? 'text-xs' : 'text-sm')}>All Clips</span>
                      <span className={cn('text-slate-400', c ? 'text-[10px]' : 'text-xs')}>247</span>
                    </div>
                    <div className={cn('flex items-center rounded-2xl transition hover:bg-white/70', c ? 'gap-2 px-2 py-1.5' : 'gap-3 px-3 py-2')}>
                      <span className="w-2 h-2 shrink-0 rounded-full bg-blue-500" />
                      <span className={cn('text-slate-600 dark:text-slate-300', c ? 'truncate text-xs' : 'text-sm')}>
                        Research Projects
                      </span>
                    </div>
                    <div className={cn('flex items-center rounded-2xl transition hover:bg-white/70', c ? 'gap-2 px-2 py-1.5' : 'gap-3 px-3 py-2')}>
                      <span className="w-2 h-2 shrink-0 rounded-full bg-orange-500" />
                      <span className={cn('text-slate-600 dark:text-slate-300', c ? 'truncate text-xs' : 'text-sm')}>
                        Market Analysis
                      </span>
                    </div>
                    <div className={cn('flex items-center rounded-2xl transition hover:bg-white/70', c ? 'gap-2 px-2 py-1.5' : 'gap-3 px-3 py-2')}>
                      <span className="w-2 h-2 shrink-0 rounded-full bg-emerald-500" />
                      <span className={cn('text-slate-600 dark:text-slate-300', c ? 'truncate text-xs' : 'text-sm')}>
                        Design Inspiration
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className={cn('flex-1', c ? (product ? 'p-2.5 sm:p-5' : 'p-3 sm:p-5') : 'p-4 sm:p-8')}>
              <div className={cn('flex flex-col gap-3 sm:flex-row sm:items-center', c ? 'mb-4 sm:mb-5' : 'mb-8 gap-4')}>
                <h3 className={cn('font-semibold text-slate-900 dark:text-white', c ? 'text-sm sm:text-base' : 'text-lg')}>
                  All Clips
                </h3>
                <div className="relative min-w-0 flex-1">
                  <SearchIcon
                    className={cn(
                      'absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 sm:left-4',
                      c ? 'h-3.5 w-3.5' : 'h-4 w-4',
                    )}
                  />
                  <input
                    type="text"
                    readOnly
                    tabIndex={-1}
                    className={cn(
                      'w-full cursor-default rounded-full border border-transparent bg-slate-100 text-slate-600 focus:border-blue-500/40 focus:ring-0 dark:bg-slate-900 dark:text-slate-300',
                      c ? 'py-2 pl-9 pr-3 text-xs sm:py-2.5 sm:pl-10 sm:text-sm' : 'py-3 pl-12 pr-4 text-sm',
                    )}
                    placeholder={product ? 'Search titles, content, URLs...' : 'Search content...'}
                  />
                </div>
              </div>

              <div
                className={cn(
                  'grid grid-cols-1 gap-3 sm:grid-cols-2',
                  c ? 'md:grid-cols-3 sm:gap-3' : 'md:grid-cols-3 sm:gap-4',
                )}
              >
                {product ? (
                  <>
                    {LP_PRODUCT_CLIPS.map((card, idx) => (
                      <div
                        key={card.title}
                        role="button"
                        tabIndex={0}
                        aria-label={`Open preview: ${card.title}`}
                        onClick={() => setPreviewIndex(idx)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            setPreviewIndex(idx)
                          }
                        }}
                        className={cn(
                          'group cursor-pointer overflow-hidden border border-slate-200/90 bg-white text-left shadow-sm outline-none transition-all duration-300 hover:border-slate-300 hover:shadow-md focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-600',
                          c ? 'rounded-xl hover:-translate-y-0.5' : 'rounded-2xl hover:-translate-y-1',
                        )}
                      >
                        <div className="relative aspect-[5/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-800/80">
                          <Image
                            src={card.thumbSrc}
                            alt={card.thumbAlt}
                            fill
                            className="object-cover"
                            sizes="(max-width:640px) 92vw, (max-width:1024px) 45vw, 280px"
                          />
                          {card.mode === 'html' ? (
                            <span className="absolute bottom-2 left-2 rounded-md bg-black/65 px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm backdrop-blur-[2px]">
                              HTML capture
                            </span>
                          ) : null}
                          {card.starred ? (
                            <Star
                              className={cn(
                                'absolute right-2 top-2 fill-amber-400 text-amber-300 drop-shadow-sm',
                                c ? 'h-3.5 w-3.5' : 'h-4 w-4',
                              )}
                              aria-hidden
                            />
                          ) : null}
                        </div>
                        <div className={c ? 'p-3' : 'p-4'}>
                          <p
                            className={cn(
                              'line-clamp-2 font-semibold leading-snug text-slate-900 dark:text-white',
                              c ? 'text-xs sm:text-[13px]' : 'text-sm',
                            )}
                          >
                            {card.title}
                          </p>
                          <div
                            className={cn(
                              'mt-2.5 flex min-w-0 items-center gap-2 text-slate-500 dark:text-slate-400',
                              c ? 'text-[10px] sm:text-[11px]' : 'text-xs',
                            )}
                          >
                            <span
                              className={cn(
                                'flex h-5 w-5 shrink-0 items-center justify-center rounded text-[9px] font-bold text-white shadow-sm',
                                card.favClass,
                              )}
                            >
                              {card.letter}
                            </span>
                            <span className="min-w-0 truncate font-medium text-slate-600 dark:text-slate-300">{card.domain}</span>
                            <span className="shrink-0 text-slate-300 dark:text-slate-600">·</span>
                            <span className="min-w-0 flex-1 truncate">{card.folder}</span>
                            <span className="shrink-0 tabular-nums text-slate-400 dark:text-slate-500">{card.date}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    {[
                      {
                        tag: 'BBC',
                        category: 'News • Technology',
                        title: 'AI Breakthrough: New Model Achieves Human-Level Reasoning',
                        excerpt:
                          'Researchers at leading tech labs have announced a significant advancement in artificial intelligence, with their latest model demonstrating unprecedented...',
                        accent: 'text-orange-600',
                        meta: 'bbc.com/technology • 2 days ago',
                      },
                      {
                        tag: 'BLOOMBERG',
                        category: 'Markets',
                        title: 'Tech Stocks Rally on Strong Earnings Reports',
                        excerpt:
                          'Major technology companies exceeded analyst expectations in Q4, driving a surge in market valuations across the sector...',
                        accent: 'text-blue-600',
                        meta: 'bloomberg.com • 1 week ago',
                      },
                      {
                        tag: 'M',
                        category: 'Design • UX Research',
                        title: 'The Evolution of Design Systems in 2025',
                        excerpt:
                          "Modern design systems have transformed how teams build products. Here's what we learned from implementing design systems at scale...",
                        accent: 'text-emerald-600',
                        meta: 'Sarah Chen • 8 min read',
                      },
                    ].map((card) => (
                      <div
                        key={card.title}
                        className={cn(
                          'group cursor-pointer border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:border-slate-200 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700',
                          c ? 'rounded-2xl p-3 hover:-translate-y-0.5' : 'rounded-3xl p-5 hover:-translate-y-1',
                        )}
                      >
                        <div className={cn('flex items-start justify-between gap-2', c ? 'mb-2' : 'mb-3')}>
                          <div className={`text-xs font-bold tracking-wide ${card.accent} flex min-w-0 items-center gap-1.5 sm:gap-2`}>
                            <div
                              className={cn(
                                'flex shrink-0 items-center justify-center rounded-lg font-bold text-white',
                                c ? 'h-5 w-5 text-[9px]' : 'h-6 w-6 text-xs',
                                card.accent === 'text-orange-600'
                                  ? 'bg-orange-600'
                                  : card.accent === 'text-blue-600'
                                    ? 'bg-blue-600'
                                    : 'bg-emerald-600',
                              )}
                            >
                              {card.tag}
                            </div>
                            <span className="truncate font-normal text-slate-500 dark:text-slate-400">{card.category}</span>
                          </div>
                        </div>
                        <p
                          className={cn(
                            'mb-2 font-semibold leading-snug text-slate-900 dark:text-white',
                            c ? 'line-clamp-2 text-xs sm:text-sm' : 'text-sm',
                          )}
                        >
                          {card.title}
                        </p>
                        <p
                          className={cn(
                            'mb-3 leading-relaxed text-slate-500 dark:text-slate-400',
                            c ? 'line-clamp-2 text-[11px] sm:text-xs' : 'line-clamp-3 text-xs',
                          )}
                        >
                          {card.excerpt}
                        </p>
                        <div className={cn('border-t border-slate-100 dark:border-slate-800', c ? 'pt-2' : 'pt-3')}>
                          <p className={cn('text-slate-400 dark:text-slate-500', c ? 'text-[10px] sm:text-xs' : 'text-xs')}>
                            {card.meta}
                          </p>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>
            {product && previewIndex !== null ? (
              <ProductClipPreviewPanel
                key={LP_PRODUCT_CLIPS[previewIndex]!.title}
                clip={LP_PRODUCT_CLIPS[previewIndex]!}
                compact={c}
                onClose={() => setPreviewIndex(null)}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

/** Extension popup, search hits, folders — homepage feature triptych. */
export function MarketingFeatureHighlightsRow({
  className,
  density = 'default',
}: {
  className?: string
  density?: 'default' | 'compact'
}) {
  const c = density === 'compact'
  return (
    <div
      className={cn(
        'max-w-5xl mx-auto',
        c
          ? 'flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 pt-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:grid sm:grid-cols-3 sm:gap-6 sm:overflow-visible lg:gap-10 [&::-webkit-scrollbar]:hidden'
          : 'grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-12 lg:gap-16',
        className,
      )}
    >
      <div className={cn('text-center group', c && 'w-[min(280px,88vw)] shrink-0 snap-center sm:w-auto')}>
        <div className={c ? 'mb-4' : 'mb-8'}>
          <div
            className={cn(
              'mx-auto border border-slate-200 bg-white shadow-md transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl dark:border-slate-700 dark:bg-slate-900',
              c ? 'max-w-[260px] rounded-xl p-4' : 'max-w-sm rounded-lg p-6',
            )}
          >
            <div className={cn('flex items-center gap-3', c ? 'mb-3' : 'mb-4')}>
              <LogoIcon size={c ? 20 : 24} />
              <span className={cn('font-semibold text-slate-800 dark:text-slate-200', c ? 'text-sm' : '')}>
                PageStash
              </span>
            </div>
            <div className="space-y-3">
              <div className={cn('rounded-lg bg-slate-50 dark:bg-slate-800', c ? 'p-2.5' : 'p-3')}>
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Folder</div>
                <div className={cn('text-slate-700 dark:text-slate-300', c ? 'text-xs' : 'text-sm')}>Research</div>
              </div>
              <Button size="sm" className={cn('w-full', c && 'h-8 text-xs')}>
                📸 Capture Page
              </Button>
            </div>
          </div>
        </div>
        <h3 className={cn('font-bold text-slate-900 dark:text-white', c ? 'mb-1 text-base' : 'mb-2 text-xl')}>
          One-Click Capture
        </h3>
        <p className={cn('text-slate-600 dark:text-slate-300', c ? 'text-xs leading-snug' : '')}>
          Simple extension popup for instant page capture
        </p>
      </div>

      <div className={cn('text-center group', c && 'w-[min(280px,88vw)] shrink-0 snap-center sm:w-auto')}>
        <div className={c ? 'mb-4' : 'mb-8'}>
          <div
            className={cn(
              'mx-auto border border-slate-200 bg-white shadow-md transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl dark:border-slate-700 dark:bg-slate-900',
              c ? 'max-w-[260px] rounded-xl p-4' : 'max-w-sm rounded-lg p-6',
            )}
          >
            <div className="mb-4">
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-lg p-2">
                <SearchIcon className="h-4 w-4 text-slate-400" />
                <span className="text-sm text-slate-600 dark:text-slate-400">machine learning</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-left p-2 bg-blue-50 dark:bg-blue-900/20 rounded border-l-2 border-blue-500">
                <div className="text-xs font-medium text-slate-700 dark:text-slate-300">AI Research Paper</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">...machine learning algorithms...</div>
              </div>
              <div className="text-left p-2 bg-green-50 dark:bg-green-900/20 rounded border-l-2 border-green-500">
                <div className="text-xs font-medium text-slate-700 dark:text-slate-300">ML Tutorial</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">...introduction to machine learning...</div>
              </div>
            </div>
          </div>
        </div>
        <h3 className={cn('font-bold text-slate-900 dark:text-white', c ? 'mb-1 text-base' : 'mb-2 text-xl')}>
          Instant Search
        </h3>
        <p className={cn('text-slate-600 dark:text-slate-300', c ? 'text-xs leading-snug' : '')}>
          Find any content across all your captures
        </p>
      </div>

      <div className={cn('text-center group', c && 'w-[min(280px,88vw)] shrink-0 snap-center sm:w-auto')}>
        <div className={c ? 'mb-4' : 'mb-8'}>
          <div
            className={cn(
              'mx-auto border border-slate-200 bg-white shadow-md transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl dark:border-slate-700 dark:bg-slate-900',
              c ? 'max-w-[260px] rounded-xl p-4' : 'max-w-sm rounded-lg p-6',
            )}
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                <FolderIcon className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-slate-700 dark:text-slate-300">Research (89)</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded">
                <FolderIcon className="h-4 w-4 text-green-500" />
                <span className="text-sm text-slate-700 dark:text-slate-300">Articles (156)</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-orange-50 dark:bg-orange-900/20 rounded">
                <FolderIcon className="h-4 w-4 text-orange-500" />
                <span className="text-sm text-slate-700 dark:text-slate-300">References (23)</span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                <div className="flex flex-wrap gap-1">
                  <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">AI</span>
                  <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">ML</span>
                  <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">Research</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <h3 className={cn('font-bold text-slate-900 dark:text-white', c ? 'mb-1 text-base' : 'mb-2 text-xl')}>
          Smart Organization
        </h3>
        <p className={cn('text-slate-600 dark:text-slate-300', c ? 'text-xs leading-snug' : '')}>
          Folders, tags, and notes keep everything organized
        </p>
      </div>
    </div>
  )
}

/** Page Graph connection map — homepage SVG mock. */
export function MarketingConnectionGraphMockup({
  className,
  density = 'default',
}: {
  className?: string
  density?: 'default' | 'compact'
}) {
  const c = density === 'compact'
  return (
    <div className={cn('relative', className)}>
      <div className={cn('absolute rounded-3xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-blue-500/10 blur-2xl', c ? '-inset-2' : '-inset-4')} />
      <div
        className={cn(
          'relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900',
          c ? 'p-4 sm:p-6' : 'p-8',
        )}
      >
        <div
          className={cn(
            'font-semibold uppercase tracking-widest text-slate-400',
            c ? 'mb-3 text-[10px] sm:text-xs' : 'mb-6 text-xs',
          )}
        >
          Connection Map — Research folder
        </div>
        <svg viewBox="0 0 380 280" className="w-full" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <line x1="190" y1="140" x2="100" y2="80" stroke="#e2e8f0" strokeWidth="1.5" />
          <line x1="190" y1="140" x2="290" y2="80" stroke="#e2e8f0" strokeWidth="1.5" />
          <line x1="190" y1="140" x2="80" y2="200" stroke="#e2e8f0" strokeWidth="1.5" />
          <line x1="190" y1="140" x2="310" y2="200" stroke="#e2e8f0" strokeWidth="1.5" />
          <line x1="190" y1="140" x2="190" y2="240" stroke="#e2e8f0" strokeWidth="1.5" />
          <line x1="100" y1="80" x2="290" y2="80" stroke="#e2e8f0" strokeWidth="1" />
          <line x1="80" y1="200" x2="190" y2="240" stroke="#e2e8f0" strokeWidth="1" />
          <line x1="310" y1="200" x2="190" y2="240" stroke="#e2e8f0" strokeWidth="1" />
          <circle cx="190" cy="140" r="22" fill="#7c3aed" opacity="0.9" />
          <text x="190" y="144" textAnchor="middle" fill="white" fontSize="10" fontWeight="600">
            AI
          </text>
          <circle cx="100" cy="80" r="16" fill="#3b82f6" opacity="0.8" />
          <text x="100" y="84" textAnchor="middle" fill="white" fontSize="9">
            ML
          </text>
          <circle cx="290" cy="80" r="16" fill="#3b82f6" opacity="0.8" />
          <text x="290" y="84" textAnchor="middle" fill="white" fontSize="9">
            LLM
          </text>
          <circle cx="80" cy="200" r="14" fill="#8b5cf6" opacity="0.7" />
          <text x="80" y="204" textAnchor="middle" fill="white" fontSize="9">
            NLP
          </text>
          <circle cx="310" cy="200" r="14" fill="#8b5cf6" opacity="0.7" />
          <text x="310" y="204" textAnchor="middle" fill="white" fontSize="9">
            RAG
          </text>
          <circle cx="190" cy="240" r="13" fill="#a78bfa" opacity="0.7" />
          <text x="190" y="244" textAnchor="middle" fill="white" fontSize="9">
            GPT
          </text>
          <circle cx="50" cy="120" r="10" fill="#ddd6fe" stroke="#7c3aed" strokeWidth="1" />
          <circle cx="340" cy="140" r="10" fill="#ddd6fe" stroke="#7c3aed" strokeWidth="1" />
          <circle cx="150" cy="40" r="10" fill="#ddd6fe" stroke="#3b82f6" strokeWidth="1" />
          <circle cx="240" cy="40" r="10" fill="#ddd6fe" stroke="#3b82f6" strokeWidth="1" />
          <line x1="100" y1="80" x2="50" y2="120" stroke="#e9d5ff" strokeWidth="1" strokeDasharray="3,2" />
          <line x1="290" y1="80" x2="340" y2="140" stroke="#e9d5ff" strokeWidth="1" strokeDasharray="3,2" />
          <line x1="100" y1="80" x2="150" y2="40" stroke="#dbeafe" strokeWidth="1" strokeDasharray="3,2" />
          <line x1="290" y1="80" x2="240" y2="40" stroke="#dbeafe" strokeWidth="1" strokeDasharray="3,2" />
        </svg>
        <div className={cn('flex flex-wrap items-center gap-3 text-slate-500', c ? 'mt-3 gap-2 text-[10px]' : 'mt-4 gap-4 text-xs')}>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" />
            <span>Primary topic</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
            <span>Related</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-200 border border-blue-400 inline-block" />
            <span>Connected</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Rich clip reader — homepage “Rich Preview Experience” mock. */
export function MarketingRichPreviewMockup({
  className,
  density = 'default',
}: {
  className?: string
  density?: 'default' | 'compact'
}) {
  const c = density === 'compact'
  return (
    <div
      className={cn(
        'relative overflow-hidden border border-slate-200 bg-white shadow-2xl ring-1 ring-slate-900/5 dark:border-slate-800 dark:bg-slate-900',
        c ? 'rounded-xl sm:rounded-2xl' : 'rounded-2xl',
        className,
      )}
    >
      <div
        className={cn(
          'sticky top-0 z-10 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-white/50 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/50',
          c ? 'px-3 py-2.5 sm:px-5 sm:py-3' : 'px-6 py-4',
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
          <div className={cn('shrink-0 font-semibold text-slate-700 dark:text-slate-200', c ? 'text-xs' : 'text-sm')}>
            6 of 10
          </div>
          <div className="h-4 w-px shrink-0 bg-slate-200 dark:bg-slate-700" />
          <div
            className={cn(
              'flex min-w-0 items-center gap-1.5 font-medium text-blue-600 dark:text-blue-400',
              c ? 'text-xs' : 'text-sm',
            )}
          >
            <FolderIcon className={cn('shrink-0 text-blue-500', c ? 'h-3.5 w-3.5' : 'h-4 w-4')} />
            <span className="truncate">Research</span>
          </div>
        </div>
        <div className="flex w-full shrink-0 items-center justify-end gap-2 sm:w-auto sm:gap-3">
          <Button size="sm" variant="ghost" className={c ? 'hidden h-8 px-2 text-xs sm:inline-flex' : 'text-sm'}>
            Open Original →
          </Button>
          <div className="flex gap-0.5 rounded-lg bg-slate-100 p-0.5 dark:bg-slate-800 sm:gap-1 sm:px-2 sm:py-1">
            <button
              type="button"
              className={cn(
                'rounded font-medium text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white',
                c ? 'bg-white px-2 py-1 text-[10px]' : 'bg-white px-3 py-1 text-xs dark:bg-slate-700',
              )}
            >
              Screenshot
            </button>
            <button
              type="button"
              className={cn(
                'font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white',
                c ? 'px-2 py-1 text-[10px]' : 'px-3 py-1 text-xs',
              )}
            >
              HTML
            </button>
            <button
              type="button"
              className={cn(
                'font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white',
                c ? 'px-2 py-1 text-[10px]' : 'px-3 py-1 text-xs',
              )}
            >
              Text
            </button>
          </div>
          <div className="hidden gap-1 sm:flex">
            <button type="button" className="rounded p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800">
              <span className="text-xs">←</span>
            </button>
            <button type="button" className="rounded p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800">
              <span className="text-xs">→</span>
            </button>
          </div>
        </div>
      </div>

      <div
        className={cn(
          'grid min-h-0 lg:grid-cols-12',
          c ? 'max-h-[min(68vh,560px)] sm:max-h-[min(72vh,620px)] lg:min-h-[380px] lg:max-h-none' : 'sm:min-h-[480px] lg:min-h-[600px]',
        )}
      >
        <div
          className={cn(
            'overflow-y-auto bg-white dark:bg-slate-950 lg:col-span-8',
            c ? 'max-h-[52vh] p-4 sm:max-h-none sm:p-6 lg:p-8' : 'max-h-[70vh] p-5 sm:max-h-none sm:p-8 lg:p-12 lg:max-h-none',
          )}
        >
          <article
            className={cn(
              'prose prose-slate max-w-none dark:prose-invert',
              c ? 'prose-sm sm:prose-base' : 'prose-lg',
            )}
          >
            <div className={cn('flex items-center gap-3 not-prose', c ? 'mb-4' : 'mb-6')}>
              <div
                className={cn(
                  'flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 font-bold text-white',
                  c ? 'h-9 w-9 text-sm' : 'h-12 w-12 text-lg',
                )}
              >
                TC
              </div>
              <div>
                <div className={cn('font-semibold text-slate-900 dark:text-white', c ? 'text-xs sm:text-sm' : '')}>
                  TechCrunch • Technology
                </div>
              </div>
            </div>

            <h1
              className={cn(
                'mb-4 font-bold leading-tight text-slate-900 dark:text-white',
                c ? 'text-xl sm:text-2xl lg:text-3xl' : 'text-3xl sm:text-4xl',
              )}
            >
              The Future of AI Research: Breaking New Ground
            </h1>

            <div
              className={cn(
                'flex flex-wrap items-center gap-2 not-prose text-slate-500 dark:text-slate-400',
                c ? 'mb-4 text-xs' : 'mb-8 text-sm',
              )}
            >
              <span>By Sarah Johnson</span>
              <span>•</span>
              <span>October 30, 2025</span>
              <span>•</span>
              <span>8 min read</span>
            </div>

            <div className={cn('flex flex-wrap gap-2 not-prose', c ? 'mb-4' : 'mb-8')}>
              <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                AI and Technology
              </span>
            </div>

            <p className="leading-relaxed text-slate-700 dark:text-slate-300">
              Artificial intelligence research has reached an inflection point. Recent breakthroughs in machine learning
              are transforming how we approach complex problems across industries.
            </p>

            <p className="leading-relaxed text-slate-700 dark:text-slate-300">
              Leading researchers at top institutions have demonstrated remarkable progress in natural language
              understanding, computer vision, and reinforcement learning. These advances promise to reshape technology as
              we know it.
            </p>

            <h2 className={cn('font-bold text-slate-900 dark:text-white', c ? 'mt-6 text-lg sm:text-xl' : 'mt-8 text-2xl')}>
              Key Developments
            </h2>

            <p className="leading-relaxed text-slate-700 dark:text-slate-300">
              The integration of large language models with reasoning capabilities has opened new possibilities for AI
              applications. From scientific discovery to creative endeavors, these tools are becoming indispensable
              partners in human innovation.
            </p>

            <div
              className={cn(
                'not-prose rounded-2xl border-l-4 border-blue-500 bg-slate-100 dark:bg-slate-800/50',
                c ? 'my-5 p-4' : 'my-8 p-6',
              )}
            >
              <p
                className={cn(
                  'font-medium italic text-slate-900 dark:text-white',
                  c ? 'text-sm sm:text-base' : 'text-xl',
                )}
              >
                &quot;We&apos;re witnessing a transformation that will define the next decade of technology.&quot;
              </p>
            </div>

            <p className="leading-relaxed text-slate-700 dark:text-slate-300">
              As we look ahead, the convergence of AI capabilities with domain expertise continues to unlock unprecedented
              opportunities for innovation and discovery.
            </p>
          </article>
        </div>

        <div
          className={cn(
            'hidden border-t border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50 sm:block lg:col-span-4 lg:border-l lg:border-t-0',
            c ? 'space-y-4 p-4 sm:p-5' : 'space-y-6 p-5 sm:space-y-8 sm:p-6',
          )}
        >
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Metadata</h4>
            <div className="space-y-4">
              <div>
                <div className="text-xs text-slate-500 mb-1">Source URL</div>
                <div className="text-sm text-blue-600 dark:text-blue-400 truncate">techcrunch.com/2025/10/...</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">Captured</div>
                <div className="text-sm text-slate-700 dark:text-slate-300">Oct 30, 2025 2:34 PM</div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Organization</h4>
            <div className="space-y-4">
              <div>
                <div className="text-xs text-slate-500 mb-2">Folder</div>
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 p-2 rounded border border-slate-200 dark:border-slate-700">
                  <FolderIcon className="w-4 h-4 text-blue-500" />
                  Research
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-2">Tags</div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-medium text-slate-600 dark:text-slate-400">
                    AI
                  </span>
                  <span className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-medium text-slate-600 dark:text-slate-400">
                    Tech
                  </span>
                  <button type="button" className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs text-slate-500 hover:text-slate-700">
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

type MarketingExportSectionBodyProps = {
  /** When true, omits bottom trust strip + CTA (landing pages bring their own CTAs). */
  compact?: boolean
  /** Tighter grid for paid landing pages. */
  density?: 'default' | 'compact'
  signupHref?: string
  onStartArchivingClick?: () => void
}

/** Homepage export formats grid + citations + optional CTA — shared with main marketing page. */
export function MarketingExportSectionBody({
  compact,
  density = 'default',
  signupHref = '/auth/signup',
  onStartArchivingClick,
}: MarketingExportSectionBodyProps) {
  const t = density === 'compact'
  return (
    <>
      <div
        className={cn(
          'mx-auto grid max-w-5xl grid-cols-2 lg:grid-cols-4',
          t ? 'gap-2 sm:gap-3' : 'gap-3 sm:gap-5',
        )}
      >
        {[
          {
            ext: '.md',
            name: 'Markdown',
            desc: 'Obsidian, Notion, plain-text writing.',
            accent: 'from-blue-500 to-cyan-400',
          },
          {
            ext: '.html',
            name: 'HTML',
            desc: 'Self-contained reports with screenshots inline.',
            accent: 'from-cyan-500 to-blue-400',
          },
          {
            ext: '.csv',
            name: 'CSV',
            desc: 'Excel, Google Sheets, data analysis.',
            accent: 'from-emerald-400 to-teal-500',
          },
          {
            ext: '.json',
            name: 'JSON',
            desc: 'Pipelines, integrations, LLM ingest.',
            accent: 'from-violet-400 to-indigo-500',
          },
        ].map((fmt) => (
          <div
            key={fmt.ext}
            className={cn(
              'group relative rounded-2xl border border-white/10 bg-white/5 shadow-none transition-all duration-500 sm:backdrop-blur-xl sm:hover:-translate-y-1 sm:hover:shadow-[0_40px_90px_-50px_rgba(59,130,246,0.4)]',
              t ? 'p-3 sm:p-4' : 'p-4 sm:p-6 sm:shadow-[0_30px_70px_-50px_rgba(2,6,23,1)]',
            )}
          >
            <div className={cn('flex items-center justify-between', t ? 'mb-2' : 'mb-3 sm:mb-4')}>
              <span
                className={cn(
                  'inline-flex items-center rounded-md font-mono font-bold text-white shadow-lg',
                  t ? 'px-2 py-0.5 text-[10px] sm:text-xs' : 'px-2.5 py-1 text-xs sm:text-sm',
                  `bg-gradient-to-br ${fmt.accent}`,
                )}
              >
                {fmt.ext}
              </span>
              <DownloadIcon className={cn('text-slate-500 transition-colors group-hover:text-slate-300', t ? 'h-3.5 w-3.5' : 'h-4 w-4')} />
            </div>
            <h3 className={cn('font-semibold text-white', t ? 'mb-0.5 text-sm sm:text-base' : 'mb-1 text-base sm:text-lg')}>
              {fmt.name}
            </h3>
            <p className={cn('leading-relaxed text-slate-400', t ? 'text-[11px] sm:text-xs' : 'text-xs sm:text-sm')}>
              {fmt.desc}
            </p>
          </div>
        ))}
      </div>

      <div className={cn('mx-auto max-w-5xl', t ? 'mt-3 sm:mt-4' : 'mt-4 sm:mt-5')}>
        <div
          className={cn(
            'group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] via-white/[0.04] to-transparent transition-all duration-500 sm:backdrop-blur-xl',
            t ? 'p-4 sm:p-5' : 'p-5 sm:p-7',
            'hover:border-white/20',
          )}
        >
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-gradient-to-br from-amber-400/15 via-orange-500/10 to-transparent blur-3xl pointer-events-none" />
          <div className="relative flex flex-col md:flex-row md:items-center gap-5 md:gap-8">
            <div className="flex items-center gap-3 md:gap-4 shrink-0">
              <span className="inline-flex items-center px-2.5 py-1 rounded-md font-mono text-xs sm:text-sm font-bold text-white bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg">
                cite
              </span>
              <h3 className="text-base sm:text-lg font-semibold text-white">Academic citations</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed flex-1">
              Auto-formatted bibliographies with full metadata — source URL, author, capture date, and access date —
              ready to paste into your paper.
            </p>
            <div className="flex flex-wrap gap-2 shrink-0">
              {['APA', 'MLA', 'Chicago'].map((style) => (
                <span
                  key={style}
                  className="px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.2em] border border-white/15 bg-white/5 text-slate-200"
                >
                  {style}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {!compact && (
        <div className="mt-10 sm:mt-14 flex flex-col items-center gap-5 sm:gap-6">
          <div className="inline-flex flex-wrap items-center justify-center gap-x-5 sm:gap-x-7 gap-y-2 px-5 py-3 rounded-full bg-white/5 border border-white/10 sm:backdrop-blur-md">
            <span className="flex items-center gap-2 text-xs sm:text-sm text-slate-200">
              <CheckIcon className="h-4 w-4 text-emerald-400" />
              Bulk export
            </span>
            <span className="flex items-center gap-2 text-xs sm:text-sm text-slate-200">
              <CheckIcon className="h-4 w-4 text-emerald-400" />
              Notes &amp; metadata included
            </span>
            <span className="flex items-center gap-2 text-xs sm:text-sm text-slate-200">
              <CheckIcon className="h-4 w-4 text-emerald-400" />
              One-click download
            </span>
          </div>

          <Button
            size="lg"
            className="group text-sm sm:text-base font-bold bg-white text-slate-950 hover:bg-slate-100 px-6 sm:px-8 py-3 sm:py-4 h-auto rounded-xl shadow-[0_0_30px_rgba(34,211,238,0.15)] hover:shadow-[0_0_45px_rgba(34,211,238,0.3)] transition-all"
            asChild
            onClick={onStartArchivingClick}
          >
            <Link href={signupHref} className="flex items-center gap-2">
              Start archiving — free
              <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>

          <p className="text-[11px] sm:text-xs text-slate-500 text-center max-w-md">
            Bulk export is included with every Pro plan. Cancel anytime, take your data with you.
          </p>
        </div>
      )}
    </>
  )
}
