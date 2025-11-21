'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { X, Download, FileText, Table, Code, FileCode, Book, CheckCircle2 } from 'lucide-react'
import { Clip, Folder } from '@pagestash/shared'
import { exportClips, downloadFile, type ExportFormat, type ExportOptions } from '@/lib/export'

interface ExportModalProps {
  clips: Clip[]
  folders: Folder[]
  isOpen: boolean
  onClose: () => void
}

type ExportFormatOption = {
  id: ExportFormat
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  category: 'document' | 'data' | 'citation'
}

const EXPORT_FORMATS: ExportFormatOption[] = [
  {
    id: 'bibliography_apa',
    label: 'APA Citation',
    description: 'Academic bibliography in APA format',
    icon: Book,
    category: 'citation'
  },
  {
    id: 'bibliography_mla',
    label: 'MLA Citation',
    description: 'Academic bibliography in MLA format',
    icon: Book,
    category: 'citation'
  },
  {
    id: 'bibliography_chicago',
    label: 'Chicago Citation',
    description: 'Academic bibliography in Chicago format',
    icon: Book,
    category: 'citation'
  },
  {
    id: 'markdown',
    label: 'Markdown',
    description: 'Formatted text with screenshots and notes',
    icon: FileText,
    category: 'document'
  },
  {
    id: 'html',
    label: 'HTML',
    description: 'Web page with beautiful formatting',
    icon: Code,
    category: 'document'
  },
  {
    id: 'csv',
    label: 'CSV Spreadsheet',
    description: 'Data for Excel or analysis',
    icon: Table,
    category: 'data'
  },
  {
    id: 'json',
    label: 'JSON',
    description: 'Structured data for developers',
    icon: FileCode,
    category: 'data'
  },
]

export function ExportModal({ clips, folders, isOpen, onClose }: ExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('markdown')
  const [isExporting, setIsExporting] = useState(false)
  const [exportSuccess, setExportSuccess] = useState(false)
  
  // Export options
  const [includeScreenshots, setIncludeScreenshots] = useState(true)
  const [includeNotes, setIncludeNotes] = useState(true)
  const [includeMetadata, setIncludeMetadata] = useState(true)
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'alphabetical'>('date')
  
  if (!isOpen) return null
  
  const handleExport = async () => {
    setIsExporting(true)
    setExportSuccess(false)
    
    try {
      const options: ExportOptions = {
        includeScreenshots,
        includeNotes,
        includeMetadata,
        sortBy,
      }
      
      const { content, filename, mimeType } = await exportClips(
        clips,
        selectedFormat,
        folders,
        options
      )
      
      downloadFile(content, filename, mimeType)
      setExportSuccess(true)
      
      // Auto-close after success
      setTimeout(() => {
        onClose()
        setExportSuccess(false)
      }, 1500)
      
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }
  
  const selectedFormatOption = EXPORT_FORMATS.find(f => f.id === selectedFormat)
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Export {clips.length} {clips.length === 1 ? 'Clip' : 'Clips'}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Choose a format and download your captures
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Format Selection - Citations */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center">
              <Book className="h-4 w-4 mr-2" />
              Citation Formats
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {EXPORT_FORMATS.filter(f => f.category === 'citation').map((format) => {
                const Icon = format.icon
                const isSelected = selectedFormat === format.id
                
                return (
                  <button
                    key={format.id}
                    onClick={() => setSelectedFormat(format.id)}
                    className={`
                      flex items-start p-4 rounded-xl border-2 transition-all text-left
                      ${isSelected 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30' 
                        : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }
                    `}
                  >
                    <div className={`
                      p-2 rounded-lg mr-3 flex-shrink-0
                      ${isSelected 
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }
                    `}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {format.label}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        {format.description}
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 ml-2" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
          
          {/* Format Selection - Documents */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Document Formats
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {EXPORT_FORMATS.filter(f => f.category === 'document').map((format) => {
                const Icon = format.icon
                const isSelected = selectedFormat === format.id
                
                return (
                  <button
                    key={format.id}
                    onClick={() => setSelectedFormat(format.id)}
                    className={`
                      flex items-start p-4 rounded-xl border-2 transition-all text-left
                      ${isSelected 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30' 
                        : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }
                    `}
                  >
                    <div className={`
                      p-2 rounded-lg mr-3 flex-shrink-0
                      ${isSelected 
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }
                    `}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {format.label}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        {format.description}
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 ml-2" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
          
          {/* Format Selection - Data */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center">
              <Table className="h-4 w-4 mr-2" />
              Data Formats
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {EXPORT_FORMATS.filter(f => f.category === 'data').map((format) => {
                const Icon = format.icon
                const isSelected = selectedFormat === format.id
                
                return (
                  <button
                    key={format.id}
                    onClick={() => setSelectedFormat(format.id)}
                    className={`
                      flex items-start p-4 rounded-xl border-2 transition-all text-left
                      ${isSelected 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30' 
                        : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }
                    `}
                  >
                    <div className={`
                      p-2 rounded-lg mr-3 flex-shrink-0
                      ${isSelected 
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }
                    `}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {format.label}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        {format.description}
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 ml-2" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
          
          {/* Export Options */}
          {(selectedFormat === 'markdown' || selectedFormat === 'html') && (
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 space-y-3">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Options
              </h3>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeScreenshots}
                  onChange={(e) => setIncludeScreenshots(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  Include screenshots
                </span>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeNotes}
                  onChange={(e) => setIncludeNotes(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  Include my notes
                </span>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeMetadata}
                  onChange={(e) => setIncludeMetadata(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  Include metadata (dates, folders)
                </span>
              </label>
              
              <div className="pt-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Sort by
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="date">Capture date</option>
                  <option value="title">Title (A-Z)</option>
                  <option value="alphabetical">Alphabetical</option>
                </select>
              </div>
            </div>
          )}
          
        </div>
        
        {/* Footer */}
        <div className="border-t border-slate-200 dark:border-slate-700 p-6 bg-slate-50/50 dark:bg-slate-900/50">
          {exportSuccess ? (
            <div className="flex items-center justify-center space-x-2 text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">Export successful!</span>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {selectedFormatOption && (
                  <span>
                    <strong>{clips.length}</strong> clips will be exported as <strong>{selectedFormatOption.label}</strong>
                  </span>
                )}
              </div>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={isExporting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                >
                  {isExporting ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
        
      </div>
    </div>
  )
}

