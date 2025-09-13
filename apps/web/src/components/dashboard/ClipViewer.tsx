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
  Folder,
  MoreHorizontal,
  Search,
  Code,
  Camera,
  StickyNote,
  Highlighter
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Clip, Folder as FolderType } from '@pagepouch/shared'

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
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedText, setSelectedText] = useState('')
  const [showAddNote, setShowAddNote] = useState(false)
  const [noteText, setNoteText] = useState('')

  useEffect(() => {
    if (clip) {
      const newForm = {
        title: clip.title,
        notes: clip.notes || '',
        folder_id: clip.folder_id || '',
        tags: [] // TODO: Load tags when implemented
      }
      setEditForm(newForm)
      setHasUnsavedChanges(false)
    }
  }, [clip])

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
        await onUpdate(clip.id, {
          title: editForm.title,
          notes: editForm.notes,
          folder_id: editForm.folder_id || undefined,
        })
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
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setEditForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleTextSelection = () => {
    const selection = window.getSelection()
    if (selection && selection.toString().trim()) {
      setSelectedText(selection.toString().trim())
      setShowAddNote(true)
    }
  }

  const handleAddNoteFromSelection = async () => {
    if (!selectedText || !noteText.trim()) return
    
    // Format the note with better visual distinction for the excerpt
    const timestamp = new Date().toLocaleString()
    const noteWithSelection = `📝 **Note added ${timestamp}**\n\n> "${selectedText}"\n\n${noteText.trim()}`
    const currentNotes = editForm.notes ? `${editForm.notes}\n\n---\n\n${noteWithSelection}` : noteWithSelection
    
    handleFormChange('notes', currentNotes)
    setSelectedText('')
    setNoteText('')
    setShowAddNote(false)
  }

  const highlightSearchText = (text: string, query: string) => {
    if (!query.trim()) return text
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    return text.replace(regex, '<mark class="bg-yellow-200 text-yellow-900 px-1 rounded">$1</mark>')
  }

  const formatNotesDisplay = (notes: string) => {
    if (!notes) return notes
    
    return notes
      // Format headers with emoji and bold
      .replace(/📝 \*\*(.*?)\*\*/g, '<div class="flex items-center gap-2 mb-2 mt-4 first:mt-0"><span class="text-lg">📝</span><span class="font-semibold text-sm text-blue-700">$1</span></div>')
      // Format blockquotes (excerpts)
      .replace(/^> "(.*?)"$/gm, '<div class="my-2 p-3 bg-blue-50 border-l-4 border-blue-400 rounded-r"><div class="text-xs font-medium text-blue-600 mb-1">EXCERPT</div><div class="text-sm italic text-gray-700 font-medium">"$1"</div></div>')
      // Format separators
      .replace(/^---$/gm, '<hr class="my-4 border-gray-200">')
      // Format line breaks
      .replace(/\n/g, '<br>')
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
                <div className="flex items-center justify-between">
                  <TabsList className="grid w-full max-w-md grid-cols-3">
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
                  
                  {/* Search Bar - Only show for HTML and Text tabs */}
                  {(activeTab === 'html' || activeTab === 'text') && (
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search content..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9 w-64"
                        />
                      </div>
                      {searchQuery && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSearchQuery('')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-hidden">
                {/* Screenshot Tab */}
                <TabsContent value="screenshot" className="h-full m-0">
                  {clip.screenshot_url ? (
                    <div className="h-full bg-muted/30 p-4 overflow-auto">
                      <div className="w-full">
                        <img
                          src={clip.screenshot_url}
                          alt={clip.title}
                          className="w-full h-auto shadow-lg rounded border block"
                          style={{ maxHeight: 'none', maxWidth: '100%' }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No screenshot available</p>
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* HTML Tab */}
                <TabsContent value="html" className="h-full m-0">
                  {clip.html_content ? (
                    <div className="h-full overflow-auto">
                      <div className="p-4">
                        <div className="bg-muted/30 rounded border overflow-hidden">
                          <pre 
                            className="text-xs font-mono whitespace-pre-wrap p-4 overflow-auto max-h-full w-full"
                            style={{ 
                              maxWidth: '100%',
                              wordBreak: 'break-all',
                              overflowWrap: 'break-word'
                            }}
                            onMouseUp={handleTextSelection}
                            dangerouslySetInnerHTML={{
                              __html: highlightSearchText(clip.html_content, searchQuery)
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No HTML content available</p>
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* Text Tab */}
                <TabsContent value="text" className="h-full m-0">
                  {clip.text_content ? (
                    <div className="h-full overflow-auto">
                      <div className="p-4">
                        <div 
                          className="text-sm whitespace-pre-wrap bg-muted/30 p-4 rounded border leading-relaxed w-full"
                          style={{ 
                            maxWidth: '100%',
                            wordBreak: 'break-word',
                            overflowWrap: 'break-word'
                          }}
                          onMouseUp={handleTextSelection}
                          dangerouslySetInnerHTML={{
                            __html: highlightSearchText(clip.text_content, searchQuery)
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
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
                <Input
                  value={editForm.title}
                  onChange={(e) => handleFormChange('title', e.target.value)}
                  placeholder="Clip title"
                  className="font-medium"
                />
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
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Notes</label>
                {editForm.notes && editForm.notes.includes('📝') ? (
                  <div className="space-y-2">
                    {/* Formatted Preview */}
                    <div 
                      className="text-sm p-3 bg-muted/30 rounded border min-h-[120px] max-h-[200px] overflow-y-auto leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: formatNotesDisplay(editForm.notes)
                      }}
                    />
                    {/* Raw Edit Mode */}
                    <details className="group">
                      <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                        Edit raw notes
                      </summary>
                      <Textarea
                        value={editForm.notes}
                        onChange={(e) => handleFormChange('notes', e.target.value)}
                        placeholder="Add your notes..."
                        rows={Math.max(6, Math.min(12, editForm.notes.split('\n').length + 2))}
                        className="text-sm resize-y min-h-[120px] max-h-[300px] leading-relaxed mt-2"
                        style={{
                          fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
                        }}
                      />
                    </details>
                  </div>
                ) : (
                  <Textarea
                    value={editForm.notes}
                    onChange={(e) => handleFormChange('notes', e.target.value)}
                    placeholder="Add your notes..."
                    rows={editForm.notes ? Math.max(6, Math.min(12, editForm.notes.split('\n').length + 2)) : 6}
                    className="text-sm resize-y min-h-[120px] max-h-[300px] leading-relaxed"
                    style={{
                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
                    }}
                  />
                )}
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
      </div>
    </div>
  )
}
