'use client'

import { useState, useEffect, useRef } from 'react'
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
import { extractEntities, entityCount, type ExtractedEntities } from '@/utils/entityExtractor'

function EntitiesView({ clip }: { clip: Clip }) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const entities = extractEntities(
    [clip.text_content || '', clip.title || '', clip.url || ''].join('\n'),
    clip.url
  )
  const total = entityCount(entities)

  const copyValue = (val: string, key: string) => {
    navigator.clipboard.writeText(val)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 1500)
  }

  const sections: { label: string; icon: typeof Scan; items: string[]; key: keyof ExtractedEntities }[] = [
    { label: 'Domains', icon: Globe, items: entities.domains, key: 'domains' },
    { label: 'Emails', icon: Mail, items: entities.emails, key: 'emails' },
    { label: 'IP Addresses', icon: Scan, items: entities.ipAddresses, key: 'ipAddresses' },
    { label: 'Phone Numbers', icon: Scan, items: entities.phones, key: 'phones' },
    { label: 'Social Handles', icon: Scan, items: entities.socialHandles, key: 'socialHandles' },
    { label: 'Names', icon: Scan, items: entities.names, key: 'names' },
  ]

  if (total === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <Scan className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="font-medium">No entities detected</p>
          <p className="text-xs mt-1">Domains, emails, IPs, and handles will appear here when found in clip content.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{total} entities found</h3>
          <button
            onClick={() => copyValue(JSON.stringify(entities, null, 2), '__all__')}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <Clipboard className="h-3 w-3" />
            {copiedKey === '__all__' ? 'Copied!' : 'Copy all as JSON'}
          </button>
        </div>

        {sections.filter(s => s.items.length > 0).map(section => (
          <div key={section.key}>
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">{section.label}</h4>
            <div className="space-y-1">
              {section.items.map((item, i) => {
                const itemKey = `${section.key}-${i}`
                return (
                  <div key={itemKey} className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-white/5 group hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
                    <span className="text-sm text-slate-800 dark:text-slate-200 font-mono truncate mr-3">{item}</span>
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
        ))}
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
    tags: [] as string[]
  })
  const [newTag, setNewTag] = useState('')
  const [showTagSuggestions, setShowTagSuggestions] = useState(false)
  const tagInputRef = useRef<HTMLInputElement>(null)
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
      const newForm = {
        title: clip.title,
        notes: clip.notes || '',
        folder_id: clip.folder_id || '',
        tags: clipTags.map(tag => tag.name)
      }
      setEditForm(newForm)
      setHasUnsavedChanges(false)
      // Default to HTML tab if no screenshot
      setActiveTab(clip.screenshot_url ? 'screenshot' : 'html')
    }
  }, [clip, clipTags])

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

    const loadTags = async () => {
      try {
        const [tagsRes, clipTagsRes] = await Promise.all([
          fetch('/api/tags'),
          fetch(`/api/clips/${clip.id}/tags`),
        ])
        if (tagsRes.ok) setAvailableTags(await tagsRes.json())
        if (clipTagsRes.ok) {
          const tags = await clipTagsRes.json()
          setClipTags(tags)
          setEditForm(prev => ({ ...prev, tags: tags.map((tag: any) => tag.name) }))
        }
      } catch (error) {
        console.error('Error loading tags:', error)
      }
    }

    loadTags()
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
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, canNavigatePrev, canNavigateNext, onNavigate, onClose])

  // Auto-save when form changes
  useEffect(() => {
    if (!clip || !hasUnsavedChanges) return

    const timeoutId = setTimeout(async () => {
      try {
        // Save clip metadata
        await onUpdate(clip.id, {
          title: editForm.title,
          notes: editForm.notes,
          folder_id: editForm.folder_id || undefined,
        })
        
        // Save tags separately
        const response = await fetch(`/api/clips/${clip.id}/tags`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tagNames: editForm.tags
          }),
        })
        
        if (!response.ok) {
          throw new Error('Failed to save tags')
        }
        
        setHasUnsavedChanges(false)
      } catch (error) {
        console.error('Auto-save failed:', error)
      }
    }, 1000) // Auto-save after 1 second of no changes

    return () => clearTimeout(timeoutId)
  }, [editForm, clip, hasUnsavedChanges, onUpdate])

  const handleFormChange = (field: string, value: string) => {
    // Handle special "no-folder" value
    const processedValue = field === 'folder_id' && value === 'no-folder' ? '' : value
    setEditForm(prev => ({ ...prev, [field]: processedValue }))
    setHasUnsavedChanges(true)
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

  const handleAddTag = () => {
    if (newTag.trim() && !editForm.tags.includes(newTag.trim())) {
      setEditForm(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
      setHasUnsavedChanges(true)
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setEditForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
    setHasUnsavedChanges(true)
  }

  const handleTextSelection = (event?: any) => {
    // For non-iframe contexts (text/source tabs)
    const selection = window.getSelection()
    if (selection && selection.toString().trim()) {
      setSelectedText(selection.toString().trim())
      setShowAddNote(true)
    }
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
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
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
              <div className="flex-1 flex flex-col">
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
                <TabsContent value="html" className="h-full m-0 data-[state=active]:flex data-[state=active]:flex-col">
                  {isLoadingContent ? (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="flex flex-col items-center gap-3 text-slate-400">
                        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm">Loading content…</span>
                      </div>
                    </div>
                  ) : fullClip?.html_content ? (
                    <div className="flex-1 flex flex-col">
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
                <TabsContent value="text" className="h-full m-0 data-[state=active]:flex data-[state=active]:flex-col flex-1">
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

                {/* Entities Tab */}
                <TabsContent value="entities" className="h-full m-0 data-[state=active]:flex data-[state=active]:flex-col flex-1">
                  <EntitiesView clip={clip} />
                </TabsContent>
              </div>
            </Tabs>
          </div>

          {/* Metadata & Edit Panel */}
          <div className="w-80 border-l bg-slate-50/60 dark:bg-slate-900/60 flex flex-col overflow-hidden">
            <div className="p-4 space-y-4 overflow-y-auto">
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
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Tags</label>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1">
                    {editForm.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs group/tag">
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 opacity-50 hover:opacity-100 hover:text-destructive transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="relative">
                    <div className="flex space-x-1">
                      <Input
                        ref={tagInputRef}
                        value={newTag}
                        onChange={(e) => { setNewTag(e.target.value); setShowTagSuggestions(true); }}
                        onFocus={() => setShowTagSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowTagSuggestions(false), 150)}
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
                      const suggestions = availableTags
                        .filter(t => !editForm.tags.includes(t.name))
                        .filter(t => !newTag.trim() || t.name.toLowerCase().includes(newTag.toLowerCase()));
                      if (suggestions.length === 0) return null;
                      return (
                        <div className="absolute z-50 top-full left-0 right-8 mt-1 bg-popover border rounded-md shadow-md max-h-32 overflow-y-auto">
                          {suggestions.map(t => (
                            <button key={t.id} className="w-full text-left px-3 py-1.5 text-xs hover:bg-accent transition-colors flex items-center gap-2"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                setEditForm(prev => ({ ...prev, tags: [...prev.tags, t.name] }));
                                setHasUnsavedChanges(true);
                                setNewTag('');
                                setShowTagSuggestions(false);
                              }}>
                              <Tag className="h-3 w-3 text-muted-foreground" />
                              {t.name}
                            </button>
                          ))}
                        </div>
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
                    <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded border">1-3</kbd>
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
                  <label className="text-sm font-medium mb-2 block">Tags</label>
                  <div className="flex flex-wrap gap-2 mb-2">
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
                          onClick={() => {
                            setClipTags(prev => prev.filter(t => t.id !== tag.id))
                            setEditForm(prev => ({
                              ...prev,
                              tags: prev.tags.filter(t => t !== tag.name)
                            }))
                            setHasUnsavedChanges(true)
                          }}
                          className="ml-2 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      placeholder="Add new tag..."
                      className="flex-1"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          if (newTagName.trim()) {
                            const newTag = { id: Date.now().toString(), name: newTagName.trim(), color: undefined }
                            setClipTags(prev => [...prev, newTag])
                            setEditForm(prev => ({
                              ...prev,
                              tags: [...prev.tags, newTagName.trim()]
                            }))
                            setNewTagName('')
                            setHasUnsavedChanges(true)
                          }
                        }
                      }}
                    />
                    <Button
                      onClick={() => {
                        if (newTagName.trim()) {
                          const newTag = { id: Date.now().toString(), name: newTagName.trim(), color: undefined }
                          setClipTags(prev => [...prev, newTag])
                          setEditForm(prev => ({
                            ...prev,
                            tags: [...prev.tags, newTagName.trim()]
                          }))
                          setNewTagName('')
                          setHasUnsavedChanges(true)
                        }
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
