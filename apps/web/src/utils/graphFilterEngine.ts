/**
 * Graph Filter Engine
 * Advanced filtering system for investigative research workflows
 */

import {
  EnhancedGraphNode,
  EnhancedGraphEdge,
  GraphFilters,
  FilteredGraphData,
  ConnectionFilters,
  EntityFilters,
  ThemeFilters,
  EvidenceFilters,
  Evidence,
  GraphSearchQuery,
  GraphSearchResult,
  GraphInsights
} from '@/types/graph-filters'

export class GraphFilterEngine {
  private nodes: EnhancedGraphNode[]
  private edges: EnhancedGraphEdge[]

  constructor(nodes: EnhancedGraphNode[], edges: EnhancedGraphEdge[]) {
    this.nodes = nodes
    this.edges = edges
  }

  /**
   * Apply comprehensive filters to the graph
   */
  applyFilters(filters: GraphFilters): FilteredGraphData {
    // Step 1: Filter nodes based on entity filters
    let filteredNodes = this.filterEntities(this.nodes, filters.entities)

    // Step 2: Filter edges based on connection filters
    let filteredEdges = this.filterConnections(this.edges, filters.connections)

    // Step 3: Apply theme filters to both nodes and edges
    const themeResult = this.filterByThemes(filteredNodes, filteredEdges, filters.themes)
    filteredNodes = themeResult.nodes
    filteredEdges = themeResult.edges

    // Step 4: Apply evidence filters
    const evidenceResult = this.filterByEvidence(filteredNodes, filteredEdges, filters.evidence)
    filteredNodes = evidenceResult.nodes
    filteredEdges = evidenceResult.edges

    // Step 5: Remove orphaned nodes (nodes with no connections)
    const connectedNodeIds = new Set<string>()
    filteredEdges.forEach(edge => {
      connectedNodeIds.add(edge.source)
      connectedNodeIds.add(edge.target)
    })
    filteredNodes = filteredNodes.filter(node => connectedNodeIds.has(node.id))

    // Step 6: Remove edges that reference filtered-out nodes
    const nodeIds = new Set(filteredNodes.map(n => n.id))
    filteredEdges = filteredEdges.filter(edge => 
      nodeIds.has(edge.source) && nodeIds.has(edge.target)
    )

    return {
      nodes: filteredNodes,
      edges: filteredEdges,
      metadata: {
        totalNodes: this.nodes.length,
        filteredNodes: filteredNodes.length,
        totalEdges: this.edges.length,
        filteredEdges: filteredEdges.length,
        filterSummary: this.generateFilterSummary(filters, filteredNodes.length, filteredEdges.length),
        appliedFilters: filters
      }
    }
  }

  /**
   * Filter entities based on type, confidence, verification, etc.
   */
  private filterEntities(nodes: EnhancedGraphNode[], filters: EntityFilters): EnhancedGraphNode[] {
    return nodes.filter(node => {
      // Type filtering
      if (filters.includeTypes.length > 0 && !filters.includeTypes.includes(node.type)) {
        return false
      }

      // Exclude specific entities
      if (filters.excludeEntities.includes(node.id) || filters.excludeEntities.includes(node.label)) {
        return false
      }

      // Confidence threshold
      if (node.confidence < filters.minConfidence) {
        return false
      }

      // Verified only
      if (filters.verifiedOnly && !node.verified) {
        return false
      }

      // Importance threshold
      if (node.importance < filters.minImportance) {
        return false
      }

      return true
    })
  }

  /**
   * Filter connections based on type, strength, source count, etc.
   */
  private filterConnections(edges: EnhancedGraphEdge[], filters: ConnectionFilters): EnhancedGraphEdge[] {
    return edges.filter(edge => {
      // Edge type filtering
      if (filters.edgeTypes.length > 0 && !filters.edgeTypes.includes(edge.type)) {
        return false
      }

      // Minimum strength
      if (edge.strength < filters.minStrength) {
        return false
      }

      // Minimum sources
      if (edge.sourceCount < filters.minSources) {
        return false
      }

      // Temporal range
      if (filters.temporalRange) {
        const edgeTime = new Date(edge.firstConnection)
        const start = new Date(filters.temporalRange.start)
        const end = new Date(filters.temporalRange.end)
        if (edgeTime < start || edgeTime > end) {
          return false
        }
      }

      return true
    })
  }

  /**
   * Filter by themes, topics, and semantic similarity
   */
  private filterByThemes(
    nodes: EnhancedGraphNode[], 
    edges: EnhancedGraphEdge[], 
    filters: ThemeFilters
  ): { nodes: EnhancedGraphNode[], edges: EnhancedGraphEdge[] } {
    
    let filteredNodes = nodes.filter(node => {
      // Tag filtering
      if (filters.includeTags.length > 0) {
        const nodeEvidence = node.evidence.flatMap(e => e.tags)
        const hasIncludedTag = filters.includeTags.some(tag => nodeEvidence.includes(tag))
        if (!hasIncludedTag) return false
      }

      if (filters.excludeTags.length > 0) {
        const nodeEvidence = node.evidence.flatMap(e => e.tags)
        const hasExcludedTag = filters.excludeTags.some(tag => nodeEvidence.includes(tag))
        if (hasExcludedTag) return false
      }

      // Topic filtering
      if (filters.topics.length > 0) {
        const hasRelevantTopic = filters.topics.some(topic => node.topics.includes(topic))
        if (!hasRelevantTopic) return false
      }

      // Sentiment filtering
      if (node.sentiment < filters.sentimentRange.min || node.sentiment > filters.sentimentRange.max) {
        return false
      }

      return true
    })

    let filteredEdges = edges.filter(edge => {
      // Topic filtering for edges
      if (filters.topics.length > 0) {
        const hasRelevantTopic = filters.topics.some(topic => edge.topics.includes(topic))
        if (!hasRelevantTopic) return false
      }

      // Sentiment filtering for edges
      if (edge.sentiment < filters.sentimentRange.min || edge.sentiment > filters.sentimentRange.max) {
        return false
      }

      return true
    })

    // Semantic similarity filtering (if query provided)
    if (filters.semanticQuery && filters.semanticQuery.trim()) {
      const semanticResults = this.performSemanticSearch(
        filteredNodes, 
        filteredEdges, 
        filters.semanticQuery, 
        filters.similarityThreshold
      )
      filteredNodes = semanticResults.nodes
      filteredEdges = semanticResults.edges
    }

    return { nodes: filteredNodes, edges: filteredEdges }
  }

  /**
   * Filter by evidence quality, provenance, and review status
   */
  private filterByEvidence(
    nodes: EnhancedGraphNode[], 
    edges: EnhancedGraphEdge[], 
    filters: EvidenceFilters
  ): { nodes: EnhancedGraphNode[], edges: EnhancedGraphEdge[] } {
    
    const filteredEdges = edges.filter(edge => {
      // Minimum excerpts per connection
      if (edge.evidence.length < filters.minExcerpts) {
        return false
      }

      // Minimum distinct sources
      const distinctSources = new Set(edge.evidence.map(e => e.url || e.clipId)).size
      if (distinctSources < filters.minDistinctSources) {
        return false
      }

      // Provenance requirements
      if (filters.requireProvenance.length > 0) {
        const hasRequiredProvenance = edge.evidence.some(evidence => {
          return filters.requireProvenance.every(requirement => {
            switch (requirement) {
              case 'quote': return evidence.provenance.hasQuote
              case 'url': return evidence.provenance.hasUrl
              case 'screenshot': return evidence.provenance.hasScreenshot
              default: return false
            }
          })
        })
        if (!hasRequiredProvenance) return false
      }

      // Review status filtering
      if (filters.reviewStatus.length > 0) {
        const hasValidReviewStatus = edge.evidence.some(evidence => 
          evidence.reviewStatus && filters.reviewStatus.includes(evidence.reviewStatus)
        )
        if (!hasValidReviewStatus) return false
      }

      // Source type filtering
      if (filters.sourceTypes.length > 0) {
        const hasValidSourceType = edge.evidence.some(evidence => 
          filters.sourceTypes.includes(evidence.sourceType)
        )
        if (!hasValidSourceType) return false
      }

      // Confidence range
      const avgConfidence = edge.evidence.reduce((sum, e) => sum + e.confidence, 0) / edge.evidence.length
      if (avgConfidence < filters.confidenceRange.min || avgConfidence > filters.confidenceRange.max) {
        return false
      }

      return true
    })

    // Filter nodes based on their evidence quality
    const filteredNodes = nodes.filter(node => {
      const avgConfidence = node.evidence.reduce((sum, e) => sum + e.confidence, 0) / node.evidence.length
      return avgConfidence >= filters.confidenceRange.min && avgConfidence <= filters.confidenceRange.max
    })

    return { nodes: filteredNodes, edges: filteredEdges }
  }

  /**
   * Perform semantic search across nodes and edges
   */
  private performSemanticSearch(
    nodes: EnhancedGraphNode[], 
    edges: EnhancedGraphEdge[], 
    query: string, 
    threshold: number
  ): { nodes: EnhancedGraphNode[], edges: EnhancedGraphEdge[] } {
    // Simple semantic matching based on text similarity
    // In a real implementation, this would use embeddings or NLP models
    const queryTerms = query.toLowerCase().split(/\s+/)
    
    const filteredNodes = nodes.filter(node => {
      const nodeText = [
        node.label,
        ...node.topics,
        ...node.evidence.flatMap(e => [e.snippet, e.context, e.clipTitle])
      ].join(' ').toLowerCase()
      
      const similarity = this.calculateTextSimilarity(nodeText, queryTerms)
      return similarity >= threshold
    })

    const filteredEdges = edges.filter(edge => {
      const edgeText = [
        edge.connectionReason,
        ...edge.topics,
        ...edge.evidence.flatMap(e => [e.snippet, e.context, e.clipTitle])
      ].join(' ').toLowerCase()
      
      const similarity = this.calculateTextSimilarity(edgeText, queryTerms)
      return similarity >= threshold
    })

    return { nodes: filteredNodes, edges: filteredEdges }
  }

  /**
   * Calculate text similarity (simple implementation)
   */
  private calculateTextSimilarity(text: string, queryTerms: string[]): number {
    const textTerms = text.split(/\s+/)
    const matches = queryTerms.filter(term => 
      textTerms.some(textTerm => textTerm.includes(term) || term.includes(textTerm))
    )
    return matches.length / queryTerms.length
  }

  /**
   * Search across the graph
   */
  search(query: GraphSearchQuery): GraphSearchResult[] {
    const results: GraphSearchResult[] = []
    const queryLower = query.query.toLowerCase()

    // Search nodes
    this.nodes.forEach(node => {
      const relevance = this.calculateNodeRelevance(node, queryLower)
      if (relevance > 0.1) {
        results.push({
          type: 'node',
          id: node.id,
          label: node.label,
          snippet: this.generateNodeSnippet(node, queryLower),
          relevanceScore: relevance,
          highlightedTerms: this.extractHighlightedTerms(node.label, queryLower),
          context: node.evidence.slice(0, 3) // Top 3 evidence pieces
        })
      }
    })

    // Search edges
    this.edges.forEach(edge => {
      const relevance = this.calculateEdgeRelevance(edge, queryLower)
      if (relevance > 0.1) {
        results.push({
          type: 'edge',
          id: edge.id,
          label: `${this.getNodeLabel(edge.source)} → ${this.getNodeLabel(edge.target)}`,
          snippet: edge.connectionReason || `${edge.type} connection`,
          relevanceScore: relevance,
          highlightedTerms: this.extractHighlightedTerms(edge.connectionReason, queryLower),
          context: edge.evidence.slice(0, 3)
        })
      }
    })

    return results.sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, query.limit || 50)
  }

  /**
   * Generate insights about the current graph
   */
  generateInsights(): GraphInsights {
    return {
      keyEntities: this.identifyKeyEntities(),
      strongConnections: this.identifyStrongConnections(),
      clusters: this.identifyClusters(),
      temporalPatterns: this.identifyTemporalPatterns(),
      evidenceGaps: this.identifyEvidenceGaps()
    }
  }

  // Helper methods for insights
  private identifyKeyEntities() {
    return this.nodes
      .map(node => ({
        nodeId: node.id,
        importance: node.importance,
        reason: `High importance score (${node.importance.toFixed(2)}) with ${node.evidence.length} evidence pieces`
      }))
      .sort((a, b) => b.importance - a.importance)
      .slice(0, 10)
  }

  private identifyStrongConnections() {
    return this.edges
      .map(edge => ({
        edgeId: edge.id,
        strength: edge.strength,
        sourceCount: edge.sourceCount,
        reason: `Strong connection (${edge.strength.toFixed(2)}) supported by ${edge.sourceCount} sources`
      }))
      .sort((a, b) => b.strength - a.strength)
      .slice(0, 10)
  }

  private identifyClusters() {
    // Simple clustering based on shared topics
    const topicClusters = new Map<string, string[]>()
    
    this.nodes.forEach(node => {
      node.topics.forEach(topic => {
        if (!topicClusters.has(topic)) {
          topicClusters.set(topic, [])
        }
        topicClusters.get(topic)!.push(node.id)
      })
    })

    return Array.from(topicClusters.entries())
      .filter(([_, nodes]) => nodes.length >= 3)
      .map(([topic, nodes], index) => ({
        id: `cluster-${index}`,
        nodes,
        topic,
        coherence: nodes.length / this.nodes.length
      }))
      .slice(0, 5)
  }

  private identifyTemporalPatterns() {
    // Group activity by time periods
    const periods = new Map<string, number>()
    
    this.edges.forEach(edge => {
      const date = new Date(edge.firstConnection)
      const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      periods.set(period, (periods.get(period) || 0) + 1)
    })

    return Array.from(periods.entries())
      .map(([period, activity]) => ({
        period,
        activity,
        keyEvents: [`${activity} connections formed`]
      }))
      .sort((a, b) => b.activity - a.activity)
      .slice(0, 6)
  }

  private identifyEvidenceGaps() {
    return this.edges
      .filter(edge => edge.sourceCount < 2 || edge.evidence.length < 3)
      .map(edge => ({
        connection: `${this.getNodeLabel(edge.source)} → ${this.getNodeLabel(edge.target)}`,
        missingEvidence: edge.sourceCount < 2 ? ['Additional sources'] : ['More excerpts'],
        suggestions: ['Search for more clips', 'Add manual annotations', 'Verify with external sources']
      }))
      .slice(0, 5)
  }

  // Utility methods
  private generateFilterSummary(filters: GraphFilters, nodeCount: number, edgeCount: number): string {
    const parts = []
    
    if (filters.entities.includeTypes.length > 0) {
      parts.push(`${filters.entities.includeTypes.join(', ')} entities`)
    }
    
    if (filters.connections.edgeTypes.length > 0) {
      parts.push(`${filters.connections.edgeTypes.join(', ')} connections`)
    }
    
    if (filters.themes.topics.length > 0) {
      parts.push(`topics: ${filters.themes.topics.join(', ')}`)
    }

    const summary = parts.length > 0 ? parts.join(' • ') : 'All data'
    return `${summary} (${nodeCount} nodes, ${edgeCount} connections)`
  }

  private calculateNodeRelevance(node: EnhancedGraphNode, query: string): number {
    let score = 0
    
    if (node.label.toLowerCase().includes(query)) score += 1.0
    if (node.topics.some(topic => topic.toLowerCase().includes(query))) score += 0.8
    if (node.evidence.some(e => e.snippet.toLowerCase().includes(query))) score += 0.6
    
    return Math.min(score, 1.0)
  }

  private calculateEdgeRelevance(edge: EnhancedGraphEdge, query: string): number {
    let score = 0
    
    if (edge.connectionReason.toLowerCase().includes(query)) score += 1.0
    if (edge.topics.some(topic => topic.toLowerCase().includes(query))) score += 0.8
    if (edge.evidence.some(e => e.snippet.toLowerCase().includes(query))) score += 0.6
    
    return Math.min(score, 1.0)
  }

  private generateNodeSnippet(node: EnhancedGraphNode, query: string): string {
    const relevantEvidence = node.evidence.find(e => 
      e.snippet.toLowerCase().includes(query)
    )
    return relevantEvidence?.snippet || node.evidence[0]?.snippet || node.label
  }

  private extractHighlightedTerms(text: string, query: string): string[] {
    const terms = query.split(/\s+/)
    return terms.filter(term => text.toLowerCase().includes(term.toLowerCase()))
  }

  private getNodeLabel(nodeId: string): string {
    return this.nodes.find(n => n.id === nodeId)?.label || nodeId
  }
}
