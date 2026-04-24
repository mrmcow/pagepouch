'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Plus, 
  FolderPlus, 
  Tag, 
  Calendar,
  ExternalLink,
  MoreHorizontal,
  User,
  Settings,
  LogOut,
  Download,
  Trash2,
  Edit3,
  Star,
  Clock,
  Globe,
  X,
  Zap,
  RefreshCw,
  Brain,
  Sparkles,
  FileText,
  FileDown,
  CheckSquare,
  Square,
  Moon,
  Sun,
  ChevronDown,
  Check
} from 'lucide-react'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createClient } from '@/lib/supabase'
import { Clip, Folder } from '@pagestash/shared'
import { LogoWithText, LogoIcon } from '@/components/ui/logo'
import { ClipViewer } from '@/components/dashboard/ClipViewer'
import { CreateFolderModal } from '@/components/dashboard/CreateFolderModal'
import { ClipUrlModal } from '@/components/dashboard/ClipUrlModal'
import { EditFolderModal } from '@/components/dashboard/EditFolderModal'
import { UserAvatar } from '@/components/ui/user-avatar'
import { ProfileModal } from '@/components/dashboard/ProfileModal'
import { BillingModal } from '@/components/dashboard/BillingModal'
import { UpgradeCard } from '@/components/dashboard/UpgradeCard'
import { KnowledgeGraphUpgradeModal } from '@/components/dashboard/KnowledgeGraphUpgradeModal'
import { KnowledgeGraphsView } from '@/components/dashboard/KnowledgeGraphsView'
import { CachedImage, useImageCache } from '@/components/ui/cached-image'
import { DownloadModal } from '@/components/ui/download-modal'
import { ExportModal } from '@/components/dashboard/ExportModal'
import { ExportUpgradeModal } from '@/components/dashboard/ExportUpgradeModal'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { trackUpgradeModalViewed, trackSearchPerformed, trackUsageLimitReached } from '@/lib/analytics'
import { getClipFaviconSrc } from '@/lib/clip-favicon'
import { useDarkMode } from '@/hooks/useDarkMode'
import { useToast } from '@/components/ui/toast'
import { OnboardingOverlay } from '@/components/dashboard/OnboardingOverlay'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface DashboardState {
  clips: Clip[]
  folders: Folder[]
  availableTags: Array<{id: string, name: string, color?: string}>
  clipTags: Record<string, string[]> // clipId -> tagIds
  isLoading: boolean
  searchQuery: string
  selectedFolder: string | null
  selectedTags: string[]
  viewMode: 'grid' | 'list'
  viewFilter: 'library' | 'favorites' | 'recent' | 'knowledge-graphs'
  sortBy: 'created_at' | 'updated_at' | 'title'
  sortOrder: 'asc' | 'desc'
  user: any
  selectedClip: Clip | null
  isClipViewerOpen: boolean
  isCreateFolderModalOpen: boolean
  isClipUrlModalOpen: boolean
  selectedFolderForEdit: Folder | null
  isEditFolderModalOpen: boolean
  isProfileModalOpen: boolean
  isBillingModalOpen: boolean
  isKnowledgeGraphUpgradeModalOpen: boolean
  isDownloadModalOpen: boolean
  // Pagination state
  totalClips: number
  hasMoreClips: boolean
  isLoadingMore: boolean
  currentOffset: number
  // Subscription state
  subscriptionTier: 'free' | 'pro'
  subscriptionStatus: string
  clipsThisMonth: number
  clipsLimit: number
  isSubscriptionLoading: boolean
  // Export & selection state
  isSelectionMode: boolean
  selectedClipIds: Set<string>
  isExportModalOpen: boolean
  isExportUpgradeModalOpen: boolean
  // Server-side search results (populated when searchQuery is non-empty)
  searchResults: Clip[] | null
  isSearching: boolean
}

function TagFilterDropdown({
  tags,
  selectedTagIds,
  onToggle,
  onClear,
}: {
  tags: Array<{ id: string; name: string; color?: string }>
  selectedTagIds: string[]
  onToggle: (tagId: string) => void
  onClear: () => void
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) { setSearch(''); return }
    if (tags.length > 8) {
      const t = setTimeout(() => searchRef.current?.focus(), 60)
      return () => clearTimeout(t)
    }
  }, [open, tags.length])

  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => { document.removeEventListener('mousedown', handleClick); document.removeEventListener('keydown', handleKey) }
  }, [open])

  const DEFAULT_COLORS = ['#3b82f6', '#8b5cf6', '#ef4444', '#f59e0b', '#10b981', '#ec4899', '#6366f1', '#14b8a6']
  const tagColor = (tag: { color?: string }, idx: number) => tag.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length]
  const hasSelection = selectedTagIds.length > 0

  const filtered = search
    ? tags.filter(t => t.name.toLowerCase().includes(search.toLowerCase()))
    : tags

  // Sort: selected first, then alphabetical
  const sorted = [...filtered].sort((a, b) => {
    const aSelected = selectedTagIds.includes(a.id) ? 0 : 1
    const bSelected = selectedTagIds.includes(b.id) ? 0 : 1
    if (aSelected !== bSelected) return aSelected - bSelected
    return a.name.localeCompare(b.name)
  })

  const triggerLabel = hasSelection
    ? selectedTagIds.length === 1
      ? (tags.find(t => t.id === selectedTagIds[0])?.name || 'Tag')
      : `${selectedTagIds.length} tags`
    : 'Tags'

  return (
    <div ref={containerRef} className="relative flex-shrink-0">
      {/* Trigger button */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`h-9 flex items-center gap-1.5 px-3 rounded-lg text-sm font-medium transition-all duration-150 border cursor-pointer select-none ${
          hasSelection
            ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/40 text-blue-700 dark:text-blue-300'
            : 'bg-slate-100 dark:bg-slate-800 border-transparent hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
        }`}
      >
        <Tag className="h-3.5 w-3.5 flex-shrink-0 opacity-50" />
        <span className="max-w-[140px] truncate">{triggerLabel}</span>
        {hasSelection ? (
          <span
            role="button"
            onClick={(e) => { e.stopPropagation(); onClear() }}
            className="ml-0.5 rounded-full p-0.5 hover:bg-blue-200 dark:hover:bg-blue-800/60 transition-colors"
          >
            <X className="h-3 w-3" />
          </span>
        ) : (
          <ChevronDown className={`h-3.5 w-3.5 opacity-40 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className="absolute left-0 top-full mt-1.5 z-[100] w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl shadow-slate-900/10 dark:shadow-black/40 overflow-hidden">

          {/* Empty state — no tags at all */}
          {tags.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <Tag className="h-6 w-6 text-slate-300 dark:text-slate-600 mx-auto mb-2.5" />
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No tags yet</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-[180px] mx-auto">
                Open a clip and add tags — they&apos;ll show up here for filtering
              </p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="px-3 pt-3 pb-2 flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {tags.length} tag{tags.length !== 1 ? 's' : ''}
                </span>
                {hasSelection && (
                  <button
                    onClick={() => { onClear() }}
                    className="text-[11px] text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold uppercase tracking-wider"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Search — only when there are enough tags to warrant it */}
              {tags.length > 8 && (
                <div className="px-2.5 pb-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      ref={searchRef}
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Search..."
                      className="w-full h-8 pl-8 pr-8 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 dark:focus:border-blue-500 transition-all"
                    />
                    {search && (
                      <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700">
                        <X className="h-3 w-3 text-slate-400" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Tag list — all visible, selected pinned to top */}
              <div className="max-h-72 overflow-y-auto overscroll-contain border-t border-slate-100 dark:border-slate-800">
                {sorted.map((tag) => {
                  const isSelected = selectedTagIds.includes(tag.id)
                  const color = tagColor(tag, tags.indexOf(tag))
                  return (
                    <button
                      key={tag.id}
                      onClick={() => onToggle(tag.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-[9px] text-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                        isSelected ? 'bg-blue-50/50 dark:bg-blue-950/15' : ''
                      }`}
                    >
                      <div className={`w-[18px] h-[18px] rounded-[5px] border-[1.5px] flex items-center justify-center flex-shrink-0 transition-all ${
                        isSelected
                          ? 'bg-blue-600 border-blue-600 dark:bg-blue-500 dark:border-blue-500'
                          : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                      }`}>
                        {isSelected && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                      </div>
                      <span
                        className="w-[10px] h-[10px] rounded-full flex-shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <span className={`truncate ${isSelected ? 'font-medium text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                        {tag.name}
                      </span>
                    </button>
                  )
                })}

                {/* Search with no results */}
                {filtered.length === 0 && search && (
                  <div className="px-4 py-6 text-center">
                    <p className="text-sm text-slate-400 dark:text-slate-500">No tags matching &ldquo;{search}&rdquo;</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              {hasSelection && (
                <div className="px-3 py-2 border-t border-slate-100 dark:border-slate-800 bg-blue-50/50 dark:bg-blue-950/10">
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTagIds.map(id => {
                      const tag = tags.find(t => t.id === id)
                      if (!tag) return null
                      const color = tagColor(tag, tags.indexOf(tag))
                      return (
                        <span
                          key={id}
                          onClick={() => onToggle(id)}
                          className="inline-flex items-center gap-1 pl-1.5 pr-1.5 py-[3px] rounded-md text-[11px] font-medium cursor-pointer bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors"
                        >
                          <span className="w-[6px] h-[6px] rounded-full" style={{ backgroundColor: color }} />
                          {tag.name}
                          <X className="h-2.5 w-2.5 ml-0.5 opacity-60" />
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

const SORT_OPTIONS: Array<{ value: 'created_at' | 'updated_at' | 'title'; label: string; icon: typeof Calendar }> = [
  { value: 'created_at', label: 'Date created', icon: Calendar },
  { value: 'updated_at', label: 'Last modified', icon: Clock },
  { value: 'title', label: 'Title', icon: FileText },
]

function SortDropdown({
  sortBy,
  sortOrder,
  onSortByChange,
  onSortOrderToggle,
}: {
  sortBy: 'created_at' | 'updated_at' | 'title'
  sortOrder: 'asc' | 'desc'
  onSortByChange: (v: 'created_at' | 'updated_at' | 'title') => void
  onSortOrderToggle: () => void
}) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const current = SORT_OPTIONS.find(o => o.value === sortBy)!

  const orderLabel = sortBy === 'title'
    ? (sortOrder === 'asc' ? 'A–Z' : 'Z–A')
    : (sortOrder === 'desc' ? 'Newest' : 'Oldest')

  return (
    <div ref={containerRef} className="relative flex-shrink-0">
      {/* Single combined trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        className="h-9 flex items-center gap-1.5 px-3 rounded-lg text-sm font-medium transition-all duration-150 border border-transparent cursor-pointer select-none bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0 opacity-50">
          <path d="M3 4.5h8M3 7h6M3 9.5h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <span>{orderLabel}</span>
        <span className="text-[11px] text-slate-400 dark:text-slate-500 font-normal">· {current.label}</span>
        <ChevronDown className={`h-3.5 w-3.5 opacity-40 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Combined panel: field selector + order toggle */}
      {open && (
        <div className="absolute left-0 top-full mt-1.5 z-[100] w-60 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl shadow-slate-900/10 dark:shadow-black/40 overflow-hidden">
          <div className="px-3 pt-3 pb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Sort by</span>
          </div>
          <div className="pb-1">
            {SORT_OPTIONS.map(opt => {
              const isActive = opt.value === sortBy
              const Icon = opt.icon
              return (
                <button
                  key={opt.value}
                  onClick={() => { onSortByChange(opt.value) }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? 'bg-blue-50/60 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} />
                  <span className={isActive ? 'font-medium' : ''}>{opt.label}</span>
                  {isActive && <Check className="h-4 w-4 ml-auto text-blue-600 dark:text-blue-400" />}
                </button>
              )
            })}
          </div>
          <div className="border-t border-slate-100 dark:border-slate-800 px-2 py-2">
            <div className="px-1 pb-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Order</span>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => { if (sortOrder !== 'desc') onSortOrderToggle() }}
                className={`flex-1 h-8 flex items-center justify-center gap-1.5 rounded-md text-xs font-medium transition-colors ${
                  sortOrder === 'desc'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                  <path d="M7 2.5v9M3.5 8L7 11.5 10.5 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {sortBy === 'title' ? 'Z–A' : 'Newest'}
              </button>
              <button
                onClick={() => { if (sortOrder !== 'asc') onSortOrderToggle() }}
                className={`flex-1 h-8 flex items-center justify-center gap-1.5 rounded-md text-xs font-medium transition-colors ${
                  sortOrder === 'asc'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" className="rotate-180">
                  <path d="M7 2.5v9M3.5 8L7 11.5 10.5 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {sortBy === 'title' ? 'A–Z' : 'Oldest'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function NewClipMenu({
  onClipUrl,
  onInstall,
}: {
  onClipUrl: () => void
  onInstall: () => void
}) {
  const [open, setOpen] = useState(false)
  const [menuPos, setMenuPos] = useState<{ top: number; left: number; minWidth: number } | null>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const updatePosition = useCallback(() => {
    if (!btnRef.current) return
    const rect = btnRef.current.getBoundingClientRect()
    const menuWidth = 288
    const viewportPad = 16
    // Anchor to button's left, but keep inside viewport on the right edge.
    const left = Math.min(rect.left, window.innerWidth - menuWidth - viewportPad)
    setMenuPos({ top: rect.bottom + 6, left: Math.max(viewportPad, left), minWidth: rect.width })
  }, [])

  useEffect(() => {
    if (!open) return
    updatePosition()

    const handleClick = (e: MouseEvent) => {
      const t = e.target as Node
      if (menuRef.current?.contains(t)) return
      if (btnRef.current?.contains(t)) return
      setOpen(false)
    }
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }

    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    window.addEventListener('resize', updatePosition)
    // Capture-phase scroll listener catches scrolls on any ancestor (sidebar, page).
    window.addEventListener('scroll', updatePosition, true)

    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [open, updatePosition])

  return (
    <>
      <button
        ref={btnRef}
        onClick={() => setOpen(o => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="group relative w-full h-10 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-500 hover:to-blue-500 text-white text-[13px] font-semibold shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 active:scale-[0.98] transition-all duration-150 overflow-hidden"
      >
        <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
        <Plus className="h-4 w-4 relative" strokeWidth={2.5} />
        <span className="relative">New Clip</span>
        <kbd className="hidden xl:inline-flex ml-1 text-[10px] font-mono opacity-80 bg-white/15 rounded px-1.5 py-0.5 relative">N</kbd>
      </button>

      {open && menuPos && (
        <div
          ref={menuRef}
          role="menu"
          style={{
            position: 'fixed',
            top: menuPos.top,
            left: menuPos.left,
            width: 288,
            minWidth: menuPos.minWidth,
            maxWidth: 'calc(100vw - 2rem)',
          }}
          className="z-[100] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl shadow-slate-900/20 dark:shadow-black/70 overflow-hidden"
        >
          <button
            role="menuitem"
            onClick={() => { onClipUrl(); setOpen(false) }}
            className="w-full px-3 py-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-left transition-colors"
          >
            <div className="h-9 w-9 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center flex-shrink-0">
              <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-slate-900 dark:text-white leading-tight">Clip a URL</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5">Paste a link to archive</div>
            </div>
            <kbd className="text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 flex-shrink-0">N</kbd>
          </button>

          <div className="h-px bg-slate-100 dark:bg-slate-800" />

          <button
            role="menuitem"
            onClick={() => { onInstall(); setOpen(false) }}
            className="w-full px-3 py-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-left transition-colors"
          >
            <div className="h-9 w-9 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center flex-shrink-0">
              <Download className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-slate-900 dark:text-white leading-tight">Install extension</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5">Chrome, Firefox & Edge</div>
            </div>
          </button>
        </div>
      )}
    </>
  )
}

const EMPTY_STATE_CSS = `
@keyframes pageStashClipFloat {
  0%, 100% { transform: translate(0, 0) rotate(-8deg); opacity: 1; }
  45% { transform: translate(32px, 28px) rotate(0deg); opacity: 1; }
  55% { transform: translate(34px, 30px) rotate(1deg); opacity: 0.3; }
  60% { transform: translate(0, 0) rotate(-8deg); opacity: 0; }
  70% { transform: translate(0, 0) rotate(-8deg); opacity: 1; }
}
@keyframes pageStashFolderPulse {
  0%, 45%, 100% { transform: scale(1); }
  55% { transform: scale(1.06); }
  65% { transform: scale(1); }
}
@keyframes pageStashGlowHalo {
  0%, 100% { opacity: 0.25; transform: scale(1); }
  55% { opacity: 0.5; transform: scale(1.15); }
}
.ps-es-clip { animation: pageStashClipFloat 3.2s cubic-bezier(0.4, 0, 0.2, 1) infinite; transform-origin: center; }
.ps-es-folder { animation: pageStashFolderPulse 3.2s cubic-bezier(0.4, 0, 0.2, 1) infinite; transform-origin: center bottom; }
.ps-es-halo { animation: pageStashGlowHalo 3.2s ease-in-out infinite; transform-origin: center; }
@media (prefers-reduced-motion: reduce) {
  .ps-es-clip, .ps-es-folder, .ps-es-halo { animation: none !important; }
}
`

function EmptyStateIllustration() {
  return (
    <div className="relative w-40 h-32 mx-auto mb-8" aria-hidden>
      <style dangerouslySetInnerHTML={{ __html: EMPTY_STATE_CSS }} />

      {/* Halo */}
      <div className="ps-es-halo absolute inset-0 flex items-center justify-center">
        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-500/30 via-blue-400/20 to-sky-300/10 blur-2xl" />
      </div>

      {/* Folder (target) */}
      <div className="ps-es-folder absolute bottom-2 right-4">
        <svg width="72" height="60" viewBox="0 0 72 60" fill="none">
          <defs>
            <linearGradient id="folderFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>
            <linearGradient id="folderBack" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
          <path d="M4 12a4 4 0 0 1 4-4h18l6 6h32a4 4 0 0 1 4 4v36a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V12Z" fill="url(#folderBack)"/>
          <path d="M4 22h64v30a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V22Z" fill="url(#folderFill)"/>
          <path d="M4 22h64" stroke="white" strokeOpacity="0.15" strokeWidth="1"/>
        </svg>
      </div>

      {/* Clip (page being archived) */}
      <div className="ps-es-clip absolute top-0 left-2">
        <svg width="52" height="64" viewBox="0 0 52 64" fill="none" style={{ filter: 'drop-shadow(0 8px 16px rgba(15, 23, 42, 0.15))' }}>
          <rect x="2" y="2" width="48" height="60" rx="6" fill="white" stroke="#e2e8f0" strokeWidth="1.5" className="dark:fill-slate-800 dark:stroke-slate-700" />
          <rect x="8" y="10" width="36" height="4" rx="2" fill="#3b82f6" />
          <rect x="8" y="20" width="28" height="2.5" rx="1.25" fill="#cbd5e1" className="dark:fill-slate-600" />
          <rect x="8" y="26" width="34" height="2.5" rx="1.25" fill="#cbd5e1" className="dark:fill-slate-600" />
          <rect x="8" y="32" width="22" height="2.5" rx="1.25" fill="#cbd5e1" className="dark:fill-slate-600" />
          <rect x="8" y="42" width="36" height="14" rx="3" fill="#eff6ff" stroke="#dbeafe" strokeWidth="1" className="dark:fill-blue-500/10 dark:stroke-blue-500/20" />
        </svg>
      </div>
    </div>
  )
}

function DashboardContent() {
  const [detectedBrowser, setDetectedBrowser] = useState<'chrome' | 'firefox'>('chrome')
  const [isDark, toggleDark] = useDarkMode()
  const { toast } = useToast()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; clipId: string | null }>({ open: false, clipId: null })
  const [showOnboarding, setShowOnboarding] = useState(false)
  
  const [state, setState] = useState<DashboardState>({
    clips: [],
    folders: [],
    availableTags: [],
    clipTags: {},
    isLoading: false, // Start with false to show UI immediately
    searchQuery: '',
    selectedFolder: null,
    selectedTags: [],
    viewMode: 'grid',
    viewFilter: 'library',
    sortBy: 'created_at',
    sortOrder: 'desc',
    user: null,
    selectedClip: null,
    isClipViewerOpen: false,
    isCreateFolderModalOpen: false,
    isClipUrlModalOpen: false,
    selectedFolderForEdit: null,
    isEditFolderModalOpen: false,
    isProfileModalOpen: false,
    isBillingModalOpen: false,
    isKnowledgeGraphUpgradeModalOpen: false,
    isDownloadModalOpen: false,
    // Pagination state
    totalClips: 0,
    hasMoreClips: false,
    isLoadingMore: false,
    currentOffset: 0,
    // Subscription state - Start with loading state to prevent flash
    subscriptionTier: 'free',
    subscriptionStatus: 'inactive',
    clipsThisMonth: 0,
    clipsLimit: 10,
    isSubscriptionLoading: true,
    // Export & selection state
    isSelectionMode: false,
    selectedClipIds: new Set(),
    isExportModalOpen: false,
    isExportUpgradeModalOpen: false,
    // Server-side search
    searchResults: null,
    isSearching: false,
  })
  
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const loadMoreRef = useRef<HTMLDivElement>(null)
  /** After repeated API failures, skip polling until this timestamp (ms). */
  const subscriptionCooldownUntilRef = useRef(0)
  const subscriptionFailStreakRef = useRef(0)

  const router = useRouter()
  const supabase = createClient()
  const { preloadClipImages, clearCache, getCacheSize, getCacheStatus } = useImageCache()

  // Detect browser on mount
  useEffect(() => {
    const userAgent = window.navigator.userAgent
    if (userAgent.includes('Firefox')) {
      setDetectedBrowser('firefox')
    }
  }, [])

  const handleRefresh = () => {
    clearCache()
    loadData(true)
  }

  const refreshSubscriptionData = useCallback(async (force = false) => {
    const now = Date.now()
    if (!force && now < subscriptionCooldownUntilRef.current) {
      return
    }
    try {
      const [subscriptionResponse, usageResponse] = await Promise.all([
        fetch('/api/subscription', {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' },
        }),
        fetch('/api/usage', {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' },
        }),
      ])

      if (subscriptionResponse.ok && usageResponse.ok) {
        subscriptionFailStreakRef.current = 0
        subscriptionCooldownUntilRef.current = 0
        const [subData, usageData] = await Promise.all([
          subscriptionResponse.json(),
          usageResponse.json(),
        ])

        setState((prev) => ({
          ...prev,
          subscriptionTier: subData.subscription_tier || usageData.subscription_tier || 'free',
          subscriptionStatus: subData.subscription_status || 'inactive',
          clipsThisMonth: usageData.clips_this_month || 0,
          clipsLimit:
            usageData.clips_limit || (subData.subscription_tier === 'pro' ? 1000 : 10),
        }))
      } else {
        subscriptionFailStreakRef.current += 1
        if (subscriptionFailStreakRef.current >= 3) {
          subscriptionCooldownUntilRef.current = now + 120_000
        }
        if (subscriptionFailStreakRef.current <= 2) {
          console.warn(
            '[PageStash] subscription/usage refresh failed',
            subscriptionResponse.status,
            usageResponse.status
          )
        }
        setState((prev) => ({ ...prev, isSubscriptionLoading: false }))
      }
    } catch (error) {
      subscriptionFailStreakRef.current += 1
      if (subscriptionFailStreakRef.current >= 3) {
        subscriptionCooldownUntilRef.current = Date.now() + 120_000
      }
      if (subscriptionFailStreakRef.current <= 1) {
        console.error('Failed to refresh subscription data:', error)
      }
      setState((prev) => ({ ...prev, isSubscriptionLoading: false }))
    }
  }, [])

  useEffect(() => {
    // Show UI immediately, load data in background
    checkAuth()
    // Don't wait for loadData - let it run in background
    setTimeout(() => loadData(), 0)
  }, [])

  // Refresh subscription data when window gains focus (user might have created clips via extension)
  useEffect(() => {
    const handleFocus = () => {
      refreshSubscriptionData()
    }

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshSubscriptionData()
      }
    }

    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [refreshSubscriptionData])

  // Periodically refresh subscription data (every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      refreshSubscriptionData()
    }, 30000)

    return () => clearInterval(interval)
  }, [refreshSubscriptionData])

  // Infinite scrolling effect with aggressive preloading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0]
        if (first.isIntersecting && state.hasMoreClips && !state.isLoadingMore) {
          loadMoreClips()
        }
      },
      { threshold: 0.1, rootMargin: '500px' } // Start loading more clips very early (increased from 300px)
    )

    const currentRef = loadMoreRef.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [state.hasMoreClips, state.isLoadingMore])

  // Advanced scroll-based preloading with speed detection
  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout
    let lastScrollTop = 0
    let lastScrollTime = Date.now()
    let preloadCooldown = false

    const handleScroll = () => {
      clearTimeout(scrollTimeout)
      
      const currentScrollTop = window.scrollY
      const currentTime = Date.now()
      const scrollDelta = currentScrollTop - lastScrollTop
      const timeDelta = currentTime - lastScrollTime
      const scrollSpeed = Math.abs(scrollDelta) / timeDelta // pixels per ms
      
      lastScrollTop = currentScrollTop
      lastScrollTime = currentTime

      scrollTimeout = setTimeout(() => {
        if (preloadCooldown) return // Prevent too frequent preloading
        
        const windowHeight = window.innerHeight
        const documentHeight = document.documentElement.scrollHeight
        const scrollProgress = currentScrollTop / (documentHeight - windowHeight)
        
        // Adaptive preloading based on scroll speed and position
        let shouldPreload = false
        let batchSize = 10
        
        if (scrollSpeed > 2) { // Fast scrolling
          shouldPreload = scrollProgress > 0.4
          batchSize = 20
        } else if (scrollSpeed > 0.5) { // Medium scrolling
          shouldPreload = scrollProgress > 0.5
          batchSize = 15
        } else { // Slow scrolling
          shouldPreload = scrollProgress > 0.7
          batchSize = 10
        }
        
        if (shouldPreload && state.clips.length > 0) {
          // Get clips in current context (filtered by folder if selected)
          let contextClips = state.clips
          if (state.selectedFolder) {
            contextClips = state.clips.filter(clip => clip.folder_id === state.selectedFolder)
          }
          
          const uncachedClips = contextClips.filter(clip => 
            clip.screenshot_url && getCacheStatus(clip.screenshot_url) !== 'loaded'
          )
          
          if (uncachedClips.length > 0) {
            preloadCooldown = true
            const nextBatch = uncachedClips.slice(0, Math.min(batchSize, uncachedClips.length))
            preloadClipImages(nextBatch, false).then(() => {
              setTimeout(() => { preloadCooldown = false }, 1000)
            })
          }
        }
      }, 100) // Reduced debounce for faster response
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearTimeout(scrollTimeout)
    }
  }, [state.clips, getCacheStatus, preloadClipImages])

  // Progressive preloading as user scrolls
  useEffect(() => {
    if (state.clips.length > 0) {
      // Preload next batch of images that aren't cached yet
      const uncachedClips = state.clips.filter(clip => 
        clip.screenshot_url && getCacheStatus(clip.screenshot_url) !== 'loaded'
      )
      
      if (uncachedClips.length > 0) {
        const nextBatch = uncachedClips.slice(0, 10)
        preloadClipImages(nextBatch, false)
      }
    }
  }, [state.clips.length]) // Trigger when new clips are loaded

  // Onboarding overlay
  useEffect(() => {
    if (!isInitialLoading && state.clips.length === 0) {
      const dismissed = localStorage.getItem('pagestash-onboarding-dismissed')
      if (!dismissed) setShowOnboarding(true)
    }
  }, [isInitialLoading, state.clips.length])

  // Preload images when folder selection changes
  useEffect(() => {
    if (state.clips.length > 0) {
      let clipsToPreload = state.clips
      
      // If a folder is selected, only preload clips from that folder
      if (state.selectedFolder) {
        clipsToPreload = state.clips.filter(clip => clip.folder_id === state.selectedFolder)
      }
      
      if (clipsToPreload.length > 0) {
        const priorityClips = clipsToPreload.slice(0, 25)
        preloadClipImages(priorityClips, false)
      }
    }
  }, [state.selectedFolder, state.clips.length]) // Trigger when folder selection or clips change

  useKeyboardShortcuts({
    viewerOpen: state.isClipViewerOpen,
    focusSearch: () => searchInputRef.current?.focus(),
    escape: () => {
      if (state.isClipViewerOpen) {
        handleClipViewerClose()
      } else if (state.isSelectionMode) {
        handleCancelSelectionMode()
      }
    },
    prev: () => handleClipNavigate('prev'),
    next: () => handleClipNavigate('next'),
    toggleFavorite: () => {
      if (state.selectedClip) {
        handleToggleFavorite(state.selectedClip.id, !state.selectedClip.is_favorite)
      }
    },
  })

  // Global "N" shortcut: open Clip URL modal from anywhere on the dashboard.
  // Only fires when no input is focused and no modal is already open.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return
      if (e.key !== 'n' && e.key !== 'N') return
      const target = e.target as HTMLElement | null
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return
      if (target?.isContentEditable) return
      if (
        state.isClipViewerOpen ||
        state.isClipUrlModalOpen ||
        state.isCreateFolderModalOpen ||
        state.isEditFolderModalOpen ||
        state.isProfileModalOpen ||
        state.isBillingModalOpen ||
        state.isExportModalOpen ||
        state.isExportUpgradeModalOpen ||
        state.isKnowledgeGraphUpgradeModalOpen ||
        state.isDownloadModalOpen
      ) return
      e.preventDefault()
      setState(prev => ({ ...prev, isClipUrlModalOpen: true }))
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [
    state.isClipViewerOpen,
    state.isClipUrlModalOpen,
    state.isCreateFolderModalOpen,
    state.isEditFolderModalOpen,
    state.isProfileModalOpen,
    state.isBillingModalOpen,
    state.isExportModalOpen,
    state.isExportUpgradeModalOpen,
    state.isKnowledgeGraphUpgradeModalOpen,
    state.isDownloadModalOpen,
  ])

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/login')
        return
      }

      setState(prev => ({ ...prev, user }))
    } catch (error) {
      console.error('Auth check failed:', error)
      // Don't redirect on auth errors - let user try to use the app
    }
  }

  const loadData = async (reset: boolean = true) => {
    try {
      const offset = reset ? 0 : state.currentOffset
      const limit = 50

      // Fire ALL requests simultaneously — don't let subscription block clip rendering
      const [clipsResponse, foldersResponse, tagsResponse, clipTagsResponse, subscriptionResponse, usageResponse] = await Promise.all([
        fetch(`/api/clips?limit=${limit}&offset=${offset}`, { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } }),
        fetch('/api/folders', { cache: 'force-cache', headers: { 'Cache-Control': 'max-age=300' } }),
        fetch('/api/tags', { cache: 'force-cache', headers: { 'Cache-Control': 'max-age=300' } }),
        fetch('/api/clip-tags', { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } }),
        fetch('/api/subscription', { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } }),
        fetch('/api/usage', { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } }),
      ])

      if (!clipsResponse.ok || !foldersResponse.ok || !tagsResponse.ok) {
        throw new Error('Failed to fetch data')
      }

      const [clipsData, foldersData, tagsData] = await Promise.all([
        clipsResponse.json(),
        foldersResponse.json(),
        tagsResponse.json(),
      ])

      const clipTagsData: Record<string, string[]> = clipTagsResponse.ok ? await clipTagsResponse.json() : {}

      const newClips = clipsData.clips || []
      const allClips = reset ? newClips : [...state.clips, ...newClips]

      // Resolve subscription data (non-blocking — clips already parsed above)
      let subscriptionTier = 'free'
      let subscriptionStatus = 'inactive'
      let clipsThisMonth = 0
      let clipsLimit = 10
      if (subscriptionResponse.ok && usageResponse.ok) {
        const [subData, usageData] = await Promise.all([subscriptionResponse.json(), usageResponse.json()])
        subscriptionTier = subData.subscription_tier || usageData.subscription_tier || 'free'
        subscriptionStatus = subData.subscription_status || 'inactive'
        clipsThisMonth = usageData.clips_this_month || 0
        clipsLimit = usageData.clips_limit || (subscriptionTier === 'pro' ? 1000 : 10)
      }

      setState(prev => ({
        ...prev,
        clips: allClips,
        folders: foldersData.folders || [],
        availableTags: tagsData || [],
        clipTags: clipTagsData,
        totalClips: clipsData.total || 0,
        hasMoreClips: clipsData.hasMore || false,
        currentOffset: offset + limit,
        isLoadingMore: false,
        subscriptionTier: subscriptionTier as 'free' | 'pro',
        subscriptionStatus,
        clipsThisMonth,
        clipsLimit,
        isSubscriptionLoading: false,
      }))

      if (newClips.length > 0) {
        preloadClipImages(newClips, false)
      }

      setIsInitialLoading(false)
    } catch (error) {
      console.error('Failed to load data:', error)
      setIsInitialLoading(false)
      setState(prev => ({ ...prev, isLoadingMore: false, isSubscriptionLoading: false }))
    }
  }

  const loadMoreClips = async () => {
    if (state.isLoadingMore || !state.hasMoreClips) return
    
    setState(prev => ({ ...prev, isLoadingMore: true }))
    
    // Store current clips count to identify new clips
    const currentClipsCount = state.clips.length
    
    // Load more data
    await loadData(false) // Don't reset, append to existing clips
    
    // Immediately start preloading the newly loaded images
    setTimeout(() => {
      const newClips = state.clips.slice(currentClipsCount) // Get only the new clips
      const uncachedNewClips = newClips.filter(clip => 
        clip.screenshot_url && getCacheStatus(clip.screenshot_url) !== 'loaded'
      )
      
      if (uncachedNewClips.length > 0) {
        preloadClipImages(uncachedNewClips, false)
      }
    }, 200) // Small delay to let the state update
  }

  const handleSearch = (query: string) => {
    setState(prev => ({ ...prev, searchQuery: query, searchResults: query ? prev.searchResults : null, isSearching: !!query }))
  }

  // Debounced server-side search — fires 300ms after the user stops typing
  useEffect(() => {
    const q = state.searchQuery.trim()
    if (!q) {
      setState(prev => ({ ...prev, searchResults: null, isSearching: false }))
      return
    }
    setState(prev => ({ ...prev, isSearching: true }))
    const timer = setTimeout(async () => {
      try {
        const folderId = state.selectedFolder
        const url = `/api/clips?q=${encodeURIComponent(q)}&limit=100${folderId ? `&folder_id=${folderId}` : ''}`
        const res = await fetch(url, { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          const results: unknown[] = data.clips || []
          trackSearchPerformed({
            query_length: q.length,
            results_count: results.length,
            search_type: 'full_text',
          })
          setState(prev => ({
            ...prev,
            searchResults: results as typeof prev.searchResults,
            isSearching: false,
          }))
        } else {
          setState(prev => ({ ...prev, isSearching: false }))
        }
      } catch {
        setState(prev => ({ ...prev, isSearching: false }))
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [state.searchQuery, state.selectedFolder])

  // Fire usage_limit_reached once per session when the user hits their clip cap
  const limitReachedFiredRef = useRef(false)
  useEffect(() => {
    if (
      !state.isSubscriptionLoading &&
      state.clipsThisMonth > 0 &&
      state.clipsThisMonth >= state.clipsLimit &&
      !limitReachedFiredRef.current
    ) {
      limitReachedFiredRef.current = true
      trackUsageLimitReached('clips')
    }
  }, [state.clipsThisMonth, state.clipsLimit, state.isSubscriptionLoading])

  // Export & Selection handlers
  const handleToggleClipSelection = (clipId: string) => {
    setState(prev => {
      const newSelected = new Set(prev.selectedClipIds)
      if (newSelected.has(clipId)) {
        newSelected.delete(clipId)
      } else {
        newSelected.add(clipId)
      }
      return { ...prev, selectedClipIds: newSelected }
    })
  }

  const handleSelectAll = () => {
    const allVisibleClipIds = sortedClips.map(clip => clip.id)
    setState(prev => ({
      ...prev,
      selectedClipIds: new Set(allVisibleClipIds)
    }))
  }

  const handleClearSelection = () => {
    setState(prev => ({
      ...prev,
      selectedClipIds: new Set()
    }))
  }

  const handleCancelSelectionMode = () => {
    setState(prev => ({
      ...prev,
      isSelectionMode: false,
      selectedClipIds: new Set()
    }))
  }

  const handleOpenExportModal = () => {
    if (state.selectedClipIds.size === 0) {
      toast({ message: 'Select at least one clip to export', type: 'error' })
      return
    }
    setState(prev => ({ ...prev, isExportModalOpen: true }))
  }

  const handleTagToggle = (tagId: string) => {
    setState(prev => {
      const has = prev.selectedTags.includes(tagId)
      return {
        ...prev,
        selectedTags: has
          ? prev.selectedTags.filter(id => id !== tagId)
          : [...prev.selectedTags, tagId],
      }
    })
  }

  const handleTagsClear = () => {
    setState(prev => ({ ...prev, selectedTags: [] }))
  }


  const handleClipClick = (clip: Clip) => {
    setState(prev => ({
      ...prev,
      selectedClip: clip,
      isClipViewerOpen: true,
    }))
  }

  const handleClipViewerClose = () => {
    setState(prev => ({
      ...prev,
      selectedClip: null,
      isClipViewerOpen: false,
    }))
  }

  const handleClipUpdate = async (clipId: string, updates: Partial<Clip>) => {
    try {
      const response = await fetch(`/api/clips/${clipId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error('Failed to update clip')
      }

      const { clip: updatedClip } = await response.json()

      setState(prev => ({
        ...prev,
        clips: prev.clips.map(clip => 
          clip.id === clipId ? { ...clip, ...updatedClip } : clip
        ),
        selectedClip: prev.selectedClip?.id === clipId 
          ? { ...prev.selectedClip, ...updatedClip } 
          : prev.selectedClip,
      }))
    } catch (error) {
      console.error('Failed to update clip:', error)
      throw error
    }
  }

  const handleClipDelete = async (clipId: string) => {
    try {
      const response = await fetch(`/api/clips/${clipId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete clip')
      }

      setState(prev => ({
        ...prev,
        clips: prev.clips.filter(clip => clip.id !== clipId),
      }))
    } catch (error) {
      console.error('Failed to delete clip:', error)
      throw error
    }
  }

  const handleToggleFavorite = async (clipId: string, isFavorite: boolean) => {
    // Optimistic update
    setState(prev => ({
      ...prev,
      clips: prev.clips.map(clip => 
        clip.id === clipId ? { ...clip, is_favorite: isFavorite } : clip
      ),
      selectedClip: prev.selectedClip?.id === clipId 
        ? { ...prev.selectedClip, is_favorite: isFavorite }
        : prev.selectedClip,
    }))

    try {
      const response = await fetch(`/api/clips/${clipId}/favorite`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_favorite: isFavorite }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to toggle favorite: ${response.status} ${errorText}`)
      }

      await response.json()
    } catch (error) {
      // Revert on error
      setState(prev => ({
        ...prev,
        clips: prev.clips.map(clip => 
          clip.id === clipId ? { ...clip, is_favorite: !isFavorite } : clip
        ),
        selectedClip: prev.selectedClip?.id === clipId 
          ? { ...prev.selectedClip, is_favorite: !isFavorite }
          : prev.selectedClip,
      }))
      
      // Show user-friendly error message
      toast({ message: 'Failed to update favorite. Please try again.', type: 'error' })
    }
  }

  const handleClipNavigate = (direction: 'prev' | 'next') => {
    if (!state.selectedClip) return

    const currentIndex = sortedClips.findIndex(clip => clip.id === state.selectedClip!.id)
    let newIndex

    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : 0
    } else {
      newIndex = currentIndex < sortedClips.length - 1 ? currentIndex + 1 : sortedClips.length - 1
    }

    const newClip = sortedClips[newIndex]
    if (newClip) {
      setState(prev => ({
        ...prev,
        selectedClip: newClip,
      }))
    }
  }

  const handleCreateFolder = async (name: string, color: string) => {
    try {
      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, color }),
      })

      if (!response.ok) {
        throw new Error('Failed to create folder')
      }

      const { folder } = await response.json()

      setState(prev => ({
        ...prev,
        folders: [...prev.folders, folder],
      }))
    } catch (error) {
      console.error('Failed to create folder:', error)
      throw error
    }
  }

  const handleUpdateFolder = async (folderId: string, name: string, color: string) => {
    try {
      const response = await fetch(`/api/folders/${folderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, color }),
      })

      if (!response.ok) {
        throw new Error('Failed to update folder')
      }

      const { folder } = await response.json()

      setState(prev => ({
        ...prev,
        folders: prev.folders.map(f => f.id === folderId ? folder : f),
      }))
    } catch (error) {
      console.error('Failed to update folder:', error)
      throw error
    }
  }

  const handleDeleteFolder = async (folderId: string, deleteClips: boolean) => {
    try {
      const response = await fetch(`/api/folders/${folderId}?deleteClips=${deleteClips}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete folder')
      }

      setState(prev => ({
        ...prev,
        folders: prev.folders.filter(f => f.id !== folderId),
        clips: deleteClips 
          ? prev.clips.filter(c => c.folder_id !== folderId)
          : prev.clips.map(c => c.folder_id === folderId ? { ...c, folder_id: undefined } : c),
        selectedFolder: prev.selectedFolder === folderId ? null : prev.selectedFolder,
      }))
    } catch (error) {
      console.error('Failed to delete folder:', error)
      throw error
    }
  }

  // Use server search results when a query is active; otherwise filter the library locally.
  // html_content/text_content are no longer in the list payload — search is fully server-side.
  const filteredClips = useMemo(() => {
    const base = state.searchQuery ? (state.searchResults ?? []) : state.clips

    return base.filter(clip => {
      const matchesFolder = !state.selectedFolder || clip.folder_id === state.selectedFolder
      const matchesTag = state.selectedTags.length === 0 || (
        state.clipTags[clip.id] && state.selectedTags.some(tid => state.clipTags[clip.id].includes(tid))
      )

      let matchesViewFilter = true
      if (state.viewFilter === 'favorites') {
        matchesViewFilter = clip.is_favorite === true
      } else if (state.viewFilter === 'recent') {
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        matchesViewFilter = new Date(clip.created_at) > sevenDaysAgo
      }

      return matchesFolder && matchesTag && matchesViewFilter
    })
  }, [state.clips, state.searchResults, state.searchQuery, state.selectedFolder, state.selectedTags, state.viewFilter, state.clipTags])

  const sortedClips = useMemo(() => [...filteredClips].sort((a, b) => {
    const aValue = a[state.sortBy] || ''
    const bValue = b[state.sortBy] || ''
    const cmp = state.sortBy === 'title'
      ? String(aValue).localeCompare(String(bValue), undefined, { numeric: true, sensitivity: 'base' })
      : (aValue > bValue ? 1 : aValue < bValue ? -1 : 0)
    return state.sortOrder === 'asc' ? cmp : -cmp
  }), [filteredClips, state.sortBy, state.sortOrder])

  // Don't hide the entire UI while loading - show skeleton instead

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 relative overflow-hidden">
      {/* Background Effects - Full Width - Same as Homepage Hero */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute -top-32 -right-32 w-[520px] h-[520px] bg-gradient-to-br from-blue-500/30 via-cyan-500/20 to-transparent blur-[160px]" />
        <div className="absolute bottom-[-200px] -left-24 w-[480px] h-[480px] bg-gradient-to-tr from-indigo-500/20 via-blue-500/10 to-transparent blur-[150px]" />
      </div>

      {/* Header */}
      <header className="border-b border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl shadow-sm relative z-20">
        <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-2.5">
          <div className="flex items-center justify-between gap-3">
            {/* Logo and Navigation */}
            <div className="flex items-center gap-3 md:gap-5 min-w-0">
              <button 
                onClick={() => {
                  // Reset to all clips view
                  setState(prev => ({ 
                    ...prev, 
                    viewFilter: 'library',
                    searchQuery: '',
                    selectedFolder: null,
                    selectedTags: []
                  }))
                }}
                className="hover:opacity-80 transition-opacity"
              >
                <LogoWithText size={36} clickable={false} />
              </button>
              
              <nav className="flex items-center gap-0.5" aria-label="Dashboard views">
                {([
                  { filter: 'library',   icon: <Grid className="h-3.5 w-3.5" />,  label: 'Library'   },
                  { filter: 'favorites', icon: <Star className="h-3.5 w-3.5" />,  label: 'Favorites' },
                  { filter: 'recent',    icon: <Clock className="h-3.5 w-3.5" />, label: 'Recent'    },
                ] as const).map(({ filter, icon, label }) => {
                  const active = state.viewFilter === filter
                  return (
                    <button
                      key={filter}
                      onClick={() => setState(prev => ({ ...prev, viewFilter: filter }))}
                      aria-label={label}
                      aria-current={active ? 'page' : undefined}
                      className={`flex items-center gap-1.5 h-8 px-2 md:px-2.5 rounded-md text-[13px] font-medium transition-all duration-150 ${
                        active
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10'
                      }`}
                    >
                      {icon}
                      <span className="hidden md:inline">{label}</span>
                    </button>
                  )
                })}
              </nav>
            </div>

            {/* User Profile */}
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleDark}
                className="h-8 w-8 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-all"
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              {state.user && (
                <UserAvatar
                  user={{
                    email: state.user.email,
                    id: state.user.id
                  }}
                  onProfileClick={() => setState(prev => ({ ...prev, isProfileModalOpen: true }))}
                  onBillingClick={() => setState(prev => ({ ...prev, isBillingModalOpen: true }))}
                />
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Container */}
      <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-5 h-auto lg:h-[calc(100vh-64px)] relative z-10">
        <div className="flex flex-col lg:flex-row gap-5 xl:gap-6 h-auto lg:h-full">
          {/* Sidebar */}
          <aside className="w-full lg:w-60 xl:w-64 2xl:w-72 lg:flex-shrink-0 space-y-3 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:pr-2 lg:pb-4">

            {/* Primary CTA — always at the top of the sidebar */}
            <NewClipMenu
              onClipUrl={() => setState(prev => ({ ...prev, isClipUrlModalOpen: true }))}
              onInstall={() => setState(prev => ({ ...prev, isDownloadModalOpen: true }))}
            />

            {/* Upgrade to Pro — promoted above Folders for free users so it is visible without scrolling */}
            {!state.isSubscriptionLoading && state.subscriptionTier === 'free' && (
              <UpgradeCard source="dashboard-sidebar" />
            )}

            {/* Folders */}
            <Card className="border border-slate-200/70 dark:border-white/10 shadow-sm bg-white dark:bg-slate-900">
              <CardHeader className="px-4 py-3">
                <CardTitle className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Folders</CardTitle>
              </CardHeader>
              <CardContent className="space-y-0.5 px-3 pb-3 pt-0">
                <Button
                  variant={!state.selectedFolder ? "secondary" : "ghost"}
                  size="sm"
                  className="w-full justify-start h-8 text-[13px] font-normal"
                  onClick={() => {
                    setState(prev => ({ 
                      ...prev, 
                      selectedFolder: null,
                      viewFilter: 'library' // Switch back to library view if in knowledge graphs
                    }))
                        setTimeout(() => {
                      if (state.clips.length > 0) {
                        preloadClipImages(state.clips.slice(0, 30), true)
                      }
                    }, 100)
                  }}
                >
                  <Grid className="mr-2 h-3.5 w-3.5" />
                  All Clips ({state.totalClips})
                </Button>
                
                {state.folders.map((folder) => {
                  const folderClipCount = state.clips.filter(clip => clip.folder_id === folder.id).length
                  return (
                    <Button
                      key={folder.id}
                      variant={state.selectedFolder === folder.id ? "secondary" : "ghost"}
                      size="sm"
                      className="w-full justify-start h-8 text-[13px] font-normal group relative"
                      onClick={() => {
                        setState(prev => ({ 
                          ...prev, 
                          selectedFolder: folder.id,
                          viewFilter: 'library' // Switch back to library view if in knowledge graphs
                        }))
                        setTimeout(() => {
                          const folderClips = state.clips.filter(clip => clip.folder_id === folder.id)
                          if (folderClips.length > 0) {
                            preloadClipImages(folderClips.slice(0, 30), true)
                          }
                        }, 100)
                      }}
                    >
                      <div 
                        className="mr-2 h-2.5 w-2.5 rounded-sm shrink-0" 
                        style={{ backgroundColor: folder.color || '#6B7280' }}
                      />
                      <span className="flex-1 text-left truncate">
                        {folder.name} ({folderClipCount})
                      </span>
                      <div
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-5 w-5 rounded hover:bg-accent cursor-pointer flex items-center justify-center"
                        onClick={(e) => {
                          e.stopPropagation()
                          setState(prev => ({ 
                            ...prev, 
                            selectedFolderForEdit: folder,
                            isEditFolderModalOpen: true 
                          }))
                        }}
                      >
                        <Edit3 className="h-3 w-3" />
                      </div>
                    </Button>
                  )
                })}
                
                {/* Add New Folder Button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start h-8 text-[13px] font-normal border-dashed border border-slate-300 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 text-slate-600 dark:text-slate-400 hover:text-blue-700 dark:hover:text-blue-400 transition-all mt-1.5"
                  onClick={() => setState(prev => ({ ...prev, isCreateFolderModalOpen: true }))}
                >
                  <Plus className="mr-2 h-3.5 w-3.5" />
                  New Folder
                </Button>
              </CardContent>
            </Card>

            {/* Tools */}
            <Card className="border border-slate-200/70 dark:border-white/10 shadow-sm bg-white dark:bg-slate-900">
              <CardHeader className="px-4 py-3">
                <CardTitle className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Tools</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 px-3 pb-3 pt-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start h-8 text-[13px] font-normal relative hover:bg-slate-100 dark:hover:bg-slate-800/60"
                  onClick={() => {
                    if (state.subscriptionTier === 'pro') {
                      if (state.viewFilter === 'knowledge-graphs') {
                        setState(prev => ({
                          ...prev,
                          viewFilter: 'library',
                          isSelectionMode: true,
                          selectedClipIds: new Set(),
                        }))
                      } else {
                        setState(prev => ({
                          ...prev,
                          isSelectionMode: true,
                          selectedClipIds: new Set(),
                        }))
                      }
                    } else {
                      trackUpgradeModalViewed('feature_locked')
                      setState(prev => ({ ...prev, isExportUpgradeModalOpen: true }))
                    }
                  }}
                >
                  <FileDown className="mr-2 h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                  Export Clips
                  {state.subscriptionTier !== 'pro' && (
                    <Badge className="ml-auto text-[10px] px-1.5 py-0 h-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0">
                      PRO
                    </Badge>
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start h-8 text-[13px] font-normal relative hover:bg-slate-100 dark:hover:bg-slate-800/60"
                  onClick={() => {
                    if (state.subscriptionTier === 'pro') {
                      setState(prev => ({
                        ...prev,
                        viewFilter: 'knowledge-graphs',
                        isSelectionMode: false,
                        selectedClipIds: new Set(),
                      }))
                    } else {
                      trackUpgradeModalViewed('feature_locked')
                      setState(prev => ({ ...prev, isKnowledgeGraphUpgradeModalOpen: true }))
                    }
                  }}
                >
                  <Brain className="mr-2 h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                  Page Graphs
                  {state.subscriptionTier !== 'pro' && (
                    <Badge className="ml-auto text-[10px] px-1.5 py-0 h-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0">
                      PRO
                    </Badge>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Usage Stats - Only show when subscription data is loaded */}
            {!state.isSubscriptionLoading && (
              <Card className={`border shadow-sm ${
                state.clipsThisMonth >= state.clipsLimit
                  ? 'border-red-200 dark:border-red-800/30 bg-red-50/50 dark:bg-red-950/10'
                  : 'border-slate-200/70 dark:border-white/10 bg-white dark:bg-slate-900'
              }`}>
                <CardHeader className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Usage</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0 opacity-60 hover:opacity-100"
                      onClick={() => void refreshSubscriptionData(true)}
                      title="Refresh usage data"
                    >
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-0">
                  <div className="space-y-2.5">
                    <div className="flex items-baseline justify-between">
                      <span className="text-[13px] text-slate-600 dark:text-slate-400">Clips this month</span>
                      <span className={`text-[13px] font-semibold tabular-nums ${
                        state.clipsThisMonth >= state.clipsLimit
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-slate-900 dark:text-white'
                      }`}>
                        <span className="text-[15px]">{state.clipsThisMonth}</span>
                        <span className="text-slate-400 dark:text-slate-500 font-normal"> / {state.clipsLimit}</span>
                      </span>
                    </div>
                    {(() => {
                      const pct = Math.min((state.clipsThisMonth / state.clipsLimit) * 100, 100)
                      const barClasses = pct >= 90
                        ? 'bg-gradient-to-r from-red-500 to-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.45)]'
                        : pct >= 70
                        ? 'bg-gradient-to-r from-amber-400 to-orange-500 shadow-[0_0_10px_rgba(245,158,11,0.35)]'
                        : 'bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 shadow-[0_0_10px_rgba(59,130,246,0.35)]'
                      return (
                        <div className="relative w-full h-2 bg-slate-100 dark:bg-slate-800/70 rounded-full overflow-hidden">
                          <div
                            className={`absolute inset-y-0 left-0 rounded-full transition-[width] duration-500 ease-out ${barClasses}`}
                            style={{ width: `${pct}%` }}
                          />
                          <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/0 dark:ring-white/5 pointer-events-none" />
                        </div>
                      )
                    })()}
                    {state.clipsThisMonth >= state.clipsLimit ? (
                      <p className="text-[11px] font-medium text-red-600 dark:text-red-400">
                        Monthly limit reached — resets next month
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {state.clipsLimit - state.clipsThisMonth} clips remaining this month
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Subscription Loading State */}
            {state.isSubscriptionLoading && (
              <Card className="border border-slate-200/70 dark:border-white/10 shadow-sm bg-white dark:bg-slate-900">
                <CardHeader className="px-4 py-3">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-600">Usage</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-0">
                  <div className="space-y-2">
                    <div className="flex justify-between text-[13px]">
                      <span className="text-slate-400">Clips this month</span>
                      <div className="h-4 w-12 bg-slate-100 dark:bg-slate-800 rounded animate-pulse"></div>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                      <div className="bg-slate-200 dark:bg-slate-700 h-2 rounded-full animate-pulse w-1/3"></div>
                    </div>
                    <div className="h-3 w-24 bg-slate-100 dark:bg-slate-800 rounded animate-pulse"></div>
                  </div>
                </CardContent>
              </Card>
            )}
          </aside>

          {/* Main Content */}
          <main className="flex-1 flex flex-col space-y-6 min-w-0 h-auto lg:h-full lg:overflow-hidden">
            {/* Search and Filters */}
            {state.viewFilter !== 'knowledge-graphs' && (
            <div className="flex flex-col gap-2 w-full px-1 py-3">
              {/* Primary row: refresh + search */}
              <div className="flex items-center gap-2 w-full">
                <button
                  onClick={handleRefresh}
                  className="h-11 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-transparent focus:outline-none transition-all duration-200 rounded-xl flex items-center justify-center flex-shrink-0"
                  title="Refresh"
                >
                  <RefreshCw className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                </button>

                <div className="relative flex-1 min-w-0">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search titles, content, URLs..."
                    value={state.searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className={`pl-10 h-11 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 focus:border-blue-500 dark:focus:border-blue-400 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-0 transition-all duration-200 rounded-xl ${state.searchQuery ? 'pr-10' : 'pr-16 sm:pr-20'}`}
                  />
                  {state.searchQuery ? (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                      {state.isSearching && (
                        <div className="w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                      )}
                      <button
                        onClick={() => handleSearch('')}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <kbd
                      className="hidden sm:inline-flex absolute right-3 top-1/2 -translate-y-1/2 items-center gap-0.5 text-[11px] font-mono text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-md px-1.5 py-0.5 pointer-events-none select-none"
                      aria-hidden
                    >
                      ⌘K
                    </kbd>
                  )}
                </div>
                {state.searchQuery && !state.isSearching && filteredClips.length > 0 && (
                  <span className="flex-shrink-0 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md whitespace-nowrap">
                    {filteredClips.length} result{filteredClips.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {/* Secondary row: filters + sort + view */}
              <div className="flex items-center gap-2 pb-0.5">
                <TagFilterDropdown
                  tags={state.availableTags}
                  selectedTagIds={state.selectedTags}
                  onToggle={handleTagToggle}
                  onClear={handleTagsClear}
                />

                <SortDropdown
                  sortBy={state.sortBy}
                  sortOrder={state.sortOrder}
                  onSortByChange={(v) => setState(prev => ({ ...prev, sortBy: v }))}
                  onSortOrderToggle={() => setState(prev => ({ ...prev, sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' }))}
                />

                <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg flex-shrink-0 ml-auto gap-0.5">
                  <button
                    onClick={() => setState(prev => ({ ...prev, viewMode: 'grid' }))}
                    className={`h-8 w-8 flex items-center justify-center rounded-md transition-all ${
                      state.viewMode === 'grid'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                    }`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setState(prev => ({ ...prev, viewMode: 'list' }))}
                    className={`h-8 w-8 flex items-center justify-center rounded-md transition-all ${
                      state.viewMode === 'list'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
            )}

            {/* Export Mode — contextual toolbar that sits above the clip grid */}
            {state.isSelectionMode && (
              <div className="flex-shrink-0 rounded-2xl border-2 border-blue-500/70 dark:border-blue-400/50 bg-gradient-to-r from-blue-50 via-blue-50/70 to-white dark:from-blue-950/30 dark:via-blue-950/15 dark:to-slate-900 shadow-lg shadow-blue-500/10 dark:shadow-blue-400/5 px-4 sm:px-5 py-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  {/* Title + count */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shadow-md shadow-blue-600/30 flex-shrink-0">
                      <FileDown className="h-[18px] w-[18px] text-white" strokeWidth={2.5} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-[15px] font-semibold text-slate-900 dark:text-white">Export mode</h3>
                        <span className="inline-flex items-center gap-1 text-[12px] font-medium text-blue-700 dark:text-blue-300 bg-blue-100/80 dark:bg-blue-500/15 border border-blue-200/60 dark:border-blue-400/20 rounded-full px-2 py-0.5">
                          <Check className="h-3 w-3" strokeWidth={3} />
                          {state.selectedClipIds.size} of {sortedClips.length} selected
                        </span>
                      </div>
                      <p className="text-[12px] text-slate-600 dark:text-slate-400 mt-0.5 hidden sm:block">
                        {state.selectedClipIds.size === 0
                          ? 'Tap any clip to select it, or use Select All to grab them all.'
                          : `Ready to export ${state.selectedClipIds.size} clip${state.selectedClipIds.size === 1 ? '' : 's'} as Markdown, JSON, CSV, or PDF.`}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0 flex-wrap sm:flex-nowrap">
                    {state.selectedClipIds.size < sortedClips.length ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSelectAll}
                        className="h-9 border-slate-300 dark:border-slate-600 bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-800"
                      >
                        Select all ({sortedClips.length})
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClearSelection}
                        className="h-9 border-slate-300 dark:border-slate-600 bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-800"
                      >
                        Deselect all
                      </Button>
                    )}

                    {state.selectedClipIds.size > 0 && state.selectedClipIds.size < sortedClips.length && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearSelection}
                        className="h-9 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        Clear
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancelSelectionMode}
                      className="h-9 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Cancel (Esc)"
                    >
                      Cancel
                    </Button>

                    <Button
                      size="sm"
                      onClick={handleOpenExportModal}
                      disabled={state.selectedClipIds.size === 0}
                      className="h-9 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold shadow-md shadow-blue-600/25 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed transition-colors"
                    >
                      <FileDown className="h-4 w-4 mr-1.5" />
                      Export{state.selectedClipIds.size > 0 ? ` (${state.selectedClipIds.size})` : ''}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Content Area - Clips or Page Graphs */}
            {state.viewFilter === 'knowledge-graphs' ? (
              <KnowledgeGraphsView 
                folders={state.folders}
                subscriptionTier={state.subscriptionTier}
                clips={state.clips}
                onNavigateToFolder={(folderId) => {
                  // Navigate to the specified folder and switch to library view
                  setState(prev => ({
                    ...prev,
                    viewFilter: 'library',
                    selectedFolder: folderId,
                    searchQuery: '',
                    selectedTags: []
                  }))
                }}
              />
            ) : (
              <div className="flex-1 overflow-visible lg:overflow-hidden">
              {isInitialLoading ? (
                /* Loading Skeleton */
                <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(220px,1fr))]">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden animate-pulse border border-slate-200/70 dark:border-white/[0.08]">
                      <div className="aspect-[16/10] bg-slate-100 dark:bg-slate-800"></div>
                      <div className="px-3 pt-2.5 pb-3 space-y-2">
                        <div className="h-3.5 bg-slate-100 dark:bg-slate-800 rounded w-3/4"></div>
                        <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-2/5"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : sortedClips.length === 0 ? (
                <div className="flex items-center justify-center py-16 lg:py-20">
                  <div className="w-full max-w-md text-center">
                    {(!state.searchQuery && (state.viewFilter === 'library' || state.viewFilter === 'favorites' || state.viewFilter === 'recent')) ? (
                      <EmptyStateIllustration />
                    ) : (
                      <div className="relative mx-auto mb-6 w-20 h-20">
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/25 via-blue-400/15 to-sky-300/10 blur-xl" />
                        <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-500/10 dark:to-blue-400/10 border border-blue-100 dark:border-white/10 flex items-center justify-center">
                          <LogoIcon size={40} />
                        </div>
                      </div>
                    )}
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                      {state.searchQuery ? 'No results found' :
                       state.viewFilter === 'favorites' ? 'No favorites yet' :
                       state.viewFilter === 'recent' ? 'No recent clips' :
                       state.selectedFolder ? 'This folder is empty' :
                       'Your stash is empty'}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-8">
                      {state.searchQuery ? `No clips match "${state.searchQuery}". Try different keywords.` :
                       state.viewFilter === 'favorites' ? 'Star any clip to pin it to Favorites for instant recall.' :
                       state.viewFilter === 'recent' ? 'Clips captured in the last 7 days will appear here.' :
                       state.selectedFolder ? 'Capture a page with the extension and move it into this folder.' :
                       'Install the extension and capture your first page — it takes one click. You can also clip any URL manually.'}
                    </p>
                    {(state.viewFilter === 'library' && !state.searchQuery && !state.selectedFolder) && (
                      <div className="flex flex-col sm:flex-row gap-2 justify-center">
                        <Button
                          onClick={() => setState(prev => ({ ...prev, isDownloadModalOpen: true }))}
                          className="h-11 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white font-medium"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Install Extension
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setState(prev => ({ ...prev, isClipUrlModalOpen: true }))}
                          className="h-11 px-6 rounded-xl font-medium"
                        >
                          <Globe className="mr-2 h-4 w-4" />
                          Clip a URL
                        </Button>
                      </div>
                    )}
                    {state.selectedFolder && (
                      <Button
                        variant="outline"
                        onClick={() => setState(prev => ({ ...prev, isClipUrlModalOpen: true }))}
                        className="h-11 px-6 rounded-xl font-medium"
                      >
                        <Globe className="mr-2 h-4 w-4" />
                        Clip a URL into this folder
                      </Button>
                    )}
                    {state.searchQuery && (
                      <button
                        onClick={() => handleSearch('')}
                        className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-auto lg:h-full overflow-visible lg:overflow-y-auto pr-2 -mr-2">
                  <div className={
                    state.viewMode === 'grid' 
                      ? "grid gap-3 pb-6 [grid-template-columns:repeat(auto-fill,minmax(220px,1fr))]"
                      : "space-y-2 pb-6 max-w-5xl"
                  }>
                    {sortedClips.map((clip, index) => (
                      <ClipCard 
                        key={clip.id} 
                        clip={clip} 
                        viewMode={state.viewMode}
                        folders={state.folders}
                        onClick={() => {
                          if (state.isSelectionMode) {
                            handleToggleClipSelection(clip.id)
                          } else {
                            handleClipClick(clip)
                          }
                        }}
                        onUpdate={handleClipUpdate}
                        onDelete={handleClipDelete}
                        onRequestDelete={(clipId) => setDeleteConfirm({ open: true, clipId })}
                        onToggleFavorite={handleToggleFavorite}
                        priority={index < 20} // Prioritize first 20 images in current view (filtered or unfiltered)
                        isSelectionMode={state.isSelectionMode}
                        isSelected={state.selectedClipIds.has(clip.id)}
                        onToggleSelection={() => handleToggleClipSelection(clip.id)}
                      />
                    ))}
                    
                    {/* Infinite scroll trigger and loading indicator */}
                    {state.hasMoreClips && (
                      <div 
                        ref={loadMoreRef}
                        className={`${
                          state.viewMode === 'grid' 
                            ? 'col-span-full flex justify-center py-8' 
                            : 'flex justify-center py-8'
                        }`}
                      >
                        {state.isLoadingMore && (
                          <div className="flex items-center space-x-2 text-muted-foreground">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                            <span>Loading more clips...</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            )}
          </main>
        </div>
      </div>

      {/* Clip Viewer Modal */}
      <ClipViewer
        clip={state.selectedClip}
        clips={sortedClips}
        folders={state.folders}
        isOpen={state.isClipViewerOpen}
        onClose={handleClipViewerClose}
        onUpdate={handleClipUpdate}
        onDelete={handleClipDelete}
        onNavigate={handleClipNavigate}
      />

      {/* Create Folder Modal */}
      <CreateFolderModal
        isOpen={state.isCreateFolderModalOpen}
        onClose={() => setState(prev => ({ ...prev, isCreateFolderModalOpen: false }))}
        onCreateFolder={handleCreateFolder}
      />

      {/* Clip URL Modal */}
      <ClipUrlModal
        isOpen={state.isClipUrlModalOpen}
        onClose={() => setState(prev => ({ ...prev, isClipUrlModalOpen: false }))}
        onSuccess={(usage) => {
          loadData(true)
          if (usage) {
            setState(prev => ({
              ...prev,
              clipsThisMonth: usage.clips_this_month,
              clipsLimit: usage.clips_limit,
            }))
          } else {
            void refreshSubscriptionData(true)
          }
        }}
      />

      {/* Edit Folder Modal */}
      <EditFolderModal
        folder={state.selectedFolderForEdit}
        isOpen={state.isEditFolderModalOpen}
        onClose={() => setState(prev => ({ 
          ...prev, 
          isEditFolderModalOpen: false,
          selectedFolderForEdit: null 
        }))}
        onUpdateFolder={handleUpdateFolder}
        onDeleteFolder={handleDeleteFolder}
        clipCount={state.selectedFolderForEdit 
          ? state.clips.filter(clip => clip.folder_id === state.selectedFolderForEdit!.id).length 
          : 0
        }
      />

      {/* Profile Management Modal */}
      <ProfileModal
        isOpen={state.isProfileModalOpen}
        onClose={() => setState(prev => ({ ...prev, isProfileModalOpen: false }))}
        user={{
          id: state.user?.id || '',
          email: state.user?.email || '',
          created_at: state.user?.created_at
        }}
        subscriptionData={{
          subscriptionTier: state.subscriptionTier,
          subscriptionStatus: state.subscriptionStatus,
          clipsThisMonth: state.clipsThisMonth,
          clipsLimit: state.clipsLimit
        }}
      />

      {/* Billing Management Modal */}
      <BillingModal
        isOpen={state.isBillingModalOpen}
        onClose={() => setState(prev => ({ ...prev, isBillingModalOpen: false }))}
        user={{
          id: state.user?.id || '',
          email: state.user?.email || ''
        }}
        subscriptionData={{
          subscriptionTier: state.subscriptionTier,
          subscriptionStatus: state.subscriptionStatus,
          clipsThisMonth: state.clipsThisMonth,
          clipsLimit: state.clipsLimit
        }}
      />

      {/* Knowledge Graph Upgrade Modal */}
      <KnowledgeGraphUpgradeModal
        isOpen={state.isKnowledgeGraphUpgradeModalOpen}
        onClose={() => setState(prev => ({ ...prev, isKnowledgeGraphUpgradeModalOpen: false }))}
      />

      {/* Download Extension Modal */}
      <DownloadModal
        isOpen={state.isDownloadModalOpen}
        onClose={() => setState(prev => ({ ...prev, isDownloadModalOpen: false }))}
        selectedBrowser={detectedBrowser}
      />

      {/* Export Clips Modal */}
      <ExportModal
        clips={sortedClips.filter(clip => state.selectedClipIds.has(clip.id))}
        folders={state.folders}
        isOpen={state.isExportModalOpen}
        onClose={() => {
          setState(prev => ({ ...prev, isExportModalOpen: false }))
          // Optionally exit selection mode after export
          // setState(prev => ({ ...prev, isExportModalOpen: false, isSelectionMode: false, selectedClipIds: new Set() }))
        }}
      />

      {/* Export Upgrade Modal (for free users) */}
      <ExportUpgradeModal
        isOpen={state.isExportUpgradeModalOpen}
        onClose={() => setState(prev => ({ ...prev, isExportUpgradeModalOpen: false }))}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirm.open} onOpenChange={(open) => setDeleteConfirm(prev => ({ ...prev, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this clip?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The clip and its screenshot will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (deleteConfirm.clipId) {
                  await handleClipDelete(deleteConfirm.clipId)
                  toast({ message: 'Clip deleted', type: 'info' })
                }
                setDeleteConfirm({ open: false, clipId: null })
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Onboarding Overlay */}
      {showOnboarding && (
        <OnboardingOverlay
          onInstallClick={() => {
            setShowOnboarding(false)
            setState(prev => ({ ...prev, isDownloadModalOpen: true }))
          }}
          onDismiss={() => {
            localStorage.setItem('pagestash-onboarding-dismissed', '1')
            setShowOnboarding(false)
          }}
        />
      )}
    </div>
  )
}

interface ClipCardProps {
  clip: Clip
  viewMode: 'grid' | 'list'
  folders: Folder[]
  onClick: () => void
  onUpdate: (clipId: string, updates: Partial<Clip>) => Promise<void>
  onDelete: (clipId: string) => Promise<void>
  onRequestDelete: (clipId: string) => void
  onToggleFavorite: (clipId: string, isFavorite: boolean) => Promise<void>
  priority?: boolean
  isSelectionMode?: boolean
  isSelected?: boolean
  onToggleSelection?: () => void
}

function ClipCard({ clip, viewMode, folders, onClick, onUpdate, onDelete, onRequestDelete, onToggleFavorite, priority = false, isSelectionMode = false, isSelected = false, onToggleSelection }: ClipCardProps) {
  const folder = folders.find(f => f.id === clip.folder_id)
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onRequestDelete(clip.id)
  }

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await onToggleFavorite(clip.id, !clip.is_favorite)
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
    }
  }

  if (viewMode === 'list') {
    return (
      <Card className={`p-3 transition-all duration-200 cursor-pointer ${
        isSelectionMode && isSelected
          ? 'border-2 border-blue-500 bg-blue-50/60 dark:bg-blue-900/20 shadow-lg shadow-blue-500/10'
          : isSelectionMode
          ? 'border-2 border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 hover:border-blue-300 dark:hover:border-blue-500/40'
          : clip.is_favorite
          ? 'border-l-4 border-l-yellow-400 bg-yellow-50/40 dark:bg-yellow-900/10 border-t border-r border-b border-slate-200/60 dark:border-white/10 hover:shadow-lg hover:shadow-black/5'
          : 'border border-slate-200/60 dark:border-white/10 bg-white dark:bg-slate-900 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/30'
      }`} onClick={onClick}>
        <div className="flex items-center space-x-3">
          {isSelectionMode && (
            <button
              type="button"
              aria-pressed={isSelected}
              aria-label={isSelected ? 'Deselect clip' : 'Select clip'}
              className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                isSelected
                  ? 'bg-blue-600 shadow-md shadow-blue-600/30'
                  : 'bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40'
              }`}
              onClick={(e) => {
                e.stopPropagation()
                onToggleSelection?.()
              }}
            >
              {isSelected && <Check className="h-4 w-4 text-white" strokeWidth={3.5} />}
            </button>
          )}
          {clip.screenshot_url && (
            <div className="relative overflow-hidden rounded-md">
              <CachedImage
                src={clip.screenshot_url}
                alt={clip.title}
                width={56}
                height={40}
                className="w-14 h-10 object-top object-cover"
                quality={75}
                priority={priority}
              />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="mb-1">
              <h3 className="font-medium text-sm truncate text-foreground/90">{clip.title}</h3>
            </div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground/80">
              <Globe className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">
                {(() => { try { return new URL(clip.url).hostname } catch { return clip.url } })()}
              </span>
              <span className="text-muted-foreground/50">•</span>
              <div className="flex items-center gap-1 flex-wrap">
                <span>
                  {new Date(clip.created_at).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
                
                {folder && (
                  <>
                    <span className="text-muted-foreground/50">•</span>
                    <Badge 
                      variant="secondary" 
                      className="text-xs px-2 py-0.5 border-0"
                      style={{
                        backgroundColor: `${folder.color}20`,
                        color: folder.color,
                        borderColor: `${folder.color}40`
                      }}
                    >
                      {folder.name}
                    </Badge>
                  </>
                )}
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleFavorite(e);
                  }}
                  className="flex-shrink-0 hover:scale-110 transition-transform"
                >
                  <Star className={`h-3 w-3 transition-colors ${
                    clip.is_favorite 
                      ? 'fill-yellow-500 text-yellow-500' 
                      : 'text-muted-foreground/40 hover:text-yellow-500'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 hover:bg-primary/10"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); window.open(clip.url, '_blank') }}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Open Original
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onClick() }}>
                <Edit3 className="mr-2 h-4 w-4" />
                View & Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>
    )
  }

  const hostname = (() => { try { return new URL(clip.url).hostname.replace('www.', '') } catch { return clip.url } })()
  const faviconSrc = getClipFaviconSrc(clip)

  return (
    <div
      className={`group relative cursor-pointer rounded-2xl overflow-hidden bg-white dark:bg-slate-900 transition-all duration-200 ${
        isSelectionMode && isSelected
          ? 'border-2 border-blue-500 shadow-lg shadow-blue-500/20 dark:shadow-blue-500/10'
          : isSelectionMode
          ? 'border-2 border-slate-200 dark:border-white/[0.08] hover:border-blue-300 dark:hover:border-blue-500/40'
          : 'border border-slate-200/80 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/20 hover:shadow-lg hover:shadow-slate-900/8 dark:hover:shadow-black/30'
      }`}
      onClick={onClick}
    >
      {/* Selected tint overlay — covers entire card, pointer-events-none so clicks pass through */}
      {isSelectionMode && isSelected && (
        <div className="absolute inset-0 bg-blue-500/[0.06] dark:bg-blue-400/[0.08] pointer-events-none z-10" aria-hidden />
      )}

      {/* Screenshot */}
      <div className="aspect-[16/10] bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
        {clip.screenshot_url ? (
          <>
            <CachedImage
              src={clip.screenshot_url}
              alt={clip.title}
              width={400}
              height={250}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
              className="w-full h-full object-cover object-top"
              quality={85}
              priority={priority}
            />
            <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/20 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <FileText className="h-8 w-8 text-slate-300 dark:text-slate-600" />
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">HTML capture</span>
          </div>
        )}

        {/* Favorite pill — top right */}
        <button
          onClick={(e) => { e.stopPropagation(); handleToggleFavorite(e) }}
          className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-150 backdrop-blur-sm shadow-sm ${
            clip.is_favorite
              ? 'opacity-100 bg-white/90 dark:bg-slate-900/90'
              : 'opacity-0 group-hover:opacity-100 bg-white/80 dark:bg-slate-900/80'
          }`}
        >
          <Star className={`h-3.5 w-3.5 transition-colors ${
            clip.is_favorite ? 'fill-yellow-400 text-yellow-400' : 'text-slate-500 hover:text-yellow-400'
          }`} />
        </button>

        {/* Selection checkbox — prominent, always visible in selection mode */}
        {isSelectionMode && (
          <button
            type="button"
            aria-pressed={isSelected}
            aria-label={isSelected ? 'Deselect clip' : 'Select clip'}
            className={`absolute top-2.5 left-2.5 z-20 w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all duration-150 ${
              isSelected
                ? 'bg-blue-600 ring-2 ring-white dark:ring-slate-950 scale-105'
                : 'bg-white/95 dark:bg-slate-900/95 ring-2 ring-white dark:ring-slate-900 hover:bg-blue-50 dark:hover:bg-blue-950/40 backdrop-blur-sm'
            }`}
            onClick={(e) => { e.stopPropagation(); onToggleSelection?.() }}
          >
            {isSelected ? (
              <Check className="h-4 w-4 text-white" strokeWidth={3.5} />
            ) : (
              <div className="w-4 h-4 rounded-full border-2 border-slate-400 dark:border-slate-500" />
            )}
          </button>
        )}
      </div>

      {/* Metadata */}
      <div className="px-3 pt-2.5 pb-3">
        <h3 className="font-semibold text-[13px] leading-snug text-slate-900 dark:text-white line-clamp-2 mb-2">
          {clip.title}
        </h3>

        <div className="flex items-center justify-between gap-2">
          {/* Source */}
          <div className="flex items-center gap-1.5 min-w-0">
            {faviconSrc ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={faviconSrc} alt="" width={12} height={12} className="w-3 h-3 rounded-sm flex-shrink-0 opacity-60" />
            ) : (
              <Globe className="w-3 h-3 flex-shrink-0 text-slate-400 dark:text-slate-500 opacity-60" aria-hidden />
            )}
            <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{hostname}</span>
            {folder && (
              <>
                <span className="text-slate-300 dark:text-slate-700 flex-shrink-0">·</span>
                <span className="text-[11px] font-medium truncate flex-shrink-0" style={{ color: folder.color }}>
                  {folder.name}
                </span>
              </>
            )}
          </div>

          {/* Date + menu */}
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <span className="text-[11px] text-slate-400 dark:text-slate-500 whitespace-nowrap">
              {new Date(clip.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="h-6 w-6 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-100 dark:hover:bg-slate-800 ml-0.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-3.5 w-3.5 text-slate-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); window.open(clip.url, '_blank') }}>
                  <ExternalLink className="mr-2 h-4 w-4" />Open Original
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onClick() }}>
                  <Edit3 className="mr-2 h-4 w-4" />View &amp; Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
