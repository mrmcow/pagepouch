/**
 * Advanced Graph Filtering System
 * Supports investigative research workflows with sophisticated filtering
 */

// Enhanced Evidence Structure
export interface Evidence {
  clipId: string
  clipTitle: string
  snippet: string
  fullText?: string
  url?: string
  timestamp: string
  folderName: string
  folderId?: string
  context: string
  confidence: number // 0-1 confidence score
  sentiment?: 'positive' | 'negative' | 'neutral'
  tags: string[]
  notes?: string
  reviewer?: string
  reviewStatus?: 'pending' | 'verified' | 'disputed'
  sourceType: 'primary' | 'secondary' | 'tertiary' | 'derived'
  provenance: {
    hasQuote: boolean
    hasUrl: boolean
    hasScreenshot: boolean
    captureMethod: 'manual' | 'automatic'
  }
}

// Enhanced Node Types
export interface EnhancedGraphNode {
  id: string
  label: string
  type: 'person' | 'organization' | 'domain' | 'email' | 'tag' | 'clip' | 'place' | 'event'
  size: number
  color: string
  x?: number
  y?: number
  evidence: Evidence[]
  
  // Entity-specific metadata
  aliases?: string[] // Alternative names/spellings
  entityType?: string // More specific than type (e.g., 'journalist', 'politician')
  confidence: number // How confident we are this is a real entity
  verified: boolean // Has this entity been manually verified?
  
  // Semantic metadata
  topics: string[] // Semantic topics this entity relates to
  sentiment: number // -1 to 1, overall sentiment
  importance: number // 0-1, calculated importance score
  
  // Temporal metadata
  firstMention: string // ISO timestamp
  lastMention: string // ISO timestamp
  mentionFrequency: number // How often mentioned
}

// Enhanced Edge Types
export interface EnhancedGraphEdge {
  id: string
  source: string
  target: string
  type: 'co_mention' | 'citation' | 'user_link' | 'semantic_similarity' | 'temporal_proximity' | 'source_authority' | 'topic_bridge' | 'same_topic' | 'tag_match' | 'same_session' | 'similar_content'
  weight: number
  color: string
  evidence: Evidence[]
  
  // Connection strength metadata
  strength: number // 0-1, how strong is this connection
  sourceCount: number // How many distinct sources support this
  confidence: number // 0-1, confidence in this connection
  
  // Temporal metadata
  firstConnection: string // When first observed
  lastConnection: string // When last observed
  frequency: number // How often this connection appears
  
  // Semantic metadata
  connectionReason: string // Why these entities are connected
  topics: string[] // What topics this connection relates to
  sentiment: number // -1 to 1, sentiment of the connection
}

// Filter Configuration Types
export interface ConnectionFilters {
  viewMode?: 'all' | 'domains' | 'folders' | 'tags' | 'temporal' | 'content' // Connection view mode
  edgeTypes: string[] // Which edge types to include
  minStrength: number // Minimum connection strength (0-1)
  minSources: number // Minimum number of supporting sources
  maxPathLength: number // Maximum degrees of separation
  includeMotifs: ('triangle' | 'star' | 'chain')[] // Graph patterns to highlight
  temporalRange?: {
    start: string
    end: string
  }
}

export interface EntityFilters {
  includeTypes: string[] // Which entity types to include
  excludeEntities: string[] // Specific entities to exclude
  minConfidence: number // Minimum confidence threshold
  verifiedOnly: boolean // Only show verified entities
  aliasHandling: 'merge' | 'separate' // How to handle aliases
  minImportance: number // Minimum importance score
}

export interface ThemeFilters {
  includeTags: string[] // User tags to include
  excludeTags: string[] // User tags to exclude
  semanticQuery?: string // Natural language query for semantic similarity
  similarityThreshold: number // Minimum semantic similarity (0-1)
  sentimentRange: {
    min: number // -1 to 1
    max: number // -1 to 1
  }
  topics: string[] // Specific topics to focus on
}

export interface EvidenceFilters {
  minExcerpts: number // Minimum excerpts per connection
  minDistinctSources: number // Minimum distinct sources
  requireProvenance: ('quote' | 'url' | 'screenshot')[] // Required provenance elements
  reviewStatus: ('pending' | 'verified' | 'disputed')[] // Review statuses to include
  sourceTypes: ('primary' | 'secondary' | 'tertiary' | 'derived')[] // Source types to include
  confidenceRange: {
    min: number // 0-1
    max: number // 0-1
  }
  includeConflicts: boolean // Include conflicting evidence
}

// Combined Filter State
export interface GraphFilters {
  connections: ConnectionFilters
  entities: EntityFilters
  themes: ThemeFilters
  evidence: EvidenceFilters
}

// Saved Lens Configuration
export interface SavedLens {
  id: string
  name: string
  description?: string
  filters: GraphFilters
  createdAt: string
  updatedAt: string
  userId: string
  isPublic: boolean
  tags: string[]
  usageCount: number
}

// Filter Application Results
export interface FilteredGraphData {
  nodes: EnhancedGraphNode[]
  edges: EnhancedGraphEdge[]
  metadata: {
    totalNodes: number
    filteredNodes: number
    totalEdges: number
    filteredEdges: number
    filterSummary: string
    appliedFilters: GraphFilters
  }
}

// Search and Discovery Types
export interface GraphSearchQuery {
  query: string
  type: 'entity' | 'connection' | 'evidence' | 'semantic'
  filters?: Partial<GraphFilters>
  limit?: number
}

export interface GraphSearchResult {
  type: 'node' | 'edge' | 'evidence'
  id: string
  label: string
  snippet: string
  relevanceScore: number
  highlightedTerms: string[]
  context: Evidence[]
}

// UI State Types
export interface GraphUIState {
  selectedNodes: string[]
  selectedEdges: string[]
  hoveredNode?: string
  hoveredEdge?: string
  persistentTooltip?: {
    nodeId: string
    position: { x: number, y: number }
  }
  activeFilters: GraphFilters
  savedLenses: SavedLens[]
  currentLens?: string
  searchQuery: string
  searchResults: GraphSearchResult[]
  evidenceDrawer: {
    isOpen: boolean
    selectedEdge?: string
    selectedNode?: string
  }
  splitView: {
    graphWidth: number // Percentage of screen width
    showResultsList: boolean
  }
}

// Analytics and Insights Types
export interface GraphInsights {
  keyEntities: {
    nodeId: string
    importance: number
    reason: string
  }[]
  strongConnections: {
    edgeId: string
    strength: number
    sourceCount: number
    reason: string
  }[]
  clusters: {
    id: string
    nodes: string[]
    topic: string
    coherence: number
  }[]
  temporalPatterns: {
    period: string
    activity: number
    keyEvents: string[]
  }[]
  evidenceGaps: {
    connection: string
    missingEvidence: string[]
    suggestions: string[]
  }[]
}
