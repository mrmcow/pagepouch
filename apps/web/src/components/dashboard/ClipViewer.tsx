'use client'

import { useState, useEffect } from 'react'
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
  Check
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
  const [isLoading, setIsLoading] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [activeTab, setActiveTab] = useState('screenshot')
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

  // Load available tags and clip tags
  useEffect(() => {
    if (!isOpen || !clip) return

    const loadTags = async () => {
      try {
        // Load all available tags
        const tagsResponse = await fetch('/api/tags')
        if (tagsResponse.ok) {
          const tags = await tagsResponse.json()
          setAvailableTags(tags)
        }

        // Load tags for this clip
        const clipTagsResponse = await fetch(`/api/clips/${clip.id}/tags`)
        if (clipTagsResponse.ok) {
          const tags = await clipTagsResponse.json()
          setClipTags(tags)
          
          // Update the edit form with the loaded tags
          setEditForm(prev => ({
            ...prev,
            tags: tags.map((tag: any) => tag.name)
          }))
        }
      } catch (error) {
        console.error('Error loading tags:', error)
      }
    }

    loadTags()
  }, [isOpen, clip])

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
    if (activeTab === 'text' && clip.text_content) {
      matches = countMatches(clip.text_content, searchQuery)
    } else if (activeTab === 'html' && clip.html_content) {
      matches = countMatches(clip.html_content, searchQuery)
    }
    
    setTotalMatches(matches)
    setCurrentMatchIndex(0)
  }, [searchQuery, activeTab, clip?.text_content, clip?.html_content, clip])

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
      
      // Clean, minimal HTML
      if (thumb && thumb.trim()) {
        // With thumbnail
        const badge = `<div class="mb-2 bg-purple-50 border border-purple-200 rounded-md overflow-hidden"><div class="relative group"><div class="inline-flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-purple-100 transition-colors w-full" onclick="window.toggleAnnotation?.(${index}, event)"><div class="relative"><img src="${thumb}" alt="" class="w-8 h-8 rounded border border-purple-300 object-cover" /><div class="absolute left-full ml-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50"><div class="bg-white border-2 border-purple-300 rounded-lg shadow-xl p-1"><img src="${thumb}" alt="" class="w-32 h-32 rounded object-cover" /></div></div></div><span class="text-xs font-medium text-purple-700 flex-1">Screenshot Annotation</span><svg class="w-4 h-4 text-purple-600 transition-transform${isExpanded ? ' rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg></div><button onclick="window.navigateToAnnotation?.(${index}, ${x}, ${y}, event)" class="absolute right-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded" title="Jump"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg></button></div>${isExpanded ? `<div class="px-3 py-2 text-sm text-gray-700 border-t border-purple-200 bg-white">${noteText.trim().replace(/\n/g, '<br>')}</div>` : ''}</div>`
        return badge
      } else {
        // Without thumbnail - with icon
        const badge = `<div class="mb-2 bg-purple-50 border border-purple-200 rounded-md overflow-hidden"><div class="relative group"><div class="inline-flex items-center gap-1.5 px-2 py-1.5 cursor-pointer hover:bg-purple-100 transition-colors w-full" onclick="window.toggleAnnotation?.(${index}, event)"><svg class="w-3.5 h-3.5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg><span class="text-xs font-medium text-purple-700 flex-1">Screenshot Annotation</span><svg class="w-4 h-4 text-purple-600 transition-transform${isExpanded ? ' rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg></div><button onclick="window.navigateToAnnotation?.(${index}, ${x}, ${y}, event)" class="absolute right-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded" title="Jump"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg></button></div>${isExpanded ? `<div class="px-3 py-2 text-sm text-gray-700 border-t border-purple-200 bg-white">${noteText.trim().replace(/\n/g, '<br>')}</div>` : ''}</div>`
        return badge
      }
    })
    
    // Format blockquotes (excerpts) - clean and tight
    result = result.replace(/^> "(.*?)"$/gm, '<div class="mb-1 p-2 bg-blue-50 border-l-4 border-blue-400 rounded-r"><div class="text-sm italic text-gray-700 font-medium">"$1"</div></div>')
    
    // Format line breaks
    result = result.replace(/\n/g, '<br>')
    
    return result
  }

  if (!isOpen || !clip) return null

  const handleDelete = async () => {
    if (!clip || !confirm('Are you sure you want to delete this clip?')) return
    
    setIsLoading(true)
    try {
      await onDelete(clip.id)
      onClose()
    } catch (error) {
      console.error('Failed to delete clip:', error)
    } finally {
      setIsLoading(false)
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
    let selection;
    
    // Check if this is from an iframe
    if (event?.target?.ownerDocument && event.target.ownerDocument !== document) {
      selection = event.target.ownerDocument.getSelection();
    } else {
      selection = window.getSelection();
    }
    
    if (selection && selection.toString().trim()) {
      setSelectedText(selection.toString().trim())
      setShowAddNote(true)
    }
  }

  const folder = folders.find(f => f.id === clip.folder_id)

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-2">
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
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleDelete} className="text-destructive">
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
              <div className="border-b bg-background px-4 py-2">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <TabsList className="grid w-full max-w-md grid-cols-3 flex-shrink-0">
                      <TabsTrigger value="screenshot" className="flex items-center gap-2">
                        <Camera className="h-4 w-4" />
                        Screenshot
                      </TabsTrigger>
                      <TabsTrigger value="html" className="flex items-center gap-2">
                        <Code className="h-4 w-4" />
                        HTML
                      </TabsTrigger>
                      <TabsTrigger value="text" className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Text
                      </TabsTrigger>
                    </TabsList>
                    
                    {/* Helpful hints for each tab */}
                    {activeTab === 'html' && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950/30 px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-800 whitespace-nowrap">
                        <Highlighter className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                        <span className="font-medium">Highlight text to annotate</span>
                      </div>
                    )}
                    {activeTab === 'text' && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950/30 px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-800 whitespace-nowrap">
                        <Highlighter className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                        <span className="font-medium">Highlight text to annotate</span>
                      </div>
                    )}
                    {activeTab === 'screenshot' && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-purple-50 dark:bg-purple-950/30 px-3 py-1.5 rounded-full border border-purple-200 dark:border-purple-800 whitespace-nowrap">
                        <StickyNote className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                        <span className="font-medium">Draw rectangles to annotate</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Search Bar - Only show for HTML and Text tabs */}
                  {(activeTab === 'html' || activeTab === 'text') && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search content..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9 w-48 sm:w-64"
                        />
                      </div>
                      
                      {searchQuery && totalMatches > 0 && (
                        <div className="flex items-center gap-2">
                          {/* Match count */}
                          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                            {currentMatchIndex + 1} of {totalMatches}
                          </span>
                          
                          {/* Navigation buttons */}
                          <div className="flex">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigateToMatch('prev')}
                              disabled={totalMatches <= 1}
                              className="h-8 w-8 p-0"
                            >
                              <ChevronUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigateToMatch('next')}
                              disabled={totalMatches <= 1}
                              className="h-8 w-8 p-0"
                            >
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      {searchQuery && totalMatches === 0 && (
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                          No matches
                        </span>
                      )}
                      
                      {searchQuery && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSearchQuery('')}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
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
                      onDeleteAnnotation={async (annotationId) => {
                        // TODO: Delete annotation note
                        console.log('Delete annotation:', annotationId)
                      }}
                      onClickAnnotation={(annotation) => {
                        // TODO: Show annotation note in sidebar
                        console.log('Click annotation:', annotation)
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
                  {clip.html_content ? (
                    <div className="flex-1 flex flex-col">
                      <div className="p-4 border-b bg-background">
                        <div className="text-sm text-muted-foreground mb-2">
                          Choose how to view the HTML content:
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setHtmlViewMode('html-rendered')}
                            className={`px-3 py-1 text-xs rounded border ${
                              htmlViewMode === 'html-rendered' 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-background hover:bg-muted'
                            }`}
                          >
                            Rendered View
                          </button>
                          <button
                            onClick={() => setHtmlViewMode('html-source')}
                            className={`px-3 py-1 text-xs rounded border ${
                              htmlViewMode === 'html-source' 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-background hover:bg-muted'
                            }`}
                          >
                            Source Code
                          </button>
                        </div>
                      </div>
                      
                      {htmlViewMode === 'html-rendered' ? (
                        <div className="flex-1 bg-muted/30 p-4">
                          <div className="bg-white rounded border shadow-sm h-full">
                            <iframe
                              srcDoc={`
                                ${clip.html_content}
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
                              sandbox="allow-same-origin allow-scripts"
                              title="HTML Content Preview"
                              style={{ minHeight: '500px' }}
                              onLoad={(e) => {
                                const iframe = e.target as HTMLIFrameElement;
                                try {
                                  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                                  if (iframeDoc) {
                                    // Add text selection handler
                                    iframeDoc.addEventListener('mouseup', () => {
                                      const selection = iframeDoc.getSelection();
                                      if (selection && selection.toString().trim()) {
                                        handleTextSelection({
                                          target: {
                                            ownerDocument: iframeDoc
                                          }
                                        } as any);
                                      }
                                    });
                                    
                                    // Send search term for highlighting
                                    if (searchQuery) {
                                      iframe.contentWindow?.postMessage({
                                        type: 'highlight',
                                        searchTerm: searchQuery,
                                        currentIndex: currentMatchIndex
                                      }, '*');
                                    }
                                  }
                                } catch (error) {
                                  console.log('Cannot access iframe content due to security restrictions');
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
                                __html: highlightSearchTextForSourceCode(clip.html_content, searchQuery, currentMatchIndex)
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
                  {clip.text_content ? (
                    <div className="flex-1 bg-muted/30 p-4">
                      <div className="bg-white rounded border shadow-sm overflow-auto" style={{ height: 'calc(100vh - 200px)' }}>
                        <div className="p-4">
                          <div 
                            className="text-sm whitespace-pre-wrap leading-relaxed"
                            style={{ 
                              maxWidth: '100%',
                              wordBreak: 'break-word',
                              overflowWrap: 'break-word'
                            }}
                            onMouseUp={handleTextSelection}
                            dangerouslySetInnerHTML={{
                              __html: highlightSearchText(clip.text_content, searchQuery, currentMatchIndex)
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No text content available</p>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </div>

          {/* Metadata & Edit Panel */}
          <div className="w-80 border-l bg-muted/20 flex flex-col overflow-hidden">
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
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                    {editForm.tags.length === 0 && (
                      <span className="text-muted-foreground text-xs">No tags</span>
                    )}
                  </div>
                  
                  <div className="flex space-x-1">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add tag"
                      className="text-xs h-7"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    />
                    <Button size="sm" onClick={handleAddTag} className="h-7 px-2">
                      <Plus className="h-3 w-3" />
                    </Button>
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
                  <Textarea
                    value={editForm.notes}
                    onChange={(e) => handleFormChange('notes', e.target.value)}
                    placeholder="Write your detailed notes here... ✍️"
                    className="flex-1 resize-none text-base leading-relaxed min-h-[400px] font-mono"
                    autoFocus
                  />
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
