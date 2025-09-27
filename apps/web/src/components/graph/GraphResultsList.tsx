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
      <div className="p-4 border-b bg-gradient-to-r from-slate-50 to-slate-100/50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-lg text-slate-900">Results</h3>
          <Badge variant="default" className="bg-blue-100 text-blue-800 font-medium px-3 py-1">
            {uniqueNodes.length} entities
          </Badge>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-slate-700 font-medium">
            {searchQuery ? `Filtered results for "${searchQuery}"` : 'All entities in current view'}
          </p>
          {nodes.length !== uniqueNodes.length && (
            <p className="text-xs text-slate-500">
              {nodes.length - uniqueNodes.length} duplicate{nodes.length - uniqueNodes.length !== 1 ? 's' : ''} removed for clarity
            </p>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {sortedNodes.map(node => {
            const isSelected = selectedNodes.includes(node.id)
            const connectionCount = getConnectedNodes(node.id)
            
            return (
              <Card 
                key={node.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg border ${
                  isSelected 
                    ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-200' 
                    : 'hover:bg-slate-50 hover:border-slate-300 border-slate-200'
                }`}
                onClick={() => onNodeSelect(node.id)}
                onMouseEnter={() => onNodeHover(node.id)}
                onMouseLeave={() => onNodeHover(null)}
              >
                <CardHeader className="pb-1 px-2 pt-2">
                  <div className="flex items-start justify-between gap-1">
                    <div className="flex items-start gap-1 min-w-0 flex-1">
                      <div 
                        className="p-0.5 rounded flex-shrink-0"
                        style={{ backgroundColor: `${node.color}15`, color: node.color, border: `1px solid ${node.color}30` }}
                      >
                        {getNodeIcon(node.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-xs font-semibold text-slate-900 leading-tight mb-0.5 truncate">
                          {highlightText(node.label, searchQuery)}
                        </CardTitle>
                        <div className="flex items-center gap-0.5">
                          <Badge variant="outline" className="text-xs capitalize font-medium px-0.5 py-0">
                            {node.type}
                          </Badge>
                          {getConfidenceBadge(node.confidence)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-xs text-slate-600 flex-shrink-0 min-w-[35px]">
                      <div className="flex items-center gap-0.5 mb-0.5 justify-end">
                        <TrendingUp className="h-2 w-2 text-emerald-600" />
                        <span className="font-medium text-xs">{(node.importance * 100).toFixed(0)}%</span>
                      </div>
                      <div className="flex items-center gap-0.5 justify-end">
                        <Users className="h-2 w-2 text-blue-600" />
                        <span className="font-medium text-xs">{connectionCount}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0 px-2 pb-2">
                  {/* Topics */}
                  {node.topics.length > 0 && (
                    <div className="mb-1.5">
                      <div className="flex flex-wrap gap-0.5">
                        {node.topics.slice(0, 1).map(topic => (
                          <Badge key={topic} variant="secondary" className="text-xs px-1 py-0 bg-slate-100 text-slate-700">
                            {topic}
                          </Badge>
                        ))}
                        {node.topics.length > 1 && (
                          <Badge variant="outline" className="text-xs px-1 py-0 text-slate-500">
                            +{node.topics.length - 1}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Evidence Preview */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-0.5 text-slate-600 font-medium">
                        <FileText className="h-2.5 w-2.5" />
                        <span className="text-xs">{node.evidence.length}</span>
                      </span>
                      <span className="flex items-center gap-0.5 text-slate-500">
                        <Clock className="h-2.5 w-2.5" />
                        <span className="text-xs">{new Date(node.lastMention).toLocaleDateString()}</span>
                      </span>
                    </div>

                    {/* Top Evidence - Micro Compact */}
                    {node.evidence.slice(0, 1).map((evidence, index) => (
                      <div key={index} className="bg-slate-50 rounded p-1 border border-slate-200/50">
                        <div className="flex items-start gap-1 mb-1">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-slate-800 text-xs truncate">
                              {evidence.clipTitle}
                            </h4>
                            <p className="text-slate-600 text-xs line-clamp-1 mt-0.5">
                              {highlightText(evidence.snippet, searchQuery)}
                            </p>
                          </div>
                          <div className="flex items-center gap-0.5 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation()
                                onEvidenceView(evidence.clipId)
                              }}
                            >
                              <Eye className="h-2 w-2" />
                            </Button>
                            {evidence.url && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 hover:bg-emerald-100 hover:text-emerald-600 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  window.open(evidence.url, '_blank')
                                }}
                              >
                                <ExternalLink className="h-2 w-2" />
                              </Button>
                            )}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs px-1 py-0 bg-white/50 border-slate-300 truncate max-w-full">
                          {evidence.folderName}
                        </Badge>
                      </div>
                    ))}

                    {node.evidence.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs h-5 text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors border border-dashed border-slate-300 hover:border-slate-400"
                        onClick={(e) => {
                          e.stopPropagation()
                          // This would expand to show all evidence
                        }}
                      >
                        <FileText className="h-2 w-2 mr-0.5" />
                        +{node.evidence.length - 1}
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
