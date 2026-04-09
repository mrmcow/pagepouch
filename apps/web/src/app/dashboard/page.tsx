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
  Sun
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
import { KnowledgeGraphUpgradeModal } from '@/components/dashboard/KnowledgeGraphUpgradeModal'
import { KnowledgeGraphsView } from '@/components/dashboard/KnowledgeGraphsView'
import { CachedImage, useImageCache } from '@/components/ui/cached-image'
import { DownloadModal } from '@/components/ui/download-modal'
import { ExportModal } from '@/components/dashboard/ExportModal'
import { ExportUpgradeModal } from '@/components/dashboard/ExportUpgradeModal'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
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
  selectedTag: string | null
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
    selectedTag: null,
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

  const refreshSubscriptionData = useCallback(async () => {
    try {
      const [subscriptionResponse, usageResponse] = await Promise.all([
        fetch('/api/subscription', {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        }),
        fetch('/api/usage', {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        })
      ])
      
      if (subscriptionResponse.ok && usageResponse.ok) {
        const [subData, usageData] = await Promise.all([
          subscriptionResponse.json(),
          usageResponse.json()
        ])
        
        setState(prev => ({
          ...prev,
          subscriptionTier: subData.subscription_tier || usageData.subscription_tier || 'free',
          subscriptionStatus: subData.subscription_status || 'inactive',
          clipsThisMonth: usageData.clips_this_month || 0,
          clipsLimit: usageData.clips_limit || (subData.subscription_tier === 'pro' ? 1000 : 10),
        }))
      } else {
      }
    } catch (error) {
      console.error('Failed to refresh subscription data:', error)
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
      if (state.isClipViewerOpen) handleClipViewerClose()
    },
    prev: () => handleClipNavigate('prev'),
    next: () => handleClipNavigate('next'),
    toggleFavorite: () => {
      if (state.selectedClip) {
        handleToggleFavorite(state.selectedClip.id, !state.selectedClip.is_favorite)
      }
    },
  })

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
      const [clipsResponse, foldersResponse, tagsResponse, subscriptionResponse, usageResponse] = await Promise.all([
        fetch(`/api/clips?limit=${limit}&offset=${offset}`, { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } }),
        fetch('/api/folders', { cache: 'force-cache', headers: { 'Cache-Control': 'max-age=300' } }),
        fetch('/api/tags', { cache: 'force-cache', headers: { 'Cache-Control': 'max-age=300' } }),
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
        clipTags: {},
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
          setState(prev => ({
            ...prev,
            searchResults: data.clips || [],
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

  const loadClipTagsForFilter = async (tagId: string) => {
    try {
      // Only load if we don't have the data yet
      if (Object.keys(state.clipTags).length === 0) {
        const clipTagsMap: Record<string, string[]> = {}
        
        // Load tags for all clips efficiently
        await Promise.all(
          state.clips.map(async (clip: Clip) => {
            try {
              const tagsResponse = await fetch(`/api/clips/${clip.id}/tags`)
              if (tagsResponse.ok) {
                const clipTags = await tagsResponse.json()
                clipTagsMap[clip.id] = clipTags.map((tag: any) => tag.id)
              } else {
                clipTagsMap[clip.id] = []
              }
            } catch (error) {
              console.error(`Failed to load tags for clip ${clip.id}:`, error)
              clipTagsMap[clip.id] = []
            }
          })
        )

        setState(prev => ({
          ...prev,
          clipTags: clipTagsMap
        }))
      }
    } catch (error) {
      console.error('Failed to load clip tags:', error)
    }
  }

  const handleTagFilterChange = async (value: string) => {
    const selectedTag = value === 'all-tags' ? null : value
    
    // Load clip tags BEFORE updating state if a tag is selected
    if (selectedTag) {
      await loadClipTagsForFilter(selectedTag)
    }
    
    // Now update the selected tag state AFTER tags are loaded
    setState(prev => ({ 
      ...prev, 
      selectedTag 
    }))
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
      const matchesTag = !state.selectedTag || (state.clipTags[clip.id] && state.clipTags[clip.id].includes(state.selectedTag))

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
  }, [state.clips, state.searchResults, state.searchQuery, state.selectedFolder, state.selectedTag, state.viewFilter, state.clipTags])

  const sortedClips = useMemo(() => [...filteredClips].sort((a, b) => {
    const aValue = a[state.sortBy]
    const bValue = b[state.sortBy]
    return state.sortOrder === 'asc' ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1)
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
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Navigation */}
            <div className="flex items-center space-x-6">
              <button 
                onClick={() => {
                  // Reset to all clips view
                  setState(prev => ({ 
                    ...prev, 
                    viewFilter: 'library',
                    searchQuery: '',
                    selectedFolder: null,
                    selectedTag: null
                  }))
                }}
                className="hover:opacity-80 transition-opacity"
              >
                <LogoWithText size={40} clickable={false} />
              </button>
              
              <nav className="hidden md:flex items-center space-x-1">
                {([
                  { filter: 'library',   icon: <Grid className="h-4 w-4" />,  label: 'Library'   },
                  { filter: 'favorites', icon: <Star className="h-4 w-4" />,  label: 'Favorites' },
                  { filter: 'recent',    icon: <Clock className="h-4 w-4" />, label: 'Recent'    },
                ] as const).map(({ filter, icon, label }) => {
                  const active = state.viewFilter === filter
                  return (
                    <button
                      key={filter}
                      onClick={() => setState(prev => ({ ...prev, viewFilter: filter }))}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                        active
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10'
                      }`}
                    >
                      {icon}
                      {label}
                    </button>
                  )
                })}
              </nav>
            </div>

            {/* User Profile */}
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleDark}
                className="h-9 w-9 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-all"
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
      <div className="container mx-auto px-4 py-6 h-auto lg:h-[calc(100vh-80px)] relative z-10">
        <div className="flex flex-col lg:flex-row gap-6 h-auto lg:h-full">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 space-y-6">

            {/* Quick Actions */}
            <Card className="border border-slate-200/70 dark:border-white/10 shadow-sm bg-white dark:bg-slate-900">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline"
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => setState(prev => ({ ...prev, isDownloadModalOpen: true }))}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Install Extension
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => setState(prev => ({ ...prev, isClipUrlModalOpen: true }))}
                >
                  <Globe className="mr-2 h-4 w-4" />
                  Clip URL
                </Button>
                
                {/* Export Clips - Pro Feature */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start relative"
                  onClick={() => {
                    if (state.subscriptionTier === 'pro') {
                      // If in Page Graphs, switch back to Library view first
                      if (state.viewFilter === 'knowledge-graphs') {
                        setState(prev => ({ 
                          ...prev, 
                          viewFilter: 'library',
                          isSelectionMode: true,
                          selectedClipIds: new Set()
                        }))
                      } else {
                        // Just enable selection mode if already in clips view
                        setState(prev => ({ 
                          ...prev, 
                          isSelectionMode: true,
                          selectedClipIds: new Set()
                        }))
                      }
                    } else {
                      // Show upgrade modal for free users
                      setState(prev => ({ ...prev, isExportUpgradeModalOpen: true }))
                    }
                  }}
                >
                  <FileDown className="mr-2 h-4 w-4" />
                  Export Clips
                  {state.subscriptionTier !== 'pro' && (
                    <Badge className="ml-auto text-[10px] px-1.5 py-0 h-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0">
                      PRO
                    </Badge>
                  )}
                </Button>
                
                {/* Page Graphs - Pro Feature */}
                  <Button 
                    variant="outline"
                    size="sm"
                  className="w-full justify-start relative"
                  onClick={() => {
                    if (state.subscriptionTier === 'pro') {
                      // Exit selection mode when switching to Page Graphs
                      setState(prev => ({ 
                        ...prev, 
                        viewFilter: 'knowledge-graphs',
                        isSelectionMode: false,
                        selectedClipIds: new Set()
                      }))
                    } else {
                      // Show upgrade modal for free users
                      setState(prev => ({ ...prev, isKnowledgeGraphUpgradeModalOpen: true }))
                    }
                  }}
                  >
                    <Brain className="mr-2 h-4 w-4" />
                  Page Graphs
                  {state.subscriptionTier !== 'pro' && (
                    <Badge className="ml-auto text-[10px] px-1.5 py-0 h-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0">
                      PRO
                    </Badge>
                )}
                </Button>
              </CardContent>
            </Card>

            {/* Folders */}
            <Card className="border border-slate-200/70 dark:border-white/10 shadow-sm bg-white dark:bg-slate-900">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Folders</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <Button
                  variant={!state.selectedFolder ? "secondary" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
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
                  <Grid className="mr-2 h-4 w-4" />
                  All Clips ({state.totalClips})
                </Button>
                
                {state.folders.map((folder) => {
                  const folderClipCount = state.clips.filter(clip => clip.folder_id === folder.id).length
                  return (
                    <Button
                      key={folder.id}
                      variant={state.selectedFolder === folder.id ? "secondary" : "ghost"}
                      size="sm"
                      className="w-full justify-start group relative"
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
                
                {/* Add New Folder Button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start border-dashed border-2 border-slate-300 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 text-slate-600 dark:text-slate-400 hover:text-blue-700 dark:hover:text-blue-400 transition-all mt-2"
                  onClick={() => setState(prev => ({ ...prev, isCreateFolderModalOpen: true }))}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New Folder
                </Button>
              </CardContent>
            </Card>

            {/* Usage Stats - Only show when subscription data is loaded */}
            {!state.isSubscriptionLoading && (
              <Card className="border border-slate-200/70 dark:border-white/10 shadow-sm bg-white dark:bg-slate-900">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Usage</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                      onClick={refreshSubscriptionData}
                      title="Refresh usage data"
                    >
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Clips this month</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{state.clipsThisMonth}/{state.clipsLimit}</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full transition-all ${
                          (state.clipsThisMonth / state.clipsLimit) >= 0.9
                            ? 'bg-red-500'
                            : (state.clipsThisMonth / state.clipsLimit) >= 0.7
                            ? 'bg-yellow-500'
                            : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min((state.clipsThisMonth / state.clipsLimit) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {state.clipsLimit - state.clipsThisMonth} clips remaining this month
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Subscription Loading State */}
            {state.isSubscriptionLoading && (
              <Card className="border border-slate-200/70 dark:border-white/10 shadow-sm bg-white dark:bg-slate-900">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-slate-400 dark:text-slate-600">Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Clips this month</span>
                      <div className="h-4 w-12 bg-slate-100 dark:bg-slate-800 rounded animate-pulse"></div>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                      <div className="bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full animate-pulse w-1/3"></div>
                    </div>
                    <div className="h-3 w-24 bg-slate-100 dark:bg-slate-800 rounded animate-pulse"></div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Upgrade Section - Only show for free users when subscription data is loaded */}
            {!state.isSubscriptionLoading && state.subscriptionTier === 'free' && (
              <Card className="border border-slate-200/70 dark:border-white/10 shadow-sm bg-white dark:bg-slate-900">
                <CardContent className="pt-4 space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white mb-0.5">Upgrade to Pro</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">1,000 clips/month · 5GB storage</p>
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        const response = await fetch('/api/stripe/checkout', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY || 'price_1SBSLeDFfW8f5SmSgQooVxsd',
                            plan: 'monthly'
                          }),
                        });
                        const { url } = await response.json();
                        if (url) window.location.href = url;
                      } catch (error) {
                        console.error('Upgrade error:', error);
                        toast({ message: 'Upgrade failed. Please try again.', type: 'error' })
                      }
                    }}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all"
                  >
                    Monthly — $12/mo
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        const response = await fetch('/api/stripe/checkout', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ANNUAL || 'price_1SBSNpDFfW8f5SmShv3v8v8Q',
                            plan: 'annual'
                          }),
                        });
                        const { url } = await response.json();
                        if (url) window.location.href = url;
                      } catch (error) {
                        console.error('Upgrade error:', error);
                        toast({ message: 'Upgrade failed. Please try again.', type: 'error' })
                      }
                    }}
                    className="w-full border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                  >
                    Annual — $120/yr <span className="text-green-600 dark:text-green-400 font-semibold">Save 17%</span>
                  </button>
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
                    className={`pl-10 h-11 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 focus:border-blue-500 dark:focus:border-blue-400 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-0 transition-all duration-200 rounded-xl ${state.searchQuery ? 'pr-10' : 'pr-3'}`}
                  />
                  {state.searchQuery && (
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
                  )}
                </div>
                {state.searchQuery && !state.isSearching && filteredClips.length > 0 && (
                  <span className="flex-shrink-0 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md whitespace-nowrap">
                    {filteredClips.length} result{filteredClips.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {/* Secondary row: filters + sort + view — scrollable on mobile */}
              <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none">
                <select
                  value={state.selectedTag || 'all-tags'}
                  onChange={(e) => handleTagFilterChange(e.target.value)}
                  className="h-9 px-2 bg-slate-100 dark:bg-slate-800 border border-transparent hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-0 transition-all duration-200 rounded-lg text-sm flex-shrink-0"
                >
                  <option value="all-tags">All Tags</option>
                  {state.availableTags.map((tag) => (
                    <option key={tag.id} value={tag.id}>{tag.name}</option>
                  ))}
                </select>

                <select
                  value={state.sortBy}
                  onChange={(e) => setState(prev => ({ ...prev, sortBy: e.target.value as any }))}
                  className="h-9 px-2 bg-slate-100 dark:bg-slate-800 border border-transparent hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-0 transition-all duration-200 rounded-lg text-sm flex-shrink-0"
                >
                  <option value="created_at">Date</option>
                  <option value="updated_at">Modified</option>
                  <option value="title">Title</option>
                </select>

                <button
                  onClick={() => setState(prev => ({ 
                    ...prev, 
                    sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' 
                  }))}
                  className="h-9 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-transparent focus:outline-none transition-all duration-200 rounded-lg text-sm flex-shrink-0"
                  title={`Sort ${state.sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                >
                  {state.sortOrder === 'asc' ? '↑' : '↓'}
                </button>

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

            {/* Selection Mode Floating Action Bar */}
            {state.isSelectionMode && (
              <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border-2 border-blue-500 px-6 py-4 flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-sm font-medium">
                    <CheckSquare className="h-5 w-5 text-blue-600" />
                    <span className="text-slate-900 dark:text-white">
                      {state.selectedClipIds.size} selected
                    </span>
                  </div>
                  
                  {state.selectedClipIds.size < sortedClips.length && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAll}
                    >
                      Select All ({sortedClips.length})
                    </Button>
                  )}
                  
                  {state.selectedClipIds.size > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearSelection}
                    >
                      Clear
                    </Button>
                  )}
                  
                  <Button
                    size="sm"
                    onClick={handleOpenExportModal}
                    disabled={state.selectedClipIds.size === 0}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                  >
                    <FileDown className="h-4 w-4 mr-2" />
                    Export {state.selectedClipIds.size > 0 ? `(${state.selectedClipIds.size})` : ''}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancelSelectionMode}
                  >
                    <X className="h-4 w-4" />
                  </Button>
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
                    searchQuery: '', // Clear search when navigating
                    selectedTag: null // Clear tag filter when navigating
                  }))
                }}
              />
            ) : (
              <div className="flex-1 overflow-visible lg:overflow-hidden">
              {isInitialLoading ? (
                /* Loading Skeleton */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {[...Array(8)].map((_, i) => (
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
                <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center mb-6">
                    <LogoIcon size={40} />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                    {state.searchQuery ? 'No results found' :
                     state.viewFilter === 'favorites' ? 'No favorites yet' :
                     state.viewFilter === 'recent' ? 'No recent clips' :
                     state.selectedFolder ? 'This folder is empty' :
                     'Your stash is empty'}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed mb-8">
                    {state.searchQuery ? `No clips match "${state.searchQuery}". Try different keywords.` :
                     state.viewFilter === 'favorites' ? 'Star a clip to add it to your favorites.' :
                     state.viewFilter === 'recent' ? 'Clips from the last 7 days will appear here.' :
                     state.selectedFolder ? 'Capture a page with the extension and move it here.' :
                     'Install the extension and capture your first page — it takes one click.'}
                  </p>
                  {(state.viewFilter === 'library' && !state.searchQuery) && (
                    <Button
                      onClick={() => setState(prev => ({ ...prev, isDownloadModalOpen: true }))}
                      className="h-11 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Install Extension
                    </Button>
                  )}
                  {state.searchQuery && (
                    <button
                      onClick={() => handleSearch('')}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              ) : (
                <div className="h-auto lg:h-full overflow-visible lg:overflow-y-auto pr-2 -mr-2">
                  <div className={
                    state.viewMode === 'grid' 
                      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-3 pb-6"
                      : "space-y-2 pb-6"
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
        onSuccess={() => {
          // Reload clips after successful capture
          loadData(true)
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
      <Card className={`p-3 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/30 transition-all duration-300 cursor-pointer ${
        isSelectionMode && isSelected 
          ? 'border-2 border-blue-500 bg-blue-50/60 dark:bg-blue-900/20' 
          : clip.is_favorite 
          ? 'border-l-4 border-l-yellow-400 bg-yellow-50/40 dark:bg-yellow-900/10 border-t border-r border-b border-slate-200/60 dark:border-white/10' 
          : 'border border-slate-200/60 dark:border-white/10 bg-white dark:bg-slate-900'
      }`} onClick={onClick}>
        <div className="flex items-center space-x-3">
          {isSelectionMode && (
            <div 
              className="flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation()
                onToggleSelection?.()
              }}
            >
              {isSelected ? (
                <CheckSquare className="h-5 w-5 text-blue-600" />
              ) : (
                <Square className="h-5 w-5 text-slate-400" />
              )}
            </div>
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
              <span className="truncate">{new URL(clip.url).hostname}</span>
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
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`

  return (
    <div
      className={`group cursor-pointer rounded-2xl overflow-hidden bg-white dark:bg-slate-900 transition-all duration-200 ${
        isSelectionMode && isSelected
          ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-950 border border-blue-500'
          : 'border border-slate-200/80 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/20 hover:shadow-lg hover:shadow-slate-900/8 dark:hover:shadow-black/30'
      }`}
      onClick={onClick}
    >
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

        {/* Selection */}
        {isSelectionMode && (
          <div
            className="absolute top-2 left-2 w-7 h-7 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm flex items-center justify-center shadow"
            onClick={(e) => { e.stopPropagation(); onToggleSelection?.() }}
          >
            {isSelected
              ? <CheckSquare className="h-4 w-4 text-blue-600" />
              : <Square className="h-4 w-4 text-slate-400" />
            }
          </div>
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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={faviconUrl} alt="" width={12} height={12} className="w-3 h-3 rounded-sm flex-shrink-0 opacity-60" />
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
