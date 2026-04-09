'use client'

import React from 'react'
import { Search, X, Globe, Folder, Tag, Clock, Layers, RotateCcw } from 'lucide-react'

interface SimpleGraphControlsProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  /** Kept for API compatibility — always treated as 'all' internally */
  viewMode?: string
  onViewModeChange?: (mode: string) => void
  connectionTypes: string[]
  onConnectionTypesChange: (types: string[]) => void
  onResetFilters: () => void
  nodeCount: number
  connectionCount: number
  className?: string
}

const CONNECTION_TYPES = [
  { id: 'citation',    label: 'Same Website', icon: <Globe className="h-3 w-3" />,  color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-700' },
  { id: 'same_topic',  label: 'Same Topic',   icon: <Folder className="h-3 w-3" />, color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700' },
  { id: 'same_session',label: 'Same Session', icon: <Clock className="h-3 w-3" />,  color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-700' },
  { id: 'tag_match',   label: 'Shared Tags',  icon: <Tag className="h-3 w-3" />,    color: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 border-green-200 dark:border-green-700' },
]

export function SimpleGraphControls({
  searchQuery,
  onSearchChange,
  connectionTypes,
  onConnectionTypesChange,
  onResetFilters,
  className = ''
}: SimpleGraphControlsProps) {

  // Active filter: empty array means "All". Non-empty means exactly ONE type (single-select).
  const activeType = connectionTypes.length === 1 ? connectionTypes[0] : null

  const selectType = (typeId: string) => {
    // Clicking the already-active pill goes back to "All"
    if (activeType === typeId) {
      onConnectionTypesChange([])
    } else {
      onConnectionTypesChange([typeId])
    }
  }

  return (
    <div className={`bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-white/10 ${className}`}>
      <div className="px-4 py-2.5 flex items-center gap-3 flex-wrap">

        {/* Search */}
        <div className="relative min-w-[200px] flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            placeholder="Search entities or content..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-8 pl-8 pr-7 text-sm bg-slate-100 dark:bg-slate-800 border-none rounded-lg outline-none focus:ring-2 focus:ring-blue-500/40 text-slate-700 dark:text-slate-200 placeholder-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
            >
              <X className="h-3 w-3 text-slate-400" />
            </button>
          )}
        </div>

        <div className="w-px h-5 bg-slate-200 dark:bg-white/10 flex-shrink-0" />

        {/* Connection filter pills — single-select radio behaviour */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-slate-400 dark:text-slate-500 mr-0.5">View:</span>

          {/* All (default) */}
          <button
            onClick={() => onConnectionTypesChange([])}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium transition-all ${
              activeType === null
                ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900 border-transparent'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-transparent hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Layers className="h-3 w-3" />
            All
          </button>

          {CONNECTION_TYPES.map(type => (
            <button
              key={type.id}
              onClick={() => selectType(type.id)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium transition-all ${
                activeType === type.id
                  ? `${type.color} shadow-sm`
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-transparent hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {type.icon}
              {type.label}
            </button>
          ))}
        </div>

        {/* Reset */}
        <button
          onClick={onResetFilters}
          className="ml-auto flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <RotateCcw className="h-3 w-3" />
          Reset
        </button>
      </div>
    </div>
  )
}
