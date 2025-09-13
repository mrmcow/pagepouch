'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Edit3, Palette, Trash2, AlertTriangle } from 'lucide-react'
import { Folder } from '@pagepouch/shared'

interface EditFolderModalProps {
  folder: Folder | null
  isOpen: boolean
  onClose: () => void
  onUpdateFolder: (folderId: string, name: string, color: string) => Promise<void>
  onDeleteFolder: (folderId: string, deleteClips: boolean) => Promise<void>
  clipCount: number
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

export function EditFolderModal({ 
  folder, 
  isOpen, 
  onClose, 
  onUpdateFolder, 
  onDeleteFolder,
  clipCount 
}: EditFolderModalProps) {
  const [name, setName] = useState('')
  const [selectedColor, setSelectedColor] = useState(FOLDER_COLORS[0])
  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteClips, setDeleteClips] = useState(false)

  useEffect(() => {
    if (folder) {
      setName(folder.name)
      setSelectedColor(folder.color || FOLDER_COLORS[0])
      setShowDeleteConfirm(false)
      setDeleteClips(false)
    }
  }, [folder])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!folder || !name.trim()) return

    setIsLoading(true)
    try {
      await onUpdateFolder(folder.id, name.trim(), selectedColor)
      onClose()
    } catch (error) {
      console.error('Failed to update folder:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!folder) return

    setIsLoading(true)
    try {
      await onDeleteFolder(folder.id, deleteClips)
      onClose()
    } catch (error) {
      console.error('Failed to delete folder:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setShowDeleteConfirm(false)
      onClose()
    }
  }

  if (!folder) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5" />
            Edit Folder
          </DialogTitle>
        </DialogHeader>

        {!showDeleteConfirm ? (
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
                  {name.trim() || folder.name} ({clipCount})
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between">
              <Button 
                type="button" 
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Folder
              </Button>
              
              <div className="flex gap-3">
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
                  {isLoading ? 'Updating...' : 'Update Folder'}
                </Button>
              </div>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            {/* Delete Confirmation */}
            <div className="flex items-start gap-3 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
              <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-destructive mb-1">Delete Folder</h4>
                <p className="text-sm text-muted-foreground">
                  Are you sure you want to delete "{folder.name}"? This action cannot be undone.
                </p>
              </div>
            </div>

            {/* Clip Handling Options */}
            {clipCount > 0 && (
              <div className="space-y-3">
                <Label>What should happen to the {clipCount} clip{clipCount !== 1 ? 's' : ''} in this folder?</Label>
                <Select value={deleteClips ? 'delete' : 'keep'} onValueChange={(value) => setDeleteClips(value === 'delete')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="keep">Move clips to "No folder"</SelectItem>
                    <SelectItem value="delete">Delete all clips in this folder</SelectItem>
                  </SelectContent>
                </Select>
                
                {deleteClips && (
                  <div className="p-3 bg-destructive/10 rounded border border-destructive/20">
                    <p className="text-sm text-destructive font-medium">
                      ⚠️ This will permanently delete all {clipCount} clip{clipCount !== 1 ? 's' : ''} in this folder!
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Delete Actions */}
            <div className="flex justify-end gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                variant="destructive"
                onClick={handleDelete}
                disabled={isLoading}
              >
                {isLoading ? 'Deleting...' : 'Delete Folder'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
