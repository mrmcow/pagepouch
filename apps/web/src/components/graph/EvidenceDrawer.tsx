'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  X,
  ExternalLink,
  Eye,
  FileText,
  Clock,
  User,
  Building2,
  Link as LinkIcon,
  Quote,
  Image as ImageIcon,
  Shield,
  AlertTriangle,
  CheckCircle,
  Star,
  TrendingUp
} from 'lucide-react'
import { EnhancedGraphNode, EnhancedGraphEdge, Evidence } from '@/types/graph-filters'

interface EvidenceDrawerProps {
  isOpen: boolean
  onClose: () => void
  selectedNode?: EnhancedGraphNode
  selectedEdge?: EnhancedGraphEdge
  onEvidenceView: (clipId: string) => void
  onNodeSelect: (nodeId: string) => void
  className?: string
}

export function EvidenceDrawer({
  isOpen,
  onClose,
  selectedNode,
  selectedEdge,
  onEvidenceView,
  onNodeSelect,
  className = ''
}: EvidenceDrawerProps) {
  
  const getProvenanceIcon = (evidence: Evidence) => {
    const icons = []
    if (evidence.provenance.hasQuote) icons.push(<Quote key="quote" className="h-3 w-3" />)
    if (evidence.provenance.hasUrl) icons.push(<LinkIcon key="url" className="h-3 w-3" />)
    if (evidence.provenance.hasScreenshot) icons.push(<ImageIcon key="screenshot" className="h-3 w-3" />)
    return icons
  }

  const getReviewStatusBadge = (status?: string) => {
    switch (status) {
      case 'verified':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Verified</Badge>
      case 'disputed':
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Disputed</Badge>
      case 'pending':
      default:
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
    }
  }

  const getSourceTypeBadge = (type: string) => {
    const colors = {
      primary: 'bg-blue-100 text-blue-800',
      secondary: 'bg-yellow-100 text-yellow-800',
      tertiary: 'bg-gray-100 text-gray-800'
    }
    return (
      <Badge variant="outline" className={colors[type as keyof typeof colors] || colors.tertiary}>
        {type.charAt(0).toUpperCase() + type.slice(1)} Source
      </Badge>
    )
  }

  const evidence = selectedNode?.evidence || selectedEdge?.evidence || []
  const title = selectedNode ? selectedNode.label : selectedEdge ? 'Connection Evidence' : 'Evidence'
  const description = selectedNode 
    ? `${evidence.length} evidence pieces for ${selectedNode.type}`
    : selectedEdge 
    ? `${evidence.length} evidence pieces supporting this connection`
    : 'No evidence selected'

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[600px] sm:max-w-[600px]">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {title}
              </SheetTitle>
              <SheetDescription>{description}</SheetDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <div className="mt-6">
          {/* Entity/Connection Summary */}
          {selectedNode && (
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div 
                    className="p-2 rounded-full"
                    style={{ backgroundColor: `${selectedNode.color}20`, color: selectedNode.color }}
                  >
                    {selectedNode.type === 'person' ? <User className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{selectedNode.label}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="capitalize">{selectedNode.type}</Badge>
                      <Badge variant="secondary">
                        <Star className="h-3 w-3 mr-1" />
                        {(selectedNode.importance * 100).toFixed(0)}% importance
                      </Badge>
                      {selectedNode.verified && (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          <Shield className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {selectedNode.topics.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm font-medium mb-2">Related Topics:</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedNode.topics.map(topic => (
                        <Badge key={topic} variant="secondary" className="text-xs">{topic}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-600">First Mentioned</p>
                    <p className="font-medium">{new Date(selectedNode.firstMention).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Last Mentioned</p>
                    <p className="font-medium">{new Date(selectedNode.lastMention).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Confidence</p>
                    <p className="font-medium">{(selectedNode.confidence * 100).toFixed(0)}%</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Mentions</p>
                    <p className="font-medium">{selectedNode.mentionFrequency}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {selectedEdge && (
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <LinkIcon className="h-5 w-5" />
                  Connection Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Connection Type</p>
                    <Badge variant="outline" className="capitalize">{selectedEdge.type.replace('_', ' ')}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Reason</p>
                    <p className="text-sm">{selectedEdge.connectionReason}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-600">Strength</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${selectedEdge.strength * 100}%` }}
                          />
                        </div>
                        <span className="font-medium">{(selectedEdge.strength * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-slate-600">Sources</p>
                      <p className="font-medium">{selectedEdge.sourceCount}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Evidence List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Supporting Evidence</h3>
              <Badge variant="outline">{evidence.length} pieces</Badge>
            </div>

            <ScrollArea className="h-[calc(100vh-400px)]">
              <div className="space-y-4 pr-4">
                {evidence.map((item, index) => (
                  <Card key={index} className="border-l-4" style={{ borderLeftColor: item.confidence > 0.7 ? '#10b981' : item.confidence > 0.4 ? '#f59e0b' : '#ef4444' }}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base mb-2">{item.clipTitle}</CardTitle>
                          <div className="flex items-center gap-2 mb-2">
                            {getReviewStatusBadge(item.reviewStatus)}
                            {getSourceTypeBadge(item.sourceType)}
                            <Badge variant="outline" className="text-xs">
                              {(item.confidence * 100).toFixed(0)}% confidence
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-600">
                            <Clock className="h-3 w-3" />
                            {new Date(item.timestamp).toLocaleDateString()}
                            <Separator orientation="vertical" className="h-3" />
                            <span>{item.folderName}</span>
                            {item.reviewer && (
                              <>
                                <Separator orientation="vertical" className="h-3" />
                                <User className="h-3 w-3" />
                                {item.reviewer}
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEvidenceView(item.clipId)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {item.url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(item.url, '_blank')}
                              className="h-8 w-8 p-0"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-slate-800 leading-relaxed">
                            "{item.snippet}"
                          </p>
                        </div>
                        
                        {item.context && (
                          <div className="bg-slate-50 rounded p-3">
                            <p className="text-xs text-slate-600 mb-1">Context:</p>
                            <p className="text-sm text-slate-700">{item.context}</p>
                          </div>
                        )}

                        {item.notes && (
                          <div className="bg-blue-50 rounded p-3">
                            <p className="text-xs text-blue-600 mb-1">Notes:</p>
                            <p className="text-sm text-blue-800">{item.notes}</p>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-600">Provenance:</span>
                            <div className="flex items-center gap-1">
                              {getProvenanceIcon(item)}
                            </div>
                          </div>
                          
                          {item.tags.length > 0 && (
                            <div className="flex items-center gap-1">
                              {item.tags.slice(0, 3).map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                              ))}
                              {item.tags.length > 3 && (
                                <Badge variant="outline" className="text-xs">+{item.tags.length - 3}</Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {evidence.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">No evidence available</p>
                    <p className="text-sm">
                      This entity or connection doesn't have supporting evidence yet.
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
