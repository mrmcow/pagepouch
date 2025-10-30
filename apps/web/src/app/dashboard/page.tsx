'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
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
  Sparkles
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
import { EditFolderModal } from '@/components/dashboard/EditFolderModal'
import { UserAvatar } from '@/components/ui/user-avatar'
import { ProfileModal } from '@/components/dashboard/ProfileModal'
import { BillingModal } from '@/components/dashboard/BillingModal'
import { KnowledgeGraphUpgradeModal } from '@/components/dashboard/KnowledgeGraphUpgradeModal'
import { KnowledgeGraphsView } from '@/components/dashboard/KnowledgeGraphsView'
import { CachedImage, useImageCache } from '@/components/ui/cached-image'
import { DownloadModal } from '@/components/ui/download-modal'

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
}

function DashboardContent() {
  const [detectedBrowser, setDetectedBrowser] = useState<'chrome' | 'firefox'>('chrome')
  
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
    clipsLimit: 50,
    isSubscriptionLoading: true,
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
    // Clear image cache on refresh to ensure fresh content
    clearCache()
    console.log('Image cache cleared')
    loadData(true) // Reset to first page
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
          clipsLimit: usageData.clips_limit || (subData.subscription_tier === 'pro' ? 1000 : 50),
        }))
        
        console.log('📊 Subscription data refreshed:', {
          tier: subData.subscription_tier || usageData.subscription_tier,
          status: subData.subscription_status,
          clipsThisMonth: usageData.clips_this_month,
          clipsLimit: usageData.clips_limit
        })
      } else {
        console.error('Failed to refresh subscription or usage data:', {
          subscriptionOk: subscriptionResponse.ok,
          usageOk: usageResponse.ok
        })
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
      console.log('🔄 Window focused, refreshing subscription data...')
      refreshSubscriptionData()
    }

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('🔄 Page became visible, refreshing subscription data...')
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
      console.log('⏰ Periodic subscription data refresh...')
      refreshSubscriptionData()
    }, 30000) // 30 seconds

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
              console.log(`Smart preload (speed: ${scrollSpeed.toFixed(2)}): ${nextBatch.length} images`)
              setTimeout(() => { preloadCooldown = false }, 1000) // 1 second cooldown
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
        // Take next 10 uncached images and preload them
        const nextBatch = uncachedClips.slice(0, 10)
        preloadClipImages(nextBatch, false).then(() => {
          console.log(`Background preloaded ${nextBatch.length} additional images`)
        })
      }
    }
  }, [state.clips.length]) // Trigger when new clips are loaded

  // Preload images when folder selection changes
  useEffect(() => {
    if (state.clips.length > 0) {
      let clipsToPreload = state.clips
      
      // If a folder is selected, only preload clips from that folder
      if (state.selectedFolder) {
        clipsToPreload = state.clips.filter(clip => clip.folder_id === state.selectedFolder)
      }
      
      // Preload first 25 clips in the current context
      if (clipsToPreload.length > 0) {
        const priorityClips = clipsToPreload.slice(0, 25)
        preloadClipImages(priorityClips, false).then(() => {
          console.log(`Context preload (${state.selectedFolder ? 'folder' : 'all'}): ${priorityClips.length} images`)
        })
      }
    }
  }, [state.selectedFolder, state.clips.length]) // Trigger when folder selection or clips change

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
      const limit = 50 // Load 50 clips at a time for better performance
      
      // Load subscription and usage data first to prevent UI flash
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
      
      // Handle subscription and usage data
      let subscriptionData = {
        subscriptionTier: 'free',
        subscriptionStatus: 'inactive',
        clipsThisMonth: 0,
        clipsLimit: 50
      }
      
      if (subscriptionResponse.ok && usageResponse.ok) {
        const [subData, usageData] = await Promise.all([
          subscriptionResponse.json(),
          usageResponse.json()
        ])
        
        subscriptionData = {
          subscriptionTier: subData.subscription_tier || usageData.subscription_tier || 'free',
          subscriptionStatus: subData.subscription_status || 'inactive',
          clipsThisMonth: usageData.clips_this_month || 0,
          clipsLimit: usageData.clips_limit || (subData.subscription_tier === 'pro' ? 1000 : 50)
        }
        
        console.log('📊 Loaded subscription and usage data:', {
          tier: subscriptionData.subscriptionTier,
          status: subscriptionData.subscriptionStatus,
          clipsThisMonth: subscriptionData.clipsThisMonth,
          clipsLimit: subscriptionData.clipsLimit
        })
      } else {
        console.error('Failed to load subscription or usage data:', {
          subscriptionOk: subscriptionResponse.ok,
          usageOk: usageResponse.ok
        })
      }
      
      // Update subscription state immediately to prevent flash
      setState(prev => ({
        ...prev,
        subscriptionTier: subscriptionData.subscriptionTier as 'free' | 'pro',
        subscriptionStatus: subscriptionData.subscriptionStatus,
        clipsThisMonth: subscriptionData.clipsThisMonth,
        clipsLimit: subscriptionData.clipsLimit,
        isSubscriptionLoading: false,
      }))
      
      // Now load other data in parallel
      const [clipsResponse, foldersResponse, tagsResponse] = await Promise.all([
        fetch(`/api/clips?limit=${limit}&offset=${offset}`, { 
          cache: 'no-store', // Always get fresh data
          headers: { 'Cache-Control': 'no-cache' }
        }),
        fetch('/api/folders', { 
          cache: 'force-cache', // Cache folders as they change less
          headers: { 'Cache-Control': 'max-age=300' }
        }),
        fetch('/api/tags', { 
          cache: 'force-cache', // Cache tags as they change less
          headers: { 'Cache-Control': 'max-age=300' }
        })
      ])

      if (!clipsResponse.ok || !foldersResponse.ok || !tagsResponse.ok) {
        throw new Error('Failed to fetch data')
      }

      const clipsData = await clipsResponse.json()
      const foldersData = await foldersResponse.json()
      const tagsData = await tagsResponse.json()

      // Load clip tags lazily - only when needed for filtering
      const clipTagsMap: Record<string, string[]> = {}

      const newClips = clipsData.clips || []
      const allClips = reset ? newClips : [...state.clips, ...newClips]

      // Folders loaded successfully
      
      setState(prev => ({
        ...prev,
        clips: allClips,
        folders: foldersData.folders || [],
        availableTags: tagsData || [],
        clipTags: clipTagsMap,
        totalClips: clipsData.total || 0,
        hasMoreClips: clipsData.hasMore || false,
        currentOffset: offset + limit,
        isLoadingMore: false,
      }))

      // Preload images for better performance
      if (newClips.length > 0) {
        const isInitialLoad = reset && state.clips.length === 0
        preloadClipImages(newClips, isInitialLoad).then(() => {
          console.log(`${isInitialLoad ? 'Sequentially preloaded' : 'Preloaded'} ${newClips.length} clip images`)
        })
      }
      
      setIsInitialLoading(false)
    } catch (error) {
      console.error('Failed to load data:', error)
      setIsInitialLoading(false)
      setState(prev => ({ 
        ...prev, 
        isLoadingMore: false,
        isSubscriptionLoading: false 
      }))
      // Show error state but don't block the UI
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
        preloadClipImages(uncachedNewClips, false).then(() => {
          console.log(`Infinite scroll preload: ${uncachedNewClips.length} new images`)
        })
      }
    }, 200) // Small delay to let the state update
  }

  const handleSearch = (query: string) => {
    setState(prev => ({ ...prev, searchQuery: query }))
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
    
    setState(prev => ({ 
      ...prev, 
      selectedTag 
    }))
    
    // Load clip tags when a tag filter is selected
    if (selectedTag) {
      await loadClipTagsForFilter(selectedTag)
    }
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
    console.log(`🌟 Toggling favorite for clip ${clipId} to ${isFavorite}`)
    
    // Optimistic update - update UI immediately
    setState(prev => {
      console.log(`🔄 Optimistically updating clip ${clipId} favorite status to ${isFavorite}`)
      return {
        ...prev,
        clips: prev.clips.map(clip => 
          clip.id === clipId 
            ? { ...clip, is_favorite: isFavorite }
            : clip
        ),
        selectedClip: prev.selectedClip?.id === clipId 
          ? { ...prev.selectedClip, is_favorite: isFavorite }
          : prev.selectedClip,
      }
    })

    try {
      const response = await fetch(`/api/clips/${clipId}/favorite`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_favorite: isFavorite }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to toggle favorite: ${response.status} ${errorText}`)
      }

      const result = await response.json()
      console.log('✅ Favorite status updated successfully:', result)
    } catch (error) {
      console.error('❌ Failed to toggle favorite:', error)
      
      // Revert the optimistic update on error
      setState(prev => {
        console.log(`🔄 Reverting clip ${clipId} favorite status back to ${!isFavorite}`)
        return {
          ...prev,
          clips: prev.clips.map(clip => 
            clip.id === clipId 
              ? { ...clip, is_favorite: !isFavorite }
              : clip
          ),
          selectedClip: prev.selectedClip?.id === clipId 
            ? { ...prev.selectedClip, is_favorite: !isFavorite }
            : prev.selectedClip,
        }
      })
      
      // Show user-friendly error message
      alert('Failed to update favorite status. Please try again.')
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
    const matchesSearch = !state.searchQuery || (() => {
      const query = state.searchQuery.toLowerCase()
      const folder = state.folders.find(f => f.id === clip.folder_id)
      
      return (
        // Search in title
        clip.title.toLowerCase().includes(query) ||
        // Search in URL
        clip.url.toLowerCase().includes(query) ||
        // Search in text content
        clip.text_content?.toLowerCase().includes(query) ||
        // Search in HTML content
        clip.html_content?.toLowerCase().includes(query) ||
        // Search in folder name
        folder?.name.toLowerCase().includes(query)
      )
    })()
    
    const matchesFolder = !state.selectedFolder || clip.folder_id === state.selectedFolder
    
    // Tag filtering: check if clip has the selected tag
    const matchesTag = !state.selectedTag || (state.clipTags[clip.id] && state.clipTags[clip.id].includes(state.selectedTag))

    // Apply view filter
    let matchesViewFilter = true
    if (state.viewFilter === 'favorites') {
      // Show only favorited clips
      matchesViewFilter = clip.is_favorite === true
    } else if (state.viewFilter === 'recent') {
      // Show clips from the last 7 days
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      matchesViewFilter = new Date(clip.created_at) > sevenDaysAgo
    }
    // 'library' shows all clips (no additional filter)

    return matchesSearch && matchesFolder && matchesTag && matchesViewFilter
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

  // Don't hide the entire UI while loading - show skeleton instead

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50/80">
      {/* Header */}
      <header className="border-b border-white/20 bg-white/80 backdrop-blur-xl shadow-sm supports-[backdrop-filter]:bg-white/70">
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
              
              <nav className="hidden md:flex items-center space-x-4">
                <Button 
                  variant={state.viewFilter === 'library' ? 'default' : 'ghost'} 
                  size="sm"
                  onClick={() => setState(prev => ({ ...prev, viewFilter: 'library' }))}
                >
                  <Grid className="mr-2 h-4 w-4" />
                  Library
                </Button>
                <Button 
                  variant={state.viewFilter === 'favorites' ? 'default' : 'ghost'} 
                  size="sm"
                  onClick={() => setState(prev => ({ ...prev, viewFilter: 'favorites' }))}
                >
                  <Star className="mr-2 h-4 w-4" />
                  Favorites
                </Button>
                <Button 
                  variant={state.viewFilter === 'recent' ? 'default' : 'ghost'} 
                  size="sm"
                  onClick={() => setState(prev => ({ ...prev, viewFilter: 'recent' }))}
                >
                  <Clock className="mr-2 h-4 w-4" />
                  Recent
                </Button>
              </nav>
            </div>

            {/* User Profile */}
            <div className="flex items-center space-x-3">
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

      <div className="container mx-auto px-4 py-6 h-[calc(100vh-80px)]">
        <div className="flex flex-col lg:flex-row gap-6 h-full">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 space-y-6">

            {/* Quick Actions */}
            <Card className="border border-white/20 shadow-md bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-md">
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
                  onClick={() => setState(prev => ({ ...prev, isCreateFolderModalOpen: true }))}
                >
                  <FolderPlus className="mr-2 h-4 w-4" />
                  New Folder
                </Button>
                
                {/* Page Graphs - Pro Feature */}
                {!state.isSubscriptionLoading && state.subscriptionTier === 'pro' && (
                  <Button 
                    variant="outline"
                    size="sm"
                    className={`w-full justify-start border transition-all duration-200 group ${
                      state.viewFilter === 'knowledge-graphs' 
                        ? 'bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white hover:text-white border-purple-500 shadow-md' 
                        : 'border-purple-200 text-purple-600 hover:text-purple-700 bg-white hover:bg-purple-50'
                    }`}
                    onClick={() => setState(prev => ({ ...prev, viewFilter: 'knowledge-graphs' }))}
                  >
                    <Brain className="mr-2 h-4 w-4" />
                    <span className="flex-1 text-left">Page Graphs</span>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs font-semibold transition-all ${
                        state.viewFilter === 'knowledge-graphs' 
                          ? 'bg-white/20 text-white border-white/30' 
                          : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0'
                      }`}
                    >
                      PRO
                    </Badge>
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Folders */}
            <Card className="border border-white/20 shadow-md bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-md">
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
                    // Trigger preloading for all clips when returning to full view
                    setTimeout(() => {
                      if (state.clips.length > 0) {
                        preloadClipImages(state.clips.slice(0, 30), true).then(() => {
                          console.log(`All clips preload: ${Math.min(30, state.clips.length)} images`)
                        })
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
                        // Trigger preloading for folder-filtered clips
                        setTimeout(() => {
                          const folderClips = state.clips.filter(clip => clip.folder_id === folder.id)
                          if (folderClips.length > 0) {
                            preloadClipImages(folderClips.slice(0, 30), true).then(() => {
                              console.log(`Folder preload: ${Math.min(30, folderClips.length)} images for "${folder.name}"`)
                            })
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
              </CardContent>
            </Card>

            {/* Usage Stats - Only show when subscription data is loaded */}
            {!state.isSubscriptionLoading && (
              <Card>
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
                      <span>Clips this month</span>
                      <span className="font-medium">{state.clipsThisMonth}/{state.clipsLimit}</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${Math.min((state.clipsThisMonth / state.clipsLimit) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {state.clipsLimit - state.clipsThisMonth} clips remaining
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Subscription Loading State */}
            {state.isSubscriptionLoading && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Loading...</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Clips this month</span>
                      <div className="h-4 w-12 bg-secondary rounded animate-pulse"></div>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div className="bg-secondary h-2 rounded-full animate-pulse"></div>
                    </div>
                    <div className="h-3 w-24 bg-secondary rounded animate-pulse"></div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Upgrade Section - Only show for free users when subscription data is loaded */}
            {!state.isSubscriptionLoading && state.subscriptionTier === 'free' && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Upgrade to Pro</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-xs text-muted-foreground">
                    Get 1,000 clips/month + 5GB storage
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        const response = await fetch('/api/stripe/checkout', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            priceId: 'price_1SBSLeDFfW8f5SmSgQooVxsd',
                            plan: 'monthly'
                          }),
                        });
                        const { url } = await response.json();
                        if (url) window.location.href = url;
                      } catch (error) {
                        console.error('Upgrade error:', error);
                        alert('Upgrade failed. Check console.');
                      }
                    }}
                    className="w-full bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600 transition-colors"
                  >
                    Upgrade Monthly ($4)
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        const response = await fetch('/api/stripe/checkout', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            priceId: 'price_1SBSNpDFfW8f5SmShv3v8v8Q',
                            plan: 'annual'
                          }),
                        });
                        const { url } = await response.json();
                        if (url) window.location.href = url;
                      } catch (error) {
                        console.error('Upgrade error:', error);
                        alert('Upgrade failed. Check console.');
                      }
                    }}
                    className="w-full bg-green-500 text-white px-3 py-2 rounded text-sm hover:bg-green-600 transition-colors"
                  >
                    Upgrade Annual ($40)
                  </button>
                </CardContent>
              </Card>
            )}
          </aside>

          {/* Main Content */}
          <main className="flex-1 flex flex-col space-y-6 min-w-0 h-full overflow-hidden">
            {/* Search and Filters - Clean Simple Layout */}
            {state.viewFilter !== 'knowledge-graphs' && (
            <div className="flex items-center gap-3 w-full px-1 py-3">
              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                className="h-11 px-3 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 focus:outline-none transition-all duration-200 rounded-xl flex items-center justify-center"
                title="Refresh and clear image cache"
              >
                <RefreshCw className="h-4 w-4 text-gray-600" />
              </button>

              {/* Main Search Bar */}
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search titles, content, URLs, folders..."
                  value={state.searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className={`pl-10 pr-3 h-11 w-full bg-white border border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-0 transition-all duration-200 rounded-xl ${state.searchQuery ? 'pr-10' : ''}`}
                />
                {state.searchQuery && (
                  <button
                    onClick={() => handleSearch('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Simple Tag Filter */}
              <select
                value={state.selectedTag || 'all-tags'}
                onChange={(e) => handleTagFilterChange(e.target.value)}
                className="h-11 px-3 bg-white border border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-0 transition-all duration-200 rounded-xl text-sm min-w-[100px]"
              >
                <option value="all-tags">All Tags</option>
                {state.availableTags.map((tag) => (
                  <option key={tag.id} value={tag.id}>
                    {tag.name}
                  </option>
                ))}
              </select>
              
              {/* Simple Sort */}
              <select
                value={state.sortBy}
                onChange={(e) => setState(prev => ({ ...prev, sortBy: e.target.value as any }))}
                className="h-11 px-3 bg-white border border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-0 transition-all duration-200 rounded-xl text-sm min-w-[120px]"
              >
                <option value="created_at">Date Created</option>
                <option value="updated_at">Last Modified</option>
                <option value="title">Title</option>
              </select>
                
              <button
                onClick={() => setState(prev => ({ 
                  ...prev, 
                  sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' 
                }))}
                className="h-11 px-3 bg-white border border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-0 transition-all duration-200 rounded-xl text-sm"
                title={`Sort ${state.sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
              >
                {state.sortOrder === 'asc' ? '↑' : '↓'}
              </button>

              {/* View Mode Toggle */}
              <div className="flex border border-gray-200 rounded-xl overflow-hidden bg-white">
                <button
                  onClick={() => setState(prev => ({ ...prev, viewMode: 'grid' }))}
                  className={`h-11 px-3 transition-all duration-200 ${
                    state.viewMode === 'grid' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setState(prev => ({ ...prev, viewMode: 'list' }))}
                  className={`h-11 px-3 transition-all duration-200 ${
                    state.viewMode === 'list' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
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
              <div className="flex-1 overflow-hidden">
              {isInitialLoading ? (
                /* Fast Loading Skeleton */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl p-4 animate-pulse border border-gray-100">
                      <div className="aspect-video bg-gray-100 rounded-lg mb-3"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : sortedClips.length === 0 ? (
                <Card className="p-12">
                  <div className="text-center space-y-4">
                    <div className="flex justify-center opacity-20">
                      <LogoIcon size={96} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">
                        {state.viewFilter === 'favorites' ? 'No favorites found' :
                         state.viewFilter === 'recent' ? 'No recent clips found' :
                         'No clips yet'}
                      </h3>
                      <p className="text-muted-foreground">
                        {state.viewFilter === 'favorites' ? 'Star clips to add them to your favorites' :
                         state.viewFilter === 'recent' ? 'Clips from the last 7 days will appear here' :
                         'Install the PageStash extension to start capturing web content'}
                      </p>
                    </div>
                    {state.viewFilter === 'library' && (
                      <Button onClick={() => router.push('/')}>
                        <Plus className="mr-2 h-4 w-4" />
                        Install Extension
                      </Button>
                    )}
                  </div>
                </Card>
              ) : (
                <div className="h-full overflow-y-auto pr-2 -mr-2">
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
                        onClick={() => handleClipClick(clip)}
                        onUpdate={handleClipUpdate}
                        onDelete={handleClipDelete}
                        onToggleFavorite={handleToggleFavorite}
                        priority={index < 20} // Prioritize first 20 images in current view (filtered or unfiltered)
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
                        {state.isLoadingMore ? (
                          <div className="flex items-center space-x-2 text-muted-foreground">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                            <span>Loading more clips...</span>
                          </div>
                        ) : (
                          <div className="text-muted-foreground text-sm">
                            Scroll to load more clips
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
  onToggleFavorite: (clipId: string, isFavorite: boolean) => Promise<void>
  priority?: boolean
}

function ClipCard({ clip, viewMode, folders, onClick, onUpdate, onDelete, onToggleFavorite, priority = false }: ClipCardProps) {
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
      <Card className={`p-3 hover:shadow-lg hover:shadow-black/5 transition-all duration-300 cursor-pointer shadow-md backdrop-blur-md ${
        clip.is_favorite 
          ? 'border-l-4 border-l-yellow-400 bg-gradient-to-r from-yellow-50/40 to-white/60 border-t border-r border-b border-white/20' 
          : 'border border-white/20 bg-gradient-to-r from-white/80 to-white/60'
      }`} onClick={onClick}>
        <div className="flex items-center space-x-3">
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

  return (
    <Card className="overflow-hidden hover:shadow-xl hover:shadow-black/10 hover:scale-[1.02] transition-all duration-300 group cursor-pointer border border-white/20 shadow-lg bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-md" onClick={onClick}>
      {clip.screenshot_url && (
        <div className="aspect-[4/3] bg-muted/30 relative overflow-hidden">
          <CachedImage
            src={clip.screenshot_url}
            alt={clip.title}
            width={400}
            height={300}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, (max-width: 1536px) 25vw, 16vw"
            className="w-full h-full object-top object-cover group-hover:scale-105 transition-transform duration-300"
            quality={85}
            priority={priority}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        </div>
      )}
      
      <CardContent className="p-3">
        <div className="space-y-1.5">
          <h3 className="font-medium text-sm line-clamp-2 leading-tight text-foreground/90">{clip.title}</h3>
          
          <div className="flex items-center text-xs text-muted-foreground/80">
            <Globe className="h-3 w-3 mr-1.5 flex-shrink-0" />
            <span className="truncate">{new URL(clip.url).hostname}</span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1 flex-wrap text-xs text-muted-foreground/70 font-medium">
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
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-primary/10"
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
