'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { X, Trash2 } from 'lucide-react'

export interface Annotation {
  id: string
  x: number
  y: number
  width: number
  height: number
  color: string
  note?: string
  createdAt: string
}

interface ScreenshotAnnotationCanvasProps {
  imageUrl: string
  imageAlt: string
  annotations?: Annotation[]
  onAddAnnotation?: (annotation: Omit<Annotation, 'id' | 'createdAt' | 'note'>, note: string) => Promise<void>
  onDeleteAnnotation?: (annotationId: string) => Promise<void>
  onClickAnnotation?: (annotation: Annotation) => void
}

export function ScreenshotAnnotationCanvas({
  imageUrl,
  imageAlt,
  annotations = [],
  onAddAnnotation,
  onDeleteAnnotation,
  onClickAnnotation
}: ScreenshotAnnotationCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentAnnotation, setCurrentAnnotation] = useState<{
    startX: number
    startY: number
    currentX: number
    currentY: number
  } | null>(null)
  const [pendingAnnotation, setPendingAnnotation] = useState<{
    x: number
    y: number
    width: number
    height: number
    color: string
  } | null>(null)
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 })
  const annotationColor = '#3b82f6' // Always blue
  const [showAddNote, setShowAddNote] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [selectedText, setSelectedText] = useState('')

  // Update canvas size when image loads or window resizes
  useEffect(() => {
    if (!imageLoaded || !imageRef.current || !canvasRef.current) return

    const updateCanvasSize = () => {
      const img = imageRef.current!
      const canvas = canvasRef.current!
      
      // Get the rendered size of the image
      const rect = img.getBoundingClientRect()
      
      // Set canvas size to match displayed image size
      canvas.width = rect.width
      canvas.height = rect.height
      
      setImageDimensions({ width: rect.width, height: rect.height })
      
      // Redraw annotations
      redrawAnnotations()
    }

    updateCanvasSize()
    
    window.addEventListener('resize', updateCanvasSize)
    return () => window.removeEventListener('resize', updateCanvasSize)
  }, [imageLoaded, annotations])

  // Redraw all annotations on canvas
  const redrawAnnotations = useCallback(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw existing annotations
    annotations.forEach((annotation) => {
      const isSelected = annotation.id === selectedAnnotation
      
      ctx.strokeStyle = annotation.color
      ctx.fillStyle = annotation.color + '20' // 20 = ~12% opacity
      ctx.lineWidth = isSelected ? 3 : 2
      
      // Draw rectangle
      ctx.fillRect(annotation.x, annotation.y, annotation.width, annotation.height)
      ctx.strokeRect(annotation.x, annotation.y, annotation.width, annotation.height)
      
      // Draw selection indicator
      if (isSelected) {
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 1
        ctx.strokeRect(
          annotation.x - 2,
          annotation.y - 2,
          annotation.width + 4,
          annotation.height + 4
        )
      }
    })

    // Draw current annotation being drawn
    if (currentAnnotation) {
      const { startX, startY, currentX, currentY } = currentAnnotation
      const x = Math.min(startX, currentX)
      const y = Math.min(startY, currentY)
      const width = Math.abs(currentX - startX)
      const height = Math.abs(currentY - startY)

      ctx.strokeStyle = annotationColor
      ctx.fillStyle = annotationColor + '20'
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      
      ctx.fillRect(x, y, width, height)
      ctx.strokeRect(x, y, width, height)
      
      ctx.setLineDash([])
    }
  }, [annotations, selectedAnnotation, currentAnnotation, annotationColor])

  // Handle mouse down
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Check if clicking on existing annotation first
    const clickedAnnotation = [...annotations].reverse().find(ann => {
      return x >= ann.x && x <= ann.x + ann.width &&
             y >= ann.y && y <= ann.y + ann.height
    })

    if (clickedAnnotation) {
      // Show note for existing annotation
      if (onClickAnnotation) {
        onClickAnnotation(clickedAnnotation)
      }
      return
    }

    // Start drawing new annotation
    setIsDrawing(true)
    setCurrentAnnotation({
      startX: x,
      startY: y,
      currentX: x,
      currentY: y
    })
  }

  // Handle mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentAnnotation) return

    const rect = canvasRef.current!.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setCurrentAnnotation({
      ...currentAnnotation,
      currentX: x,
      currentY: y
    })

    redrawAnnotations()
  }

  // Handle mouse up
  const handleMouseUp = () => {
    if (!isDrawing || !currentAnnotation) return

    const { startX, startY, currentX, currentY } = currentAnnotation
    const x = Math.min(startX, currentX)
    const y = Math.min(startY, currentY)
    const width = Math.abs(currentX - startX)
    const height = Math.abs(currentY - startY)

    // Only show note dialog if annotation is big enough (at least 10x10 pixels)
    if (width > 10 && height > 10) {
      setPendingAnnotation({
        x,
        y,
        width,
        height,
        color: annotationColor
      })
      setSelectedText(`Rectangle annotation (${Math.round(width)}x${Math.round(height)}px)`)
      setShowAddNote(true)
    }

    setIsDrawing(false)
    setCurrentAnnotation(null)
  }

  // Handle add note submission
  const handleAddNote = async () => {
    if (!pendingAnnotation || !noteText.trim() || !onAddAnnotation) return

    await onAddAnnotation(pendingAnnotation, noteText.trim())
    
    setShowAddNote(false)
    setNoteText('')
    setPendingAnnotation(null)
    setSelectedText('')
  }

  // Handle cancel note
  const handleCancelNote = () => {
    setShowAddNote(false)
    setNoteText('')
    setPendingAnnotation(null)
    setSelectedText('')
  }

  // Delete selected annotation
  const handleDeleteAnnotation = async () => {
    if (selectedAnnotation && onDeleteAnnotation) {
      await onDeleteAnnotation(selectedAnnotation)
      setSelectedAnnotation(null)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-4 p-3 border-b bg-background">
        {/* Instructions */}
        <div className="text-xs text-muted-foreground">
          Click and drag to draw annotation • Click existing annotation to view note
        </div>
      </div>

      {/* Add Note Modal */}
      {showAddNote && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="bg-background border rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg">Add Note for Selection</h3>
                <p className="text-xs text-muted-foreground mt-1">Selected: {selectedText}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelNote}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="mb-4">
              <label className="text-sm font-medium mb-2 block">Your Note:</label>
              <Textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add your thoughts about this selection..."
                className="min-h-[120px] resize-none"
                autoFocus
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={handleCancelNote}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddNote}
                disabled={!noteText.trim()}
              >
                Add Note
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Canvas Container */}
      <div ref={containerRef} className="flex-1 bg-muted/30 p-4 overflow-auto">
        <div className="relative inline-block bg-white rounded border shadow-sm">
          {/* Image */}
          <img
            ref={imageRef}
            src={imageUrl}
            alt={imageAlt}
            className="block"
            style={{
              height: 'auto',
              width: 'auto',
              maxWidth: '100%'
            }}
            onLoad={() => setImageLoaded(true)}
          />

          {/* Annotation Canvas Overlay */}
          {imageLoaded && (
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0"
              style={{
                cursor: 'crosshair'
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={() => {
                if (isDrawing) handleMouseUp()
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}

