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
import { ClipViewer } from './ClipViewer'
import { generateGraphPreview } from '@/utils/graphPreviewGenerator'

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
  type: 'mentions' | 'links_to' | 'affiliated_with' | 'appears_with' | 'source' | 'categorized_as' | 'same_source' | 'same_topic' | 'same_topic_and_source' | 'similar_content' | 'same_session'
  weight: number
  color: string
}

interface KnowledgeGraphViewerProps {
  isOpen: boolean
  onClose: () => void
  graphId: string
  graphTitle: string
  graphDescription?: string
  clips?: any[] // Pass clips array to find clip by ID
  folders?: any[] // Pass folders for ClipViewer
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

// Generate real graph data from user's clips and metadata
function generateRealGraphData(clips: any[] = [], folders: any[] = []): { nodes: GraphNode[], edges: GraphEdge[] } {
  if (!clips.length) {
    return generateMockGraphData(clips); // Fallback to mock data if no clips
  }

  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  
  // Track domains and their clips
  const domainMap = new Map<string, any[]>();
  const folderMap = new Map<string, any[]>();
  
  // Process each clip into nodes and collect metadata
  clips.forEach(clip => {
    // Create clip node
    const domain = extractDomain(clip.url);
    const folderName = folders.find(f => f.id === clip.folder_id)?.name || 'Uncategorized';
    
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
        context: `Captured from ${domain}`
      }]
    });
    
    // Group clips by domain
    if (!domainMap.has(domain)) {
      domainMap.set(domain, []);
    }
    domainMap.get(domain)!.push(clip);
    
    // Group clips by folder
    if (!folderMap.has(folderName)) {
      folderMap.set(folderName, []);
    }
    folderMap.get(folderName)!.push(clip);
  });
  
  // Create domain nodes for domains with multiple clips
  domainMap.forEach((domainClips, domain) => {
    if (domainClips.length > 1) {
      nodes.push({
        id: `domain-${domain}`,
        label: domain,
        type: 'domain',
        size: Math.min(20 + domainClips.length * 2, 30),
        color: NODE_COLORS.domain,
        evidence: domainClips.map(clip => ({
          clipId: clip.id,
          clipTitle: clip.title,
          snippet: extractTextSnippet(clip.text_content) || 'No content available',
          url: clip.url,
          timestamp: clip.created_at,
          folderName: folders.find(f => f.id === clip.folder_id)?.name || 'Uncategorized',
          context: `Source: ${domain}`
        }))
      });
      
      // Connect domain to its clips
      domainClips.forEach(clip => {
        edges.push({
          id: `edge-${domain}-${clip.id}`,
          source: `domain-${domain}`,
          target: clip.id,
          type: 'source',
          weight: 0.7,
          color: '#94a3b8'
        });
      });
    }
  });
  
  // Create folder nodes for folders with multiple clips
  folderMap.forEach((folderClips, folderName) => {
    if (folderClips.length > 1) {
      nodes.push({
        id: `folder-${folderName}`,
        label: folderName,
        type: 'tag',
        size: Math.min(18 + folderClips.length * 1.5, 25),
        color: NODE_COLORS.tag,
        evidence: folderClips.map(clip => ({
          clipId: clip.id,
          clipTitle: clip.title,
          snippet: extractTextSnippet(clip.text_content) || 'No content available',
          url: clip.url,
          timestamp: clip.created_at,
          folderName: folderName,
          context: `Topic: ${folderName}`
        }))
      });
      
      // Connect folder to its clips
      folderClips.forEach(clip => {
        edges.push({
          id: `edge-${folderName}-${clip.id}`,
          source: `folder-${folderName}`,
          target: clip.id,
          type: 'categorized_as',
          weight: 0.6,
          color: '#a855f7'
        });
      });
    }
  });
  
  // Create connections between clips based on similarity
  generateClipConnections(clips, edges);
  
  return { nodes, edges };
}

// Helper functions for real data processing
function extractDomain(url: string): string {
  try {
    const domain = new URL(url).hostname;
    return domain.replace('www.', '');
  } catch {
    return 'unknown';
  }
}

function extractTextSnippet(textContent: string | null | undefined): string {
  if (!textContent) return '';
  return textContent.slice(0, 150) + (textContent.length > 150 ? '...' : '');
}

function truncateText(text: string, maxLength: number): string {
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
}

function getClipColor(domain: string): string {
  // Color clips based on domain type
  if (domain.includes('twitter.com') || domain.includes('x.com')) return '#1da1f2';
  if (domain.includes('youtube.com')) return '#ff0000';
  if (domain.includes('github.com')) return '#333333';
  if (domain.includes('linkedin.com')) return '#0077b5';
  if (domain.includes('reddit.com')) return '#ff4500';
  if (domain.includes('news') || domain.includes('bbc') || domain.includes('cnn')) return '#e11d48';
  return NODE_COLORS.clip; // Default purple
}

function generateClipConnections(clips: any[], edges: GraphEdge[]): void {
  clips.forEach((clip1, i) => {
    clips.forEach((clip2, j) => {
      if (i >= j) return; // Avoid duplicates and self-connections
      
      let connectionStrength = 0;
      let connectionType = '';
      
      // Same domain connection
      const domain1 = extractDomain(clip1.url);
      const domain2 = extractDomain(clip2.url);
      if (domain1 === domain2) {
        connectionStrength += 0.4;
        connectionType = 'same_source';
      }
      
      // Same folder connection
      if (clip1.folder_id && clip1.folder_id === clip2.folder_id) {
        connectionStrength += 0.5;
        connectionType = connectionType ? 'same_topic_and_source' : 'same_topic';
      }
      
      // Title similarity
      const titleSimilarity = calculateTitleSimilarity(clip1.title, clip2.title);
      if (titleSimilarity > 0.3) {
        connectionStrength += titleSimilarity * 0.4;
        connectionType = connectionType || 'similar_content';
      }
      
      // Temporal proximity (same day)
      const date1 = new Date(clip1.created_at).toDateString();
      const date2 = new Date(clip2.created_at).toDateString();
      if (date1 === date2) {
        connectionStrength += 0.2;
        connectionType = connectionType || 'same_session';
      }
      
      // Create edge if connection is strong enough
      if (connectionStrength > 0.3) {
        edges.push({
          id: `edge-${clip1.id}-${clip2.id}`,
          source: clip1.id,
          target: clip2.id,
          type: connectionType as any,
          weight: Math.min(connectionStrength, 1.0),
          color: getConnectionColor(connectionStrength)
        });
      }
    });
  });
}

function calculateTitleSimilarity(title1: string, title2: string): number {
  const words1 = title1.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const words2 = title2.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  
  if (words1.length === 0 || words2.length === 0) return 0;
  
  const intersection = words1.filter(word => words2.includes(word));
  const union = [...new Set([...words1, ...words2])];
  
  return intersection.length / union.length;
}

function getConnectionColor(strength: number): string {
  if (strength > 0.7) return '#059669'; // Strong - green
  if (strength > 0.5) return '#d97706'; // Medium - orange  
  return '#94a3b8'; // Weak - gray
}

// Keep mock data as fallback
function generateMockGraphData(clips: any[] = []): { nodes: GraphNode[], edges: GraphEdge[] } {
  const nodes: GraphNode[] = [
    { 
      id: 'trump', 
      label: 'Donald Trump', 
      type: 'person', 
      size: 20, 
      color: NODE_COLORS.person, 
      evidence: clips.slice(0, 2).map((clip, index) => ({
        clipId: clip.id,
        clipTitle: clip.title,
        snippet: clip.notes || 'No notes available',
        url: clip.url,
        timestamp: clip.created_at,
        folderName: 'Trump',
        context: 'Political announcement during campaign rally'
      }))
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
      evidence: clips.slice(8, 9).map((clip) => ({
        clipId: clip.id,
        clipTitle: clip.title,
        snippet: clip.notes || 'Comprehensive coverage of 2024 election developments...',
        url: clip.url,
        timestamp: clip.created_at,
        folderName: 'Trump',
        context: 'Election news and analysis'
      }))
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

export function KnowledgeGraphViewer({ isOpen, onClose, graphId, graphTitle, graphDescription, clips = [], folders = [] }: KnowledgeGraphViewerProps) {
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
  
  // Clip viewer state
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null)
  const [isClipViewerOpen, setIsClipViewerOpen] = useState(false)
  
  // Tooltip state
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })

  // Function to save graph preview
  const saveGraphPreview = useCallback(async (graphData: { nodes: GraphNode[], edges: GraphEdge[] }) => {
    if (!graphId || typeof window === 'undefined') return
    
    try {
      // Generate preview image
      const previewImage = generateGraphPreview(graphData)
      
      // Save to database
      const response = await fetch(`/api/knowledge-graphs/${graphId}/preview`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ preview_image: previewImage })
      })
      
      if (!response.ok) {
        console.error('Failed to save graph preview')
      }
    } catch (error) {
      console.error('Error saving graph preview:', error)
    }
  }, [graphId])

  // Load graph data
  useEffect(() => {
    if (isOpen) {
      // Generate real graph data from user's clips
      const realData = generateRealGraphData(clips, folders)
      setGraphData(realData)
      
      // Save preview after a short delay to ensure graph is rendered
      setTimeout(() => {
        saveGraphPreview(realData)
      }, 1000)
    }
  }, [isOpen, graphId, clips, folders, saveGraphPreview])

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
      const mousePos = getMousePos(event)
      
      if (isDragging) {
        const deltaX = mousePos.x - lastMousePos.x
        const deltaY = mousePos.y - lastMousePos.y
        
        setPanOffset(prev => ({
          x: prev.x + deltaX / zoom,
          y: prev.y + deltaY / zoom
        }))
        
        setLastMousePos(mousePos)
        render()
      } else {
        // Check for node hover when not dragging
        const worldPos = screenToWorld(mousePos)
        const hoveredNodeFound = graphData.nodes.find(node => {
          if (node.x === undefined || node.y === undefined) return false
          const distance = Math.sqrt((worldPos.x - node.x) ** 2 + (worldPos.y - node.y) ** 2)
          return distance <= node.size
        })
        
        if (hoveredNodeFound !== hoveredNode) {
          setHoveredNode(hoveredNodeFound || null)
          if (hoveredNodeFound) {
            setTooltipPosition({ x: mousePos.x, y: mousePos.y })
          }
        }
        
        // Change cursor based on hover
        canvas.style.cursor = hoveredNodeFound ? 'pointer' : isDragging ? 'grabbing' : 'grab'
      }
    }

    function handleMouseUp() {
      setIsDragging(false)
    }

    function handleMouseLeave() {
      setIsDragging(false)
      setHoveredNode(null)
      canvas.style.cursor = 'default'
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
    canvas.addEventListener('mouseleave', handleMouseLeave)
    canvas.addEventListener('wheel', handleWheel)

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseup', handleMouseUp)
      canvas.removeEventListener('mouseleave', handleMouseLeave)
      canvas.removeEventListener('wheel', handleWheel)
    }
  }, [graphData, selectedNode, searchQuery, nodeTypeFilters, zoom, panOffset, isDragging, lastMousePos, hoveredNode])

  if (!isOpen) return null

  const nodeTypeCounts = graphData.nodes.reduce((acc, node) => {
    acc[node.type] = (acc[node.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <>
      {/* Hover Tooltip - Rendered at root level for proper z-index */}
      {hoveredNode && (
        <div 
          className="fixed bg-slate-900 text-white text-sm rounded-lg px-4 py-3 shadow-2xl pointer-events-none max-w-xs border border-slate-700"
          style={{
            left: Math.min(tooltipPosition.x + 15, (typeof window !== 'undefined' ? window.innerWidth : 1200) - 300),
            top: Math.max(tooltipPosition.y - 80, 10),
            zIndex: 99999,
          }}
        >
          <div className="font-semibold mb-2 text-white">{hoveredNode.label}</div>
          <div className="text-slate-300 capitalize mb-2 text-xs">
            <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: hoveredNode.color }}></span>
            {hoveredNode.type}
          </div>
          <div className="text-slate-400 text-xs mb-2">
            📎 {hoveredNode.evidence.length} evidence clip{hoveredNode.evidence.length !== 1 ? 's' : ''}
          </div>
          <div className="text-slate-500 text-xs">
            💡 Click to explore connections
          </div>
        </div>
      )}

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
                          onClick={() => {
                            setSelectedClipId(evidence.clipId)
                            setIsClipViewerOpen(true)
                          }}
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

      {/* Clip Viewer Overlay - Rendered at root level for proper z-index */}
      {isClipViewerOpen && selectedClipId && (() => {
        const selectedClip = clips.find(clip => clip.id === selectedClipId) || null
        return (
          <div 
            style={{ 
              position: 'fixed',
              inset: 0,
              zIndex: 100000,
            }}
          >
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
                onUpdate={async () => {}} // Placeholder - no updates needed in graph context
                onDelete={async () => {}} // Placeholder - no deletes needed in graph context
                onNavigate={() => {}} // Placeholder - no navigation needed in graph context
              />
            </div>
          </div>
        )
      })()}
    </>
  )
}
