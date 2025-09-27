'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Users, 
  Building2, 
  Globe, 
  MapPin, 
  Calendar, 
  Tag,
  FileText,
  ExternalLink,
  Eye,
  TrendingUp,
  Clock,
  Shield
} from 'lucide-react'
import { EnhancedGraphNode, EnhancedGraphEdge, Evidence } from '@/types/graph-filters'

interface GraphResultsListProps {
  nodes: EnhancedGraphNode[]
  edges: EnhancedGraphEdge[]
  selectedNodes: string[]
  onNodeSelect: (nodeId: string) => void
  onNodeHover: (nodeId: string | null) => void
  onEvidenceView: (clipId: string) => void
  searchQuery: string
  className?: string
}

export function GraphResultsList({
  nodes,
  edges,
  selectedNodes,
  onNodeSelect,
  onNodeHover,
  onEvidenceView,
  searchQuery,
  className = ''
}: GraphResultsListProps) {
  
  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'person': return <Users className="h-4 w-4" />
      case 'organization': return <Building2 className="h-4 w-4" />
      case 'domain': return <Globe className="h-4 w-4" />
      case 'place': return <MapPin className="h-4 w-4" />
      case 'event': return <Calendar className="h-4 w-4" />
      case 'tag': return <Tag className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) return <Badge variant="default" className="text-xs bg-green-100 text-green-800">High</Badge>
    if (confidence >= 0.6) return <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">Medium</Badge>
    return <Badge variant="outline" className="text-xs bg-red-100 text-red-800">Low</Badge>
  }

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = text.split(regex)
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">{part}</mark>
      ) : part
    )
  }

  // Deduplicate nodes by ID and label, keeping the one with more evidence
  const uniqueNodes = nodes.reduce((acc, node) => {
    const existing = acc.find(n => n.id === node.id || n.label.toLowerCase() === node.label.toLowerCase())
    if (!existing) {
      acc.push(node)
    } else if (node.evidence.length > existing.evidence.length) {
      // Replace with node that has more evidence
      const index = acc.findIndex(n => n.id === existing.id)
      acc[index] = node
    }
    return acc
  }, [] as EnhancedGraphNode[])

  const sortedNodes = uniqueNodes.sort((a, b) => {
    // Sort by importance, then by evidence count
    if (b.importance !== a.importance) return b.importance - a.importance
    return b.evidence.length - a.evidence.length
  })

  const getConnectedNodes = (nodeId: string) => {
    const connections = edges.filter(edge => 
      edge.source === nodeId || edge.target === nodeId
    )
    return connections.length
  }

  return (
    <div className={`h-full flex flex-col ${className}`}>
      <div className="p-4 border-b bg-slate-50">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-lg">Results</h3>
          <Badge variant="outline">{uniqueNodes.length} entities</Badge>
        </div>
        <p className="text-sm text-slate-600">
          {searchQuery ? `Filtered results for "${searchQuery}"` : 'All entities in current view'}
          {nodes.length !== uniqueNodes.length && (
            <span className="text-xs text-slate-500 ml-1">
              ({nodes.length - uniqueNodes.length} duplicates removed)
            </span>
          )}
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {sortedNodes.map(node => {
            const isSelected = selectedNodes.includes(node.id)
            const connectionCount = getConnectedNodes(node.id)
            
            return (
              <Card 
                key={node.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-slate-50'
                }`}
                onClick={() => onNodeSelect(node.id)}
                onMouseEnter={() => onNodeHover(node.id)}
                onMouseLeave={() => onNodeHover(null)}
              >
                <CardHeader className="pb-2 px-3 pt-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div 
                        className="p-1 rounded-full flex-shrink-0"
                        style={{ backgroundColor: `${node.color}20`, color: node.color }}
                      >
                        {getNodeIcon(node.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-sm truncate">
                          {highlightText(node.label, searchQuery)}
                        </CardTitle>
                        <div className="flex items-center gap-1 mt-1 flex-wrap">
                          <Badge variant="outline" className="text-xs capitalize">
                            {node.type}
                          </Badge>
                          {getConfidenceBadge(node.confidence)}
                          {node.verified && (
                            <Badge variant="default" className="text-xs bg-blue-100 text-blue-800">
                              <Shield className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-xs text-slate-500 flex-shrink-0 ml-2">
                      <div className="flex items-center gap-1 mb-1">
                        <TrendingUp className="h-3 w-3" />
                        {(node.importance * 100).toFixed(0)}%
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {connectionCount}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0 px-3 pb-3">
                  {/* Topics */}
                  {node.topics.length > 0 && (
                    <div className="mb-2">
                      <div className="flex flex-wrap gap-1">
                        {node.topics.slice(0, 2).map(topic => (
                          <Badge key={topic} variant="secondary" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                        {node.topics.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{node.topics.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Evidence Preview */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {node.evidence.length} evidence
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(node.lastMention).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Top Evidence - Compact */}
                    {node.evidence.slice(0, 1).map((evidence, index) => (
                      <div key={index} className="bg-slate-50 rounded p-2 text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-slate-700 truncate flex-1">
                            {evidence.clipTitle}
                          </span>
                          <div className="flex items-center gap-1 ml-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0"
                              onClick={(e) => {
                                e.stopPropagation()
                                onEvidenceView(evidence.clipId)
                              }}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            {evidence.url && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-5 w-5 p-0"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  window.open(evidence.url, '_blank')
                                }}
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                        <p className="text-slate-600 line-clamp-1 mb-1">
                          {highlightText(evidence.snippet, searchQuery)}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {evidence.folderName}
                        </Badge>
                      </div>
                    ))}

                    {node.evidence.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs h-6"
                        onClick={(e) => {
                          e.stopPropagation()
                          // This would expand to show all evidence
                        }}
                      >
                        View {node.evidence.length - 1} more evidence pieces
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {uniqueNodes.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No results found</p>
              <p className="text-sm">
                Try adjusting your filters or search query to see more results.
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
