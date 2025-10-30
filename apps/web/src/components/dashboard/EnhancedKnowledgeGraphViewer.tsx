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
import { SimpleGraphControls } from '@/components/graph/SimpleGraphControls'
import { GraphResultsList } from '@/components/graph/GraphResultsList'
import { EvidenceDrawer } from '@/components/graph/EvidenceDrawer'
import { NodeTooltip } from '@/components/graph/NodeTooltip'
import { GraphFilterEngine } from '@/utils/graphFilterEngine'
import { generateGraphPreview } from '@/utils/graphPreviewGenerator'
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
  graphFolderIds?: string[] // Folder IDs that this graph should include
  clips?: any[]
  folders?: any[]
  onPreviewGenerated?: (previewImage: string) => void // Callback when preview is successfully generated
  onNavigateToFolder?: (folderId: string | null) => void // Callback to navigate to folder in dashboard
}

// Default filter state - PERMISSIVE to show all data initially
const DEFAULT_FILTERS: GraphFilters = {
  connections: {
    viewMode: 'all',
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
  graphFolderIds = [],
  clips = [],
  folders = [],
  onPreviewGenerated,
  onNavigateToFolder
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
  const [isExporting, setIsExporting] = useState(false)

  // Initialize filter engine
  const filterEngine = useCallback(() => {
    return new GraphFilterEngine(rawGraphData.nodes, rawGraphData.edges)
  }, [rawGraphData])

  // Convert clips to enhanced graph data
  const convertToEnhancedGraphData = useCallback((clips: any[], folders: any[], viewMode: string = 'all'): { nodes: EnhancedGraphNode[], edges: EnhancedGraphEdge[] } => {
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
          folderId: clip.folder_id,
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
            folderId: clip.folder_id,
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
            type: 'citation',
            weight: 0.7,
            color: '#94a3b8',
            evidence: [{
              clipId: clip.id,
              clipTitle: clip.title,
              snippet: `Content sourced from ${domain}`,
              url: clip.url,
              timestamp: clip.created_at,
              folderName: folders.find(f => f.id === clip.folder_id)?.name || 'Uncategorized',
              folderId: clip.folder_id,
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

    // Generate additional connections based on view mode
    if (viewMode === 'folders' || viewMode === 'all') {
      generateFolderConnections(clips, folders, nodes, edges)
    }
    
    if (viewMode === 'tags' || viewMode === 'all') {
      generateTagConnections(clips, nodes, edges)
    }
    
    if (viewMode === 'temporal' || viewMode === 'all') {
      generateTemporalConnections(clips, nodes, edges)
    }
    
    if (viewMode === 'content' || viewMode === 'all') {
      generateContentConnections(clips, nodes, edges)
    }

    // Deduplicate nodes by label and type, keeping the one with more evidence
    const uniqueNodes = nodes.reduce((acc, node) => {
      const existing = acc.find(n => 
        n.label.toLowerCase() === node.label.toLowerCase() && 
        n.type === node.type
      )
      
      if (!existing) {
        acc.push(node)
      } else if (node.evidence.length > existing.evidence.length) {
        // Replace with node that has more evidence
        const index = acc.findIndex(n => n.id === existing.id)
        // Update edge references to point to the kept node
        edges.forEach(edge => {
          if (edge.source === existing.id) edge.source = node.id
          if (edge.target === existing.id) edge.target = node.id
        })
        acc[index] = node
      } else {
        // Update edge references to point to the existing node
        edges.forEach(edge => {
          if (edge.source === node.id) edge.source = existing.id
          if (edge.target === node.id) edge.target = existing.id
        })
      }
      return acc
    }, [] as EnhancedGraphNode[])

    // Remove duplicate edges after node deduplication
    const uniqueEdges = edges.reduce((acc, edge) => {
      const existing = acc.find(e => 
        e.source === edge.source && 
        e.target === edge.target && 
        e.type === edge.type
      )
      
      if (!existing) {
        acc.push(edge)
      } else {
        // Merge evidence from duplicate edges
        existing.evidence = [...existing.evidence, ...edge.evidence]
        existing.strength = Math.max(existing.strength || 0, edge.strength || 0)
      }
      return acc
    }, [] as EnhancedGraphEdge[])

    console.log('🔍 Graph Generation Debug:', {
      originalNodes: nodes.length,
      uniqueNodes: uniqueNodes.length,
      duplicatesRemoved: nodes.length - uniqueNodes.length,
      originalEdges: edges.length,
      uniqueEdges: uniqueEdges.length
    })

    return { nodes: uniqueNodes, edges: uniqueEdges }
  }, [])

  // Helper functions for generating different types of connections
  const generateFolderConnections = (clips: any[], folders: any[], nodes: EnhancedGraphNode[], edges: EnhancedGraphEdge[]) => {
    // Group clips by folder and create connections between clips in the same folder
    const folderGroups = new Map<string, any[]>()
    
    clips.forEach(clip => {
      const folderId = clip.folder_id || 'uncategorized'
      if (!folderGroups.has(folderId)) {
        folderGroups.set(folderId, [])
      }
      folderGroups.get(folderId)!.push(clip)
    })
    
    folderGroups.forEach((folderClips, folderId) => {
      if (folderClips.length > 1) {
        // Create connections between all clips in the same folder
        for (let i = 0; i < folderClips.length; i++) {
          for (let j = i + 1; j < folderClips.length; j++) {
            const clip1 = folderClips[i]
            const clip2 = folderClips[j]
            
            edges.push({
              id: `folder-${clip1.id}-${clip2.id}`,
              source: clip1.id,
              target: clip2.id,
              type: 'same_topic',
              weight: 0.6,
              color: '#a855f7',
              evidence: [{
                clipId: clip1.id,
                clipTitle: `${clip1.title} ↔ ${clip2.title}`,
                snippet: 'Both clips are in the same folder/topic',
                url: '',
                timestamp: new Date().toISOString(),
                folderName: folders.find(f => f.id === folderId)?.name || 'Uncategorized',
                folderId: folderId,
                context: 'Folder relationship',
                confidence: 0.8,
                sentiment: 'neutral',
                tags: ['folder', 'topic'],
                sourceType: 'derived',
                provenance: {
                  hasQuote: false,
                  hasUrl: false,
                  hasScreenshot: false,
                  captureMethod: 'automatic'
                }
              }],
              strength: 0.6,
              sourceCount: 1,
              confidence: 0.8,
              firstConnection: clip1.created_at,
              lastConnection: clip2.created_at,
              frequency: 1,
              connectionReason: 'Same folder/topic',
              topics: [folders.find(f => f.id === folderId)?.name || 'Uncategorized'],
              sentiment: 0
            })
          }
        }
      }
    })
  }

  const generateTagConnections = (clips: any[], nodes: EnhancedGraphNode[], edges: EnhancedGraphEdge[]) => {
    // Create connections between clips that share tags
    const tagGroups = new Map<string, any[]>()
    
    clips.forEach(clip => {
      if (clip.tags && clip.tags.length > 0) {
        clip.tags.forEach((tag: string) => {
          if (!tagGroups.has(tag)) {
            tagGroups.set(tag, [])
          }
          tagGroups.get(tag)!.push(clip)
        })
      }
    })
    
    tagGroups.forEach((taggedClips, tag) => {
      if (taggedClips.length > 1) {
        for (let i = 0; i < taggedClips.length; i++) {
          for (let j = i + 1; j < taggedClips.length; j++) {
            const clip1 = taggedClips[i]
            const clip2 = taggedClips[j]
            
            edges.push({
              id: `tag-${clip1.id}-${clip2.id}-${tag}`,
              source: clip1.id,
              target: clip2.id,
              type: 'tag_match',
              weight: 0.5,
              color: '#10b981',
              evidence: [{
                clipId: clip1.id,
                clipTitle: `${clip1.title} ↔ ${clip2.title}`,
                snippet: `Both clips are tagged with "${tag}"`,
                url: '',
                timestamp: new Date().toISOString(),
                folderName: 'Tag Connection',
                folderId: '',
                context: 'Shared tag',
                confidence: 0.7,
                sentiment: 'neutral',
                tags: [tag],
                sourceType: 'derived',
                provenance: {
                  hasQuote: false,
                  hasUrl: false,
                  hasScreenshot: false,
                  captureMethod: 'automatic'
                }
              }],
              strength: 0.5,
              sourceCount: 1,
              confidence: 0.7,
              firstConnection: clip1.created_at,
              lastConnection: clip2.created_at,
              frequency: 1,
              connectionReason: `Shared tag: ${tag}`,
              topics: [tag],
              sentiment: 0
            })
          }
        }
      }
    })
  }

  const generateTemporalConnections = (clips: any[], nodes: EnhancedGraphNode[], edges: EnhancedGraphEdge[]) => {
    // Create connections between clips created within the same time period
    const sortedClips = [...clips].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    
    for (let i = 0; i < sortedClips.length - 1; i++) {
      const clip1 = sortedClips[i]
      const clip2 = sortedClips[i + 1]
      
      const timeDiff = new Date(clip2.created_at).getTime() - new Date(clip1.created_at).getTime()
      const hoursDiff = timeDiff / (1000 * 60 * 60)
      
      // Connect clips created within 24 hours of each other
      if (hoursDiff <= 24) {
        edges.push({
          id: `temporal-${clip1.id}-${clip2.id}`,
          source: clip1.id,
          target: clip2.id,
          type: 'same_session',
          weight: Math.max(0.2, 1 - (hoursDiff / 24)),
          color: '#f59e0b',
          evidence: [{
            clipId: clip1.id,
            clipTitle: `${clip1.title} → ${clip2.title}`,
            snippet: `Clips created ${Math.round(hoursDiff)} hours apart`,
            url: '',
            timestamp: new Date().toISOString(),
            folderName: 'Temporal Connection',
            folderId: '',
            context: 'Time proximity',
            confidence: 0.6,
            sentiment: 'neutral',
            tags: ['temporal', 'session'],
            sourceType: 'derived',
            provenance: {
              hasQuote: false,
              hasUrl: false,
              hasScreenshot: false,
              captureMethod: 'automatic'
            }
          }],
          strength: Math.max(0.2, 1 - (hoursDiff / 24)),
          sourceCount: 1,
          confidence: 0.6,
          firstConnection: clip1.created_at,
          lastConnection: clip2.created_at,
          frequency: 1,
          connectionReason: `Created within ${Math.round(hoursDiff)} hours`,
          topics: ['temporal'],
          sentiment: 0
        })
      }
    }
  }

  const generateContentConnections = (clips: any[], nodes: EnhancedGraphNode[], edges: EnhancedGraphEdge[]) => {
    // Create connections between clips with similar content
    for (let i = 0; i < clips.length; i++) {
      for (let j = i + 1; j < clips.length; j++) {
        const clip1 = clips[i]
        const clip2 = clips[j]
        
        const similarity = calculateContentSimilarity(clip1, clip2)
        
        if (similarity > 0.3) {
          edges.push({
            id: `content-${clip1.id}-${clip2.id}`,
            source: clip1.id,
            target: clip2.id,
            type: 'similar_content',
            weight: similarity,
            color: '#3b82f6',
            evidence: [{
              clipId: clip1.id,
              clipTitle: `${clip1.title} ↔ ${clip2.title}`,
              snippet: `Content similarity: ${Math.round(similarity * 100)}%`,
              url: '',
              timestamp: new Date().toISOString(),
              folderName: 'Content Connection',
              folderId: '',
              context: 'Content similarity',
              confidence: similarity,
              sentiment: 'neutral',
              tags: ['content', 'similarity'],
              sourceType: 'derived',
              provenance: {
                hasQuote: false,
                hasUrl: false,
                hasScreenshot: false,
                captureMethod: 'automatic'
              }
            }],
            strength: similarity,
            sourceCount: 1,
            confidence: similarity,
            firstConnection: clip1.created_at,
            lastConnection: clip2.created_at,
            frequency: 1,
            connectionReason: `Content similarity: ${Math.round(similarity * 100)}%`,
            topics: ['content'],
            sentiment: 0
          })
        }
      }
    }
  }

  const calculateContentSimilarity = (clip1: any, clip2: any): number => {
    // Simple content similarity based on title and text content
    const title1 = (clip1.title || '').toLowerCase()
    const title2 = (clip2.title || '').toLowerCase()
    const text1 = (clip1.text_content || '').toLowerCase()
    const text2 = (clip2.text_content || '').toLowerCase()
    
    // Title similarity
    const titleWords1 = title1.split(/\s+/).filter((w: string) => w.length > 3)
    const titleWords2 = title2.split(/\s+/).filter((w: string) => w.length > 3)
    const titleIntersection = titleWords1.filter((w: string) => titleWords2.includes(w))
    const titleSimilarity = titleWords1.length > 0 ? titleIntersection.length / Math.max(titleWords1.length, titleWords2.length) : 0
    
    // Text similarity (simple word overlap)
    const textWords1 = text1.split(/\s+/).filter((w: string) => w.length > 4).slice(0, 50) // Limit for performance
    const textWords2 = text2.split(/\s+/).filter((w: string) => w.length > 4).slice(0, 50)
    const textIntersection = textWords1.filter((w: string) => textWords2.includes(w))
    const textSimilarity = textWords1.length > 0 ? textIntersection.length / Math.max(textWords1.length, textWords2.length) : 0
    
    // Weighted combination
    return (titleSimilarity * 0.7) + (textSimilarity * 0.3)
  }

  // Apply filters to graph data
  const applyFilters = useCallback((filters: GraphFilters) => {
    const engine = filterEngine()
    let filtered = engine.applyFilters(filters)
    
    // Apply search query filtering to the graph visualization
    if (uiState.searchQuery) {
      const query = uiState.searchQuery.toLowerCase()
      
      // Filter nodes based on search query
      const searchMatchedNodes = filtered.nodes.filter(node => {
        // Search in node label
        if (node.label.toLowerCase().includes(query)) return true
        // Search in evidence snippets
        if (node.evidence.some(evidence => 
          evidence.snippet.toLowerCase().includes(query) ||
          evidence.clipTitle.toLowerCase().includes(query) ||
          evidence.folderName.toLowerCase().includes(query)
        )) return true
        // Search in node type
        if (node.type.toLowerCase().includes(query)) return true
        return false
      })
      
      // Get IDs of matched nodes
      const matchedNodeIds = new Set(searchMatchedNodes.map(n => n.id))
      
      // Include edges that connect to matched nodes (to show their connections)
      const searchMatchedEdges = filtered.edges.filter(edge => 
        matchedNodeIds.has(edge.source) || matchedNodeIds.has(edge.target)
      )
      
      // Also include nodes that are connected to matched nodes (1-hop neighbors)
      const connectedNodeIds = new Set<string>()
      searchMatchedEdges.forEach(edge => {
        connectedNodeIds.add(edge.source)
        connectedNodeIds.add(edge.target)
      })
      
      // Final set of nodes: matched nodes + their immediate neighbors
      const finalNodes = filtered.nodes.filter(node => 
        matchedNodeIds.has(node.id) || connectedNodeIds.has(node.id)
      )
      
      filtered = {
        ...filtered,
        nodes: finalNodes,
        edges: searchMatchedEdges,
        metadata: {
          ...filtered.metadata,
          filteredNodes: finalNodes.length,
          filteredEdges: searchMatchedEdges.length,
          filterSummary: `Search: "${uiState.searchQuery}" (${searchMatchedNodes.length} matches, ${finalNodes.length} total nodes)`
        }
      }
    }
    
    setFilteredData(filtered)
  }, [filterEngine, uiState.searchQuery])

  // Load and process graph data
  useEffect(() => {
    if (isOpen) {
      // Filter clips by the graph's selected folders
      const filteredClips = graphFolderIds.length > 0 
        ? clips.filter(clip => graphFolderIds.includes(clip.folder_id))
        : clips
      
      console.log('🔍 Debug: Loading graph data', { 
        totalClipsLength: clips?.length || 0, 
        graphFolderIds,
        filteredClipsLength: filteredClips?.length || 0,
        foldersLength: folders?.length || 0,
        graphId,
        filteredClips: filteredClips?.slice(0, 3) // Show first 3 filtered clips for debugging
      })
      
      const enhanced = convertToEnhancedGraphData(filteredClips, folders, uiState.activeFilters.connections.viewMode)
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
  }, [isOpen, clips, folders, convertToEnhancedGraphData, graphId, graphFolderIds, uiState.activeFilters.connections.viewMode])

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

    // Clear canvas with white background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, rect.width, rect.height)

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

  // Generate and save graph preview when graph is rendered with data
  useEffect(() => {
    if (isOpen && graphId && filteredData.nodes.length > 0 && canvasRef.current) {
      console.log('🖼️ Preview Generation: Scheduling preview generation for graph', graphId)
      // Delay to ensure canvas is fully rendered
      const timer = setTimeout(() => {
        console.log('🖼️ Preview Generation: Starting preview generation...')
        generateAndSavePreview()
      }, 5000) // Increased delay to ensure graph is fully rendered and positioned
      
      return () => clearTimeout(timer)
    }
  }, [isOpen, graphId, filteredData.nodes.length])

  const generateAndSavePreview = async () => {
    if (!graphId || !filteredData.nodes.length || !canvasRef.current) {
      console.log('🖼️ Preview Generation: Skipping - missing requirements', { 
        graphId, 
        nodesLength: filteredData.nodes.length,
        hasCanvas: !!canvasRef.current 
      })
      return
    }
    
    console.log('🖼️ Preview Generation: Capturing actual canvas content')
    
    try {
      // Capture the actual rendered canvas content
      const canvas = canvasRef.current
      
      // Create a smaller preview canvas with proper aspect ratio
      const previewCanvas = document.createElement('canvas')
      const previewWidth = 320
      const previewHeight = 180
      previewCanvas.width = previewWidth
      previewCanvas.height = previewHeight
      
      const previewCtx = previewCanvas.getContext('2d')!
      
      // Set white background to match brand
      previewCtx.fillStyle = '#ffffff'
      previewCtx.fillRect(0, 0, previewWidth, previewHeight)
      
      // Calculate aspect ratios to maintain proportions with padding
      const padding = 20 // Add some padding around the graph
      const availableWidth = previewWidth - (padding * 2)
      const availableHeight = previewHeight - (padding * 2)
      
      const canvasAspect = canvas.width / canvas.height
      const availableAspect = availableWidth / availableHeight
      
      let drawWidth, drawHeight, drawX, drawY
      
      if (canvasAspect > availableAspect) {
        // Canvas is wider - fit to available width, center vertically
        drawWidth = availableWidth
        drawHeight = availableWidth / canvasAspect
        drawX = padding
        drawY = padding + (availableHeight - drawHeight) / 2
      } else {
        // Canvas is taller - fit to available height, center horizontally
        drawHeight = availableHeight
        drawWidth = availableHeight * canvasAspect
        drawX = padding + (availableWidth - drawWidth) / 2
        drawY = padding
      }
      
      // Draw the main canvas content with proper aspect ratio
      previewCtx.drawImage(
        canvas, 
        0, 0, canvas.width, canvas.height,  // Source dimensions
        drawX, drawY, drawWidth, drawHeight // Destination with proper aspect ratio
      )
      
      // Add a subtle border around the preview
      previewCtx.strokeStyle = '#e5e7eb' // gray-200
      previewCtx.lineWidth = 1
      previewCtx.strokeRect(0.5, 0.5, previewWidth - 1, previewHeight - 1)
      
      // Convert to base64 with good quality
      const previewImage = previewCanvas.toDataURL('image/jpeg', 0.8)
      console.log('🖼️ Preview Generation: Canvas captured, size:', previewImage.length, 'characters')
      
      // Save to database
      console.log('🖼️ Preview Generation: Saving to database...')
      const response = await fetch(`/api/knowledge-graphs/${graphId}/preview`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ preview_image: previewImage }),
      })
      
      if (!response.ok) {
        console.error('🖼️ Preview Generation: Failed to save graph preview', response.status, response.statusText)
      } else {
        console.log('🖼️ Preview Generation: Graph preview saved successfully! Updating thumbnail...')
        // Notify parent component that preview was generated, pass the preview image
        onPreviewGenerated?.(previewImage)
      }
    } catch (error) {
      console.error('Error generating graph preview:', error)
    }
  }

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: GraphFilters) => {
    setUIState(prev => ({ ...prev, activeFilters: newFilters }))
    applyFilters(newFilters)
  }, [applyFilters])

  // Reapply filters when search query changes
  useEffect(() => {
    applyFilters(uiState.activeFilters)
  }, [uiState.searchQuery, applyFilters, uiState.activeFilters])

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
        selectedNode: selectedNode?.id,
        selectedEdge: selectedEdge?.id
      }
    }))
  }, [filteredData])

  // Helper function to detect node at position
  const getNodeAtPosition = useCallback((x: number, y: number) => {
    const canvas = canvasRef.current
    if (!canvas) return null

    const rect = canvas.getBoundingClientRect()
    
    // Transform mouse coordinates to canvas coordinates
    const canvasX = (x - panOffset.x) / zoom
    const canvasY = (y - panOffset.y) / zoom

    // Position nodes if they don't have positions (same logic as rendering)
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

    return nodesWithPositions.find(node => {
      if (node.x === undefined || node.y === undefined) return false
      
      const distance = Math.sqrt((canvasX - node.x) ** 2 + (canvasY - node.y) ** 2)
      const nodeRadius = node.size || 12
      return distance <= nodeRadius + 5 // Node radius plus small buffer
    })
  }, [filteredData.nodes, panOffset, zoom])

  // Helper function to get screen position of a node
  const getNodeScreenPosition = useCallback((nodeId: string) => {
    const canvas = canvasRef.current
    if (!canvas) return null

    const rect = canvas.getBoundingClientRect()
    const node = filteredData.nodes.find(n => n.id === nodeId)
    if (!node) return null

    // Position nodes if they don't have positions (same logic as rendering)
    let nodeX = node.x
    let nodeY = node.y
    
    if (nodeX === undefined || nodeY === undefined) {
      const nodeIndex = filteredData.nodes.findIndex(n => n.id === nodeId)
      const angle = (nodeIndex / filteredData.nodes.length) * 2 * Math.PI
      const radius = Math.min(rect.width, rect.height) * 0.3
      nodeX = rect.width / 2 + radius * Math.cos(angle)
      nodeY = rect.height / 2 + radius * Math.sin(angle)
    }
    
    // Convert canvas coordinates to screen coordinates
    const screenX = nodeX * zoom + panOffset.x + rect.left
    const screenY = nodeY * zoom + panOffset.y + rect.top
    
    return { x: screenX, y: screenY }
  }, [filteredData.nodes, zoom, panOffset])

  // Helper function to detect edge at position
  const getEdgeAtPosition = useCallback((x: number, y: number) => {
    const canvas = canvasRef.current
    if (!canvas) return null

    const rect = canvas.getBoundingClientRect()
    const canvasX = (x - panOffset.x) / zoom
    const canvasY = (y - panOffset.y) / zoom

    // Position nodes if they don't have positions (same logic as rendering)
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

    return filteredData.edges.find(edge => {
      const sourceNode = nodesWithPositions.find(n => n.id === edge.source)
      const targetNode = nodesWithPositions.find(n => n.id === edge.target)
      
      if (!sourceNode || !targetNode || sourceNode.x === undefined || sourceNode.y === undefined || targetNode.x === undefined || targetNode.y === undefined) return false

      const x1 = sourceNode.x
      const y1 = sourceNode.y
      const x2 = targetNode.x
      const y2 = targetNode.y

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
      return Math.sqrt(dx * dx + dy * dy) <= 8 // Edge click tolerance
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
        setUIState(prev => ({ ...prev, hoveredNode: hoveredNode.id, hoveredEdge: undefined }))
        if (canvasRef.current) {
          canvasRef.current.style.cursor = 'pointer'
        }
      } else if (hoveredEdge) {
        setUIState(prev => ({ ...prev, hoveredEdge: hoveredEdge.id, hoveredNode: undefined }))
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

    // Always update tooltip position for any mouse movement
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
      // Get node screen position for persistent tooltip
      const nodePosition = getNodeScreenPosition(clickedNode.id)
      
      setUIState(prev => ({
        ...prev,
        selectedNodes: prev.selectedNodes.includes(clickedNode.id)
          ? prev.selectedNodes.filter(id => id !== clickedNode.id)
          : [...prev.selectedNodes, clickedNode.id],
        // Set persistent tooltip at node position
        persistentTooltip: nodePosition ? {
          nodeId: clickedNode.id,
          position: nodePosition
        } : undefined
      }))
    } else if (clickedEdge) {
      // Show edge details in evidence drawer
      setUIState(prev => ({
        ...prev,
        evidenceDrawer: {
          isOpen: true,
          selectedEdge: clickedEdge.id,
          selectedNode: undefined
        },
        // Clear persistent tooltip when clicking elsewhere
        persistentTooltip: undefined
      }))
    } else {
      // Clear persistent tooltip when clicking empty space
      setUIState(prev => ({
        ...prev,
        persistentTooltip: undefined
      }))
    }
  }, [getNodeAtPosition, getEdgeAtPosition, getNodeScreenPosition])

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
              variant="outline"
              size="sm"
              onClick={() => setUIState(prev => ({ ...prev, splitView: { ...prev.splitView, showResultsList: !prev.splitView.showResultsList } }))}
            >
              {uiState.splitView.showResultsList ? <Eye className="h-4 w-4 mr-1" /> : <EyeOff className="h-4 w-4 mr-1" />}
              Results Panel
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

        {/* Simple Graph Controls */}
        <SimpleGraphControls
          searchQuery={uiState.searchQuery}
          onSearchChange={(query) => setUIState(prev => ({ ...prev, searchQuery: query }))}
          viewMode={uiState.activeFilters.connections.viewMode || 'all'}
          onViewModeChange={(mode) => {
            const newFilters = {
              ...uiState.activeFilters,
              connections: {
                ...uiState.activeFilters.connections,
                viewMode: mode as any
              }
            }
            handleFiltersChange(newFilters)
          }}
          connectionTypes={uiState.activeFilters.connections.edgeTypes}
          onConnectionTypesChange={(types) => {
            const newFilters = {
              ...uiState.activeFilters,
              connections: {
                ...uiState.activeFilters.connections,
                edgeTypes: types
              }
            }
            handleFiltersChange(newFilters)
          }}
          onResetFilters={() => {
            handleFiltersChange(DEFAULT_FILTERS)
            setUIState(prev => ({ ...prev, searchQuery: '' }))
          }}
          nodeCount={filteredData.nodes.length}
          connectionCount={filteredData.edges.length}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Graph Canvas */}
          <div 
            className={`relative bg-slate-50 ${uiState.splitView.showResultsList ? 'flex-[2]' : 'flex-1'}`}
          >
            <canvas
              ref={canvasRef}
              className="w-full h-full cursor-grab active:cursor-grabbing"
              style={{ background: '#ffffff' }}
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
                <div className="w-[480px] flex-shrink-0 border-l bg-white overflow-hidden">
                  <GraphResultsList
                nodes={filteredData.nodes}
                edges={filteredData.edges}
                selectedNodes={uiState.selectedNodes}
                onNodeSelect={handleNodeSelect}
                onNodeHover={(nodeId) => {
                  if (nodeId) {
                    // Get node screen position for tooltip
                    const nodePosition = getNodeScreenPosition(nodeId)
                    setUIState(prev => ({ 
                      ...prev, 
                      hoveredNode: nodeId,
                    }))
                    // Update tooltip position to node location
                    if (nodePosition) {
                      setTooltipPosition(nodePosition)
                    }
                  } else {
                    setUIState(prev => ({ ...prev, hoveredNode: undefined }))
                  }
                }}
            onEvidenceView={handleEvidenceView}
            onFolderNavigate={onNavigateToFolder}
            searchQuery={uiState.searchQuery}
              />
            </div>
          )}
        </div>

        {/* Evidence Drawer */}
        <EvidenceDrawer
          isOpen={uiState.evidenceDrawer.isOpen}
          onClose={() => setUIState(prev => ({ ...prev, evidenceDrawer: { ...prev.evidenceDrawer, isOpen: false } }))}
          selectedNode={uiState.evidenceDrawer.selectedNode ? filteredData.nodes.find(n => n.id === uiState.evidenceDrawer.selectedNode) : undefined}
          selectedEdge={uiState.evidenceDrawer.selectedEdge ? filteredData.edges.find(e => e.id === uiState.evidenceDrawer.selectedEdge) : undefined}
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

      {/* Node Tooltip - Show persistent tooltip or hover tooltip */}
      {(() => {
        // Prioritize persistent tooltip over hover tooltip
        const tooltipNodeId = uiState.persistentTooltip?.nodeId || uiState.hoveredNode
        const currentTooltipPosition = uiState.persistentTooltip?.position || tooltipPosition
        
        if (!tooltipNodeId) return null
        
        const nodeData = filteredData.nodes.find(n => n.id === tooltipNodeId)
        if (!nodeData) return null
        
        return (
          <NodeTooltip
            node={nodeData}
            position={currentTooltipPosition}
            connectionCount={filteredData.edges.filter(e => 
              e.source === tooltipNodeId || e.target === tooltipNodeId
            ).length}
            onViewEvidence={handleEvidenceView}
            onAddNote={async (nodeId) => {
              // Find the clip associated with this node
              const node = filteredData.nodes.find(n => n.id === nodeId)
              if (!node || node.evidence.length === 0) return
              
              const clipId = node.evidence[0].clipId
              const currentNotes = node.evidence[0].snippet
              
              // Prompt user for note
              const newNote = prompt('Add a note for this clip:', currentNotes)
              if (newNote === null) return // User cancelled
              
              try {
                const response = await fetch(`/api/clips/${clipId}`, {
                  method: 'PATCH',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ notes: newNote })
                })
                
                if (response.ok) {
                  // Update local data
                  const updatedNode = { ...node }
                  updatedNode.evidence[0].snippet = newNote
                  
                  // Update the graph data
                  setRawGraphData(prev => ({
                    ...prev,
                    nodes: prev.nodes.map(n => n.id === nodeId ? updatedNode : n)
                  }))
                  
                  console.log('Note updated successfully')
                } else {
                  console.error('Failed to update note')
                }
              } catch (error) {
                console.error('Error updating note:', error)
              }
            }}
            onMarkImportant={async (nodeId) => {
              // Find the clip associated with this node
              const node = filteredData.nodes.find(n => n.id === nodeId)
              if (!node || node.evidence.length === 0) return
              
              const clipId = node.evidence[0].clipId
              
              try {
                const response = await fetch(`/api/clips/${clipId}/favorite`, {
                  method: 'PATCH',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ is_favorite: true })
                })
                
                if (response.ok) {
                  console.log('Clip marked as favorite successfully')
                  // Optionally update local state to show visual feedback
                } else {
                  console.error('Failed to mark clip as favorite')
                }
              } catch (error) {
                console.error('Error marking clip as favorite:', error)
              }
            }}
            isPersistent={!!uiState.persistentTooltip}
            isClipViewerOpen={isClipViewerOpen}
          />
        )
      })()}
    </div>
  )
}
