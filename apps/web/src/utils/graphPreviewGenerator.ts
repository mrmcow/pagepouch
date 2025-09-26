/**
 * Graph Preview Generator
 * Creates mini-canvas snapshots of knowledge graphs for card previews
 */

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

interface GraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

/**
 * Generate a preview image for a knowledge graph
 * @param graphData - The graph nodes and edges
 * @param width - Canvas width (default: 320px for 16:9 aspect ratio)
 * @param height - Canvas height (default: 180px for 16:9 aspect ratio)
 * @returns Base64 data URL of the preview image
 */
export function generateGraphPreview(
  graphData: GraphData,
  width: number = 160,
  height: number = 90
): string {
  // Create offscreen canvas
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!

  // Clear canvas with gradient background
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, '#faf5ff') // purple-50
  gradient.addColorStop(1, '#eff6ff') // blue-50
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  // If no data, return empty preview
  if (!graphData.nodes.length) {
    return canvas.toDataURL('image/jpeg', 0.7)
  }

  // Position nodes if they don't have coordinates
  const nodesWithPositions = positionNodesForPreview(graphData.nodes, width, height)
  
  // Draw edges first (so they appear behind nodes)
  drawEdges(ctx, graphData.edges, nodesWithPositions, width, height)
  
  // Draw nodes
  drawNodes(ctx, nodesWithPositions, width, height)

  // Add subtle border
  ctx.strokeStyle = '#e5e7eb' // gray-200
  ctx.lineWidth = 1
  ctx.strokeRect(0, 0, width, height)

  return canvas.toDataURL('image/jpeg', 0.7)
}

/**
 * Position nodes in a visually appealing layout for preview
 */
function positionNodesForPreview(nodes: GraphNode[], width: number, height: number): GraphNode[] {
  const padding = 20
  const centerX = width / 2
  const centerY = height / 2
  
  return nodes.map((node, index) => {
    if (node.x !== undefined && node.y !== undefined) {
      // Scale existing positions to fit preview canvas
      return {
        ...node,
        x: (node.x * (width - padding * 2)) + padding,
        y: (node.y * (height - padding * 2)) + padding
      }
    }

    // Create circular layout for nodes without positions
    const angle = (index / nodes.length) * 2 * Math.PI
    const radius = Math.min(width, height) * 0.3
    
    return {
      ...node,
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius
    }
  })
}

/**
 * Draw edges between nodes
 */
function drawEdges(
  ctx: CanvasRenderingContext2D,
  edges: GraphEdge[],
  nodes: GraphNode[],
  width: number,
  height: number
) {
  const nodeMap = new Map(nodes.map(node => [node.id, node]))

  edges.forEach(edge => {
    const sourceNode = nodeMap.get(edge.source)
    const targetNode = nodeMap.get(edge.target)
    
    if (!sourceNode || !targetNode || !sourceNode.x || !sourceNode.y || !targetNode.x || !targetNode.y) {
      return
    }

    // Draw edge line
    ctx.beginPath()
    ctx.moveTo(sourceNode.x, sourceNode.y)
    ctx.lineTo(targetNode.x, targetNode.y)
    ctx.strokeStyle = edge.color + '40' // Add transparency
    ctx.lineWidth = Math.max(1, edge.weight * 2) // Scale line width based on weight
    ctx.stroke()
  })
}

/**
 * Draw nodes on the canvas
 */
function drawNodes(
  ctx: CanvasRenderingContext2D,
  nodes: GraphNode[],
  width: number,
  height: number
) {
  nodes.forEach(node => {
    if (!node.x || !node.y) return

    // Scale node size for preview (smaller than full graph)
    const radius = Math.max(3, Math.min(12, node.size * 0.6))

    // Draw node circle
    ctx.beginPath()
    ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI)
    ctx.fillStyle = node.color
    ctx.fill()

    // Add subtle border
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 1
    ctx.stroke()

    // For larger nodes, add a subtle inner highlight
    if (radius > 6) {
      ctx.beginPath()
      ctx.arc(node.x, node.y, radius * 0.6, 0, 2 * Math.PI)
      ctx.fillStyle = '#ffffff20'
      ctx.fill()
    }
  })
}

/**
 * Generate a fallback preview for graphs without data
 */
export function generateFallbackPreview(
  status: 'processing' | 'failed' | 'empty',
  width: number = 160,
  height: number = 90
): string {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  if (status === 'failed') {
    gradient.addColorStop(0, '#fef2f2') // red-50
    gradient.addColorStop(1, '#fef2f2')
  } else if (status === 'processing') {
    gradient.addColorStop(0, '#faf5ff') // purple-50
    gradient.addColorStop(1, '#eff6ff') // blue-50
  } else {
    gradient.addColorStop(0, '#f9fafb') // gray-50
    gradient.addColorStop(1, '#f3f4f6') // gray-100
  }
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  // Draw status indicator
  const centerX = width / 2
  const centerY = height / 2

  if (status === 'processing') {
    // Animated dots (static for preview)
    const dotRadius = 4
    const dotSpacing = 12
    ctx.fillStyle = '#8b5cf6' // purple-500
    
    for (let i = 0; i < 3; i++) {
      ctx.beginPath()
      ctx.arc(centerX - dotSpacing + (i * dotSpacing), centerY, dotRadius, 0, 2 * Math.PI)
      ctx.fill()
    }
  } else if (status === 'failed') {
    // Error indicator
    ctx.fillStyle = '#ef4444' // red-500
    ctx.font = '24px system-ui'
    ctx.textAlign = 'center'
    ctx.fillText('!', centerX, centerY + 8)
  } else {
    // Empty state - simple network icon
    ctx.strokeStyle = '#9ca3af' // gray-400
    ctx.lineWidth = 2
    
    // Draw simple network diagram
    const nodeRadius = 6
    const positions = [
      { x: centerX - 20, y: centerY - 15 },
      { x: centerX + 20, y: centerY - 15 },
      { x: centerX, y: centerY + 20 }
    ]
    
    // Draw connections
    ctx.beginPath()
    positions.forEach((pos, i) => {
      positions.forEach((otherPos, j) => {
        if (i < j) {
          ctx.moveTo(pos.x, pos.y)
          ctx.lineTo(otherPos.x, otherPos.y)
        }
      })
    })
    ctx.stroke()
    
    // Draw nodes
    ctx.fillStyle = '#d1d5db' // gray-300
    positions.forEach(pos => {
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, nodeRadius, 0, 2 * Math.PI)
      ctx.fill()
    })
  }

  // Border
  ctx.strokeStyle = '#e5e7eb' // gray-200
  ctx.lineWidth = 1
  ctx.strokeRect(0, 0, width, height)

  return canvas.toDataURL('image/jpeg', 0.7)
}

/**
 * Generate preview statistics overlay (optional enhancement)
 */
export function generateStatsOverlay(
  nodeCount: number,
  connectionCount: number,
  width: number = 160,
  height: number = 90
): string {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!

  // Semi-transparent overlay
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
  ctx.fillRect(0, height - 40, width, 40)

  // Stats text
  ctx.fillStyle = '#ffffff'
  ctx.font = '12px system-ui'
  ctx.textAlign = 'left'
  ctx.fillText(`${nodeCount} nodes • ${connectionCount} connections`, 10, height - 20)

  return canvas.toDataURL('image/jpeg', 0.7)
}
