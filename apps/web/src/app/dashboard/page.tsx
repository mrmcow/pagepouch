'use client'

import { useState, useEffect } from 'react'
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
  Globe
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
import { Clip, Folder } from '@pagepouch/shared'
import { LogoWithText, LogoIcon } from '@/components/ui/logo'
import { ClipViewer } from '@/components/dashboard/ClipViewer'
import { CreateFolderModal } from '@/components/dashboard/CreateFolderModal'
import { EditFolderModal } from '@/components/dashboard/EditFolderModal'

interface DashboardState {
  clips: Clip[]
  folders: Folder[]
  isLoading: boolean
  searchQuery: string
  selectedFolder: string | null
  viewMode: 'grid' | 'list'
  sortBy: 'created_at' | 'updated_at' | 'title'
  sortOrder: 'asc' | 'desc'
  user: any
  selectedClip: Clip | null
  isClipViewerOpen: boolean
  isCreateFolderModalOpen: boolean
  selectedFolderForEdit: Folder | null
  isEditFolderModalOpen: boolean
}

function DashboardContent() {
  const [state, setState] = useState<DashboardState>({
    clips: [],
    folders: [],
    isLoading: true,
    searchQuery: '',
    selectedFolder: null,
    viewMode: 'grid',
    sortBy: 'created_at',
    sortOrder: 'desc',
    user: null,
    selectedClip: null,
    isClipViewerOpen: false,
    isCreateFolderModalOpen: false,
    selectedFolderForEdit: null,
    isEditFolderModalOpen: false,
  })

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAuth()
    loadData()
  }, [])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/auth/login')
      return
    }

    setState(prev => ({ ...prev, user }))
  }

  const loadData = async () => {
    setState(prev => ({ ...prev, isLoading: true }))

    try {
      // Load clips and folders in parallel
      const [clipsResponse, foldersResponse] = await Promise.all([
        fetch('/api/clips'),
        fetch('/api/folders')
      ])

      const clipsData = await clipsResponse.json()
      const foldersData = await foldersResponse.json()

      setState(prev => ({
        ...prev,
        clips: clipsData.clips || [],
        folders: foldersData.folders || [],
        isLoading: false,
      }))
    } catch (error) {
      console.error('Failed to load data:', error)
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }

  const handleSearch = (query: string) => {
    setState(prev => ({ ...prev, searchQuery: query }))
    // TODO: Implement debounced search API call
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
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

  const filteredClips = state.clips.filter(clip => {
    const matchesSearch = !state.searchQuery || 
      clip.title.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
      clip.text_content?.toLowerCase().includes(state.searchQuery.toLowerCase())
    
    const matchesFolder = !state.selectedFolder || clip.folder_id === state.selectedFolder

    return matchesSearch && matchesFolder
  })

  const sortedClips = [...filteredClips].sort((a, b) => {
    const aValue = a[state.sortBy]
    const bValue = b[state.sortBy]
    
    if (state.sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  if (state.isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <LogoIcon size={64} />
          </div>
          <p className="text-muted-foreground">Loading your clips...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Navigation */}
            <div className="flex items-center space-x-6">
              <button 
                onClick={() => router.push('/dashboard')}
                className="hover:opacity-80 transition-opacity"
              >
                <LogoWithText size={32} />
              </button>
              
              <nav className="hidden md:flex items-center space-x-4">
                <Button variant="ghost" size="sm">
                  <Grid className="mr-2 h-4 w-4" />
                  Library
                </Button>
                <Button variant="ghost" size="sm">
                  <Star className="mr-2 h-4 w-4" />
                  Favorites
                </Button>
                <Button variant="ghost" size="sm">
                  <Clock className="mr-2 h-4 w-4" />
                  Recent
                </Button>
              </nav>
            </div>

            {/* User Menu and Sign Out */}
            <div className="flex items-center space-x-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {state.user?.user_metadata?.full_name || 'User'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {state.user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Download className="mr-2 h-4 w-4" />
                    <span>Export Data</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSignOut}
                className="hidden sm:flex"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => router.push('/')}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Install Extension
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => setState(prev => ({ ...prev, isCreateFolderModalOpen: true }))}
                >
                  <FolderPlus className="mr-2 h-4 w-4" />
                  New Folder
                </Button>
              </CardContent>
            </Card>

            {/* Folders */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Folders</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <Button
                  variant={!state.selectedFolder ? "secondary" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setState(prev => ({ ...prev, selectedFolder: null }))}
                >
                  <Grid className="mr-2 h-4 w-4" />
                  All Clips ({state.clips.length})
                </Button>
                
                {state.folders.map((folder) => {
                  const folderClipCount = state.clips.filter(clip => clip.folder_id === folder.id).length
                  return (
                    <Button
                      key={folder.id}
                      variant={state.selectedFolder === folder.id ? "secondary" : "ghost"}
                      size="sm"
                      className="w-full justify-start group relative"
                      onClick={() => setState(prev => ({ ...prev, selectedFolder: folder.id }))}
                    >
                      <div 
                        className="mr-2 h-3 w-3 rounded-sm" 
                        style={{ backgroundColor: folder.color || '#6B7280' }}
                      />
                      <span className="flex-1 text-left">
                        {folder.name} ({folderClipCount})
                      </span>
                      <div
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6 rounded hover:bg-accent cursor-pointer flex items-center justify-center"
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
              </CardContent>
            </Card>

            {/* Usage Stats */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Clips this month</span>
                    <span className="font-medium">{state.clips.length}/100</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${Math.min((state.clips.length / 100) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {100 - state.clips.length} clips remaining
                  </p>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="flex-1 space-y-6 min-w-0">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 flex-1 w-full">
                <div className="relative flex-1 w-full max-w-md">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search your clips..."
                    value={state.searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select
                  value={state.sortBy}
                  onValueChange={(value: any) => setState(prev => ({ ...prev, sortBy: value }))}
                >
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created_at">Date Created</SelectItem>
                    <SelectItem value="updated_at">Last Modified</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant={state.viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setState(prev => ({ ...prev, viewMode: 'grid' }))}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={state.viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setState(prev => ({ ...prev, viewMode: 'list' }))}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Clips Grid/List */}
            {sortedClips.length === 0 ? (
              <Card className="p-12">
                <div className="text-center space-y-4">
                  <div className="flex justify-center opacity-20">
                    <LogoIcon size={96} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">No clips yet</h3>
                    <p className="text-muted-foreground">
                      Install the PagePouch extension to start capturing web content
                    </p>
                  </div>
                  <Button onClick={() => router.push('/')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Install Extension
                  </Button>
                </div>
              </Card>
            ) : (
              <div className={
                state.viewMode === 'grid' 
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4"
                  : "space-y-4"
              }>
                {sortedClips.map((clip) => (
                  <ClipCard 
                    key={clip.id} 
                    clip={clip} 
                    viewMode={state.viewMode}
                    folders={state.folders}
                    onClick={() => handleClipClick(clip)}
                    onUpdate={handleClipUpdate}
                    onDelete={handleClipDelete}
                  />
                ))}
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
}

function ClipCard({ clip, viewMode, folders, onClick, onUpdate, onDelete }: ClipCardProps) {
  const folder = folders.find(f => f.id === clip.folder_id)
  
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this clip?')) {
      try {
        await onDelete(clip.id)
      } catch (error) {
        console.error('Failed to delete clip:', error)
      }
    }
  }

  if (viewMode === 'list') {
    return (
      <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
        <div className="flex items-center space-x-4">
          {clip.screenshot_url && (
            <img
              src={clip.screenshot_url}
              alt={clip.title}
              className="w-16 h-12 object-cover rounded border"
            />
          )}
          
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{clip.title}</h3>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Globe className="h-3 w-3" />
              <span className="truncate">{new URL(clip.url).hostname}</span>
              <span>•</span>
              <span>{new Date(clip.created_at).toLocaleDateString()}</span>
            </div>
            {folder && (
              <Badge variant="secondary" className="mt-1">
                {folder.name}
              </Badge>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
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

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow group cursor-pointer" onClick={onClick}>
      {clip.screenshot_url && (
        <div className="aspect-video bg-muted">
          <img
            src={clip.screenshot_url}
            alt={clip.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="font-medium line-clamp-2 leading-tight">{clip.title}</h3>
          
          <div className="flex items-center text-xs text-muted-foreground">
            <Globe className="h-3 w-3 mr-1" />
            <span className="truncate">{new URL(clip.url).hostname}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {new Date(clip.created_at).toLocaleDateString()}
            </span>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
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

          {folder && (
            <Badge variant="secondary" className="text-xs">
              {folder.name}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
