'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  X, 
  ExternalLink, 
  Edit3, 
  Save, 
  Tag, 
  Plus, 
  Trash2,
  Calendar,
  Globe,
  FileText,
  Image,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Folder,
  MoreHorizontal,
  Search,
  Code,
  Camera,
  StickyNote,
  Highlighter,
  Check,
  Download,
  Share2,
  Link,
  Copy,
  Scan,
  Clipboard,
  Mail
} from 'lucide-react'
import { ScreenshotAnnotationCanvas, type Annotation } from './ScreenshotAnnotationCanvas'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Clip, Folder as FolderType } from '@pagestash/shared'
import { extractEntities, entityCount, ENTITY_SECTIONS, type ExtractedEntities, type EntityCategory } from '@/utils/entityExtractor'
import { exportMarkdown } from '@/lib/export'
import {
  User,
  Building2,
  Server,
  Cpu,
  Phone,
  AtSign,
  Bitcoin,
  DollarSign,
  BookOpen,
  Bookmark,
  Shield,
  Fingerprint,
  AlertTriangle,
  Hash,
  MapPin,
  Landmark,
  Sparkles,
  RefreshCw,
} from 'lucide-react'

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  'user': User,
  'building': Building2,
  'mail': Mail,
  'globe': Globe,
  'link': Link,
  'server': Server,
  'cpu': Cpu,
  'phone': Phone,
  'at-sign': AtSign,
  'bitcoin': Bitcoin,
  'dollar-sign': DollarSign,
  'book-open': BookOpen,
  'bookmark': Bookmark,
  'shield': Shield,
  'fingerprint': Fingerprint,
  'alert-triangle': AlertTriangle,
  'hash': Hash,
  'map-pin': MapPin,
  'landmark': Landmark,
  'sparkles': Sparkles,
  'calendar': Calendar,
  'scan': Scan,
}

const CATEGORY_COLORS: Record<EntityCategory, { bg: string; border: string; text: string; badge: string }> = {
  identity:  { bg: 'bg-violet-50 dark:bg-violet-950/30', border: 'border-violet-200 dark:border-violet-800/40', text: 'text-violet-700 dark:text-violet-300', badge: 'bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300' },
  digital:   { bg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-blue-200 dark:border-blue-800/40', text: 'text-blue-700 dark:text-blue-300', badge: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' },
  financial: { bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-200 dark:border-emerald-800/40', text: 'text-emerald-700 dark:text-emerald-300', badge: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300' },
  academic:  { bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-200 dark:border-amber-800/40', text: 'text-amber-700 dark:text-amber-300', badge: 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300' },
  osint:     { bg: 'bg-red-50 dark:bg-red-950/30', border: 'border-red-200 dark:border-red-800/40', text: 'text-red-700 dark:text-red-300', badge: 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300' },
  general:   { bg: 'bg-slate-50 dark:bg-slate-800/50', border: 'border-slate-200 dark:border-slate-700', text: 'text-slate-700 dark:text-slate-300', badge: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300' },
  metadata:  { bg: 'bg-sky-50 dark:bg-sky-950/30', border: 'border-sky-200 dark:border-sky-800/40', text: 'text-sky-700 dark:text-sky-300', badge: 'bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300' },
}

function EntitiesView({ clip }: { clip: Clip }) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [isReExtracting, setIsReExtracting] = useState(false)

  const storedEntities = (clip as any).entities as ExtractedEntities | null

  const entities = storedEntities && entityCount(storedEntities) > 0
    ? storedEntities
    : extractEntities(
        [clip.text_content || '', clip.title || '', clip.url || ''].join('\n'),
        clip.url,
        (clip as any).html_content || undefined
      )

  const total = entityCount(entities)

  const copyValue = (val: string, key: string) => {
    navigator.clipboard.writeText(val)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 1500)
  }

  const handleReExtract = async () => {
    setIsReExtracting(true)
    try {
      await fetch(`/api/clips/${clip.id}/entities`, { method: 'POST' })
      window.location.reload()
    } catch {
      setIsReExtracting(false)
    }
  }

  // Group sections by category
  const categories = new Map<string, typeof ENTITY_SECTIONS>()
  for (const section of ENTITY_SECTIONS) {
    const items = entities[section.key as keyof ExtractedEntities]
    if (!Array.isArray(items) || items.length === 0) continue
    if (!categories.has(section.category)) categories.set(section.category, [])
    categories.get(section.category)!.push(section)
  }

  // Page metadata
  const meta = entities.metadata || {}
  const hasMetadata = Object.keys(meta).filter(k => {
    const v = meta[k as keyof typeof meta]
    return v !== undefined && v !== null && v !== ''
  }).length > 0

  if (total === 0 && !hasMetadata) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <Scan className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="font-medium">No entities detected</p>
          <p className="text-xs mt-1 max-w-xs mx-auto">
            People, organizations, emails, IPs, crypto addresses, and more will appear here when found in clip content.
          </p>
          <button
            onClick={handleReExtract}
            disabled={isReExtracting}
            className="mt-4 text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5 mx-auto"
          >
            <RefreshCw className={`h-3 w-3 ${isReExtracting ? 'animate-spin' : ''}`} />
            {isReExtracting ? 'Extracting...' : 'Re-extract entities'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{total} entities found</h3>
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
              {categories.size} categories
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleReExtract}
              disabled={isReExtracting}
              className="text-xs text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 transition-colors"
              title="Re-extract entities from content"
            >
              <RefreshCw className={`h-3 w-3 ${isReExtracting ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => copyValue(JSON.stringify(entities, null, 2), '__all__')}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <Clipboard className="h-3 w-3" />
              {copiedKey === '__all__' ? 'Copied!' : 'Copy all as JSON'}
            </button>
          </div>
        </div>

        {/* Page Metadata */}
        {hasMetadata && (
          <div className={`rounded-xl border p-4 ${CATEGORY_COLORS.metadata.bg} ${CATEGORY_COLORS.metadata.border}`}>
            <h4 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${CATEGORY_COLORS.metadata.text}`}>
              Page Metadata
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {meta.author && (
                <div className="text-sm"><span className="text-slate-500 dark:text-slate-400">Author:</span> <span className="font-medium text-slate-800 dark:text-slate-200">{meta.author}</span></div>
              )}
              {meta.siteName && (
                <div className="text-sm"><span className="text-slate-500 dark:text-slate-400">Site:</span> <span className="font-medium text-slate-800 dark:text-slate-200">{meta.siteName}</span></div>
              )}
              {meta.publishedDate && (
                <div className="text-sm"><span className="text-slate-500 dark:text-slate-400">Published:</span> <span className="font-medium text-slate-800 dark:text-slate-200">{meta.publishedDate}</span></div>
              )}
              {meta.language && (
                <div className="text-sm"><span className="text-slate-500 dark:text-slate-400">Language:</span> <span className="font-medium text-slate-800 dark:text-slate-200">{meta.language}</span></div>
              )}
              {meta.description && (
                <div className="text-sm col-span-full"><span className="text-slate-500 dark:text-slate-400">Description:</span> <span className="text-slate-700 dark:text-slate-300">{meta.description}</span></div>
              )}
              {meta.keywords && meta.keywords.length > 0 && (
                <div className="col-span-full flex flex-wrap gap-1.5 mt-1">
                  {meta.keywords.map((kw, i) => (
                    <span key={i} className="text-[11px] px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 font-medium">{kw}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Entity Categories */}
        {[...categories.entries()].map(([category, sections]) => {
          const colors = CATEGORY_COLORS[category as EntityCategory] || CATEGORY_COLORS.general
          const categoryLabel = sections[0].categoryLabel
          const categoryTotal = sections.reduce((sum, s) => {
            const items = entities[s.key as keyof ExtractedEntities]
            return sum + (Array.isArray(items) ? items.length : 0)
          }, 0)

          return (
            <div key={category} className={`rounded-xl border ${colors.border} overflow-hidden`}>
              <div className={`px-4 py-2.5 ${colors.bg} flex items-center justify-between`}>
                <h4 className={`text-xs font-semibold uppercase tracking-wider ${colors.text}`}>
                  {categoryLabel}
                </h4>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${colors.badge}`}>
                  {categoryTotal}
                </span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-white/5">
                {sections.map(section => {
                  const items = entities[section.key as keyof ExtractedEntities] as string[]
                  const Icon = ICON_MAP[section.icon] || Scan

                  return (
                    <div key={section.key} className="px-4 py-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{section.label}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">{items.length}</span>
                      </div>
                      <div className="space-y-1">
                        {items.map((item, i) => {
                          const itemKey = `${section.key}-${i}`
                          return (
                            <div
                              key={itemKey}
                              className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-white/5 group hover:border-blue-200 dark:hover:border-blue-800 transition-colors"
                            >
                              <span className="text-sm text-slate-800 dark:text-slate-200 font-mono truncate mr-3 select-all">{item}</span>
                              <button
                                onClick={() => copyValue(item, itemKey)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 shrink-0 flex items-center gap-1"
                              >
                                {copiedKey === itemKey ? (
                                  <><Check className="h-3 w-3 text-emerald-500" /> Copied</>
                                ) : (
                                  <><Copy className="h-3 w-3" /> Copy</>
                                )}
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface ClipViewerProps {
  clip: Clip | null
  clips: Clip[]
  folders: FolderType[]
  isOpen: boolean
  onClose: () => void
  onUpdate: (clipId: string, updates: Partial<Clip>) => Promise<void>
  onDelete: (clipId: string) => Promise<void>
  onNavigate: (direction: 'prev' | 'next') => void
}

interface ReaderViewProps {
  content: string
  searchQuery: string
  currentMatchIndex: number
  clipUrl: string
  onTextSelection: (event?: React.MouseEvent<HTMLDivElement>) => void
  highlightFn: (text: string, query: string, currentIndex: number) => string
}

function ReaderView({ content, searchQuery, currentMatchIndex, clipUrl, onTextSelection, highlightFn }: ReaderViewProps) {
  const [copyButton, setCopyButton] = useState<{ x: number; y: number; text: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    onTextSelection(e)

    const selection = window.getSelection()
    const selected = selection?.toString().trim()
    if (!selected) {
      setCopyButton(null)
      return
    }

    const range = selection?.getRangeAt(0)
    if (!range) return
    const rect = range.getBoundingClientRect()
    const containerRect = containerRef.current?.getBoundingClientRect()
    if (!containerRect) return

    setCopyButton({
      x: rect.left - containerRect.left + rect.width / 2,
      y: rect.top - containerRect.top - 8,
      text: selected,
    })
    setCopied(false)
  }

  const handleCopyWithSource = () => {
    if (!copyButton) return
    const textToCopy = `${copyButton.text}\n\nSource: ${clipUrl}`
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true)
      setTimeout(() => {
        setCopyButton(null)
        setCopied(false)
      }, 1200)
    })
  }

  const paragraphs = content.split(/\n\n+/).filter(p => p.trim())

  return (
    <div className="flex-1 bg-muted/30 overflow-auto relative" ref={containerRef}>
      <div className="max-w-2xl mx-auto px-6 py-8">
        {searchQuery ? (
          <div
            className="text-lg font-serif leading-8 text-slate-800 dark:text-slate-200 whitespace-pre-wrap break-words"
            onMouseUp={handleMouseUp}
            dangerouslySetInnerHTML={{
              __html: highlightFn(content, searchQuery, currentMatchIndex),
            }}
          />
        ) : (
          <div className="space-y-5" onMouseUp={handleMouseUp}>
            {paragraphs.map((para, i) => (
              <p
                key={i}
                className="text-lg font-serif leading-8 text-slate-800 dark:text-slate-200 break-words"
              >
                {para.trim()}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Floating "Copy with source" button */}
      {copyButton && (
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleCopyWithSource}
          className="absolute z-10 -translate-x-1/2 -translate-y-full px-3 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-lg shadow-xl hover:bg-slate-700 transition-colors whitespace-nowrap"
          style={{ left: copyButton.x, top: copyButton.y }}
        >
          {copied ? '✓ Copied!' : 'Copy with source'}
        </button>
      )}
    </div>
  )
}

export function ClipViewer({ 
  clip, 
  clips, 
  folders, 
  isOpen, 
  onClose, 
  onUpdate, 
  onDelete,
  onNavigate 
}: ClipViewerProps) {
  const [editForm, setEditForm] = useState({
    title: '',
    notes: '',
    folder_id: '',
  })
  const [newTag, setNewTag] = useState('')
  const [showTagSuggestions, setShowTagSuggestions] = useState(false)
  const [tagSaveStatus, setTagSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const tagInputRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [activeTab, setActiveTab] = useState(clip?.screenshot_url ? 'screenshot' : 'html')
  const [htmlViewMode, setHtmlViewMode] = useState('html-rendered')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedText, setSelectedText] = useState('')
  const [showAddNote, setShowAddNote] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0)
  const [totalMatches, setTotalMatches] = useState(0)
  const [availableTags, setAvailableTags] = useState<Array<{id: string, name: string, color?: string}>>([])
  const [clipTags, setClipTags] = useState<Array<{id: string, name: string, color?: string}>>([])
  const [newTagName, setNewTagName] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  // Full clip data (html_content / text_content not sent in list responses — fetched on open)
  const [fullClip, setFullClip] = useState<Clip | null>(null)
  const [isLoadingContent, setIsLoadingContent] = useState(false)
  // Transient "Copied!" confirmation for the header copy button
  const [copiedFlash, setCopiedFlash] = useState(false)
  // Floating copy-with-source affordance on the Markdown tab
  const [mdSelection, setMdSelection] = useState<{ x: number; y: number; text: string } | null>(null)
  const [mdSelectionCopied, setMdSelectionCopied] = useState(false)
  const markdownContainerRef = useRef<HTMLDivElement>(null)

  // Clear any floating markdown selection affordance when switching tabs or clips.
  useEffect(() => {
    setMdSelection(null)
    setMdSelectionCopied(false)
  }, [activeTab, clip?.id])

  // Markdown representation of the current clip — derived on demand for the .md tab + copy action.
  const markdownContent = useMemo(() => {
    const source = fullClip ?? clip
    if (!source) return ''
    return exportMarkdown([source], folders, {
      includeFullContent: true,
      includeScreenshots: true,
      includeNotes: true,
      includeMetadata: true,
      includeEntities: true,
    })
  }, [fullClip, clip, folders])

  // Lazy-load full clip content when viewer opens or clip changes
  useEffect(() => {
    if (!isOpen || !clip) {
      setFullClip(null)
      return
    }
    // If the prop already carries full content (e.g. from extension), skip fetch
    if (clip.html_content != null || clip.text_content != null) {
      setFullClip(clip)
      return
    }
    let cancelled = false
    setIsLoadingContent(true)
    fetch(`/api/clips/${clip.id}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!cancelled) {
          setFullClip(data?.clip ?? clip)
          setIsLoadingContent(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFullClip(clip)
          setIsLoadingContent(false)
        }
      })
    return () => { cancelled = true }
  }, [isOpen, clip?.id])

  // Merge live prop updates (title, notes, etc.) into fullClip
  useEffect(() => {
    if (clip && fullClip && clip.id === fullClip.id) {
      setFullClip(prev => prev ? { ...prev, ...clip, html_content: prev.html_content, text_content: prev.text_content } : null)
    }
  }, [clip])

  useEffect(() => {
    if (clip) {
      setEditForm({
        title: clip.title,
        notes: clip.notes || '',
        folder_id: clip.folder_id || '',
      })
      setHasUnsavedChanges(false)
      setActiveTab(clip.screenshot_url ? 'screenshot' : 'html')
      isInitialTagLoad.current = true
      isApiTagUpdate.current = false
      setTagSaveStatus('idle')
    }
  }, [clip?.id])

  // Parse screenshot annotations from notes
  const parseScreenshotAnnotations = (notes: string): Annotation[] => {
    if (!notes) return []
    
    const annotations: Annotation[] = []
    // Updated regex to handle optional thumb parameter
    const annotationRegex = /📍 SCREENSHOT \[x:(\d+),y:(\d+),w:(\d+),h:(\d+)(?:,thumb:[^\]]*)?\]\n([^\n📍]+(?:\n(?!📍)[^\n]+)*)/g
    
    let match
    while ((match = annotationRegex.exec(notes)) !== null) {
      annotations.push({
        id: `annotation-${annotations.length}`,
        x: parseInt(match[1]),
        y: parseInt(match[2]),
        width: parseInt(match[3]),
        height: parseInt(match[4]),
        color: '#3b82f6',
        note: match[5].trim(),
        createdAt: new Date().toISOString()
      })
    }
    
    return annotations
  }

  // Load available tags and clip tags in parallel
  useEffect(() => {
    if (!isOpen || !clip) return
    let cancelled = false

    const loadTags = async () => {
      try {
        const [tagsRes, clipTagsRes] = await Promise.all([
          fetch('/api/tags'),
          fetch(`/api/clips/${clip.id}/tags`),
        ])
        if (cancelled) return
        if (tagsRes.ok) setAvailableTags(await tagsRes.json())
        if (clipTagsRes.ok) setClipTags(await clipTagsRes.json())
      } catch (error) {
        console.error('Error loading tags:', error)
      }
    }

    loadTags()
    return () => { cancelled = true }
  }, [isOpen, clip?.id])

  // Calculate navigation state
  const currentIndex = clip ? clips.findIndex(c => c.id === clip.id) : -1
  const canNavigatePrev = currentIndex > 0
  const canNavigateNext = currentIndex >= 0 && currentIndex < clips.length - 1

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't interfere with typing in inputs
      if (event.target instanceof HTMLInputElement || 
          event.target instanceof HTMLTextAreaElement ||
          event.target instanceof HTMLSelectElement) {
        return
      }

      switch (event.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
          event.preventDefault()
          if (canNavigatePrev) {
            onNavigate('prev')
          }
          break
        case 'ArrowRight':
        case 'ArrowDown':
          event.preventDefault()
          if (canNavigateNext) {
            onNavigate('next')
          }
          break
        case 'Escape':
          event.preventDefault()
          onClose()
          break
        case '1':
          event.preventDefault()
          setActiveTab('screenshot')
          break
        case '2':
          event.preventDefault()
          setActiveTab('html')
          break
        case '3':
          event.preventDefault()
          setActiveTab('text')
          break
        case '4':
          event.preventDefault()
          setActiveTab('markdown')
          break
        case '5':
          event.preventDefault()
          setActiveTab('entities')
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, canNavigatePrev, canNavigateNext, onNavigate, onClose])

  // Auto-save metadata when form changes
  useEffect(() => {
    if (!clip || !hasUnsavedChanges) return

    const timeoutId = setTimeout(async () => {
      try {
        await onUpdate(clip.id, {
          title: editForm.title,
          notes: editForm.notes,
          folder_id: editForm.folder_id || undefined,
        })
        setHasUnsavedChanges(false)
      } catch (error) {
        console.error('Auto-save failed:', error)
      }
    }, 1000)

    return () => clearTimeout(timeoutId)
  }, [editForm, clip, hasUnsavedChanges, onUpdate])

  // Refs for tag save logic — prevent infinite loops and initial-load saves
  const isInitialTagLoad = useRef(true)
  const isApiTagUpdate = useRef(false)
  useEffect(() => {
    if (!clip || !isOpen) return
    if (isInitialTagLoad.current) {
      isInitialTagLoad.current = false
      return
    }
    if (isApiTagUpdate.current) {
      isApiTagUpdate.current = false
      return
    }

    setTagSaveStatus('saving')
    const timeoutId = setTimeout(async () => {
      try {
        const response = await fetch(`/api/clips/${clip.id}/tags`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tagNames: clipTags.map(t => t.name) }),
        })
        if (response.ok) {
          const result = await response.json()
          if (result.tags) {
            isApiTagUpdate.current = true
            setClipTags(result.tags)
            const tagsRes = await fetch('/api/tags')
            if (tagsRes.ok) setAvailableTags(await tagsRes.json())
          }
          setTagSaveStatus('saved')
          setTimeout(() => setTagSaveStatus('idle'), 1500)
        } else {
          console.error('Tag save failed with status:', response.status)
          setTagSaveStatus('idle')
        }
      } catch (error) {
        console.error('Tag save failed:', error)
        setTagSaveStatus('idle')
      }
    }, 600)

    return () => clearTimeout(timeoutId)
  }, [clipTags])

  const handleFormChange = (field: string, value: string) => {
    // Handle special "no-folder" value
    const processedValue = field === 'folder_id' && value === 'no-folder' ? '' : value
    setEditForm(prev => ({ ...prev, [field]: processedValue }))
    setHasUnsavedChanges(true)
  }

  // Copy the content of whatever tab is currently active. Returns a human label for toast copy.
  const handleCopyActiveTab = () => {
    if (!clip) return
    let payload = ''
    switch (activeTab) {
      case 'screenshot':
        payload = clip.screenshot_url ?? ''
        break
      case 'html':
        payload = fullClip?.html_content ?? ''
        break
      case 'text':
        payload = fullClip?.text_content ?? ''
        break
      case 'markdown':
        payload = markdownContent
        break
      case 'entities': {
        const storedEntities = (clip as any).entities as ExtractedEntities | null
        const entities = storedEntities && entityCount(storedEntities) > 0
          ? storedEntities
          : extractEntities(`${clip.title ?? ''} ${clip.url ?? ''} ${fullClip?.text_content ?? ''}`)
        payload = ENTITY_SECTIONS
          .map(s => {
            const items = entities[s.key as keyof ExtractedEntities] as string[]
            if (!items || items.length === 0) return ''
            return `${s.label}:\n  ${items.join('\n  ')}`
          })
          .filter(Boolean)
          .join('\n\n')
        break
      }
    }
    if (!payload) return
    navigator.clipboard.writeText(payload).then(() => {
      setCopiedFlash(true)
      window.setTimeout(() => setCopiedFlash(false), 1400)
    })
  }

  // Update match count when search query or active tab changes
  useEffect(() => {
    if (!searchQuery.trim() || !clip) {
      setTotalMatches(0)
      setCurrentMatchIndex(0)
      return
    }

    let matches = 0
    if (activeTab === 'text' && fullClip?.text_content) {
      matches = countMatches(fullClip.text_content, searchQuery)
    } else if (activeTab === 'html' && fullClip?.html_content) {
      matches = countMatches(fullClip.html_content, searchQuery)
    }
    
    setTotalMatches(matches)
    setCurrentMatchIndex(0)
  }, [searchQuery, activeTab, fullClip?.text_content, fullClip?.html_content, fullClip])

  const updateIframeHighlighting = (newIndex: number) => {
    const iframe = document.querySelector('iframe[title="HTML Content Preview"]') as HTMLIFrameElement
    if (iframe && iframe.contentWindow && searchQuery) {
      iframe.contentWindow.postMessage({
        type: 'highlight',
        searchTerm: searchQuery,
        currentIndex: newIndex
      }, '*')
    }
  }

  // Update iframe highlighting when currentMatchIndex changes or when search starts
  useEffect(() => {
    if (activeTab === 'html' && htmlViewMode === 'html-rendered' && searchQuery && totalMatches > 0) {
      // Add a small delay to ensure iframe is loaded
      setTimeout(() => {
        updateIframeHighlighting(currentMatchIndex)
      }, 200)
    }
  }, [currentMatchIndex, activeTab, htmlViewMode, searchQuery, totalMatches])

  const countMatches = (text: string, query: string) => {
    if (!query.trim()) return 0
    const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
    const matches = text.match(regex)
    return matches ? matches.length : 0
  }

  const highlightSearchText = (text: string, query: string, currentIndex = 0) => {
    if (!query.trim()) return text
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    let matchCount = 0
    
    return text.replace(regex, (match) => {
      const isCurrentMatch = matchCount === currentIndex
      matchCount++
      
      if (isCurrentMatch) {
        return `<mark class="bg-orange-300 text-orange-900 px-1 rounded border-2 border-orange-500" id="current-match">${match}</mark>`
      } else {
        return `<mark class="bg-yellow-200 text-yellow-900 px-1 rounded">${match}</mark>`
      }
    })
  }

  const highlightSearchTextForSourceCode = (text: string, query: string, currentIndex = 0) => {
    if (!query.trim()) return text
    
    // For source code, we need to escape HTML first, then add highlighting
    const escapedText = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    let matchCount = 0
    
    return escapedText.replace(regex, (match) => {
      const isCurrentMatch = matchCount === currentIndex
      matchCount++
      
      if (isCurrentMatch) {
        return `<mark class="bg-orange-300 text-orange-900 px-1 rounded border-2 border-orange-500" id="current-match">${match}</mark>`
      } else {
        return `<mark class="bg-yellow-200 text-yellow-900 px-1 rounded">${match}</mark>`
      }
    })
  }

  const navigateToMatch = (direction: 'next' | 'prev') => {
    if (totalMatches === 0) return
    
    let newIndex
    if (direction === 'next') {
      newIndex = currentMatchIndex >= totalMatches - 1 ? 0 : currentMatchIndex + 1
    } else {
      newIndex = currentMatchIndex <= 0 ? totalMatches - 1 : currentMatchIndex - 1
    }
    
    setCurrentMatchIndex(newIndex)
    
    // Update iframe highlighting if in HTML rendered view
    if (activeTab === 'html' && htmlViewMode === 'html-rendered') {
      updateIframeHighlighting(newIndex)
    }
    
    // Scroll to current match - handle different tab types
    setTimeout(() => {
      if (activeTab === 'html' && htmlViewMode === 'html-rendered') {
        // For iframe (HTML Rendered view) - scrolling is handled inside the iframe
        // The iframe will receive the postMessage and handle highlighting + scrolling
      } else {
        // For main document (Text tab and HTML Source Code)
        const currentMatch = document.getElementById('current-match')
        if (currentMatch) {
          currentMatch.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }
    }, 100)
  }

  const handleAddNoteFromSelection = async () => {
    if (!selectedText || !noteText.trim()) return
    
    // Simple format: just the quoted text and the note (tight spacing)
    const noteWithSelection = `> "${selectedText}"\n${noteText.trim()}`
    const currentNotes = editForm.notes ? `${editForm.notes}\n\n${noteWithSelection}` : noteWithSelection
    
    handleFormChange('notes', currentNotes)
    setSelectedText('')
    setNoteText('')
    setShowAddNote(false)
  }

  // State for highlighted annotation
  const [highlightedAnnotation, setHighlightedAnnotation] = useState<{x: number, y: number} | null>(null)
  // State for expanded annotations in notes
  const [expandedAnnotations, setExpandedAnnotations] = useState<Set<number>>(new Set())
  // State for focus mode
  const [isFocusModeOpen, setIsFocusModeOpen] = useState(false)

  // Auto-expand all annotations by default when notes change
  useEffect(() => {
    if (editForm.notes && editForm.notes.includes('📍 SCREENSHOT')) {
      // Count how many annotations exist
      const annotationCount = (editForm.notes.match(/📍 SCREENSHOT/g) || []).length
      // Expand all of them by default
      const allExpanded = new Set(Array.from({ length: annotationCount }, (_, i) => i))
      setExpandedAnnotations(allExpanded)
    }
  }, [clip?.id, editForm.notes])

  // Keep annotations expanded when Focus Mode opens (they're already expanded)
  useEffect(() => {
    if (isFocusModeOpen && editForm.notes && editForm.notes.includes('📍 SCREENSHOT')) {
      // Count how many annotations exist
      const annotationCount = (editForm.notes.match(/📍 SCREENSHOT/g) || []).length
      // Expand all of them
      const allExpanded = new Set(Array.from({ length: annotationCount }, (_, i) => i))
      setExpandedAnnotations(allExpanded)
    }
  }, [isFocusModeOpen, editForm.notes])

  // Toggle annotation expansion in notes panel
  const handleToggleAnnotation = (annotationIndex: number, event?: Event) => {
    if (event) {
      event.stopPropagation()
    }
    setExpandedAnnotations(prev => {
      const newSet = new Set(prev)
      if (newSet.has(annotationIndex)) {
        newSet.delete(annotationIndex)
      } else {
        newSet.add(annotationIndex)
      }
      return newSet
    })
  }

  // Handle screenshot annotation click - scroll to annotation
  const handleScreenshotAnnotationClick = (annotationIndex: number, x: number, y: number, event?: Event) => {
    if (event) {
      event.stopPropagation()
    }
    
    // Switch to screenshot tab
    setActiveTab('screenshot')
    
    // Highlight the annotation
    setHighlightedAnnotation({x, y})
    
    // Scroll to annotation after tab switch
    setTimeout(() => {
      // Find the screenshot container
      const container = document.querySelector('[data-screenshot-container]') as HTMLElement
      if (container) {
        // Scroll to annotation Y position (with offset for visibility)
        container.scrollTop = y - 100
      }
      
      // Clear highlight after 2 seconds
      setTimeout(() => setHighlightedAnnotation(null), 2000)
    }, 100)
  }

  // Expose functions to window for onclick handlers
  useEffect(() => {
    ;(window as any).navigateToAnnotation = handleScreenshotAnnotationClick
    ;(window as any).toggleAnnotation = handleToggleAnnotation
    ;(window as any).isAnnotationExpanded = (index: number) => expandedAnnotations.has(index)
    return () => {
      delete (window as any).navigateToAnnotation
      delete (window as any).toggleAnnotation
      delete (window as any).isAnnotationExpanded
    }
  }, [handleScreenshotAnnotationClick, handleToggleAnnotation, expandedAnnotations])

  const formatNotesDisplay = (notes: string) => {
    if (!notes) return notes
    
    let annotationIndex = 0
    let result = notes
    
    // First, extract and replace screenshot annotations with note text
    result = result.replace(/📍 SCREENSHOT \[x:(\d+),y:(\d+),w:(\d+),h:(\d+)(?:,thumb:([^\]]*))?\]\n([^\n📍]+(?:\n(?!📍)[^\n]+)*)/g, (match, x, y, w, h, thumb, noteText) => {
      const index = annotationIndex++
      const isExpanded = expandedAnnotations.has(index)
      
      // Completely redesigned clean badge with solid styling
      if (thumb && thumb.trim()) {
        // With thumbnail - ultra-clean design with simple hover popup
        const badge = `<div style="display:block;margin-bottom:0.5rem;background:#faf5ff;border:1px solid #e9d5ff;border-radius:0.375rem;overflow:visible;"><div style="position:relative;"><div style="display:flex;align-items:center;gap:0.5rem;padding:0.375rem 0.5rem;cursor:pointer;background:#faf5ff;transition:background 0.2s;" onclick="window.toggleAnnotation?.(${index},event)" onmouseover="this.style.background='#f3e8ff'" onmouseout="this.style.background='#faf5ff'"><div style="position:relative;flex-shrink:0;width:2rem;height:2rem;background:#f3e8ff;border-radius:0.25rem;overflow:visible;" onmouseenter="this.querySelector('.hover-preview').style.opacity='1'" onmouseleave="this.querySelector('.hover-preview').style.opacity='0'"><img src="${thumb}" alt="" style="width:100%;height:100%;object-fit:cover;display:block;margin:0;padding:0;border:0;border-radius:0.25rem;" /><img class="hover-preview" src="${thumb}" alt="" style="position:absolute;left:100%;margin-left:1rem;top:50%;transform:translateY(-50%);width:12rem;height:12rem;object-fit:cover;display:block;border-radius:0.5rem;opacity:0;pointer-events:none;transition:opacity 0.15s;z-index:1000;box-shadow:0 20px 25px -5px rgba(0,0,0,0.2),0 10px 10px -5px rgba(0,0,0,0.1);border:3px solid white;" /></div><span style="flex:1;font-size:0.75rem;font-weight:500;color:#7c3aed;">Screenshot Annotation</span><svg style="width:1rem;height:1rem;color:#7c3aed;flex-shrink:0;transition:transform 0.2s;transform:rotate(${isExpanded ? '180' : '0'}deg);" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg></div><button onclick="window.navigateToAnnotation?.(${index},${x},${y},event)" style="position:absolute;right:2.5rem;top:50%;transform:translateY(-50%);opacity:0;transition:opacity 0.2s;padding:0.25rem 0.5rem;background:#7c3aed;color:white;font-size:0.75rem;border-radius:0.25rem;border:0;cursor:pointer;" onmouseover="this.style.opacity='1';this.style.background='#6d28d9'" onmouseout="this.style.opacity='0'" title="Jump"><svg style="width:0.75rem;height:0.75rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg></button></div>${isExpanded ? `<div style="display:block;padding:0.75rem;font-size:0.875rem;color:#374151;border-top:1px solid #e9d5ff;background:white;">${noteText.trim().replace(/\n/g, '<br>')}</div>` : ''}</div>`
        return badge
      } else {
        // Without thumbnail - ultra-clean design with icon
        const badge = `<div style="display:block;margin-bottom:0.5rem;background:#faf5ff;border:1px solid #e9d5ff;border-radius:0.375rem;overflow:hidden;"><div style="position:relative;"><div style="display:flex;align-items:center;gap:0.375rem;padding:0.375rem 0.5rem;cursor:pointer;background:#faf5ff;transition:background 0.2s;" onclick="window.toggleAnnotation?.(${index},event)" onmouseover="this.style.background='#f3e8ff'" onmouseout="this.style.background='#faf5ff'"><svg style="width:0.875rem;height:0.875rem;color:#7c3aed;flex-shrink:0;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg><span style="flex:1;font-size:0.75rem;font-weight:500;color:#7c3aed;">Screenshot Annotation</span><svg style="width:1rem;height:1rem;color:#7c3aed;flex-shrink:0;transition:transform 0.2s;transform:rotate(${isExpanded ? '180' : '0'}deg);" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg></div><button onclick="window.navigateToAnnotation?.(${index},${x},${y},event)" style="position:absolute;right:2.5rem;top:50%;transform:translateY(-50%);opacity:0;transition:opacity 0.2s;padding:0.25rem 0.5rem;background:#7c3aed;color:white;font-size:0.75rem;border-radius:0.25rem;border:0;cursor:pointer;" onmouseover="this.style.opacity='1';this.style.background='#6d28d9'" onmouseout="this.style.opacity='0'" title="Jump"><svg style="width:0.75rem;height:0.75rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg></button></div>${isExpanded ? `<div style="display:block;padding:0.75rem;font-size:0.875rem;color:#374151;border-top:1px solid #e9d5ff;background:white;">${noteText.trim().replace(/\n/g, '<br>')}</div>` : ''}</div>`
        return badge
      }
    })
    
    // Format blockquotes (excerpts) - clean and tight
    result = result.replace(/^> "(.*?)"$/gm, '<div class="mb-1 p-2 bg-blue-50 border-l-4 border-blue-400 rounded-r"><div class="text-sm italic text-gray-700 font-medium">"$1"</div></div>')
    
    // Format line breaks
    result = result.replace(/\n/g, '<br>')
    
    return result
  }

  // Receive text selections from the sandboxed iframe via postMessage
  useEffect(() => {
    if (!isOpen) return
    const onMessage = (event: MessageEvent) => {
      if (event.data?.type === 'ps-selection' && event.data.text) {
        setSelectedText(event.data.text)
        setShowAddNote(true)
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [isOpen])

  if (!isOpen || !clip) return null

  const handleDelete = async () => {
    if (!clip) return
    setIsLoading(true)
    try {
      await onDelete(clip.id)
      onClose()
    } catch (error) {
      console.error('Failed to delete clip:', error)
    } finally {
      setIsLoading(false)
      setShowDeleteConfirm(false)
    }
  }

  const handleAddTag = (tagName?: string) => {
    const name = (tagName || newTag).trim()
    if (!name) return
    if (clipTags.some(t => t.name.toLowerCase() === name.toLowerCase())) return
    const existing = availableTags.find(t => t.name.toLowerCase() === name.toLowerCase())
    setClipTags(prev => [...prev, existing || { id: `temp-${Date.now()}`, name, color: undefined }])
    setNewTag('')
  }

  const handleRemoveTag = (tagName: string) => {
    setClipTags(prev => prev.filter(t => t.name !== tagName))
  }

  const handleTextSelection = (event?: any) => {
    // For non-iframe contexts (text/source tabs)
    const selection = window.getSelection()
    if (selection && selection.toString().trim()) {
      setSelectedText(selection.toString().trim())
      setShowAddNote(true)
    }
  }

  // Markdown tab: capture selection, place a floating copy button at the anchor, and
  // feed the "Add note" flow the same way the Reader (Text) tab does.
  const handleMarkdownMouseUp = (event: React.MouseEvent<HTMLElement>) => {
    handleTextSelection(event)

    const selection = window.getSelection()
    const selected = selection?.toString().trim()
    if (!selected) {
      setMdSelection(null)
      return
    }
    const range = selection?.getRangeAt(0)
    if (!range || !markdownContainerRef.current) return
    const rect = range.getBoundingClientRect()
    const containerRect = markdownContainerRef.current.getBoundingClientRect()
    setMdSelection({
      x: rect.left - containerRect.left + rect.width / 2,
      y: rect.top - containerRect.top - 8,
      text: selected,
    })
    setMdSelectionCopied(false)
  }

  const handleCopyMarkdownSelection = () => {
    if (!mdSelection || !clip) return
    const textToCopy = `${mdSelection.text}\n\nSource: ${clip.url}`
    navigator.clipboard.writeText(textToCopy).then(() => {
      setMdSelectionCopied(true)
      window.setTimeout(() => {
        setMdSelection(null)
        setMdSelectionCopied(false)
      }, 1200)
    })
  }

  const folder = folders.find(f => f.id === clip.folder_id)

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[10010] flex items-center justify-center p-2">
      <div className="bg-background rounded-lg shadow-2xl w-[98vw] h-[96vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('prev')}
                disabled={!canNavigatePrev}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                {currentIndex + 1} of {clips.length}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('next')}
                disabled={!canNavigateNext}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {folder && (
              <Badge variant="secondary">
                <Folder className="h-3 w-3 mr-1" />
                {folder.name}
              </Badge>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {hasUnsavedChanges && (
              <span className="text-sm text-muted-foreground">
                Auto-saving...
              </span>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyActiveTab}
              title={`Copy ${activeTab === 'markdown' ? 'Markdown' : activeTab === 'html' ? 'HTML' : activeTab === 'text' ? 'text' : activeTab === 'entities' ? 'entities' : 'screenshot URL'}`}
              className={copiedFlash ? 'text-emerald-600 dark:text-emerald-400' : ''}
            >
              {copiedFlash ? (
                <>
                  <Check className="h-4 w-4 mr-2" strokeWidth={3} />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </>
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(clip.url, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Original
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => {
                  navigator.clipboard.writeText(clip.url)
                }}>
                  <Link className="mr-2 h-4 w-4" />
                  Copy URL
                </DropdownMenuItem>
                {clip.screenshot_url && (
                  <DropdownMenuItem onClick={() => {
                    const a = document.createElement('a');
                    a.href = clip.screenshot_url!;
                    a.download = `pagestash-${clip.title?.slice(0, 40).replace(/\s+/g, '-') || clip.id}.png`;
                    a.click();
                  }}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Screenshot
                  </DropdownMenuItem>
                )}
                {clip.text_content && (
                  <DropdownMenuItem onClick={() => {
                    const blob = new Blob([clip.text_content!], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `pagestash-${clip.title?.slice(0, 40).replace(/\s+/g, '-') || clip.id}.txt`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}>
                    <FileText className="mr-2 h-4 w-4" />
                    Download Text
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowDeleteConfirm(true)} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Clip
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Main Content Area - Tabbed Interface */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
              {/* Tab Navigation */}
              <div className="border-b bg-background px-4 py-2.5">
                <div className="flex items-center gap-3">
                  {/* Tabs */}
                  <TabsList className="flex-shrink-0 h-9">
                    <TabsTrigger value="screenshot" className="flex items-center gap-1.5 px-3 text-xs">
                      <Camera className="h-3.5 w-3.5" />
                      Screenshot
                    </TabsTrigger>
                    <TabsTrigger value="html" className="flex items-center gap-1.5 px-3 text-xs">
                      <Code className="h-3.5 w-3.5" />
                      HTML
                    </TabsTrigger>
                    <TabsTrigger value="text" className="flex items-center gap-1.5 px-3 text-xs">
                      <FileText className="h-3.5 w-3.5" />
                      Text
                    </TabsTrigger>
                    <TabsTrigger value="markdown" className="flex items-center gap-1.5 px-3 text-xs" title="Markdown">
                      <Download className="h-3.5 w-3.5" />
                      .md
                    </TabsTrigger>
                    <TabsTrigger value="entities" className="flex items-center gap-1.5 px-3 text-xs">
                      <Scan className="h-3.5 w-3.5" />
                      Entities
                    </TabsTrigger>
                  </TabsList>

                  {/* Search — shown for HTML and Text tabs, takes remaining width */}
                  {(activeTab === 'html' || activeTab === 'text') && (
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <div className="relative flex-1 min-w-0">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                        <Input
                          placeholder="Search content..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9 h-9 text-sm w-full"
                        />
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>

                      {searchQuery && totalMatches > 0 && (
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <span className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                            {currentMatchIndex + 1}/{totalMatches}
                          </span>
                          <button
                            onClick={() => navigateToMatch('prev')}
                            disabled={totalMatches <= 1}
                            className="h-7 w-7 flex items-center justify-center rounded hover:bg-muted disabled:opacity-40 transition-colors"
                          >
                            <ChevronUp className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => navigateToMatch('next')}
                            disabled={totalMatches <= 1}
                            className="h-7 w-7 flex items-center justify-center rounded hover:bg-muted disabled:opacity-40 transition-colors"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </button>
                        </div>
                      )}

                      {searchQuery && totalMatches === 0 && (
                        <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">No matches</span>
                      )}
                    </div>
                  )}

                  {/* Screenshot hint — icon only, doesn't crowd */}
                  {activeTab === 'screenshot' && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground ml-1">
                      <StickyNote className="h-3.5 w-3.5 flex-shrink-0" />
                      <span>Draw to annotate</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Tab Content */}
              <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                {/* Screenshot Tab */}
                <TabsContent value="screenshot" className="h-full m-0 data-[state=active]:flex data-[state=active]:flex-col flex-1">
                  {clip.screenshot_url ? (
                    <ScreenshotAnnotationCanvas
                      imageUrl={clip.screenshot_url}
                      imageAlt={clip.title}
                      annotations={parseScreenshotAnnotations(editForm.notes)}
                      highlightedPosition={highlightedAnnotation}
                      onAddAnnotation={async (annotation, note, thumbnail) => {
                        // Format: 📍 SCREENSHOT [x:100,y:150,w:200,h:100,thumb:data:image/jpeg;base64,...]
                        // Note text here
                        const annotationMeta = `📍 SCREENSHOT [x:${Math.round(annotation.x)},y:${Math.round(annotation.y)},w:${Math.round(annotation.width)},h:${Math.round(annotation.height)},thumb:${thumbnail}]`
                        const noteWithAnnotation = `${annotationMeta}\n${note.trim()}`
                        const currentNotes = editForm.notes ? `${editForm.notes}\n\n${noteWithAnnotation}` : noteWithAnnotation
                        
                        handleFormChange('notes', currentNotes)
                      }}
                      onDeleteAnnotation={async (_annotationId) => {
                        // TODO: Delete annotation note
                      }}
                      onClickAnnotation={(_annotation) => {
                        // TODO: Show annotation note in sidebar
                      }}
                    />
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No screenshot available</p>
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* HTML Tab */}
                <TabsContent value="html" className="h-full m-0 data-[state=active]:flex data-[state=active]:flex-col min-h-0">
                  {isLoadingContent ? (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="flex flex-col items-center gap-3 text-slate-400">
                        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm">Loading content…</span>
                      </div>
                    </div>
                  ) : fullClip?.html_content ? (
                    <div className="flex-1 flex flex-col min-h-0">
                      <div className="px-4 py-2.5 border-b bg-background flex items-center gap-3">
                        <div className="flex items-center p-0.5 bg-muted rounded-lg text-xs gap-0.5">
                          <button
                            onClick={() => setHtmlViewMode('html-rendered')}
                            className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                              htmlViewMode === 'html-rendered'
                                ? 'bg-background text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            Rendered
                          </button>
                          <button
                            onClick={() => setHtmlViewMode('html-source')}
                            className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                              htmlViewMode === 'html-source'
                                ? 'bg-background text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            Source
                          </button>
                        </div>
                        {htmlViewMode === 'html-rendered' && (
                          <span className="text-xs text-muted-foreground">Scripts are blocked for safety</span>
                        )}
                      </div>
                      
                      {htmlViewMode === 'html-rendered' ? (
                        <div className="flex-1 bg-muted/30 p-4">
                          <div className="bg-white rounded border shadow-sm h-full">
                            <iframe
                              srcDoc={`<script>
                                (function() {
                                  /* ── PageStash network isolation layer ──────────────────────────
                                   * The archived HTML is stored in our database exactly as captured.
                                   * We block all outbound network requests so the viewer is fully
                                   * self-contained and never touches the live site.
                                   * ─────────────────────────────────────────────────────────────*/
                                  var noop = function() {};
                                  var rejectAll = function() { return Promise.reject(new Error('Blocked')); };

                                  /* 1. Block fetch / XHR / WebSocket / beacon */
                                  window.fetch = rejectAll;
                                  window.XMLHttpRequest = function() {
                                    return { open: noop, send: noop, abort: noop, setRequestHeader: noop,
                                      getResponseHeader: function() { return null; }, addEventListener: noop,
                                      removeEventListener: noop, onreadystatechange: null,
                                      readyState: 4, status: 0, responseText: '', response: null };
                                  };
                                  window.WebSocket = function() { return { send: noop, close: noop, addEventListener: noop }; };
                                  if (navigator.sendBeacon) navigator.sendBeacon = noop;
                                  if (typeof EventSource !== 'undefined') window.EventSource = function() { return { close: noop }; };

                                  /* 2. Block dynamic <script src="…"> and <link href="…"> injection */
                                  var _isExternal = function(url) {
                                    return url && typeof url === 'string' &&
                                      (url.startsWith('http') || url.startsWith('//') || url.startsWith('www.'));
                                  };
                                  var _origCreate = document.createElement.bind(document);
                                  document.createElement = function(tag) {
                                    var el = _origCreate(tag);
                                    var lower = (tag || '').toLowerCase();
                                    if (lower === 'script') {
                                      var _src = '';
                                      Object.defineProperty(el, 'src', {
                                        get: function() { return _src; },
                                        set: function(v) { if (!_isExternal(v)) _src = v; },
                                        configurable: true
                                      });
                                    }
                                    if (lower === 'link') {
                                      var _href = '';
                                      Object.defineProperty(el, 'href', {
                                        get: function() { return _href; },
                                        set: function(v) { if (!_isExternal(v)) _href = v; },
                                        configurable: true
                                      });
                                    }
                                    return el;
                                  };

                                  /* 3. Block setAttribute on script/link nodes */
                                  var _origSetAttr = Element.prototype.setAttribute;
                                  Element.prototype.setAttribute = function(name, value) {
                                    var tag = this.tagName;
                                    if ((tag === 'SCRIPT' && name === 'src') || (tag === 'LINK' && name === 'href')) {
                                      if (_isExternal(value)) return;
                                    }
                                    return _origSetAttr.call(this, name, value);
                                  };

                                  /* 4. MutationObserver — remove any external script/preload nodes
                                   *    that slip through (e.g. created before our override was active) */
                                  var _observer = new MutationObserver(function(mutations) {
                                    mutations.forEach(function(m) {
                                      m.addedNodes.forEach(function(node) {
                                        if (!node.tagName) return;
                                        var t = node.tagName;
                                        if (t === 'SCRIPT' && _isExternal(node.src)) { node.remove(); return; }
                                        if (t === 'LINK' && node.rel === 'preload' && node.as === 'script' && _isExternal(node.href)) { node.remove(); }
                                      });
                                    });
                                  });
                                  _observer.observe(document.documentElement || document.body || document, { childList: true, subtree: true });

                                  /* 5. Relay text selection back to parent without needing allow-same-origin */
                                  document.addEventListener('mouseup', function() {
                                    var sel = window.getSelection ? window.getSelection() : null;
                                    var text = sel ? sel.toString().trim() : '';
                                    if (text) {
                                      try { window.parent.postMessage({ type: 'ps-selection', text: text }, '*'); } catch(e) {}
                                    }
                                  });
                                })();
                                </script>
                                ${fullClip?.html_content ?? ''}
                                <style>
                                  /* Block specific ad networks and tracking */
                                  iframe[src*="doubleclick"], iframe[src*="googlesyndication"],
                                  iframe[src*="amazon-adsystem"], iframe[src*="facebook.com/tr"],
                                  iframe[src*="googletagmanager"], iframe[src*="google-analytics"],
                                  .adsbygoogle, .google-ad, .adsystem,
                                  /* Block obvious ad containers */
                                  .advertisement, .ad-banner, .ad-container, .ad-wrapper,
                                  .sidebar-ad, .header-ad, .footer-ad, .inline-ad,
                                  /* Block media players that interfere with text selection */
                                  .video-player, .media-player, .player-container, .video-container,
                                  .jwplayer, .brightcove-player, .vjs-tech, .video-js,
                                  iframe[src*="youtube"], iframe[src*="vimeo"], iframe[src*="dailymotion"],
                                  iframe[src*="jwplatform"], iframe[src*="brightcove"], iframe[src*="kaltura"],
                                  /* Block autoplay media */
                                  video[autoplay], audio[autoplay] {
                                    display: none !important;
                                    visibility: hidden !important;
                                  }
                                  
                                  /* Disable autoplay on all media */
                                  video, audio {
                                    autoplay: false !important;
                                  }
                                  
                                  /* Improve reading experience and layout */
                                  body {
                                    background: white !important;
                                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
                                    line-height: 1.6 !important;
                                    max-width: none !important;
                                    margin: 0 !important;
                                    padding: 20px !important;
                                  }
                                  
                                  /* Improve readability */
                                  p, div, span, article, section {
                                    max-width: none !important;
                                    line-height: 1.6 !important;
                                  }
                                  
                                  /* Remove fixed/sticky elements that might interfere with text selection */
                                  [style*="position: fixed"], [style*="position: sticky"] {
                                    position: static !important;
                                  }
                                  
                                  /* Clean typography for better reading */
                                  h1, h2, h3, h4, h5, h6 {
                                    line-height: 1.3 !important;
                                    margin-bottom: 0.5em !important;
                                  }
                                  
                                  /* Better paragraph spacing */
                                  p {
                                    margin-bottom: 1em !important;
                                  }
                                </style>
                                <script>
                                  // Conservative ad blocking - focus on tracking, ads, and media players
                                  function cleanupPage() {
                                    // Remove ad network and media player iframes
                                    document.querySelectorAll('iframe').forEach(iframe => {
                                      const src = iframe.src || iframe.getAttribute('data-src') || '';
                                      if (src.includes('doubleclick') || src.includes('googlesyndication') ||
                                          src.includes('amazon-adsystem') || src.includes('facebook.com/tr') ||
                                          src.includes('googletagmanager') || src.includes('google-analytics') ||
                                          src.includes('youtube') || src.includes('vimeo') || src.includes('dailymotion') ||
                                          src.includes('jwplatform') || src.includes('brightcove') || src.includes('kaltura')) {
                                        iframe.remove();
                                      }
                                    });
                                    
                                    // Remove ad containers and media players
                                    const removeSelectors = [
                                      '.adsbygoogle', '.google-ad', '.adsystem',
                                      '.advertisement', '.ad-banner', '.ad-container', '.ad-wrapper',
                                      '.video-player', '.media-player', '.player-container', '.video-container',
                                      '.jwplayer', '.brightcove-player', '.vjs-tech', '.video-js'
                                    ];
                                    
                                    removeSelectors.forEach(selector => {
                                      document.querySelectorAll(selector).forEach(el => el.remove());
                                    });
                                    
                                    // Remove all video and audio elements that might interfere
                                    document.querySelectorAll('video, audio').forEach(media => {
                                      // Check if it's part of the main content or just a media player
                                      const parent = media.closest('article, .article, .content, .post, .story');
                                      if (!parent || media.closest('.player, .video-player, .media-player')) {
                                        media.remove();
                                      } else {
                                        // Keep but disable autoplay and controls
                                        media.autoplay = false;
                                        media.controls = false;
                                        media.pause();
                                        media.style.pointerEvents = 'none';
                                      }
                                    });
                                  }
                                  
                                  // Run cleanup when page loads
                                  document.addEventListener('DOMContentLoaded', cleanupPage);
                                  setTimeout(cleanupPage, 100); // Also run after a short delay
                                  
                                  function highlightSearchInIframe(searchTerm, currentIndex = 0) {
                                    if (!searchTerm) return;
                                    
                                    // Only update the current match styling instead of rebuilding everything
                                    const existingMarks = document.querySelectorAll('mark[data-search-highlight]');
                                    
                                    if (existingMarks.length > 0) {
                                      // If highlights already exist, just update the current match styling
                                      existingMarks.forEach((mark, index) => {
                                        mark.removeAttribute('id');
                                        if (index === currentIndex) {
                                          mark.id = 'current-match';
                                          mark.style.cssText = 'background-color: #fed7aa; color: #ea580c; padding: 1px 2px; border: 2px solid #f97316;';
                                        } else {
                                          mark.style.cssText = 'background-color: #fef3c7; color: #a16207; padding: 1px 2px;';
                                        }
                                      });
                                      return; // Exit early - no need to rebuild highlights
                                    }
                                    
                                    // First time highlighting - build all highlights
                                    const walker = document.createTreeWalker(
                                      document.body,
                                      NodeFilter.SHOW_TEXT,
                                      null,
                                      false
                                    );
                                    
                                    const textNodes = [];
                                    let node;
                                    while (node = walker.nextNode()) {
                                      textNodes.push(node);
                                    }
                                    
                                    let matchCount = 0;
                                    textNodes.forEach(textNode => {
                                      const text = textNode.textContent;
                                      if (text.toLowerCase().includes(searchTerm.toLowerCase())) {
                                        const regex = new RegExp(\`(\${searchTerm})\`, 'gi');
                                        const highlightedText = text.replace(regex, (match) => {
                                          const isCurrentMatch = matchCount === currentIndex;
                                          matchCount++;
                                          
                                          if (isCurrentMatch) {
                                            return \`<mark data-search-highlight id="current-match" style="background-color: #fed7aa; color: #ea580c; padding: 1px 2px; border: 2px solid #f97316;">\${match}</mark>\`;
                                          } else {
                                            return \`<mark data-search-highlight style="background-color: #fef3c7; color: #a16207; padding: 1px 2px;">\${match}</mark>\`;
                                          }
                                        });
                                        const wrapper = document.createElement('span');
                                        wrapper.innerHTML = highlightedText;
                                        textNode.parentNode.replaceChild(wrapper, textNode);
                                      }
                                    });
                                  }
                                  
                                  // Highlight search term if provided
                                  window.addEventListener('message', function(event) {
                                    if (event.data.type === 'highlight') {
                                      highlightSearchInIframe(event.data.searchTerm, event.data.currentIndex || 0);
                                      
                                      // Scroll to current match immediately after highlighting
                                      const currentMatch = document.getElementById('current-match');
                                      if (currentMatch) {
                                        // Use smooth scrolling that maintains current viewport context
                                        currentMatch.scrollIntoView({ 
                                          behavior: 'smooth', 
                                          block: 'center',
                                          inline: 'nearest'
                                        });
                                      }
                                    }
                                  });
                                  
                                  // Initial highlight - only use searchQuery, not currentMatchIndex
                                  setTimeout(() => {
                                    highlightSearchInIframe('${searchQuery}', 0);
                                    // Scroll to first match after initial highlighting
                                    setTimeout(() => {
                                      const currentMatch = document.getElementById('current-match');
                                      if (currentMatch) {
                                        currentMatch.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                      }
                                    }, 100);
                                  }, 100);
                                </script>
                              `}
                              className="w-full h-full rounded"
                              sandbox="allow-scripts"
                              title="HTML Content Preview"
                              style={{ minHeight: '500px' }}
                              onLoad={(e) => {
                                // No same-origin access needed — text selection is relayed via postMessage.
                                // Send current search term for in-page highlighting.
                                const iframe = e.target as HTMLIFrameElement;
                                if (searchQuery) {
                                  iframe.contentWindow?.postMessage({
                                    type: 'highlight',
                                    searchTerm: searchQuery,
                                    currentIndex: currentMatchIndex
                                  }, '*');
                                }
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1 bg-muted/30 p-4">
                          <div className="bg-white rounded border shadow-sm overflow-auto" style={{ height: 'calc(100vh - 200px)' }}>
                            <div 
                              className="text-xs font-mono whitespace-pre-wrap p-4 w-full"
                              style={{ 
                                maxWidth: '100%',
                                wordBreak: 'break-all',
                                overflowWrap: 'break-word'
                              }}
                              onMouseUp={handleTextSelection}
                              dangerouslySetInnerHTML={{
                                __html: highlightSearchTextForSourceCode(fullClip?.html_content ?? '', searchQuery, currentMatchIndex)
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No HTML content available</p>
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* Text Tab */}
                <TabsContent value="text" className="h-full m-0 data-[state=active]:flex data-[state=active]:flex-col flex-1 min-h-0">
                  {isLoadingContent ? (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="flex flex-col items-center gap-3 text-slate-400">
                        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm">Loading content…</span>
                      </div>
                    </div>
                  ) : fullClip?.text_content ? (
                    <ReaderView
                      content={fullClip.text_content}
                      searchQuery={searchQuery}
                      currentMatchIndex={currentMatchIndex}
                      clipUrl={clip.url}
                      onTextSelection={handleTextSelection}
                      highlightFn={highlightSearchText}
                    />
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No text content available</p>
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* Markdown Tab */}
                <TabsContent value="markdown" className="h-full m-0 data-[state=active]:flex data-[state=active]:flex-col flex-1 min-h-0">
                  {isLoadingContent ? (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="flex flex-col items-center gap-3 text-slate-400">
                        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm">Loading content…</span>
                      </div>
                    </div>
                  ) : markdownContent ? (
                    <div
                      ref={markdownContainerRef}
                      className="flex-1 min-h-0 bg-slate-50 dark:bg-slate-950/50 overflow-auto relative"
                    >
                      <div className="max-w-3xl mx-auto px-6 py-6">
                        <div className="flex items-center gap-2 mb-3 text-[11px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            <Download className="h-3 w-3" />
                            markdown
                          </span>
                          <span>·</span>
                          <span>{(markdownContent.length / 1024).toFixed(1)} KB</span>
                          <span>·</span>
                          <span>{markdownContent.split(/\s+/).filter(Boolean).length.toLocaleString()} words</span>
                          <span className="ml-auto normal-case tracking-normal text-[11px] text-slate-400 dark:text-slate-500 hidden sm:inline">
                            Select text to copy or annotate
                          </span>
                        </div>
                        <pre
                          onMouseUp={handleMarkdownMouseUp}
                          className="text-[13px] leading-6 font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap break-words bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm selection:bg-blue-200/70 dark:selection:bg-blue-500/30 selection:text-slate-900 dark:selection:text-white cursor-text"
                        >{markdownContent}</pre>
                      </div>

                      {/* Floating "Copy with source" button — shown while a selection exists */}
                      {mdSelection && (
                        <button
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={handleCopyMarkdownSelection}
                          className="absolute z-10 -translate-x-1/2 -translate-y-full px-3 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-lg shadow-xl hover:bg-slate-700 transition-colors whitespace-nowrap inline-flex items-center gap-1.5"
                          style={{ left: mdSelection.x, top: mdSelection.y }}
                        >
                          {mdSelectionCopied ? (
                            <>
                              <Check className="h-3 w-3" strokeWidth={3} />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              Copy with source
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <Download className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No content to render as Markdown</p>
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* Entities Tab */}
                <TabsContent value="entities" className="h-full m-0 data-[state=active]:flex data-[state=active]:flex-col flex-1 min-h-0">
                  {/*
                    Pass `fullClip` when it's loaded — the list endpoint strips
                    `entities`, `text_content`, and `html_content` for payload
                    size, so using the bare `clip` prop here makes
                    `storedEntities` look null and forces a client-side fallback
                    that only sees `title + url` (yielding ~1 entity).
                  */}
                  <EntitiesView clip={(fullClip ?? clip) as Clip} />
                </TabsContent>
              </div>
            </Tabs>
          </div>

          {/* Metadata & Edit Panel */}
          <div className="w-80 border-l bg-slate-50/60 dark:bg-slate-900/60 flex flex-col">
            <div className="p-4 space-y-4 overflow-y-auto flex-1">
              {/* Title */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Title</label>
                <div className="relative">
                  <textarea
                    value={editForm.title}
                    onChange={(e) => handleFormChange('title', e.target.value)}
                    placeholder="Clip title"
                    className="w-full font-medium text-sm bg-background border border-input rounded-md px-3 py-2 resize-none overflow-hidden focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all"
                    style={{
                      minHeight: '2.5rem',
                      height: 'auto',
                      lineHeight: '1.4'
                    }}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = 'auto';
                      target.style.height = target.scrollHeight + 'px';
                    }}
                    onFocus={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = 'auto';
                      target.style.height = target.scrollHeight + 'px';
                    }}
                    ref={(el) => {
                      if (el) {
                        // Auto-resize on mount
                        el.style.height = 'auto';
                        el.style.height = el.scrollHeight + 'px';
                      }
                    }}
                    rows={1}
                  />
                </div>
              </div>

              {/* URL & Date */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">URL</label>
                  <div className="flex items-center space-x-2 text-sm">
                    <Globe className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    <a 
                      href={clip.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline truncate text-xs"
                    >
                      {clip.url}
                    </a>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Captured</label>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(clip.created_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Folder */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Folder</label>
                <Select 
                  value={editForm.folder_id || 'no-folder'}
                  onValueChange={(value) => handleFormChange('folder_id', value)}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Select folder" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-folder">No folder</SelectItem>
                    {folders.map((folder) => (
                      <SelectItem key={folder.id} value={folder.id}>
                        {folder.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Notes */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-muted-foreground">Notes</label>
                  <button
                    onClick={() => setIsFocusModeOpen(true)}
                    className="p-1 hover:bg-muted rounded transition-colors"
                    title="Focus mode (distraction-free writing)"
                  >
                    <svg className="w-4 h-4 text-muted-foreground hover:text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </button>
                </div>
                <div className="relative">
                  {/* Rich text editor style - show formatted view with inline editing */}
                  {editForm.notes && (editForm.notes.includes('> "') || editForm.notes.includes('📍 SCREENSHOT')) ? (
                    <div className="space-y-2">
                      {/* Formatted Preview */}
                      <div 
                        className="text-sm p-3 bg-background rounded border min-h-[100px] max-h-[300px] overflow-y-auto leading-relaxed cursor-text"
                        dangerouslySetInnerHTML={{
                          __html: formatNotesDisplay(editForm.notes)
                        }}
                        onClick={() => {
                          // Focus the textarea when clicking on the preview
                          const textarea = document.getElementById('notes-textarea') as HTMLTextAreaElement;
                          if (textarea) {
                            textarea.focus();
                            textarea.style.display = 'block';
                            textarea.previousElementSibling?.setAttribute('style', 'display: none');
                          }
                        }}
                      />
                      {/* Hidden editable textarea - shows on focus */}
                      <Textarea
                        id="notes-textarea"
                        value={editForm.notes}
                        onChange={(e) => handleFormChange('notes', e.target.value)}
                        placeholder="Add your notes..."
                        rows={Math.max(4, Math.min(12, (editForm.notes || '').split('\n').length + 1))}
                        className="text-sm resize-y min-h-[100px] max-h-[300px] leading-relaxed hidden"
                        onBlur={(e) => {
                          // Hide textarea and show formatted view when losing focus
                          e.target.style.display = 'none';
                          const preview = e.target.previousElementSibling as HTMLElement;
                          if (preview) preview.style.display = 'block';
                        }}
                      />
                    </div>
                  ) : (
                    <Textarea
                      id="notes-textarea"
                      value={editForm.notes}
                      onChange={(e) => handleFormChange('notes', e.target.value)}
                      placeholder="Add your notes..."
                      rows={Math.max(3, Math.min(8, (editForm.notes || '').split('\n').length + 1))}
                      className="text-sm resize-y min-h-[80px] max-h-[300px] leading-relaxed"
                    />
                  )}
                </div>
              </div>

              {/* Tags */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-muted-foreground">Tags</label>
                  {tagSaveStatus === 'saving' && (
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                      Saving...
                    </span>
                  )}
                  {tagSaveStatus === 'saved' && (
                    <span className="text-[10px] text-emerald-600 flex items-center gap-1">
                      <Check className="h-2.5 w-2.5" />
                      Saved
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  {clipTags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {clipTags.map((tag) => (
                        <Badge key={tag.id} variant="secondary" className="text-xs group/tag pr-1">
                          {tag.name}
                          <button
                            onClick={() => handleRemoveTag(tag.name)}
                            className="ml-1 opacity-0 group-hover/tag:opacity-100 hover:text-destructive transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  <div className="relative" ref={tagInputRef}>
                    <div className="flex space-x-1">
                      <Input
                        value={newTag}
                        onChange={(e) => { setNewTag(e.target.value); setShowTagSuggestions(true); }}
                        onFocus={() => setShowTagSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowTagSuggestions(false), 200)}
                        placeholder="Search or create tag..."
                        className="text-xs h-7"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); setShowTagSuggestions(false); }
                          if (e.key === 'Escape') setShowTagSuggestions(false);
                        }}
                      />
                      <Button size="sm" onClick={() => { handleAddTag(); setShowTagSuggestions(false); }} className="h-7 px-2" disabled={!newTag.trim()}>
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    {showTagSuggestions && (() => {
                      const currentNames = new Set(clipTags.map(t => t.name.toLowerCase()));
                      const suggestions = availableTags
                        .filter(t => !currentNames.has(t.name.toLowerCase()))
                        .filter(t => !newTag.trim() || t.name.toLowerCase().includes(newTag.toLowerCase()));

                      const rect = tagInputRef.current?.getBoundingClientRect();
                      const dropdownStyle: React.CSSProperties = rect ? {
                        position: 'fixed',
                        top: rect.bottom + 4,
                        left: rect.left,
                        width: rect.width - 32,
                        zIndex: 10020,
                      } : {};

                      if (suggestions.length === 0 && newTag.trim()) {
                        return createPortal(
                          <div className="bg-popover border rounded-lg shadow-xl" style={dropdownStyle}>
                            <button
                              className="w-full text-left px-3 py-2 text-xs hover:bg-accent transition-colors flex items-center gap-2 rounded-lg"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                handleAddTag();
                                setShowTagSuggestions(false);
                              }}
                            >
                              <Plus className="h-3 w-3 text-blue-600" />
                              <span>Create <span className="font-semibold">&ldquo;{newTag.trim()}&rdquo;</span></span>
                            </button>
                          </div>,
                          document.body
                        );
                      }
                      if (suggestions.length === 0) return null;
                      return createPortal(
                        <div className="bg-popover border rounded-lg shadow-xl max-h-48 overflow-y-auto" style={dropdownStyle}>
                          {suggestions.map(t => (
                            <button key={t.id} className="w-full text-left px-3 py-1.5 text-xs hover:bg-accent transition-colors flex items-center gap-2"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                handleAddTag(t.name);
                                setShowTagSuggestions(false);
                              }}>
                              {t.color && <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: t.color }} />}
                              {!t.color && <Tag className="h-3 w-3 text-muted-foreground flex-shrink-0" />}
                              {newTag.trim() ? (
                                <span dangerouslySetInnerHTML={{
                                  __html: t.name.replace(
                                    new RegExp(`(${newTag.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'),
                                    '<strong class="text-foreground">$1</strong>'
                                  )
                                }} />
                              ) : (
                                <span>{t.name}</span>
                              )}
                            </button>
                          ))}
                          {newTag.trim() && !suggestions.some(s => s.name.toLowerCase() === newTag.trim().toLowerCase()) && (
                            <>
                              <div className="border-t" />
                              <button
                                className="w-full text-left px-3 py-1.5 text-xs hover:bg-accent transition-colors flex items-center gap-2"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  handleAddTag();
                                  setShowTagSuggestions(false);
                                }}
                              >
                                <Plus className="h-3 w-3 text-blue-600" />
                                <span>Create <span className="font-semibold">&ldquo;{newTag.trim()}&rdquo;</span></span>
                              </button>
                            </>
                          )}
                        </div>,
                        document.body
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Keyboard Shortcuts */}
              <div className="pt-2 border-t">
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Keyboard Shortcuts</label>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded border">←→</kbd>
                    <span>Navigate</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded border">1–5</kbd>
                    <span>Tabs</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded border">Esc</kbd>
                    <span>Close</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-20">
            <div className="bg-background rounded-xl shadow-2xl max-w-sm w-full p-6 border">
              <div className="flex items-start gap-4 mb-5">
                <div className="flex-shrink-0 p-2.5 bg-red-100 dark:bg-red-950/50 rounded-full">
                  <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-base mb-1">Delete this clip?</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    This will permanently delete <span className="font-medium text-foreground">&ldquo;{clip.title}&rdquo;</span> and all its notes and annotations. This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(false)} disabled={isLoading}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isLoading ? 'Deleting...' : 'Delete clip'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Text Selection Note Modal */}
        {showAddNote && selectedText && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4 z-10">
            <div className="bg-background rounded-lg shadow-lg max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Highlighter className="h-5 w-5" />
                  Add Note for Selection
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowAddNote(false)
                    setSelectedText('')
                    setNoteText('')
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Selected Text:
                  </label>
                  <div className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded-r text-sm">
                    <div className="flex items-start gap-2">
                      <span className="text-blue-600 font-medium text-xs">EXCERPT</span>
                    </div>
                    <div className="mt-1 text-gray-700 italic font-medium">
                      "{selectedText}"
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Your Note:
                  </label>
                  <Textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Add your thoughts about this selection..."
                    rows={3}
                    className="resize-none"
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAddNote(false)
                      setSelectedText('')
                      setNoteText('')
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddNoteFromSelection}
                    disabled={!noteText.trim()}
                  >
                    <StickyNote className="h-4 w-4 mr-2" />
                    Add Note
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Focus Mode Modal */}
        {isFocusModeOpen && (
          <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-background border rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-3">
                  {clip.screenshot_url && (
                    <img 
                      src={clip.screenshot_url} 
                      alt={clip.title}
                      className="w-12 h-12 object-cover rounded border"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold text-lg">{clip.title}</h3>
                    <p className="text-xs text-muted-foreground">{new URL(clip.url).hostname}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsFocusModeOpen(false)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                  title="Close (Esc)"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col gap-4 p-6 overflow-auto">
                {/* Tags Section */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">Tags</label>
                    {tagSaveStatus === 'saving' && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                        Saving...
                      </span>
                    )}
                    {tagSaveStatus === 'saved' && (
                      <span className="text-xs text-emerald-600 flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        Saved
                      </span>
                    )}
                  </div>
                  {clipTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {clipTags.map((tag) => (
                        <Badge 
                          key={tag.id}
                          variant="secondary"
                          className="px-3 py-1"
                          style={{
                            backgroundColor: tag.color ? `${tag.color}20` : undefined,
                            borderColor: tag.color ? `${tag.color}40` : undefined,
                            color: tag.color || undefined
                          }}
                        >
                          {tag.name}
                          <button
                            onClick={() => handleRemoveTag(tag.name)}
                            className="ml-2 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Input
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      placeholder="Add new tag..."
                      className="flex-1"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddTag(newTagName)
                          setNewTagName('')
                        }
                      }}
                    />
                    <Button
                      onClick={() => {
                        handleAddTag(newTagName)
                        setNewTagName('')
                      }}
                      disabled={!newTagName.trim()}
                    >
                      <Tag className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </div>

                {/* Notes Section */}
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">Notes</label>
                    <div className="text-xs text-muted-foreground">
                      {editForm.notes.length} characters · {editForm.notes.split(/\s+/).filter(Boolean).length} words
                    </div>
                  </div>
                  
                  {/* Show formatted view if has annotations or blockquotes */}
                  {editForm.notes && (editForm.notes.includes('> "') || editForm.notes.includes('📍 SCREENSHOT')) ? (
                    <div className="flex-1 flex flex-col gap-2 border rounded-lg p-4 bg-background">
                      {/* Formatted Preview */}
                      <div 
                        className="text-base leading-relaxed overflow-y-auto"
                        dangerouslySetInnerHTML={{
                          __html: formatNotesDisplay(editForm.notes)
                        }}
                        onClick={() => {
                          // Focus the textarea when clicking on the preview
                          const textarea = document.getElementById('focus-notes-textarea') as HTMLTextAreaElement;
                          if (textarea) {
                            textarea.style.display = 'block';
                            textarea.previousElementSibling?.setAttribute('style', 'display: none');
                            setTimeout(() => textarea.focus(), 0);
                          }
                        }}
                      />
                      {/* Hidden editable textarea */}
                      <Textarea
                        id="focus-notes-textarea"
                        value={editForm.notes}
                        onChange={(e) => handleFormChange('notes', e.target.value)}
                        placeholder="Write your detailed notes here... ✍️"
                        className="flex-1 resize-none text-base leading-relaxed min-h-[400px] hidden"
                        onBlur={(e) => {
                          // Hide textarea and show formatted view when losing focus
                          e.target.style.display = 'none';
                          const preview = e.target.previousElementSibling as HTMLElement;
                          if (preview) preview.style.display = 'block';
                        }}
                      />
                    </div>
                  ) : (
                    <Textarea
                      value={editForm.notes}
                      onChange={(e) => handleFormChange('notes', e.target.value)}
                      placeholder="Write your detailed notes here... ✍️"
                      className="flex-1 resize-none text-base leading-relaxed min-h-[400px] border rounded-lg p-4"
                      autoFocus
                    />
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between p-4 border-t bg-muted/30">
                <div className="text-sm text-muted-foreground">
                  {hasUnsavedChanges ? (
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                      Auto-saving...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      Saved
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsFocusModeOpen(false)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Close
                  </Button>
                  <Button
                    onClick={() => setIsFocusModeOpen(false)}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Done
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Keyboard shortcut handler for Esc */}
        {isFocusModeOpen && (
          <div
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setIsFocusModeOpen(false)
              }
            }}
            tabIndex={-1}
            className="fixed inset-0 pointer-events-none"
          />
        )}
      </div>
    </div>
  )
}
