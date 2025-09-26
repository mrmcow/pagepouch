'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Download, 
  Share2, 
  Search,
  Filter,
  Maximize2,
  Settings,
  Brain,
  Network,
  Eye,
  EyeOff,
  ExternalLink,
  FileText,
  Calendar,
  Link
} from 'lucide-react'
import { Input } from '@/components/ui/input'

// Enhanced data structure with rich evidence
interface GraphNode {
  id: string
  label: string
  type: 'person' | 'organization' | 'domain' | 'email' | 'tag' | 'clip'
  size: number
  color: string
  x?: number
  y?: number
  evidence: Array<{
    clipId: string
    clipTitle: string
    snippet: string
    url?: string
    timestamp: string
    folderName: string
    context: string
  }>
}

interface GraphEdge {
  id: string
  source: string
  target: string
  type: 'mentions' | 'links_to' | 'affiliated_with' | 'appears_with'
  weight: number
  color: string
}

interface KnowledgeGraphViewerProps {
  isOpen: boolean
  onClose: () => void
  graphId: string
  graphTitle: string
  graphDescription?: string
}

// Color scheme for different node types
const NODE_COLORS = {
  person: '#F59E0B',      // Orange
  organization: '#10B981', // Green
  domain: '#3B82F6',      // Blue
  email: '#14B8A6',       // Teal
  tag: '#64748B',         // Slate
  clip: '#8B5CF6'         // Purple
}

// Generate mock graph data with rich evidence - will be replaced with API call
function generateMockGraphData(): { nodes: GraphNode[], edges: GraphEdge[] } {
  const nodes: GraphNode[] = [
    { 
      id: 'trump', 
      label: 'Donald Trump', 
      type: 'person', 
      size: 20, 
      color: NODE_COLORS.person, 
      evidence: [
        {
          clipId: 'clip1',
          clipTitle: 'Trump Rally Speech',
          snippet: 'Former President Donald Trump announced his campaign plans...',
          url: 'https://example.com/trump-rally',
          timestamp: '2024-09-25T10:30:00Z',
          folderName: 'Trump',
          context: 'Political announcement during campaign rally'
        },
        {
          clipId: 'clip2',
          clipTitle: 'Truth Social Post',
          snippet: 'Trump posted on Truth Social about upcoming events...',
          url: 'https://truthsocial.com/post/123',
          timestamp: '2024-09-24T15:45:00Z',
          folderName: 'Trump',
          context: 'Social media activity'
        }
      ]
    },
    { 
      id: 'truth-social', 
      label: 'Truth Social', 
      type: 'domain', 
      size: 15, 
      color: NODE_COLORS.domain, 
      evidence: [
        {
          clipId: 'clip3',
          clipTitle: 'Platform Analysis',
          snippet: 'Truth Social platform shows increased engagement...',
          url: 'https://truthsocial.com',
          timestamp: '2024-09-23T09:15:00Z',
          folderName: 'Trump',
          context: 'Platform metrics and analysis'
        }
      ]
    },
    { 
      id: 'twitter', 
      label: 'Twitter/X', 
      type: 'domain', 
      size: 18, 
      color: NODE_COLORS.domain, 
      evidence: [
        {
          clipId: 'clip4',
          clipTitle: 'X Platform Changes',
          snippet: 'Elon Musk announced new features for X platform...',
          url: 'https://x.com/elonmusk/status/123',
          timestamp: '2024-09-22T14:20:00Z',
          folderName: 'Trump',
          context: 'Social media platform updates'
        }
      ]
    },
    { 
      id: 'maga', 
      label: '#MAGA', 
      type: 'tag', 
      size: 12, 
      color: NODE_COLORS.tag, 
      evidence: [
        {
          clipId: 'clip5',
          clipTitle: 'Campaign Hashtag Usage',
          snippet: 'The #MAGA hashtag trending across social platforms...',
          url: 'https://example.com/hashtag-analysis',
          timestamp: '2024-09-21T11:30:00Z',
          folderName: 'Trump',
          context: 'Social media trend analysis'
        }
      ]
    },
    { 
      id: 'gop', 
      label: 'Republican Party', 
      type: 'organization', 
      size: 16, 
      color: NODE_COLORS.organization, 
      evidence: [
        {
          clipId: 'clip6',
          clipTitle: 'GOP Strategy Meeting',
          snippet: 'Republican Party leaders discussed campaign strategy...',
          url: 'https://gop.com/news/strategy',
          timestamp: '2024-09-20T16:45:00Z',
          folderName: 'Trump',
          context: 'Party organizational activities'
        }
      ]
    },
    { 
      id: 'desantis', 
      label: 'Ron DeSantis', 
      type: 'person', 
      size: 14, 
      color: NODE_COLORS.person, 
      evidence: [
        {
          clipId: 'clip7',
          clipTitle: 'Florida Governor Update',
          snippet: 'Governor DeSantis announced new Florida policies...',
          url: 'https://flgov.com/news/update',
          timestamp: '2024-09-19T13:15:00Z',
          folderName: 'Trump',
          context: 'State government announcement'
        }
      ]
    },
    { 
      id: 'florida', 
      label: 'Florida', 
      type: 'tag', 
      size: 10, 
      color: NODE_COLORS.tag, 
      evidence: [
        {
          clipId: 'clip8',
          clipTitle: 'Florida Election News',
          snippet: 'Florida prepares for upcoming election cycle...',
          url: 'https://example.com/florida-election',
          timestamp: '2024-09-18T08:30:00Z',
          folderName: 'Trump',
          context: 'State election preparation'
        }
      ]
    },
    { 
      id: 'election', 
      label: '#Election2024', 
      type: 'tag', 
      size: 13, 
      color: NODE_COLORS.tag, 
      evidence: [
        {
          clipId: 'clip9',
          clipTitle: '2024 Election Coverage',
          snippet: 'Comprehensive coverage of 2024 election developments...',
          url: 'https://example.com/election2024',
          timestamp: '2024-09-17T12:00:00Z',
          folderName: 'Trump',
          context: 'Election news and analysis'
        }
      ]
    },
  ]

  const edges: GraphEdge[] = [
    { id: 'e1', source: 'trump', target: 'truth-social', type: 'mentions', weight: 5, color: '#94a3b8' },
    { id: 'e2', source: 'trump', target: 'twitter', type: 'mentions', weight: 8, color: '#94a3b8' },
    { id: 'e3', source: 'trump', target: 'maga', type: 'mentions', weight: 10, color: '#94a3b8' },
    { id: 'e4', source: 'trump', target: 'gop', type: 'affiliated_with', weight: 7, color: '#94a3b8' },
    { id: 'e5', source: 'desantis', target: 'gop', type: 'affiliated_with', weight: 6, color: '#94a3b8' },
    { id: 'e6', source: 'desantis', target: 'florida', type: 'mentions', weight: 9, color: '#94a3b8' },
    { id: 'e7', source: 'trump', target: 'election', type: 'mentions', weight: 8, color: '#94a3b8' },
    { id: 'e8', source: 'desantis', target: 'election', type: 'mentions', weight: 6, color: '#94a3b8' },
  ]

  return { nodes, edges }
}

export function KnowledgeGraphViewer({ isOpen, onClose, graphId, graphTitle, graphDescription }: KnowledgeGraphViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [graphData, setGraphData] = useState<{ nodes: GraphNode[], edges: GraphEdge[] }>({ nodes: [], edges: [] })
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [zoom, setZoom] = useState(1)
  const [nodeTypeFilters, setNodeTypeFilters] = useState<Set<string>>(new Set())
  
  // Canvas interaction state
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 })
  const [isExporting, setIsExporting] = useState(false)

  // Load graph data
  useEffect(() => {
    if (isOpen) {
      // TODO: Replace with actual API call
      const mockData = generateMockGraphData()
      setGraphData(mockData)
    }
  }, [isOpen, graphId])

  // Zoom functions
  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev * 1.2, 3))
  }, [])

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev / 1.2, 0.3))
  }, [])

  const handleResetView = useCallback(() => {
    setZoom(1)
    setPanOffset({ x: 0, y: 0 })
    setSelectedNode(null)
  }, [])

  // Export function
  const handleExport = useCallback(async () => {
    if (!canvasRef.current) return
    
    setIsExporting(true)
    try {
      const canvas = canvasRef.current
      const link = document.createElement('a')
      link.download = `${graphTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_knowledge_graph.png`
      link.href = canvas.toDataURL()
      link.click()
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }, [graphTitle])

  // Share function
  const handleShare = useCallback(async () => {
    if (!canvasRef.current) return
    
    try {
      const canvas = canvasRef.current
      canvas.toBlob(async (blob) => {
        if (blob && navigator.share) {
          const file = new File([blob], 'knowledge-graph.png', { type: 'image/png' })
          await navigator.share({
            title: graphTitle,
            text: graphDescription || 'Knowledge Graph visualization',
            files: [file]
          })
        } else {
          // Fallback: copy to clipboard
          navigator.clipboard.writeText(window.location.href)
          alert('Graph link copied to clipboard!')
        }
      })
    } catch (error) {
      console.error('Share failed:', error)
      // Fallback: copy URL
      navigator.clipboard.writeText(window.location.href)
      alert('Graph link copied to clipboard!')
    }
  }, [graphTitle, graphDescription])

  // Enhanced canvas rendering with interactions
  useEffect(() => {
    if (!canvasRef.current || !graphData.nodes.length) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    const width = rect.width
    const height = rect.height

    // Position nodes in a circle if they don't have positions
    graphData.nodes.forEach((node, index) => {
      if (node.x === undefined || node.y === undefined) {
        const angle = (index / graphData.nodes.length) * 2 * Math.PI
        const radius = Math.min(width, height) * 0.25
        node.x = width / 2 + Math.cos(angle) * radius
        node.y = height / 2 + Math.sin(angle) * radius
      }
    })

    function render() {
      if (!ctx) return
      
      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      // Save context for transformations
      ctx.save()
      
      // Apply zoom and pan transformations
      ctx.translate(width / 2, height / 2)
      ctx.scale(zoom, zoom)
      ctx.translate(-width / 2 + panOffset.x, -height / 2 + panOffset.y)

      // Draw edges
      ctx.strokeStyle = '#e2e8f0'
      ctx.lineWidth = 1 / zoom // Adjust line width for zoom
      graphData.edges.forEach(edge => {
        const sourceNode = graphData.nodes.find(n => n.id === edge.source)
        const targetNode = graphData.nodes.find(n => n.id === edge.target)
        
        if (sourceNode && targetNode && sourceNode.x !== undefined && sourceNode.y !== undefined && 
            targetNode.x !== undefined && targetNode.y !== undefined) {
          
          // Highlight edges connected to selected node
          if (selectedNode && (edge.source === selectedNode.id || edge.target === selectedNode.id)) {
            ctx.strokeStyle = '#8b5cf6'
            ctx.lineWidth = 2 / zoom
          } else {
            ctx.strokeStyle = '#e2e8f0'
            ctx.lineWidth = 1 / zoom
          }
          
          ctx.beginPath()
          ctx.moveTo(sourceNode.x, sourceNode.y)
          ctx.lineTo(targetNode.x, targetNode.y)
          ctx.stroke()
        }
      })

      // Draw nodes
      graphData.nodes.forEach(node => {
        if (node.x === undefined || node.y === undefined) return

        // Filter by search
        if (searchQuery && !node.label.toLowerCase().includes(searchQuery.toLowerCase())) {
          return
        }

        // Filter by type
        if (nodeTypeFilters.size > 0 && !nodeTypeFilters.has(node.type)) {
          return
        }

        const nodeSize = node.size / zoom // Adjust node size for zoom
        const isSelected = selectedNode?.id === node.id

        // Draw node glow for selected
        if (isSelected) {
          ctx.shadowColor = node.color
          ctx.shadowBlur = 20 / zoom
        } else {
          ctx.shadowBlur = 0
        }

        // Draw node circle
        ctx.fillStyle = node.color
        ctx.beginPath()
        ctx.arc(node.x, node.y, nodeSize, 0, 2 * Math.PI)
        ctx.fill()

        // Draw node border
        ctx.strokeStyle = isSelected ? '#1f2937' : '#ffffff'
        ctx.lineWidth = (isSelected ? 3 : 2) / zoom
        ctx.stroke()

        // Reset shadow
        ctx.shadowBlur = 0

        // Draw label
        ctx.fillStyle = '#1f2937'
        ctx.font = `${12 / zoom}px Inter, sans-serif`
        ctx.textAlign = 'center'
        ctx.fillText(node.label, node.x, node.y + nodeSize + 15 / zoom)
      })

      // Restore context
      ctx.restore()
    }

    render()

    // Mouse event handlers
    function getMousePos(event: MouseEvent) {
      const rect = canvas.getBoundingClientRect()
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      }
    }

    function screenToWorld(screenPos: { x: number, y: number }) {
      return {
        x: (screenPos.x - width / 2) / zoom - panOffset.x + width / 2,
        y: (screenPos.y - height / 2) / zoom - panOffset.y + height / 2
      }
    }

    function handleMouseDown(event: MouseEvent) {
      const mousePos = getMousePos(event)
      const worldPos = screenToWorld(mousePos)
      
      // Check if clicking on a node
      const clickedNode = graphData.nodes.find(node => {
        if (node.x === undefined || node.y === undefined) return false
        const distance = Math.sqrt((worldPos.x - node.x) ** 2 + (worldPos.y - node.y) ** 2)
        return distance <= node.size
      })

      if (clickedNode) {
        setSelectedNode(clickedNode)
      } else {
        // Start dragging
        setIsDragging(true)
        setLastMousePos(mousePos)
      }
      render()
    }

    function handleMouseMove(event: MouseEvent) {
      if (!isDragging) return
      
      const mousePos = getMousePos(event)
      const deltaX = mousePos.x - lastMousePos.x
      const deltaY = mousePos.y - lastMousePos.y
      
      setPanOffset(prev => ({
        x: prev.x + deltaX / zoom,
        y: prev.y + deltaY / zoom
      }))
      
      setLastMousePos(mousePos)
      render()
    }

    function handleMouseUp() {
      setIsDragging(false)
    }

    function handleWheel(event: WheelEvent) {
      event.preventDefault()
      const mousePos = getMousePos(event)
      const worldPos = screenToWorld(mousePos)
      
      const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1
      const newZoom = Math.max(0.3, Math.min(3, zoom * zoomFactor))
      
      if (newZoom !== zoom) {
        // Zoom towards mouse position
        const zoomChange = newZoom / zoom
        setPanOffset(prev => ({
          x: prev.x + (worldPos.x - width / 2) * (1 - zoomChange),
          y: prev.y + (worldPos.y - height / 2) * (1 - zoomChange)
        }))
        setZoom(newZoom)
      }
    }

    // Add event listeners
    canvas.addEventListener('mousedown', handleMouseDown)
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseup', handleMouseUp)
    canvas.addEventListener('mouseleave', handleMouseUp)
    canvas.addEventListener('wheel', handleWheel)

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseup', handleMouseUp)
      canvas.removeEventListener('mouseleave', handleMouseUp)
      canvas.removeEventListener('wheel', handleWheel)
    }
  }, [graphData, selectedNode, searchQuery, nodeTypeFilters, zoom, panOffset, isDragging, lastMousePos])

  if (!isOpen) return null

  const nodeTypeCounts = graphData.nodes.reduce((acc, node) => {
    acc[node.type] = (acc[node.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex">
      {/* Main Graph Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-purple-600" />
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{graphTitle}</h2>
              {graphDescription && (
                <p className="text-sm text-slate-600">{graphDescription}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExport}
              disabled={isExporting}
            >
              <Download className="w-4 h-4 mr-2" />
              {isExporting ? 'Exporting...' : 'Export'}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-slate-50 border-b border-slate-200 p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search nodes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            
            <div className="flex items-center gap-2">
              {Object.entries(nodeTypeCounts).map(([type, count]) => (
                <Badge
                  key={type}
                  variant={nodeTypeFilters.has(type) ? "default" : "outline"}
                  className="cursor-pointer capitalize"
                  onClick={() => {
                    const newFilters = new Set(nodeTypeFilters)
                    if (newFilters.has(type)) {
                      newFilters.delete(type)
                    } else {
                      newFilters.add(type)
                    }
                    setNodeTypeFilters(newFilters)
                  }}
                >
                  {type} ({count})
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleZoomOut}
              disabled={zoom <= 0.3}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm text-slate-600 min-w-[60px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleZoomIn}
              disabled={zoom >= 3}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleResetView}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Graph Canvas */}
        <div className="flex-1 relative bg-white">
          <canvas
            ref={canvasRef}
            className="w-full h-full cursor-pointer"
            style={{ width: '100%', height: '100%' }}
          />
          
          {/* Graph Stats Overlay */}
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-sm">
            <div className="text-sm space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>{graphData.nodes.length} nodes</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>{graphData.edges.length} connections</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Node Details */}
      {selectedNode && (
        <div className="w-80 bg-white border-l border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center gap-3 mb-3">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: selectedNode.color }}
              >
                <Network className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">{selectedNode.label}</h3>
                <p className="text-sm text-slate-600 capitalize">{selectedNode.type}</p>
              </div>
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-6">
              {/* Connections */}
              <div>
                <h4 className="text-sm font-medium text-slate-900 mb-3 flex items-center gap-2">
                  <Network className="w-4 h-4" />
                  Connections ({graphData.edges.filter(edge => edge.source === selectedNode.id || edge.target === selectedNode.id).length})
                </h4>
                <div className="space-y-2">
                  {graphData.edges
                    .filter(edge => edge.source === selectedNode.id || edge.target === selectedNode.id)
                    .map(edge => {
                      const connectedNodeId = edge.source === selectedNode.id ? edge.target : edge.source
                      const connectedNode = graphData.nodes.find(n => n.id === connectedNodeId)
                      return (
                        <div 
                          key={edge.id} 
                          className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                          onClick={() => setSelectedNode(connectedNode || null)}
                        >
                          <div 
                            className="w-6 h-6 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: connectedNode?.color }}
                          >
                            <Network className="w-3 h-3 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-slate-900">{connectedNode?.label}</div>
                            <div className="text-xs text-slate-500 capitalize">{connectedNode?.type}</div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {edge.type.replace('_', ' ')}
                          </Badge>
                        </div>
                      )
                    })}
                </div>
              </div>

              {/* Evidence */}
              <div>
                <h4 className="text-sm font-medium text-slate-900 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Evidence ({selectedNode.evidence.length} clips)
                </h4>
                <div className="space-y-3">
                  {selectedNode.evidence.map((evidence, index) => (
                    <div key={index} className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h5 className="text-sm font-medium text-slate-900 mb-1">{evidence.clipTitle}</h5>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Badge variant="secondary" className="text-xs">{evidence.folderName}</Badge>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(evidence.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        {evidence.url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => window.open(evidence.url, '_blank')}
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="bg-slate-50 rounded p-3 mb-2">
                        <p className="text-sm text-slate-700 leading-relaxed">"{evidence.snippet}"</p>
                      </div>
                      
                      <div className="text-xs text-slate-600">
                        <span className="font-medium">Context:</span> {evidence.context}
                      </div>
                      
                      <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-100">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs h-7"
                          onClick={() => {/* TODO: Open clip viewer */}}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View Clip
                        </Button>
                        {evidence.url && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-7"
                            onClick={() => window.open(evidence.url, '_blank')}
                          >
                            <Link className="w-3 h-3 mr-1" />
                            Source
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
