'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Users, 
  Building2, 
  Globe, 
  MapPin, 
  Calendar, 
  Tag,
  FileText,
  Eye,
  Clock,
  Star,
  Link as LinkIcon,
  X
} from 'lucide-react'
import { EnhancedGraphNode } from '@/types/graph-filters'

interface NodeTooltipProps {
  node: EnhancedGraphNode
  position: { x: number; y: number }
  connectionCount: number
  onViewEvidence: (clipId: string) => void
  onClose?: () => void
  onAddNote?: (nodeId: string) => void
  onMarkImportant?: (nodeId: string) => void
  isPersistent?: boolean
  isClipViewerOpen?: boolean
}

/** Strip internal annotation metadata (screenshot coords, base64 thumbs) from display text */
function cleanSnippet(text: string): string {
  if (!text) return text
  // Remove 📍 SCREENSHOT [...] annotation blocks
  let cleaned = text.replace(/📍 SCREENSHOT \[[^\]]*\]/g, '').trim()
  // Remove leftover "> " quote prefixes from formatted notes
  cleaned = cleaned.replace(/^>\s*[""]|[""]$/gm, '').trim()
  // Collapse multiple newlines
  cleaned = cleaned.replace(/\n{2,}/g, '\n').trim()
  return cleaned || text // fall back to original if nothing remains
}

export function NodeTooltip({ 
  node, 
  position, 
  connectionCount, 
  onViewEvidence,
  onClose,
  onAddNote, 
  onMarkImportant,
  isPersistent = false,
  isClipViewerOpen = false
}: NodeTooltipProps) {
  
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

  // Smart positioning to avoid going off-screen
  const getTooltipPosition = () => {
    const tooltipWidth = 320
    const tooltipHeight = 300 // Estimated height
    const margin = 10
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    
    let left = position.x + margin
    let top = position.y - margin
    
    // Adjust horizontal position
    if (left + tooltipWidth > viewportWidth) {
      // Try positioning to the left of the cursor
      left = position.x - tooltipWidth - margin
      
      // If still off-screen, clamp to viewport
      if (left < margin) {
        left = Math.max(margin, viewportWidth - tooltipWidth - margin)
      }
    }
    
    // Adjust vertical position
    if (top + tooltipHeight > viewportHeight) {
      // Try positioning above the cursor
      top = position.y - tooltipHeight - margin
      
      // If still off-screen, clamp to viewport
      if (top < margin) {
        top = Math.max(margin, viewportHeight - tooltipHeight - margin)
      }
    }
    
    // Ensure minimum margins
    left = Math.max(margin, Math.min(left, viewportWidth - tooltipWidth - margin))
    top = Math.max(margin, Math.min(top, viewportHeight - tooltipHeight - margin))
    
    return { left, top }
  }
  
  const { left, top } = getTooltipPosition()
  
  // Determine tooltip direction for arrow positioning
  const isTooltipLeft = left < position.x - 160 // Tooltip is to the left of node
  const isTooltipAbove = top < position.y - 150 // Tooltip is above the node
  
  const tooltipStyle: React.CSSProperties = {
    position: 'fixed',
    left,
    top,
    zIndex: isClipViewerOpen ? 10001 : 10002,
    maxWidth: '300px',
    pointerEvents: isPersistent ? 'auto' : 'none'
  }

  return (
    <div style={tooltipStyle} className="relative">
      {/* Connection indicator */}
      <div 
        className={`absolute w-2 h-2 bg-white dark:bg-slate-800 border-2 rotate-45 ${
          isTooltipLeft
            ? 'right-[-5px] top-4'
            : isTooltipAbove
              ? 'bottom-[-5px] left-4'
              : 'left-[-5px] top-4'
        } ${isPersistent ? 'border-blue-400' : 'border-slate-200 dark:border-slate-700'}`}
      />
      <Card className={`shadow-2xl border bg-white dark:bg-slate-800 ${isPersistent ? 'border-blue-400/60 shadow-blue-500/10' : 'border-slate-200 dark:border-slate-700'}`}>
        <CardHeader className="pb-2 pr-2">
          <div className="flex items-start gap-2">
            <div 
              className="p-1.5 rounded-full flex-shrink-0 mt-0.5"
              style={{ backgroundColor: `${node.color}20`, color: node.color }}
            >
              {getNodeIcon(node.type)}
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-sm font-semibold leading-snug text-slate-900 dark:text-white">
                {node.label}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                <span className="capitalize">{node.type === 'clip' ? 'page' : node.type === 'domain' ? 'website' : node.type}</span>
              </div>
            </div>
            {isPersistent && onClose && (
              <button
                onClick={(e) => { e.stopPropagation(); onClose() }}
                className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-3">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="text-center px-3 py-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <div className="font-semibold text-slate-900 dark:text-white text-base">{connectionCount}</div>
              <div className="text-slate-500 dark:text-slate-400 mt-0.5">Connections</div>
            </div>
            <div className="text-center px-3 py-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <div className="font-semibold text-slate-900 dark:text-white text-base">{node.evidence.length}</div>
              <div className="text-slate-500 dark:text-slate-400 mt-0.5">Clip{node.evidence.length !== 1 ? 's' : ''}</div>
            </div>
          </div>

          {/* Topics */}
          {node.topics.length > 0 && (
            <div>
              <div className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Topics</div>
              <div className="flex flex-wrap gap-1">
                {node.topics.slice(0, 3).map(topic => (
                  <Badge key={topic} variant="secondary" className="text-xs">
                    {topic}
                  </Badge>
                ))}
                {node.topics.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{node.topics.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Recent Evidence */}
          {node.evidence.length > 0 && (
            <div>
              <div className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Recent Evidence</div>
                <div 
                className="bg-slate-50 dark:bg-slate-800/60 rounded p-2 text-xs cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                onClick={(e) => {
                  e.stopPropagation()
                  onViewEvidence(node.evidence[0].clipId)
                }}
              >
                <div className="font-medium text-slate-700 dark:text-slate-200 truncate mb-1">
                  {node.evidence[0].clipTitle}
                </div>
                {(() => {
                  const cleaned = cleanSnippet(node.evidence[0].snippet)
                  return cleaned ? (
                    <p className="text-slate-500 dark:text-slate-400 line-clamp-2 mb-1">{cleaned}</p>
                  ) : null
                })()}
                <div className="flex items-center justify-between mt-1">
                  <Badge variant="outline" className="text-xs px-1.5 py-0">
                    {node.evidence[0].folderName}
                  </Badge>
                  <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500">
                    <Clock className="h-3 w-3" />
                    {new Date(node.lastMention).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex items-center gap-1 pt-1">
            {node.evidence.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs px-2 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                onClick={(e) => {
                  e.stopPropagation()
                  onViewEvidence(node.evidence[0].clipId)
                }}
              >
                <Eye className="h-3 w-3 mr-1" />
                View Clip
              </Button>
            )}
            {onAddNote && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs px-2 hover:bg-emerald-100 hover:text-emerald-600 transition-colors"
                onClick={(e) => {
                  e.stopPropagation()
                  onAddNote(node.id)
                }}
              >
                <FileText className="h-3 w-3 mr-1" />
                Note
              </Button>
            )}
            {onMarkImportant && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs px-2 hover:bg-amber-100 hover:text-amber-600 transition-colors"
                onClick={(e) => {
                  e.stopPropagation()
                  onMarkImportant(node.id)
                }}
              >
                <Star className="h-3 w-3 mr-1" />
                Star
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
