'use client'

import { useState, useEffect, Fragment } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Brain, 
  Plus, 
  Search, 
  Filter, 
  Grid, 
  List, 
  MoreHorizontal,
  Share2,
  Download,
  Trash2,
  Edit3,
  Eye,
  Calendar,
  Users,
  Zap,
  Sparkles,
  Network,
  FileText,
  Target
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { Folder } from '@pagepouch/shared'
import { EnhancedKnowledgeGraphViewer } from './EnhancedKnowledgeGraphViewer'
import { generateFallbackPreview } from '@/utils/graphPreviewGenerator'

// Utility function for safe date formatting
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'No date'
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'Invalid date'
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch (error) {
    return 'Invalid date'
  }
}

// Utility function for relative time
const formatRelativeTime = (dateString: string | null | undefined): string => {
  if (!dateString) return 'Unknown'
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'Invalid date'
    
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInHours = diffInMs / (1000 * 60 * 60)
    const diffInDays = diffInHours / 24
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`
    if (diffInDays < 7) return `${Math.floor(diffInDays)}d ago`
    
    return formatDate(dateString)
  } catch (error) {
    return 'Invalid date'
  }
}

interface KnowledgeGraph {
  id: string
  title: string
  description?: string
  folder_ids: string[] // folder IDs
  nodeCount: number
  connectionCount: number
  createdAt: string
  updatedAt: string
  status: 'processing' | 'completed' | 'failed'
  thumbnail?: string
  preview_image?: string // Base64 preview image
  isPublic?: boolean
}

interface KnowledgeGraphsViewProps {
  folders: Folder[]
  subscriptionTier: 'free' | 'pro'
  clips: any[] // Add clips prop
  onNavigateToFolder?: (folderId: string | null) => void
}

export function KnowledgeGraphsView({ folders, subscriptionTier, clips, onNavigateToFolder }: KnowledgeGraphsViewProps) {
  const [graphs, setGraphs] = useState<KnowledgeGraph[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedGraphId, setSelectedGraphId] = useState<string | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingGraph, setEditingGraph] = useState<any>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deletingGraph, setDeletingGraph] = useState<any>(null)

  // Load graphs from API
  useEffect(() => {
    loadGraphs()
  }, [])

  const loadGraphs = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/knowledge-graphs')
      if (response.ok) {
        const data = await response.json()
        // Map database fields to component expected fields
        const mappedGraphs = data.map((graph: any) => ({
          ...graph,
          createdAt: graph.created_at,
          updatedAt: graph.updated_at,
          nodeCount: graph.node_count || 0,
          connectionCount: graph.connection_count || 0,
          folder_ids: graph.folder_ids || []
        }))
        setGraphs(mappedGraphs)
      } else {
        console.error('Failed to load knowledge graphs')
      }
    } catch (error) {
      console.error('Error loading knowledge graphs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const createGraph = async (graphData: { title: string; description: string; folders: string[] }) => {
    try {
      const response = await fetch('/api/knowledge-graphs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(graphData),
      })

      if (response.ok) {
        const rawGraph = await response.json()
        // Map database fields to component expected fields
        const newGraph = {
          ...rawGraph,
          createdAt: rawGraph.created_at,
          updatedAt: rawGraph.updated_at,
          nodeCount: rawGraph.node_count || 0,
          connectionCount: rawGraph.connection_count || 0,
          folder_ids: rawGraph.folder_ids || []
        }
        setGraphs(prev => [newGraph, ...prev])
        
        // Poll for updates to show processing status
        pollGraphStatus(newGraph.id)
      } else {
        console.error('Failed to create knowledge graph')
      }
    } catch (error) {
      console.error('Error creating knowledge graph:', error)
    }
  }

  const onEditGraph = (graph: any) => {
    setEditingGraph(graph)
    setIsEditModalOpen(true)
  }

  const onDeleteGraph = (graph: any) => {
    setDeletingGraph(graph)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingGraph) return
    
    try {
      const response = await fetch(`/api/knowledge-graphs/${deletingGraph.id}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        // Remove from local state
        setGraphs(prev => prev.filter(g => g.id !== deletingGraph.id))
        setIsDeleteDialogOpen(false)
        setDeletingGraph(null)
      } else {
        console.error('Failed to delete graph')
      }
    } catch (error) {
      console.error('Error deleting graph:', error)
    }
  }

  const handleEditSubmit = async (updatedData: { title: string; description: string; folder_ids: string[] }) => {
    if (!editingGraph) return
    
    try {
      const response = await fetch(`/api/knowledge-graphs/${editingGraph.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      })
      
      if (response.ok) {
        const updatedGraph = await response.json()
        // Update local state
        setGraphs(prev => prev.map(g => g.id === editingGraph.id ? updatedGraph : g))
        setIsEditModalOpen(false)
        setEditingGraph(null)
      } else {
        console.error('Failed to update graph')
      }
    } catch (error) {
      console.error('Error updating graph:', error)
    }
  }

  const pollGraphStatus = (graphId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch('/api/knowledge-graphs')
        if (response.ok) {
          const data = await response.json()
          const updatedGraph = data.find((g: any) => g.id === graphId)
          
          if (updatedGraph && updatedGraph.status === 'completed') {
            setGraphs(prev => prev.map(g => g.id === graphId ? {
              ...g,
              status: updatedGraph.status,
              nodeCount: updatedGraph.node_count,
              connectionCount: updatedGraph.connection_count,
              updatedAt: updatedGraph.updated_at,
              preview_image: updatedGraph.preview_image // Include preview image in updates
            } : g))
            clearInterval(pollInterval)
          }
        }
      } catch (error) {
        console.error('Error polling graph status:', error)
        clearInterval(pollInterval)
      }
    }, 2000) // Poll every 2 seconds

    // Stop polling after 30 seconds
    setTimeout(() => clearInterval(pollInterval), 30000)
  }

  const filteredGraphs = graphs.filter(graph =>
    graph.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    graph.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="flex-1 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gray-200 rounded mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col space-y-6 overflow-hidden">
      {/* Header with Search and Actions - Aligned with main content */}
      <div className="flex items-center gap-3 w-full px-1 py-3">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search page graphs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-3 h-11 w-full bg-white border border-gray-200 hover:border-gray-300 focus:border-purple-500 focus:outline-none focus:ring-0 transition-all duration-200 rounded-xl"
          />
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded transition-colors ${
              viewMode === 'grid' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded transition-colors ${
              viewMode === 'list' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>

        {/* Create New Graph Button */}
        <Button 
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white border-0"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Graph
        </Button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto px-1">
          {filteredGraphs.length === 0 ? (
            <FirstTimeExperience 
              onCreateGraph={() => setShowCreateModal(true)}
              folders={folders}
            />
          ) : (
            <GraphsGrid 
              graphs={filteredGraphs}
              viewMode={viewMode}
              folders={folders}
              onOpenGraph={setSelectedGraphId}
              onEditGraph={onEditGraph}
              onDeleteGraph={onDeleteGraph}
            />
          )}
        </div>
      </div>

      {/* Create Graph Modal */}
      {showCreateModal && (
          <CreateGraphModal
            folders={folders}
            onClose={() => setShowCreateModal(false)}
            onCreateGraph={(graphData) => {
              createGraph(graphData)
              setShowCreateModal(false)
            }}
          />
      )}

      {/* Knowledge Graph Viewer */}
      {selectedGraphId && (
        <EnhancedKnowledgeGraphViewer
          isOpen={!!selectedGraphId}
          onClose={() => setSelectedGraphId(null)}
          graphId={selectedGraphId}
          graphTitle={graphs.find(g => g.id === selectedGraphId)?.title || 'Page Graph'}
          graphDescription={graphs.find(g => g.id === selectedGraphId)?.description}
          graphFolderIds={graphs.find(g => g.id === selectedGraphId)?.folder_ids || []}
          clips={clips}
          folders={folders}
          onPreviewGenerated={(previewImage) => {
            // Update just this graph's preview without refreshing the whole list
            setGraphs(prev => prev.map(g => 
              g.id === selectedGraphId 
                ? { ...g, preview_image: previewImage }
                : g
            ))
          }}
          onNavigateToFolder={(folderId) => {
            // Close the knowledge graph and navigate to folder
            setSelectedGraphId(null)
            if (onNavigateToFolder) {
              onNavigateToFolder(folderId)
            }
          }}
        />
      )}

      {/* Edit Graph Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Page Graph</DialogTitle>
            <DialogDescription>
              Update the title, description, and folder selection for your page graph.
            </DialogDescription>
          </DialogHeader>
          {editingGraph && (
            <EditGraphForm
              graph={editingGraph}
              folders={folders}
              onSubmit={handleEditSubmit}
              onCancel={() => setIsEditModalOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Page Graph</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingGraph?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function FirstTimeExperience({ onCreateGraph, folders }: { onCreateGraph: () => void, folders: Folder[] }) {
  return (
    <div className="h-full flex flex-col">
      {/* Compact Professional Header */}
      <div className="py-8 bg-gradient-to-br from-slate-50 via-white to-slate-50 border-b border-slate-200">
        <div className="px-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">
            Visualize Your Research
          </h1>
          <p className="text-base text-slate-600">
            Transform scattered information into connected insights.
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex min-h-0">
        {/* Left Panel - Features */}
        <div className="w-72 bg-white border-r border-slate-200 p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-semibold text-slate-900 mb-4">Capabilities</h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Network className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 text-sm mb-1">Auto-connect concepts</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">AI identifies relationships between entities and themes</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Eye className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 text-sm mb-1">Interactive exploration</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">Navigate with smooth zoom, pan, and click-to-explore</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 text-sm mb-1">Export & share</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">Generate publication-ready visuals for reports</p>
                  </div>
                </div>
              </div>
            </div>

            {folders.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-3">Available folders ({folders.length})</h3>
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {folders.slice(0, 5).map((folder) => (
                    <div key={folder.id} className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 transition-colors">
                      <div 
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: folder.color || '#64748b' }}
                      />
                      <span className="text-xs text-slate-700 truncate">{folder.name}</span>
                    </div>
                  ))}
                  {folders.length > 5 && (
                    <p className="text-xs text-slate-500 px-1.5">+{folders.length - 5} more</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center Panel - Visual Preview */}
        <div className="flex-1 bg-slate-50 relative overflow-hidden">
          {/* Subtle Grid Background */}
          <div className="absolute inset-0 opacity-20">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
                  <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#e2e8f0" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Mock Graph Visualization */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-80 h-52">
              {/* Sample Nodes */}
              <div className="absolute top-6 left-8 w-12 h-12 bg-white rounded-lg shadow-lg border border-slate-200 flex items-center justify-center">
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              
              <div className="absolute top-2 right-12 w-16 h-8 bg-white rounded-md shadow-md border border-slate-200 flex items-center justify-center">
                <span className="text-xs font-medium text-slate-700">Research</span>
              </div>
              
              <div className="absolute bottom-8 left-6 w-10 h-10 bg-white rounded-full shadow-lg border border-slate-200 flex items-center justify-center">
                <Users className="w-4 h-4 text-purple-600" />
              </div>
              
              <div className="absolute bottom-6 right-8 w-14 h-7 bg-white rounded-md shadow-md border border-slate-200 flex items-center justify-center">
                <span className="text-xs font-medium text-slate-700">Analysis</span>
              </div>
              
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-slate-600 to-slate-800 rounded-lg shadow-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>

              {/* Connection Lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <defs>
                  <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#64748b" stopOpacity="0.4"/>
                    <stop offset="100%" stopColor="#475569" stopOpacity="0.7"/>
                  </linearGradient>
                </defs>
                <path d="M 68 48 Q 140 60 160 90" stroke="url(#connectionGradient)" strokeWidth="2" fill="none" strokeDasharray="4,4" className="animate-pulse"/>
                <path d="M 128 128 Q 100 100 68 80" stroke="url(#connectionGradient)" strokeWidth="2" fill="none" strokeDasharray="4,4" className="animate-pulse"/>
                <path d="M 160 90 Q 180 140 148 156" stroke="url(#connectionGradient)" strokeWidth="2" fill="none" strokeDasharray="4,4" className="animate-pulse"/>
              </svg>
            </div>
          </div>

          {/* Floating Action */}
          <div className="absolute bottom-6 right-6">
            <Button 
              onClick={onCreateGraph}
              className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-lg px-6 py-2.5 text-sm font-medium"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Graph
            </Button>
          </div>

          {/* Subtle Overlay Text */}
          <div className="absolute top-6 left-6">
            <div className="bg-white/90 backdrop-blur-sm rounded-md px-3 py-1.5 shadow-sm border border-slate-200">
              <p className="text-xs text-slate-600">Interactive preview</p>
            </div>
          </div>
        </div>

        {/* Right Panel - Process */}
        <div className="w-64 bg-white border-l border-slate-200 p-6">
          <div>
            <h3 className="text-base font-semibold text-slate-900 mb-4">Process</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium text-slate-600">
                  1
                </div>
                <div>
                  <h4 className="font-medium text-slate-900 text-sm mb-1">Select folders</h4>
                  <p className="text-xs text-slate-600">Choose content to analyze</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium text-slate-600">
                  2
                </div>
                <div>
                  <h4 className="font-medium text-slate-900 text-sm mb-1">AI processing</h4>
                  <p className="text-xs text-slate-600">Extract entities & relationships</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium text-slate-600">
                  3
                </div>
                <div>
                  <h4 className="font-medium text-slate-900 text-sm mb-1">Explore & refine</h4>
                  <p className="text-xs text-slate-600">Navigate your knowledge map</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200">
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span className="text-xs font-medium text-slate-900">Best practice</span>
                </div>
                <p className="text-xs text-slate-600">Start with 2-3 related folders for optimal results</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function GraphsGrid({ graphs, viewMode, folders, onOpenGraph, onEditGraph, onDeleteGraph }: { 
  graphs: KnowledgeGraph[], 
  viewMode: 'grid' | 'list',
  folders: Folder[],
  onOpenGraph: (graphId: string) => void
  onEditGraph: (graph: any) => void
  onDeleteGraph: (graph: any) => void
}) {
  const getFolderNames = (folderIds: string[]) => {
    return folderIds
      .map(id => folders.find(f => f.id === id)?.name)
      .filter(Boolean)
      .join(', ')
  }

  if (viewMode === 'list') {
    return (
      <div className="space-y-3">
        {graphs.map((graph) => (
          <Card key={graph.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div 
                    className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center relative cursor-pointer hover:from-purple-600 hover:to-blue-700 transition-all duration-200"
                    onClick={() => onOpenGraph(graph.id)}
                  >
                    {graph.status === 'processing' ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    ) : (
                      <Brain className="w-6 h-6 text-white" />
                    )}
                    {graph.status === 'completed' && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{graph.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{graph.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>{graph.nodeCount} nodes</span>
                      <span>{graph.connectionCount} connections</span>
                      <span>Folders: {getFolderNames(graph.folder_ids)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {graph.isPublic && (
                    <Badge variant="secondary" className="text-xs">
                      <Share2 className="w-3 h-3 mr-1" />
                      Public
                    </Badge>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onOpenGraph(graph.id)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Open Graph
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEditGraph(graph)}>
                        <Edit3 className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="mr-2 h-4 w-4" />
                        Export
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600" onClick={() => onDeleteGraph(graph)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {graphs.map((graph) => (
        <Card key={graph.id} className="hover:shadow-lg transition-all duration-200 cursor-pointer group flex flex-col h-full">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                  {graph.title}
                </CardTitle>
                <CardDescription className="mt-1 text-sm text-gray-600">
                  {graph.description}
                </CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onOpenGraph(graph.id)}>
                    <Eye className="mr-2 h-4 w-4" />
                    Open Graph
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEditGraph(graph)}>
                    <Edit3 className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600" onClick={() => onDeleteGraph(graph)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col h-full">
            {/* Graph Thumbnail/Preview */}
            <div 
              className="aspect-video rounded-lg mb-4 relative cursor-pointer overflow-hidden border border-purple-100 hover:border-purple-200 transition-all duration-200 group"
              onClick={() => onOpenGraph(graph.id)}
            >
              {graph.preview_image ? (
                // Show actual graph preview
                <div className="relative w-full h-full">
                  <img 
                    src={graph.preview_image} 
                    alt={`Preview of ${graph.title}`}
                    className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                  />
                  {/* Overlay gradient for better text visibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  {/* Status indicator */}
                  {graph.status === 'completed' && (
                    <div className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full shadow-sm"></div>
                  )}
                  {/* Hover overlay with stats */}
                  <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="bg-white/90 backdrop-blur-sm rounded px-2 py-1 text-xs text-gray-700">
                      {graph.nodeCount} nodes • {graph.connectionCount} connections
                    </div>
                  </div>
                </div>
              ) : (
                // Fallback for graphs without previews
                <div className="w-full h-full bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center relative group-hover:from-purple-100 group-hover:to-blue-100 transition-all duration-200">
                  <div className="text-center">
                    {graph.status === 'processing' ? (
                      <>
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-2"></div>
                        <p className="text-xs text-purple-600 font-medium">Processing...</p>
                      </>
                    ) : graph.status === 'failed' ? (
                      <>
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <span className="text-red-600 text-xs">!</span>
                        </div>
                        <p className="text-xs text-red-600 font-medium">Failed</p>
                      </>
                    ) : (
                      <>
                        <Brain className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                        <p className="text-xs text-purple-600 font-medium">Interactive Graph</p>
                      </>
                    )}
                  </div>
                  {graph.status === 'completed' && (
                    <div className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full"></div>
                  )}
                </div>
              )}
            </div>

            {/* Graph Stats */}
            <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  {graph.nodeCount} nodes
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  {graph.connectionCount} links
                </span>
              </div>
              {graph.isPublic && (
                <Badge variant="secondary" className="text-xs">
                  <Share2 className="w-3 h-3 mr-1" />
                  Public
                </Badge>
              )}
            </div>

            {/* Folders - with better overflow handling */}
            <div className="text-xs text-gray-500 mb-3">
              <span className="font-medium">Folders:</span>{' '}
              <span className="line-clamp-2">{getFolderNames(graph.folder_ids)}</span>
            </div>

            {/* Spacer to push footer to bottom */}
            <div className="flex-1"></div>

            {/* Footer with dates and action - anchored to bottom */}
            <div className="mt-auto pt-3 border-t border-gray-100 space-y-2">
              {/* Dates */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Created: {formatDate(graph.createdAt)}
                </span>
                <span className="flex items-center gap-1">
                  Updated: {formatRelativeTime(graph.updatedAt)}
                </span>
              </div>
              
              {/* Action button */}
              <div className="flex justify-end">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                  onClick={() => onOpenGraph(graph.id)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Open
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function CreateGraphModal({ folders, onClose, onCreateGraph }: {
  folders: Folder[]
  onClose: () => void
  onCreateGraph: (data: any) => void
}) {
  const [selectedFolders, setSelectedFolders] = useState<string[]>([])
  const [graphTitle, setGraphTitle] = useState('')
  const [graphDescription, setGraphDescription] = useState('')
  
  // Modal initialized with folders

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold">Create Page Graph</CardTitle>
              <CardDescription className="mt-1">
                Select folders to analyze and create connections between your content
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Graph Details */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Graph Title
              </label>
              <input
                type="text"
                value={graphTitle}
                onChange={(e) => setGraphTitle(e.target.value)}
                placeholder="e.g., Research Project Alpha"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={graphDescription}
                onChange={(e) => setGraphDescription(e.target.value)}
                placeholder="Brief description of what this graph represents..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Folder Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Folders to Include
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
              {folders.map((folder) => (
                <label
                  key={folder.id}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                    selectedFolders.includes(folder.id)
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedFolders.includes(folder.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedFolders([...selectedFolders, folder.id])
                      } else {
                        setSelectedFolders(selectedFolders.filter(id => id !== folder.id))
                      }
                    }}
                    className="mr-3 text-purple-600 focus:ring-purple-500"
                  />
                  <div className="flex items-center gap-2 flex-1">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: folder.color || '#6B7280' }}
                    />
                    <span className="font-medium text-gray-900">{folder.name}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              {selectedFolders.length} folder{selectedFolders.length !== 1 ? 's' : ''} selected
            </p>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={() => onCreateGraph({
                  title: graphTitle,
                  description: graphDescription,
                  folders: selectedFolders
                })}
                disabled={!graphTitle.trim() || selectedFolders.length === 0}
                className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white border-0"
              >
                <Brain className="mr-2 h-4 w-4" />
                Create Graph
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function EditGraphForm({ 
  graph, 
  folders, 
  onSubmit, 
  onCancel 
}: { 
  graph: any
  folders: Folder[]
  onSubmit: (data: { title: string; description: string; folder_ids: string[] }) => void
  onCancel: () => void
}) {
  const [title, setTitle] = useState(graph.title || '')
  const [description, setDescription] = useState(graph.description || '')
  const [selectedFolders, setSelectedFolders] = useState<string[]>(graph.folder_ids || [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      folder_ids: selectedFolders
    })
  }

  const toggleFolder = (folderId: string) => {
    setSelectedFolders(prev => 
      prev.includes(folderId) 
        ? prev.filter(id => id !== folderId)
        : [...prev, folderId]
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter graph title"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter graph description (optional)"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>Folders</Label>
        <div className="max-h-32 overflow-y-auto border rounded-md p-2 space-y-1">
          {folders.map(folder => (
            <div key={folder.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`folder-${folder.id}`}
                checked={selectedFolders.includes(folder.id)}
                onChange={() => toggleFolder(folder.id)}
                className="rounded border-gray-300"
              />
              <Label
                htmlFor={`folder-${folder.id}`}
                className="text-sm font-normal cursor-pointer flex-1"
              >
                {folder.name}
              </Label>
            </div>
          ))}
        </div>
        {selectedFolders.length === 0 && (
          <p className="text-sm text-red-600">Please select at least one folder.</p>
        )}
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!title.trim() || selectedFolders.length === 0}>
          Save Changes
        </Button>
      </DialogFooter>
    </form>
  )
}
