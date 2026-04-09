'use client'

import React from 'react'

/** Strip internal annotation metadata before display */
function cleanSnippet(text: string): string {
  if (!text) return text
  let cleaned = text.replace(/📍 SCREENSHOT \[[^\]]*\]/g, '').trim()
  cleaned = cleaned.replace(/^>\s*[""]|[""]$/gm, '').trim()
  cleaned = cleaned.replace(/\n{2,}/g, '\n').trim()
  return cleaned || text
}

import { Badge } from '@/components/ui/badge'
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

  const getNodeTypeLabel = (type: string) => {
    switch (type) {
      case 'clip': return 'page'
      case 'domain': return 'website'
      case 'folder': return 'topic'
      default: return type
    }
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
    <div className={`h-full flex flex-col bg-white dark:bg-slate-900 ${className}`}>
      <div className="px-4 py-3 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/80">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm text-slate-900 dark:text-white">Knowledge Explorer</h3>
          <Badge variant="outline" className="text-[11px] px-2 py-0.5 text-slate-500 dark:text-slate-400">
            {filteredNodes.length} entities
          </Badge>
        </div>
        <div className="mt-0.5">
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {searchQuery ? `Filtered for "${searchQuery}"` : 'Click any entity to explore connections and evidence'}
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
                className={`group cursor-pointer transition-all duration-200 border-l-2 ${
                  isSelected
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-l-blue-500'
                    : 'border-l-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:border-l-slate-300'
                } px-3 py-2.5 border-b border-slate-100 dark:border-white/5`}
                onClick={() => onNodeSelect(node.id)}
                onMouseEnter={() => onNodeHover(node.id)}
                onMouseLeave={() => onNodeHover(null)}
              >
                {/* Entity Header */}
                <div className="flex items-start gap-2 mb-2 min-w-0">
                  <div
                    className="p-1.5 rounded-lg flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: `${node.color}18`, color: node.color }}
                  >
                    {getNodeIcon(node.type)}
                  </div>
                  <div className="min-w-0 flex-1 overflow-hidden">
                    {/* Allow up to 3 lines so long titles don't feel brutally cut */}
                    <h3 className="text-[13px] font-semibold text-slate-900 dark:text-white leading-[1.35] line-clamp-3 break-words">
                      {highlightText(node.label, searchQuery)}
                    </h3>
                    {/* Wrap stats onto multiple lines rather than overflow */}
                    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                      <span className="capitalize">{getNodeTypeLabel(node.type)}</span>
                      <span className="opacity-40">·</span>
                      <span className="whitespace-nowrap">{connectionCount} connection{connectionCount !== 1 ? 's' : ''}</span>
                      {node.evidence.length > 0 && (
                        <>
                          <span className="opacity-40">·</span>
                          <span className="whitespace-nowrap">{node.evidence.length} clip{node.evidence.length !== 1 ? 's' : ''}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Evidence clips */}
                <div className="space-y-1 ml-8 min-w-0">
                  {node.evidence.slice(0, 3).map((evidence, index) => (
                    <div
                      key={index}
                      className="group/ev flex items-start gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-700/40 cursor-pointer transition-colors min-w-0"
                      onClick={(e) => { e.stopPropagation(); onEvidenceView(evidence.clipId) }}
                    >
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <p className="text-[12px] font-medium text-slate-700 dark:text-slate-200 line-clamp-2 leading-[1.35] break-words">
                          {highlightText(evidence.clipTitle, searchQuery)}
                        </p>
                        {(() => {
                          const cleaned = cleanSnippet(evidence.snippet)
                          const isReal = cleaned && !cleaned.startsWith('Content sourced') && !cleaned.startsWith('Both clips') && !cleaned.startsWith('Clips created') && !cleaned.startsWith('Content similarity')
                          return isReal ? (
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 line-clamp-2 mt-0.5 leading-[1.35] break-words">
                              {highlightText(cleaned, searchQuery)}
                            </p>
                          ) : null
                        })()}
                        {/* Folder + external link row — properly constrained */}
                        <div className="flex items-center gap-1.5 mt-1 min-w-0">
                          <div className="flex-1 min-w-0">
                            {evidence.folderId && onFolderNavigate ? (
                              <button
                                onClick={(e) => { e.stopPropagation(); onFolderNavigate(evidence.folderId ?? null) }}
                                className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline block w-full text-left truncate"
                              >
                                {evidence.folderName}
                              </button>
                            ) : (
                              <span className="text-[11px] text-slate-400 block truncate">{evidence.folderName}</span>
                            )}
                          </div>
                          {evidence.url && (
                            <button
                              onClick={(e) => { e.stopPropagation(); window.open(evidence.url, '_blank') }}
                              className="opacity-0 group-hover/ev:opacity-100 transition-opacity flex-shrink-0"
                            >
                              <ExternalLink className="h-3 w-3 text-slate-400 hover:text-slate-600" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {node.evidence.length > 3 && (
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 ml-8 mt-1.5">
                    +{node.evidence.length - 3} more clip{node.evidence.length - 3 !== 1 ? 's' : ''}
                  </p>
                )}
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
