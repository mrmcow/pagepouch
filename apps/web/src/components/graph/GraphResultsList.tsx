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
  Shield,
  List,
  Star,
  Folder
} from 'lucide-react'
import { EnhancedGraphNode, EnhancedGraphEdge, Evidence } from '@/types/graph-filters'

interface GraphResultsListProps {
  nodes: EnhancedGraphNode[]
  edges: EnhancedGraphEdge[]
  selectedNodes: string[]
  onNodeSelect: (nodeId: string) => void
  onNodeHover: (nodeId: string | null) => void
  onEvidenceView: (clipId: string) => void
  onFolderNavigate?: (folderId: string | null) => void
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
  onFolderNavigate,
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

  // Filter nodes based on search query
  const filteredNodes = searchQuery 
    ? uniqueNodes.filter(node => {
        const query = searchQuery.toLowerCase()
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
    : uniqueNodes

  const sortedNodes = filteredNodes.sort((a, b) => {
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
      <div className="p-3 border-b bg-gradient-to-r from-slate-50 to-slate-100/50">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-base text-slate-900">Knowledge Explorer</h3>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs px-2 py-1">
              {filteredNodes.length} entities
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-slate-500 hover:text-slate-700"
              onClick={() => {
                // TODO: Toggle view mode
              }}
            >
              <List className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-slate-600">
            {searchQuery ? `Filtered results for "${searchQuery}"` : 'Click any entity to explore connections and evidence'}
          </p>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {sortedNodes.map(node => {
            const isSelected = selectedNodes.includes(node.id)
            const connectionCount = getConnectedNodes(node.id)
            
            return (
              <div
                key={node.id}
                className={`group cursor-pointer transition-all duration-200 hover:bg-slate-50 border-l-2 ${
                  isSelected 
                    ? 'bg-blue-50 border-l-blue-500' 
                    : 'border-l-transparent hover:border-l-slate-300'
                } p-2 border-b border-slate-100`}
                onClick={() => onNodeSelect(node.id)}
                onMouseEnter={() => onNodeHover(node.id)}
                onMouseLeave={() => onNodeHover(null)}
              >
                {/* Entity Header */}
                <div className="flex items-start justify-between mb-1.5">
                  <div className="flex items-start gap-2 min-w-0 flex-1">
                    <div 
                      className="p-1 rounded-full flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: `${node.color}20`, color: node.color }}
                    >
                      {getNodeIcon(node.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 leading-tight">
                        {highlightText(node.label, searchQuery)}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Badge variant="outline" className="text-xs px-1 py-0.5 leading-none">
                          {node.type}
                        </Badge>
                        {getConfidenceBadge(node.confidence)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500 flex-shrink-0 mt-0.5">
                    <Users className="h-3 w-3" />
                    <span>{connectionCount}</span>
                  </div>
                </div>

                {/* Evidence Summary */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {node.evidence.length} evidence
                    </span>
                    <span className="text-xs">{new Date(node.lastMention).toLocaleDateString()}</span>
                  </div>

                  {/* Evidence List */}
                  <div className="space-y-1">
                    {node.evidence.slice(0, 2).map((evidence, index) => (
                      <div key={index} className="group/evidence p-1.5 bg-slate-50 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                           onClick={(e) => {
                             e.stopPropagation()
                             onEvidenceView(evidence.clipId)
                           }}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-slate-700 line-clamp-1 leading-tight">
                              {evidence.clipTitle}
                            </p>
                            {/* Folder badge */}
                            <div className="flex items-center gap-1 mt-0.5">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (onFolderNavigate && evidence.folderId) {
                                    onFolderNavigate(evidence.folderId)
                                  }
                                }}
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded text-xs transition-colors"
                                title={`Navigate to ${evidence.folderName} folder`}
                              >
                                <Folder className="h-2.5 w-2.5" />
                                {evidence.folderName}
                              </button>
                            </div>
                            <p className="text-xs text-slate-500 line-clamp-2 mt-0.5 leading-tight">
                              {highlightText(evidence.snippet, searchQuery)}
                            </p>
                          </div>
                          <div className="flex items-center gap-0.5 opacity-0 group-hover/evidence:opacity-100 transition-opacity flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0 hover:bg-blue-100 hover:text-blue-600"
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
                                className="h-5 w-5 p-0 hover:bg-emerald-100 hover:text-emerald-600"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  window.open(evidence.url, '_blank')
                                }}
                              >
                                <ExternalLink className="h-2.5 w-2.5" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Show More Evidence */}
                  {node.evidence.length > 2 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs h-6 text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation()
                        // TODO: Show all evidence in drawer
                      }}
                    >
                      View {node.evidence.length - 2} more evidence piece{node.evidence.length - 2 !== 1 ? 's' : ''}
                    </Button>
                  )}

                  {/* Quick Actions */}
                  <div className="flex items-center gap-1 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost" 
                      size="sm"
                      className="text-xs h-5 px-1.5 hover:bg-blue-100 hover:text-blue-600"
                      onClick={(e) => {
                        e.stopPropagation()
                        // TODO: Show connections
                      }}
                    >
                      <Users className="h-2.5 w-2.5 mr-1" />
                      Links
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm" 
                      className="text-xs h-5 px-1.5 hover:bg-emerald-100 hover:text-emerald-600"
                      onClick={(e) => {
                        e.stopPropagation()
                        // TODO: Add to collection
                      }}
                    >
                      <Star className="h-2.5 w-2.5 mr-1" />
                      Save
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}

            {filteredNodes.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">
                {searchQuery ? `No results found for "${searchQuery}"` : 'No results found'}
              </p>
              <p className="text-sm">
                {searchQuery 
                  ? 'Try a different search term or clear the search to see all entities.'
                  : 'Try adjusting your filters to see more results.'
                }
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
