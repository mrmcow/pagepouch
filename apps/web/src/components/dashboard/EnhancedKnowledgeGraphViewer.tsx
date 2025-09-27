'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
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
  Link,
  SplitSquareHorizontal,
  List,
  Layers
} from 'lucide-react'
import { ClipViewer } from './ClipViewer'
import { AdvancedFilters } from '@/components/graph/AdvancedFilters'
import { GraphResultsList } from '@/components/graph/GraphResultsList'
import { EvidenceDrawer } from '@/components/graph/EvidenceDrawer'
import { NodeTooltip } from '@/components/graph/NodeTooltip'
import { GraphFilterEngine } from '@/utils/graphFilterEngine'
import { 
  EnhancedGraphNode, 
  EnhancedGraphEdge, 
  GraphFilters, 
  SavedLens,
  GraphUIState,
  FilteredGraphData
} from '@/types/graph-filters'

interface EnhancedKnowledgeGraphViewerProps {
  isOpen: boolean
  onClose: () => void
  graphId: string
  graphTitle: string
  graphDescription?: string
  clips?: any[]
  folders?: any[]
}

// Default filter state - PERMISSIVE to show all data initially
const DEFAULT_FILTERS: GraphFilters = {
  connections: {
    edgeTypes: [], // Empty = include all types
    minStrength: 0,
    minSources: 0, // Changed from 1 to 0 to be more permissive
    maxPathLength: 6, // Increased from 3
    includeMotifs: []
  },
  entities: {
    includeTypes: [], // Empty = include all types
    excludeEntities: [],
    minConfidence: 0,
    verifiedOnly: false,
    aliasHandling: 'merge',
    minImportance: 0
  },
  themes: {
    includeTags: [],
    excludeTags: [],
    semanticQuery: '',
    similarityThreshold: 0.1, // Lowered from 0.3 to be more permissive
    sentimentRange: { min: -1, max: 1 },
    topics: []
  },
  evidence: {
    minExcerpts: 0, // Changed from 1 to 0 to be more permissive
    minDistinctSources: 0, // Changed from 1 to 0 to be more permissive
    requireProvenance: [],
    reviewStatus: ['pending', 'verified', 'disputed'],
    sourceTypes: ['primary', 'secondary', 'tertiary'],
    confidenceRange: { min: 0, max: 1 },
    includeConflicts: true
  }
}

export function EnhancedKnowledgeGraphViewer({
  isOpen,
  onClose,
  graphId,
  graphTitle,
  graphDescription,
  clips = [],
  folders = []
}: EnhancedKnowledgeGraphViewerProps) {
  // Canvas and rendering state
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [rawGraphData, setRawGraphData] = useState<{ nodes: EnhancedGraphNode[], edges: EnhancedGraphEdge[] }>({ nodes: [], edges: [] })
  const [filteredData, setFilteredData] = useState<FilteredGraphData>({ nodes: [], edges: [], metadata: { totalNodes: 0, filteredNodes: 0, totalEdges: 0, filteredEdges: 0, filterSummary: '', appliedFilters: DEFAULT_FILTERS } })
  
  // UI State
  const [uiState, setUIState] = useState<GraphUIState>({
    selectedNodes: [],
    selectedEdges: [],
    hoveredNode: undefined,
    hoveredEdge: undefined,
    activeFilters: DEFAULT_FILTERS,
    savedLenses: [],
    currentLens: undefined,
    searchQuery: '',
    searchResults: [],
    evidenceDrawer: {
      isOpen: false,
      selectedEdge: undefined,
      selectedNode: undefined
    },
    splitView: {
      graphWidth: 70, // 70% for graph, 30% for results list
      showResultsList: true
    }
  })

  // Canvas interaction state
  const [zoom, setZoom] = useState(1)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 })
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })

  // Clip viewer state
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null)
  const [isClipViewerOpen, setIsClipViewerOpen] = useState(false)

  // Advanced features state
  const [showFilters, setShowFilters] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  // Initialize filter engine
  const filterEngine = useCallback(() => {
    return new GraphFilterEngine(rawGraphData.nodes, rawGraphData.edges)
  }, [rawGraphData])

  // Convert clips to enhanced graph data
  const convertToEnhancedGraphData = useCallback((clips: any[], folders: any[]): { nodes: EnhancedGraphNode[], edges: EnhancedGraphEdge[] } => {
    if (!clips.length) {
      return { nodes: [], edges: [] }
    }

    const nodes: EnhancedGraphNode[] = []
    const edges: EnhancedGraphEdge[] = []
    
    // Process clips into enhanced nodes
    clips.forEach(clip => {
      const domain = extractDomain(clip.url)
      const folderName = folders.find(f => f.id === clip.folder_id)?.name || 'Uncategorized'
      
      nodes.push({
        id: clip.id,
        label: truncateText(clip.title, 50),
        type: 'clip',
        size: 12,
        color: getClipColor(domain),
        evidence: [{
          clipId: clip.id,
          clipTitle: clip.title,
          snippet: clip.notes || extractTextSnippet(clip.text_content) || 'No content available',
          url: clip.url,
          timestamp: clip.created_at,
          folderName: folderName,
          context: `Captured from ${domain}`,
          confidence: 0.8,
          sentiment: 'neutral',
          tags: clip.tags || [],
          sourceType: 'primary',
          provenance: {
            hasQuote: !!clip.notes,
            hasUrl: !!clip.url,
            hasScreenshot: false,
            captureMethod: 'manual'
          }
        }],
        aliases: [],
        entityType: 'content',
        confidence: 0.8,
        verified: false,
        topics: [folderName],
        sentiment: 0,
        importance: Math.random() * 0.5 + 0.3, // Random importance for demo
        firstMention: clip.created_at,
        lastMention: clip.updated_at || clip.created_at,
        mentionFrequency: 1
      })
    })

    // Create domain and folder nodes with enhanced properties
    const domainMap = new Map<string, any[]>()
    const folderMap = new Map<string, any[]>()
    
    clips.forEach(clip => {
      const domain = extractDomain(clip.url)
      const folderName = folders.find(f => f.id === clip.folder_id)?.name || 'Uncategorized'
      
      if (!domainMap.has(domain)) {
        domainMap.set(domain, [])
      }
      domainMap.get(domain)!.push(clip)
      
      if (!folderMap.has(folderName)) {
        folderMap.set(folderName, [])
      }
      folderMap.get(folderName)!.push(clip)
    })

    // Add domain nodes
    domainMap.forEach((domainClips, domain) => {
      if (domainClips.length > 1) {
        nodes.push({
          id: `domain-${domain}`,
          label: domain,
          type: 'domain',
          size: Math.min(20 + domainClips.length * 2, 30),
          color: '#3B82F6',
          evidence: domainClips.map(clip => ({
            clipId: clip.id,
            clipTitle: clip.title,
            snippet: extractTextSnippet(clip.text_content) || 'No content available',
            url: clip.url,
            timestamp: clip.created_at,
            folderName: folders.find(f => f.id === clip.folder_id)?.name || 'Uncategorized',
            context: `Source: ${domain}`,
            confidence: 0.9,
            sentiment: 'neutral',
            tags: [],
            sourceType: 'primary',
            provenance: {
              hasQuote: false,
              hasUrl: true,
              hasScreenshot: false,
              captureMethod: 'automatic'
            }
          })),
          aliases: [],
          entityType: 'source',
          confidence: 0.9,
          verified: true,
          topics: ['source', 'domain'],
          sentiment: 0,
          importance: domainClips.length / clips.length,
          firstMention: Math.min(...domainClips.map(c => new Date(c.created_at).getTime())).toString(),
          lastMention: Math.max(...domainClips.map(c => new Date(c.updated_at || c.created_at).getTime())).toString(),
          mentionFrequency: domainClips.length
        })

        // Create edges from domain to clips
        domainClips.forEach(clip => {
          edges.push({
            id: `edge-${domain}-${clip.id}`,
            source: `domain-${domain}`,
            target: clip.id,
            type: 'source',
            weight: 0.7,
            color: '#94a3b8',
            evidence: [{
              clipId: clip.id,
              clipTitle: clip.title,
              snippet: `Content sourced from ${domain}`,
              url: clip.url,
              timestamp: clip.created_at,
              folderName: folders.find(f => f.id === clip.folder_id)?.name || 'Uncategorized',
              context: `Source relationship`,
              confidence: 0.9,
              sentiment: 'neutral',
              tags: ['source'],
              sourceType: 'primary',
              provenance: {
                hasQuote: false,
                hasUrl: true,
                hasScreenshot: false,
                captureMethod: 'automatic'
              }
            }],
            strength: 0.8,
            sourceCount: 1,
            confidence: 0.9,
            firstConnection: clip.created_at,
            lastConnection: clip.updated_at || clip.created_at,
            frequency: 1,
            connectionReason: `Content sourced from ${domain}`,
            topics: ['source'],
            sentiment: 0
          })
        })
      }
    })

    return { nodes, edges }
  }, [])

  // Apply filters to graph data
  const applyFilters = useCallback((filters: GraphFilters) => {
    const engine = filterEngine()
    const filtered = engine.applyFilters(filters)
    setFilteredData(filtered)
  }, [filterEngine])

  // Load and process graph data
  useEffect(() => {
    if (isOpen) {
      // TODO: Filter clips by the graph's selected folders
      // For now, we'll use all clips, but this should be filtered based on the graph's folder_ids
      console.log('🔍 Debug: Loading graph data', { 
        clipsLength: clips?.length || 0, 
        foldersLength: folders?.length || 0,
        graphId,
        clips: clips?.slice(0, 3) // Show first 3 clips for debugging
      })
      
      const enhanced = convertToEnhancedGraphData(clips, folders)
      console.log('🔍 Debug: Enhanced graph data', { 
        nodesLength: enhanced.nodes.length, 
        edgesLength: enhanced.edges.length,
        nodes: enhanced.nodes.slice(0, 3) // Show first 3 nodes for debugging
      })
      
      setRawGraphData(enhanced)
      
      // Apply default filters
      const engine = new GraphFilterEngine(enhanced.nodes, enhanced.edges)
      const filtered = engine.applyFilters(DEFAULT_FILTERS)
      console.log('🔍 Debug: Filtered data', { 
        filteredNodesLength: filtered.nodes.length, 
        filteredEdgesLength: filtered.edges.length 
      })
      
      setFilteredData(filtered)
    }
  }, [isOpen, clips, folders, convertToEnhancedGraphData, graphId])

  // Canvas rendering
  useEffect(() => {
    if (!isOpen || !canvasRef.current || !filteredData.nodes.length) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height)

    // Apply transformations
    ctx.save()
    ctx.translate(panOffset.x, panOffset.y)
    ctx.scale(zoom, zoom)

    // Position nodes if they don't have positions
    const nodesWithPositions = filteredData.nodes.map((node, index) => {
      if (node.x === undefined || node.y === undefined) {
        const angle = (index / filteredData.nodes.length) * 2 * Math.PI
        const radius = Math.min(rect.width, rect.height) * 0.3
        return {
          ...node,
          x: rect.width / 2 + radius * Math.cos(angle),
          y: rect.height / 2 + radius * Math.sin(angle)
        }
      }
      return node
    })

    // Draw edges with enhanced visual feedback
    filteredData.edges.forEach(edge => {
      const sourceNode = nodesWithPositions.find(n => n.id === edge.source)
      const targetNode = nodesWithPositions.find(n => n.id === edge.target)

      if (sourceNode && targetNode && sourceNode.x !== undefined && sourceNode.y !== undefined && targetNode.x !== undefined && targetNode.y !== undefined) {
        const isHovered = uiState.hoveredEdge === edge.id
        const isSelected = uiState.selectedNodes.includes(edge.source) || uiState.selectedNodes.includes(edge.target)
        
        ctx.beginPath()
        ctx.moveTo(sourceNode.x, sourceNode.y)
        ctx.lineTo(targetNode.x, targetNode.y)
        
        // Edge thickness based on strength and state
        const baseThickness = Math.max(1, (edge.strength || edge.weight || 0.5) * 4)
        ctx.lineWidth = isHovered ? baseThickness * 2 : baseThickness
        
        // Edge color and opacity based on state
        if (isHovered) {
          ctx.strokeStyle = '#3b82f6'
          ctx.globalAlpha = 1
        } else if (isSelected) {
          ctx.strokeStyle = '#8b5cf6'
          ctx.globalAlpha = 0.8
        } else {
          ctx.strokeStyle = edge.color || '#94a3b8'
          ctx.globalAlpha = 0.3 + (edge.strength || edge.weight || 0.5) * 0.5
        }
        
        ctx.stroke()
        ctx.globalAlpha = 1
      }
    })

    // Draw nodes with enhanced visual feedback
    nodesWithPositions.forEach(node => {
      if (node.x !== undefined && node.y !== undefined) {
        const isHovered = uiState.hoveredNode === node.id
        const isSelected = uiState.selectedNodes.includes(node.id)
        
        // Node size based on importance and state
        const baseRadius = node.size || (8 + (node.importance || 0.5) * 12)
        const radius = isHovered ? baseRadius * 1.2 : baseRadius
        
        // Outer glow for hovered/selected nodes
        if (isHovered || isSelected) {
          ctx.beginPath()
          ctx.arc(node.x, node.y, radius + 6, 0, 2 * Math.PI)
          const glowColor = isSelected ? '#8b5cf6' : '#3b82f6'
          ctx.fillStyle = `${glowColor}30`
          ctx.fill()
        }
        
        // Main node circle
        ctx.beginPath()
        ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI)
        
        // Node color based on confidence
        const confidence = node.confidence || 0.5
        let nodeColor = node.color || '#3b82f6'
        
        if (confidence >= 0.8) {
          nodeColor = '#10b981' // High confidence - green
        } else if (confidence >= 0.6) {
          nodeColor = '#f59e0b' // Medium confidence - amber  
        } else if (confidence < 0.6) {
          nodeColor = '#ef4444' // Low confidence - red
        }
        
        ctx.fillStyle = isSelected ? '#8b5cf6' : nodeColor
        ctx.globalAlpha = isSelected ? 1 : (isHovered ? 0.9 : 0.8)
        ctx.fill()
        
        // Node border
        ctx.strokeStyle = isHovered ? '#1f2937' : '#ffffff'
        ctx.lineWidth = isHovered ? 3 : 2
        ctx.globalAlpha = 1
        ctx.stroke()
        
        // Draw node label with better visibility
        if (isHovered || zoom > 0.8) {
          ctx.fillStyle = '#1f2937'
          ctx.font = `${isHovered ? '12px' : '10px'} Inter, sans-serif`
          ctx.textAlign = 'center'
          ctx.strokeStyle = '#ffffff'
          ctx.lineWidth = 2
          ctx.strokeText(node.label, node.x, node.y + radius + 15)
          ctx.fillText(node.label, node.x, node.y + radius + 15)
        }
        
        ctx.globalAlpha = 1
      }
    })

    ctx.restore()
  }, [filteredData, zoom, panOffset, uiState.selectedNodes, uiState.selectedEdges, uiState.hoveredNode, uiState.hoveredEdge, isOpen])

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: GraphFilters) => {
    setUIState(prev => ({ ...prev, activeFilters: newFilters }))
    applyFilters(newFilters)
  }, [applyFilters])

  // Handle node selection
  const handleNodeSelect = useCallback((nodeId: string) => {
    setUIState(prev => ({
      ...prev,
      selectedNodes: prev.selectedNodes.includes(nodeId) 
        ? prev.selectedNodes.filter(id => id !== nodeId)
        : [...prev.selectedNodes, nodeId]
    }))
  }, [])

  // Handle evidence viewing
  const handleEvidenceView = useCallback((clipId: string) => {
    setSelectedClipId(clipId)
    setIsClipViewerOpen(true)
  }, [])

  // Handle evidence drawer
  const handleOpenEvidenceDrawer = useCallback((nodeId?: string, edgeId?: string) => {
    const selectedNode = nodeId ? filteredData.nodes.find(n => n.id === nodeId) : undefined
    const selectedEdge = edgeId ? filteredData.edges.find(e => e.id === edgeId) : undefined
    
    setUIState(prev => ({
      ...prev,
      evidenceDrawer: {
        isOpen: true,
        selectedNode,
        selectedEdge
      }
    }))
  }, [filteredData])

  // Helper function to detect node at position
  const getNodeAtPosition = useCallback((x: number, y: number) => {
    const canvas = canvasRef.current
    if (!canvas) return null

    const rect = canvas.getBoundingClientRect()
    const canvasX = (x - panOffset.x) / zoom
    const canvasY = (y - panOffset.y) / zoom

    return filteredData.nodes.find(node => {
      const nodeX = (node.x || 0) + canvas.width / 2
      const nodeY = (node.y || 0) + canvas.height / 2
      const distance = Math.sqrt((canvasX - nodeX) ** 2 + (canvasY - nodeY) ** 2)
      return distance <= 20 // Node radius
    })
  }, [filteredData.nodes, panOffset, zoom])

  // Helper function to detect edge at position
  const getEdgeAtPosition = useCallback((x: number, y: number) => {
    const canvas = canvasRef.current
    if (!canvas) return null

    const canvasX = (x - panOffset.x) / zoom
    const canvasY = (y - panOffset.y) / zoom

    return filteredData.edges.find(edge => {
      const sourceNode = filteredData.nodes.find(n => n.id === edge.source)
      const targetNode = filteredData.nodes.find(n => n.id === edge.target)
      
      if (!sourceNode || !targetNode) return false

      const x1 = (sourceNode.x || 0) + canvas.width / 2
      const y1 = (sourceNode.y || 0) + canvas.height / 2
      const x2 = (targetNode.x || 0) + canvas.width / 2
      const y2 = (targetNode.y || 0) + canvas.height / 2

      // Distance from point to line
      const A = canvasX - x1
      const B = canvasY - y1
      const C = x2 - x1
      const D = y2 - y1

      const dot = A * C + B * D
      const lenSq = C * C + D * D
      let param = -1
      if (lenSq !== 0) param = dot / lenSq

      let xx, yy
      if (param < 0) {
        xx = x1
        yy = y1
      } else if (param > 1) {
        xx = x2
        yy = y2
      } else {
        xx = x1 + param * C
        yy = y1 + param * D
      }

      const dx = canvasX - xx
      const dy = canvasY - yy
      return Math.sqrt(dx * dx + dy * dy) <= 5 // Edge click tolerance
    })
  }, [filteredData.nodes, filteredData.edges, panOffset, zoom])

  // Mouse event handlers for canvas interaction
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    setIsDragging(true)
    setLastMousePos({ x, y })
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (isDragging) {
      // Pan the canvas
      const deltaX = x - lastMousePos.x
      const deltaY = y - lastMousePos.y
      setPanOffset(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }))
      setLastMousePos({ x, y })
    } else {
      // Check for node/edge hover
      const hoveredNode = getNodeAtPosition(x, y)
      const hoveredEdge = getEdgeAtPosition(x, y)
      
      if (hoveredNode) {
        setUIState(prev => ({ ...prev, hoveredNode: hoveredNode.id }))
        if (canvasRef.current) {
          canvasRef.current.style.cursor = 'pointer'
        }
      } else if (hoveredEdge) {
        setUIState(prev => ({ ...prev, hoveredEdge: hoveredEdge.id }))
        if (canvasRef.current) {
          canvasRef.current.style.cursor = 'pointer'
        }
      } else {
        setUIState(prev => ({ ...prev, hoveredNode: undefined, hoveredEdge: undefined }))
        if (canvasRef.current) {
          canvasRef.current.style.cursor = isDragging ? 'grabbing' : 'grab'
        }
      }
    }

    // Update tooltip position for hover effects
    setTooltipPosition({ x: e.clientX, y: e.clientY })
  }, [isDragging, lastMousePos, getNodeAtPosition, getEdgeAtPosition])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false)
    setUIState(prev => ({ ...prev, hoveredNode: undefined, hoveredEdge: undefined }))
    if (canvasRef.current) {
      canvasRef.current.style.cursor = 'grab'
    }
  }, [])

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const clickedNode = getNodeAtPosition(x, y)
    const clickedEdge = getEdgeAtPosition(x, y)

    if (clickedNode) {
      // Toggle node selection
      setUIState(prev => ({
        ...prev,
        selectedNodes: prev.selectedNodes.includes(clickedNode.id)
          ? prev.selectedNodes.filter(id => id !== clickedNode.id)
          : [...prev.selectedNodes, clickedNode.id]
      }))
    } else if (clickedEdge) {
      // Show edge details in evidence drawer
      setUIState(prev => ({
        ...prev,
        evidenceDrawer: {
          isOpen: true,
          selectedEdge: clickedEdge,
          selectedNode: null
        }
      }))
    }
  }, [getNodeAtPosition, getEdgeAtPosition])

  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1
    setZoom(prev => Math.max(0.1, Math.min(3, prev * zoomFactor)))
  }, [])

  // Zoom controls
  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.2, 3))
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.1))
  const handleResetView = () => {
    setZoom(1)
    setPanOffset({ x: 0, y: 0 })
  }

  // Export functionality
  const handleExport = async () => {
    setIsExporting(true)
    try {
      if (canvasRef.current) {
        const link = document.createElement('a')
        link.download = `${graphTitle}-knowledge-graph.png`
        link.href = canvasRef.current.toDataURL()
        link.click()
      }
    } finally {
      setIsExporting(false)
    }
  }

  // Share functionality
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: graphTitle,
          text: graphDescription || 'Knowledge Graph from PagePouch',
          url: window.location.href
        })
      } catch (err) {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  // Utility functions (simplified versions)
  const extractDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '')
    } catch {
      return 'unknown'
    }
  }

  const extractTextSnippet = (text: string) => {
    return text?.substring(0, 150) + (text?.length > 150 ? '...' : '')
  }

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  }

  const getClipColor = (domain: string) => {
    const colors = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444']
    const hash = domain.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
    return colors[hash % colors.length]
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full h-full max-w-7xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-slate-50 rounded-t-xl">
          <div className="flex items-center gap-3">
            <Brain className="h-6 w-6 text-purple-600" />
            <div>
              <h2 className="text-xl font-bold text-slate-900">{graphTitle}</h2>
              {graphDescription && (
                <p className="text-sm text-slate-600">{graphDescription}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {filteredData.metadata.filterSummary}
            </Badge>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between p-3 border-b bg-white">
          <div className="flex items-center gap-2">
            <Button
              variant={showFilters ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-1" />
              Filters
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setUIState(prev => ({ ...prev, splitView: { ...prev.splitView, showResultsList: !prev.splitView.showResultsList } }))}
            >
              {uiState.splitView.showResultsList ? <Eye className="h-4 w-4 mr-1" /> : <EyeOff className="h-4 w-4 mr-1" />}
              Results
            </Button>

            <div className="flex items-center gap-1 ml-4">
              <Button variant="outline" size="sm" onClick={handleZoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleZoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleResetView}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search entities..."
                value={uiState.searchQuery}
                onChange={(e) => setUIState(prev => ({ ...prev, searchQuery: e.target.value }))}
                className="pl-10 w-64"
              />
            </div>
            
            <Button variant="outline" size="sm" onClick={handleExport} disabled={isExporting}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
            
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="border-b bg-slate-50">
            <div className="max-h-[400px] overflow-y-auto">
              <AdvancedFilters
                filters={uiState.activeFilters}
                onFiltersChange={handleFiltersChange}
                savedLenses={uiState.savedLenses}
                onSaveLens={(name, description) => {
                  // TODO: Implement save lens functionality
                  console.log('Save lens:', name, description)
                }}
                onLoadLens={(lensId) => {
                  // TODO: Implement load lens functionality
                  console.log('Load lens:', lensId)
                }}
                onResetFilters={() => handleFiltersChange(DEFAULT_FILTERS)}
                className="mx-6 my-4"
              />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Graph Canvas */}
          <div 
            className={`relative bg-slate-50 ${uiState.splitView.showResultsList ? 'flex-[2]' : 'flex-1'}`}
          >
            <canvas
              ref={canvasRef}
              className="w-full h-full cursor-grab active:cursor-grabbing"
              style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              onWheel={handleWheel}
              onClick={handleClick}
            />
            
            {/* Graph Stats Overlay */}
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-sm">
              <div className="text-xs space-y-1">
                <div className="flex items-center gap-2">
                  <Network className="h-3 w-3 text-blue-600" />
                  <span>{filteredData.nodes.length} entities</span>
                </div>
                <div className="flex items-center gap-2">
                  <Link className="h-3 w-3 text-green-600" />
                  <span>{filteredData.edges.length} connections</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="h-3 w-3 text-purple-600" />
                  <span>Zoom: {(zoom * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Results List */}
          {uiState.splitView.showResultsList && (
            <div className="w-[400px] flex-shrink-0 border-l bg-white overflow-hidden">
              <GraphResultsList
                nodes={filteredData.nodes}
                edges={filteredData.edges}
                selectedNodes={uiState.selectedNodes}
                onNodeSelect={handleNodeSelect}
                onNodeHover={(nodeId) => setUIState(prev => ({ ...prev, hoveredNode: nodeId || undefined }))}
                onEvidenceView={handleEvidenceView}
                searchQuery={uiState.searchQuery}
              />
            </div>
          )}
        </div>

        {/* Evidence Drawer */}
        <EvidenceDrawer
          isOpen={uiState.evidenceDrawer.isOpen}
          onClose={() => setUIState(prev => ({ ...prev, evidenceDrawer: { ...prev.evidenceDrawer, isOpen: false } }))}
          selectedNode={uiState.evidenceDrawer.selectedNode}
          selectedEdge={uiState.evidenceDrawer.selectedEdge}
          onEvidenceView={handleEvidenceView}
          onNodeSelect={handleNodeSelect}
        />

        {/* Clip Viewer Overlay */}
        {isClipViewerOpen && selectedClipId && (() => {
          const selectedClip = clips.find(clip => clip.id === selectedClipId) || null
          return (
            <div style={{ position: 'fixed', inset: 0, zIndex: 100000 }}>
              <div style={{ position: 'relative', zIndex: 100001 }}>
                <ClipViewer
                  clip={selectedClip}
                  clips={clips}
                  folders={folders}
                  isOpen={isClipViewerOpen}
                  onClose={() => {
                    setIsClipViewerOpen(false)
                    setSelectedClipId(null)
                  }}
                  onUpdate={async () => {}}
                  onDelete={async () => {}}
                  onNavigate={() => {}}
                />
              </div>
            </div>
          )
        })()}
      </div>

      {/* Node Tooltip */}
      {uiState.hoveredNode && (
        <NodeTooltip
          node={filteredData.nodes.find(n => n.id === uiState.hoveredNode)!}
          position={tooltipPosition}
          connectionCount={filteredData.edges.filter(e => 
            e.source === uiState.hoveredNode || e.target === uiState.hoveredNode
          ).length}
          onViewEvidence={handleEvidenceView}
          onAddNote={(nodeId) => {
            // TODO: Implement add note functionality
            console.log('Add note for node:', nodeId)
          }}
          onMarkImportant={(nodeId) => {
            // TODO: Implement mark important functionality
            console.log('Mark important:', nodeId)
          }}
        />
      )}
    </div>
  )
}
