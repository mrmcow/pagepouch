'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Filter,
  Users,
  Link,
  Tag,
  FileText,
  ChevronDown,
  ChevronUp,
  X,
  Save,
  RotateCcw,
  Search,
  Sparkles,
  Shield,
  Clock,
  TrendingUp
} from 'lucide-react'
import { GraphFilters, SavedLens } from '@/types/graph-filters'

interface AdvancedFiltersProps {
  filters: GraphFilters
  onFiltersChange: (filters: GraphFilters) => void
  savedLenses: SavedLens[]
  onSaveLens: (name: string, description: string) => void
  onLoadLens: (lensId: string) => void
  onResetFilters: () => void
  className?: string
}

export function AdvancedFilters({
  filters,
  onFiltersChange,
  savedLenses,
  onSaveLens,
  onLoadLens,
  onResetFilters,
  className = ''
}: AdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [saveLensName, setSaveLensName] = useState('')
  const [saveLensDescription, setSaveLensDescription] = useState('')
  const [showSaveLens, setShowSaveLens] = useState(false)

  const updateConnectionFilters = (updates: Partial<typeof filters.connections>) => {
    onFiltersChange({
      ...filters,
      connections: { ...filters.connections, ...updates }
    })
  }

  const updateEntityFilters = (updates: Partial<typeof filters.entities>) => {
    onFiltersChange({
      ...filters,
      entities: { ...filters.entities, ...updates }
    })
  }

  const updateThemeFilters = (updates: Partial<typeof filters.themes>) => {
    onFiltersChange({
      ...filters,
      themes: { ...filters.themes, ...updates }
    })
  }

  const updateEvidenceFilters = (updates: Partial<typeof filters.evidence>) => {
    onFiltersChange({
      ...filters,
      evidence: { ...filters.evidence, ...updates }
    })
  }

  const addTag = (tagList: string[], newTag: string, updateFn: (tags: string[]) => void) => {
    if (newTag.trim() && !tagList.includes(newTag.trim())) {
      updateFn([...tagList, newTag.trim()])
    }
  }

  const removeTag = (tagList: string[], tagToRemove: string, updateFn: (tags: string[]) => void) => {
    updateFn(tagList.filter(tag => tag !== tagToRemove))
  }

  const handleSaveLens = () => {
    if (saveLensName.trim()) {
      onSaveLens(saveLensName.trim(), saveLensDescription.trim())
      setSaveLensName('')
      setSaveLensDescription('')
      setShowSaveLens(false)
    }
  }

  return (
    <Card className={`w-full ${className} shadow-sm`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-blue-600" />
            <CardTitle className="text-base">Advanced Filters</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onResetFilters}
              className="text-slate-500 hover:text-slate-700 h-8"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8"
            >
              {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </Button>
          </div>
        </div>
        <CardDescription className="text-sm">
          Filter your knowledge graph to focus on specific connections, entities, themes, and evidence
        </CardDescription>
      </CardHeader>

      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <Tabs defaultValue="connections" className="w-full">
              <TabsList className="grid w-full grid-cols-4 h-9">
                <TabsTrigger value="connections" className="flex items-center gap-1 text-xs">
                  <Link className="h-3 w-3" />
                  <span className="hidden sm:inline">Connections</span>
                </TabsTrigger>
                <TabsTrigger value="entities" className="flex items-center gap-1 text-xs">
                  <Users className="h-3 w-3" />
                  <span className="hidden sm:inline">Entities</span>
                </TabsTrigger>
                <TabsTrigger value="themes" className="flex items-center gap-1 text-xs">
                  <Tag className="h-3 w-3" />
                  <span className="hidden sm:inline">Themes</span>
                </TabsTrigger>
                <TabsTrigger value="evidence" className="flex items-center gap-1 text-xs">
                  <FileText className="h-3 w-3" />
                  <span className="hidden sm:inline">Evidence</span>
                </TabsTrigger>
              </TabsList>

              {/* Connections Tab */}
              <TabsContent value="connections" className="space-y-3 mt-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-3">
                    <Label>Connection View Mode</Label>
                    <Select 
                      value={filters.connections.viewMode || 'all'} 
                      onValueChange={(value) => updateConnectionFilters({ viewMode: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select connection type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Connections</SelectItem>
                        <SelectItem value="domains">By Website Domain</SelectItem>
                        <SelectItem value="folders">By Folder/Topic</SelectItem>
                        <SelectItem value="tags">By Tags</SelectItem>
                        <SelectItem value="temporal">By Time Period</SelectItem>
                        <SelectItem value="content">By Content Similarity</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <div className="space-y-2">
                      <Label>Connection Types</Label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { id: 'citation', label: 'Source Links', icon: '🔗' },
                          { id: 'same_topic', label: 'Same Folder', icon: '📁' },
                          { id: 'same_source', label: 'Same Website', icon: '🌐' },
                          { id: 'similar_content', label: 'Similar Content', icon: '📄' },
                          { id: 'same_session', label: 'Same Session', icon: '⏰' },
                          { id: 'tag_match', label: 'Shared Tags', icon: '🏷️' }
                        ].map(type => (
                          <Badge
                            key={type.id}
                            variant={filters.connections.edgeTypes.includes(type.id) ? "default" : "outline"}
                            className="cursor-pointer hover:bg-slate-100 transition-colors"
                            onClick={() => {
                              const newTypes = filters.connections.edgeTypes.includes(type.id)
                                ? filters.connections.edgeTypes.filter(t => t !== type.id)
                                : [...filters.connections.edgeTypes, type.id]
                              updateConnectionFilters({ edgeTypes: newTypes })
                            }}
                          >
                            <span className="mr-1">{type.icon}</span>
                            {type.label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Minimum Strength: {filters.connections.minStrength.toFixed(2)}</Label>
                    <Slider
                      value={[filters.connections.minStrength]}
                      onValueChange={([value]) => updateConnectionFilters({ minStrength: value })}
                      max={1}
                      min={0}
                      step={0.1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Minimum Sources</Label>
                    <Input
                      type="number"
                      value={filters.connections.minSources}
                      onChange={(e) => updateConnectionFilters({ minSources: parseInt(e.target.value) || 1 })}
                      min={1}
                      max={10}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Max Path Length</Label>
                    <Input
                      type="number"
                      value={filters.connections.maxPathLength}
                      onChange={(e) => updateConnectionFilters({ maxPathLength: parseInt(e.target.value) || 3 })}
                      min={1}
                      max={6}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Entities Tab */}
              <TabsContent value="entities" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Entity Types</Label>
                    <div className="flex flex-wrap gap-2">
                      {['person', 'organization', 'domain', 'place', 'event'].map(type => (
                        <Badge
                          key={type}
                          variant={filters.entities.includeTypes.includes(type) ? "default" : "outline"}
                          className="cursor-pointer capitalize"
                          onClick={() => {
                            const newTypes = filters.entities.includeTypes.includes(type)
                              ? filters.entities.includeTypes.filter(t => t !== type)
                              : [...filters.entities.includeTypes, type]
                            updateEntityFilters({ includeTypes: newTypes })
                          }}
                        >
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Minimum Confidence: {filters.entities.minConfidence.toFixed(2)}</Label>
                    <Slider
                      value={[filters.entities.minConfidence]}
                      onValueChange={([value]) => updateEntityFilters({ minConfidence: value })}
                      max={1}
                      min={0}
                      step={0.1}
                      className="w-full"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={filters.entities.verifiedOnly}
                      onCheckedChange={(checked) => updateEntityFilters({ verifiedOnly: checked })}
                    />
                    <Label>Verified entities only</Label>
                  </div>

                  <div className="space-y-2">
                    <Label>Minimum Importance: {filters.entities.minImportance.toFixed(2)}</Label>
                    <Slider
                      value={[filters.entities.minImportance]}
                      onValueChange={([value]) => updateEntityFilters({ minImportance: value })}
                      max={1}
                      min={0}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Themes Tab */}
              <TabsContent value="themes" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Semantic Search</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter semantic query (e.g., 'whistleblowing', 'supply chain')"
                        value={filters.themes.semanticQuery || ''}
                        onChange={(e) => updateThemeFilters({ semanticQuery: e.target.value })}
                      />
                      <Button variant="outline" size="sm">
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Similarity Threshold: {filters.themes.similarityThreshold.toFixed(2)}</Label>
                    <Slider
                      value={[filters.themes.similarityThreshold]}
                      onValueChange={([value]) => updateThemeFilters({ similarityThreshold: value })}
                      max={1}
                      min={0}
                      step={0.1}
                      className="w-full"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Include Tags</Label>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {filters.themes.includeTags.map(tag => (
                          <Badge key={tag} variant="default" className="text-xs">
                            {tag}
                            <X 
                              className="h-3 w-3 ml-1 cursor-pointer" 
                              onClick={() => removeTag(filters.themes.includeTags, tag, (tags) => updateThemeFilters({ includeTags: tags }))}
                            />
                          </Badge>
                        ))}
                      </div>
                      <Input
                        placeholder="Add tag..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addTag(filters.themes.includeTags, e.currentTarget.value, (tags) => updateThemeFilters({ includeTags: tags }))
                            e.currentTarget.value = ''
                          }
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Exclude Tags</Label>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {filters.themes.excludeTags.map(tag => (
                          <Badge key={tag} variant="destructive" className="text-xs">
                            {tag}
                            <X 
                              className="h-3 w-3 ml-1 cursor-pointer" 
                              onClick={() => removeTag(filters.themes.excludeTags, tag, (tags) => updateThemeFilters({ excludeTags: tags }))}
                            />
                          </Badge>
                        ))}
                      </div>
                      <Input
                        placeholder="Add tag to exclude..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addTag(filters.themes.excludeTags, e.currentTarget.value, (tags) => updateThemeFilters({ excludeTags: tags }))
                            e.currentTarget.value = ''
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Sentiment Range</Label>
                    <div className="px-2">
                      <Slider
                        value={[filters.themes.sentimentRange.min, filters.themes.sentimentRange.max]}
                        onValueChange={([min, max]) => updateThemeFilters({ 
                          sentimentRange: { min, max } 
                        })}
                        max={1}
                        min={-1}
                        step={0.1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-slate-500 mt-1">
                        <span>Negative ({filters.themes.sentimentRange.min.toFixed(1)})</span>
                        <span>Positive ({filters.themes.sentimentRange.max.toFixed(1)})</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Evidence Tab */}
              <TabsContent value="evidence" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Minimum Excerpts</Label>
                    <Input
                      type="number"
                      value={filters.evidence.minExcerpts}
                      onChange={(e) => updateEvidenceFilters({ minExcerpts: parseInt(e.target.value) || 1 })}
                      min={1}
                      max={10}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Minimum Sources</Label>
                    <Input
                      type="number"
                      value={filters.evidence.minDistinctSources}
                      onChange={(e) => updateEvidenceFilters({ minDistinctSources: parseInt(e.target.value) || 1 })}
                      min={1}
                      max={10}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Required Provenance</Label>
                    <div className="flex flex-wrap gap-2">
                      {['quote', 'url', 'screenshot'].map(type => (
                        <Badge
                          key={type}
                          variant={filters.evidence.requireProvenance.includes(type as any) ? "default" : "outline"}
                          className="cursor-pointer capitalize"
                          onClick={() => {
                            const newTypes = filters.evidence.requireProvenance.includes(type as any)
                              ? filters.evidence.requireProvenance.filter(t => t !== type)
                              : [...filters.evidence.requireProvenance, type as any]
                            updateEvidenceFilters({ requireProvenance: newTypes })
                          }}
                        >
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Review Status</Label>
                    <div className="flex flex-wrap gap-2">
                      {['pending', 'verified', 'disputed'].map(status => (
                        <Badge
                          key={status}
                          variant={filters.evidence.reviewStatus.includes(status as any) ? "default" : "outline"}
                          className="cursor-pointer capitalize"
                          onClick={() => {
                            const newStatuses = filters.evidence.reviewStatus.includes(status as any)
                              ? filters.evidence.reviewStatus.filter(s => s !== status)
                              : [...filters.evidence.reviewStatus, status as any]
                            updateEvidenceFilters({ reviewStatus: newStatuses })
                          }}
                        >
                          {status}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Confidence Range</Label>
                    <div className="px-2">
                      <Slider
                        value={[filters.evidence.confidenceRange.min, filters.evidence.confidenceRange.max]}
                        onValueChange={([min, max]) => updateEvidenceFilters({ 
                          confidenceRange: { min, max } 
                        })}
                        max={1}
                        min={0}
                        step={0.1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-slate-500 mt-1">
                        <span>Low ({filters.evidence.confidenceRange.min.toFixed(1)})</span>
                        <span>High ({filters.evidence.confidenceRange.max.toFixed(1)})</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={filters.evidence.includeConflicts}
                      onCheckedChange={(checked) => updateEvidenceFilters({ includeConflicts: checked })}
                    />
                    <Label>Include conflicting evidence</Label>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Saved Lenses Section */}
            <div className="mt-6 pt-4 border-t">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  Saved Lenses
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSaveLens(!showSaveLens)}
                >
                  <Save className="h-4 w-4 mr-1" />
                  Save Current
                </Button>
              </div>

              {showSaveLens && (
                <div className="space-y-2 mb-4 p-3 bg-slate-50 rounded-lg">
                  <Input
                    placeholder="Lens name..."
                    value={saveLensName}
                    onChange={(e) => setSaveLensName(e.target.value)}
                  />
                  <Input
                    placeholder="Description (optional)..."
                    value={saveLensDescription}
                    onChange={(e) => setSaveLensDescription(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveLens}>Save</Button>
                    <Button size="sm" variant="outline" onClick={() => setShowSaveLens(false)}>Cancel</Button>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {savedLenses.map(lens => (
                  <Badge
                    key={lens.id}
                    variant="outline"
                    className="cursor-pointer hover:bg-purple-50"
                    onClick={() => onLoadLens(lens.id)}
                  >
                    {lens.name}
                  </Badge>
                ))}
                {savedLenses.length === 0 && (
                  <p className="text-sm text-slate-500">No saved lenses yet. Save your current filter configuration to reuse it later.</p>
                )}
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
