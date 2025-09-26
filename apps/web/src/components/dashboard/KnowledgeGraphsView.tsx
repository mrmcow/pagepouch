'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
import { Folder } from '@pagepouch/shared'

interface KnowledgeGraph {
  id: string
  title: string
  description?: string
  folders: string[] // folder IDs
  nodeCount: number
  connectionCount: number
  createdAt: string
  updatedAt: string
  thumbnail?: string
  isPublic: boolean
}

interface KnowledgeGraphsViewProps {
  folders: Folder[]
  subscriptionTier: 'free' | 'pro'
}

export function KnowledgeGraphsView({ folders, subscriptionTier }: KnowledgeGraphsViewProps) {
  const [graphs, setGraphs] = useState<KnowledgeGraph[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Mock data for now - will be replaced with real API calls
  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setGraphs([
        // Empty for now to show first-time experience
      ])
      setIsLoading(false)
    }, 500)
  }, [])

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
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header with Search and Actions */}
      <div className="flex items-center justify-between gap-4 p-6 pb-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search knowledge graphs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-3 h-10 w-full bg-white border border-gray-200 hover:border-gray-300 focus:border-purple-500 focus:outline-none focus:ring-0 transition-all duration-200 rounded-lg"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
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
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-6">
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
          />
        )}
      </div>

      {/* Create Graph Modal would go here */}
      {showCreateModal && (
        <CreateGraphModal
          folders={folders}
          onClose={() => setShowCreateModal(false)}
          onCreateGraph={(graphData) => {
            // Handle graph creation
            console.log('Creating graph:', graphData)
            setShowCreateModal(false)
          }}
        />
      )}
    </div>
  )
}

function FirstTimeExperience({ onCreateGraph, folders }: { onCreateGraph: () => void, folders: Folder[] }) {
  return (
    <div className="flex items-center justify-center min-h-[600px]">
      <Card className="max-w-2xl mx-auto border-2 border-dashed border-purple-200 bg-gradient-to-br from-purple-50/50 to-blue-50/50">
        <CardContent className="p-12 text-center">
          {/* Hero Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center">
                <Brain className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-yellow-800" />
              </div>
            </div>
          </div>

          {/* Title and Description */}
          <div className="space-y-4 mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Create Your First Knowledge Graph
            </h2>
            <p className="text-lg text-gray-600 max-w-lg mx-auto leading-relaxed">
              Transform your research into interactive visual maps that reveal hidden connections between your captured content.
            </p>
          </div>

          {/* Features Preview */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto">
                <Network className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Smart Connections</h3>
              <p className="text-sm text-gray-600">AI discovers relationships between entities, topics, and concepts</p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto">
                <Eye className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Visual Exploration</h3>
              <p className="text-sm text-gray-600">Navigate through your research like a Miro board with zoom and pan</p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto">
                <Share2 className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Professional Export</h3>
              <p className="text-sm text-gray-600">Export beautiful graphs for presentations and reports</p>
            </div>
          </div>

          {/* CTA */}
          <div className="space-y-4">
            <Button 
              onClick={onCreateGraph}
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white border-0 px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="mr-2 h-5 w-5" />
              Create Your First Graph
            </Button>
            
            {folders.length > 0 && (
              <p className="text-sm text-gray-500">
                Choose from your {folders.length} folder{folders.length !== 1 ? 's' : ''} to get started
              </p>
            )}
          </div>

          {/* Getting Started Tips */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                <span>Select folders</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span>AI analyzes content</span>
              </div>
              <div className="flex items-center gap-2">
                <Network className="w-4 h-4" />
                <span>Explore connections</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function GraphsGrid({ graphs, viewMode, folders }: { 
  graphs: KnowledgeGraph[], 
  viewMode: 'grid' | 'list',
  folders: Folder[]
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
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{graph.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{graph.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>{graph.nodeCount} nodes</span>
                      <span>{graph.connectionCount} connections</span>
                      <span>Folders: {getFolderNames(graph.folders)}</span>
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
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        Open Graph
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit3 className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="mr-2 h-4 w-4" />
                        Export
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
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
        <Card key={graph.id} className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
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
                  <DropdownMenuItem>
                    <Eye className="mr-2 h-4 w-4" />
                    Open Graph
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Edit3 className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            {/* Graph Thumbnail/Preview */}
            <div className="aspect-video bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg mb-4 flex items-center justify-center border border-purple-100">
              <div className="text-center">
                <Brain className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <p className="text-xs text-purple-600 font-medium">Interactive Graph</p>
              </div>
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

            {/* Folders */}
            <div className="text-xs text-gray-500">
              <span className="font-medium">Folders:</span> {getFolderNames(graph.folders)}
            </div>

            {/* Updated Date */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(graph.updatedAt).toLocaleDateString()}
              </span>
              <Button size="sm" variant="ghost" className="text-purple-600 hover:text-purple-700 hover:bg-purple-50">
                <Eye className="w-4 h-4 mr-1" />
                Open
              </Button>
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold">Create Knowledge Graph</CardTitle>
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
