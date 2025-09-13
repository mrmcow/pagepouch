'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FolderPlus, Palette } from 'lucide-react'

interface CreateFolderModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateFolder: (name: string, color: string) => Promise<void>
}

const FOLDER_COLORS = [
  '#6B7280', // Gray
  '#EF4444', // Red
  '#F97316', // Orange
  '#EAB308', // Yellow
  '#22C55E', // Green
  '#06B6D4', // Cyan
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
]

export function CreateFolderModal({ isOpen, onClose, onCreateFolder }: CreateFolderModalProps) {
  const [name, setName] = useState('')
  const [selectedColor, setSelectedColor] = useState(FOLDER_COLORS[0])
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) return

    setIsLoading(true)
    try {
      await onCreateFolder(name.trim(), selectedColor)
      setName('')
      setSelectedColor(FOLDER_COLORS[0])
      onClose()
    } catch (error) {
      console.error('Failed to create folder:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setName('')
      setSelectedColor(FOLDER_COLORS[0])
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderPlus className="h-5 w-5" />
            Create New Folder
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Folder Name */}
          <div className="space-y-2">
            <Label htmlFor="folder-name">Folder Name</Label>
            <Input
              id="folder-name"
              placeholder="Enter folder name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              autoFocus
            />
          </div>

          {/* Color Selection */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Folder Color
            </Label>
            <div className="grid grid-cols-9 gap-2">
              {FOLDER_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`
                    w-8 h-8 rounded-full border-2 transition-all
                    ${selectedColor === color 
                      ? 'border-foreground scale-110' 
                      : 'border-border hover:border-foreground/50'
                    }
                  `}
                  style={{ backgroundColor: color }}
                  disabled={isLoading}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Preview:</p>
            <div className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-sm" 
                style={{ backgroundColor: selectedColor }}
              />
              <span className="font-medium">
                {name.trim() || 'New Folder'}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!name.trim() || isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Folder'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
