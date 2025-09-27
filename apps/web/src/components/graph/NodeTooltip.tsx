'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  Star,
  Link as LinkIcon
} from 'lucide-react'
import { EnhancedGraphNode } from '@/types/graph-filters'

interface NodeTooltipProps {
  node: EnhancedGraphNode
  position: { x: number; y: number }
  connectionCount: number
  onViewEvidence: (clipId: string) => void
  onAddNote?: (nodeId: string) => void
  onMarkImportant?: (nodeId: string) => void
}

export function NodeTooltip({ 
  node, 
  position, 
  connectionCount, 
  onViewEvidence,
  onAddNote,
  onMarkImportant 
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

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) return { variant: 'default' as const, label: 'High', color: 'bg-green-100 text-green-800' }
    if (confidence >= 0.6) return { variant: 'secondary' as const, label: 'Medium', color: 'bg-yellow-100 text-yellow-800' }
    return { variant: 'outline' as const, label: 'Low', color: 'bg-red-100 text-red-800' }
  }

  const confidenceBadge = getConfidenceBadge(node.confidence || 0.5)

  // Position tooltip to avoid going off-screen
  const tooltipStyle: React.CSSProperties = {
    position: 'fixed',
    left: Math.min(position.x + 10, window.innerWidth - 320),
    top: Math.min(position.y - 10, window.innerHeight - 300),
    zIndex: 100000,
    maxWidth: '300px',
    pointerEvents: 'none'
  }

  return (
    <div style={tooltipStyle}>
      <Card className="shadow-lg border-2 bg-white/95 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div 
                className="p-1.5 rounded-full"
                style={{ backgroundColor: `${node.color}20`, color: node.color }}
              >
                {getNodeIcon(node.type)}
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">
                  {node.label}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs capitalize">
                    {node.type}
                  </Badge>
                  <Badge variant={confidenceBadge.variant} className={`text-xs ${confidenceBadge.color}`}>
                    {confidenceBadge.label}
                  </Badge>
                  {node.verified && (
                    <Badge variant="default" className="text-xs bg-blue-100 text-blue-800">
                      <Shield className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-3">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-slate-600">
                <TrendingUp className="h-3 w-3" />
              </div>
              <div className="font-medium">{(node.importance * 100).toFixed(0)}%</div>
              <div className="text-slate-500">Importance</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-slate-600">
                <LinkIcon className="h-3 w-3" />
              </div>
              <div className="font-medium">{connectionCount}</div>
              <div className="text-slate-500">Connections</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-slate-600">
                <FileText className="h-3 w-3" />
              </div>
              <div className="font-medium">{node.evidence.length}</div>
              <div className="text-slate-500">Evidence</div>
            </div>
          </div>

          {/* Topics */}
          {node.topics.length > 0 && (
            <div>
              <div className="text-xs font-medium text-slate-700 mb-1">Topics</div>
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
              <div className="text-xs font-medium text-slate-700 mb-1">Recent Evidence</div>
              <div className="bg-slate-50 rounded p-2 text-xs">
                <div className="font-medium text-slate-700 truncate mb-1">
                  {node.evidence[0].clipTitle}
                </div>
                <p className="text-slate-600 line-clamp-2 mb-1">
                  {node.evidence[0].snippet}
                </p>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {node.evidence[0].folderName}
                  </Badge>
                  <div className="flex items-center gap-1 text-slate-500">
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
                className="h-6 text-xs px-2"
                onClick={(e) => {
                  e.stopPropagation()
                  onViewEvidence(node.evidence[0].clipId)
                }}
              >
                <Eye className="h-3 w-3 mr-1" />
                View
              </Button>
            )}
            {onAddNote && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs px-2"
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
                className="h-6 text-xs px-2"
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
