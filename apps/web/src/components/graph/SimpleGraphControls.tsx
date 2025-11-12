'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Search,
  X,
  Globe,
  Folder,
  Tag,
  Clock,
  FileText,
  RotateCcw,
  Layers
} from 'lucide-react'
import { GraphFilters } from '@/types/graph-filters'

interface SimpleGraphControlsProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  viewMode: string
  onViewModeChange: (mode: string) => void
  connectionTypes: string[]
  onConnectionTypesChange: (types: string[]) => void
  onResetFilters: () => void
  nodeCount: number
  connectionCount: number
  className?: string
}

const VIEW_MODES = [
  { id: 'all', label: 'All Connections', icon: Layers, description: 'Show all types of connections' },
  { id: 'domains', label: 'By Website', icon: Globe, description: 'Group by website domains' },
  { id: 'folders', label: 'By Topic', icon: Folder, description: 'Group by folders/topics' },
  { id: 'tags', label: 'By Tags', icon: Tag, description: 'Connect by shared tags' },
  { id: 'temporal', label: 'By Time', icon: Clock, description: 'Connect by time proximity' },
  { id: 'content', label: 'By Content', icon: FileText, description: 'Connect by content similarity' }
]

const CONNECTION_TYPES = [
  { id: 'citation', label: 'Source Links', icon: '🔗', color: 'bg-blue-100 text-blue-700' },
  { id: 'same_topic', label: 'Same Topic', icon: '📁', color: 'bg-purple-100 text-purple-700' },
  { id: 'same_source', label: 'Same Website', icon: '🌐', color: 'bg-green-100 text-green-700' },
  { id: 'similar_content', label: 'Similar Content', icon: '📄', color: 'bg-orange-100 text-orange-700' },
  { id: 'same_session', label: 'Same Session', icon: '⏰', color: 'bg-red-100 text-red-700' },
  { id: 'tag_match', label: 'Shared Tags', icon: '🏷️', color: 'bg-yellow-100 text-yellow-700' }
]

export function SimpleGraphControls({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  connectionTypes,
  onConnectionTypesChange,
  onResetFilters,
  nodeCount,
  connectionCount,
  className = ''
}: SimpleGraphControlsProps) {
  
  const selectedViewMode = VIEW_MODES.find(mode => mode.id === viewMode) || VIEW_MODES[0]
  
  const toggleConnectionType = (typeId: string) => {
    const newTypes = connectionTypes.includes(typeId)
      ? connectionTypes.filter(t => t !== typeId)
      : [...connectionTypes, typeId]
    onConnectionTypesChange(newTypes)
  }

  const clearSearch = () => {
    onSearchChange('')
  }

  return (
    <div className={`bg-white border-b border-slate-200 ${className}`}>
      {/* Top Row - Search and View Mode */}
      <div className="px-4 py-3 border-b border-slate-100">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Search */}
          <div className="flex-1 min-w-[280px] max-w-md relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search entities, content, or evidence..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-8 h-10"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-slate-100 rounded"
              >
                <X className="h-3 w-3 text-slate-400" />
              </button>
            )}
          </div>

          {/* View Mode Selector */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-700 whitespace-nowrap">View:</span>
            <Select value={viewMode} onValueChange={onViewModeChange}>
              <SelectTrigger className="w-[220px] h-10">
                <div className="flex items-center gap-2.5">
                  <selectedViewMode.icon className="h-4 w-4 flex-shrink-0" />
                  <SelectValue className="text-sm" />
                </div>
              </SelectTrigger>
              <SelectContent className="w-[280px]">
                {VIEW_MODES.map(mode => (
                  <SelectItem key={mode.id} value={mode.id} className="py-2.5">
                    <div className="flex items-center gap-3">
                      <mode.icon className="h-4 w-4 flex-shrink-0 text-slate-600" />
                      <div className="flex flex-col gap-0.5">
                        <div className="font-medium text-sm">{mode.label}</div>
                        <div className="text-xs text-slate-500">{mode.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Stats and Reset */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="text-sm text-slate-600 whitespace-nowrap">
              <span className="font-medium">{nodeCount}</span> entities • <span className="font-medium">{connectionCount}</span> connections
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onResetFilters}
              className="text-slate-500 hover:text-slate-700 h-10"
            >
              <RotateCcw className="h-4 w-4 mr-1.5" />
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Row - Connection Type Filters */}
      <div className="px-4 py-2.5">
        <div className="flex items-start gap-3 flex-wrap">
          <span className="text-sm font-medium text-slate-700 whitespace-nowrap pt-1">Show connections:</span>
          
          <div className="flex flex-wrap items-center gap-2">
            {/* All connections button */}
            <button
              onClick={() => onConnectionTypesChange([])}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                connectionTypes.length === 0
                  ? 'bg-blue-100 text-blue-700 border border-blue-200 shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              All Types
            </button>
            
            {/* Individual connection type buttons */}
            {CONNECTION_TYPES.map(type => {
              const isSelected = connectionTypes.includes(type.id)
              return (
                <button
                  key={type.id}
                  onClick={() => toggleConnectionType(type.id)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                    isSelected 
                      ? `${type.color} shadow-sm border border-opacity-20`
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  <span className="text-sm leading-none">{type.icon}</span>
                  <span>{type.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
