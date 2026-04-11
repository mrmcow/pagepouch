'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { X, Trash2, Square, Circle, ArrowUpRight, Minus } from 'lucide-react'

export type AnnotationShape = 'rectangle' | 'circle' | 'arrow' | 'line'

export interface Annotation {
  id: string
  x: number
  y: number
  width: number
  height: number
  color: string
  shape?: AnnotationShape
  note?: string
  createdAt: string
}

interface ScreenshotAnnotationCanvasProps {
  imageUrl: string
  imageAlt: string
  annotations?: Annotation[]
  highlightedPosition?: {x: number, y: number} | null
  onAddAnnotation?: (annotation: Omit<Annotation, 'id' | 'createdAt' | 'note'>, note: string, thumbnail: string) => Promise<void>
  onDeleteAnnotation?: (annotationId: string) => Promise<void>
  onClickAnnotation?: (annotation: Annotation) => void
}

export function ScreenshotAnnotationCanvas({
  imageUrl,
  imageAlt,
  annotations = [],
  highlightedPosition,
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
  const annotationColor = '#3b82f6'
  const [activeShape, setActiveShape] = useState<AnnotationShape>('rectangle')
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

    const drawShape = (
      shape: AnnotationShape | undefined,
      x: number, y: number, w: number, h: number,
      strokeColor: string, fillColor: string, lineWidth: number,
      dashed = false,
    ) => {
      ctx.strokeStyle = strokeColor
      ctx.fillStyle = fillColor
      ctx.lineWidth = lineWidth
      if (dashed) ctx.setLineDash([5, 5])
      else ctx.setLineDash([])

      const s = shape || 'rectangle'
      if (s === 'rectangle') {
        ctx.fillRect(x, y, w, h)
        ctx.strokeRect(x, y, w, h)
      } else if (s === 'circle') {
        const cx = x + w / 2, cy = y + h / 2
        const rx = Math.abs(w) / 2, ry = Math.abs(h) / 2
        ctx.beginPath()
        ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI)
        ctx.fill()
        ctx.stroke()
      } else if (s === 'arrow') {
        const sx = x, sy = y, ex = x + w, ey = y + h
        ctx.beginPath()
        ctx.moveTo(sx, sy)
        ctx.lineTo(ex, ey)
        ctx.stroke()
        const angle = Math.atan2(ey - sy, ex - sx)
        const headLen = Math.min(16, Math.hypot(w, h) * 0.3)
        ctx.beginPath()
        ctx.moveTo(ex, ey)
        ctx.lineTo(ex - headLen * Math.cos(angle - Math.PI / 6), ey - headLen * Math.sin(angle - Math.PI / 6))
        ctx.lineTo(ex - headLen * Math.cos(angle + Math.PI / 6), ey - headLen * Math.sin(angle + Math.PI / 6))
        ctx.closePath()
        ctx.fillStyle = strokeColor
        ctx.fill()
      } else if (s === 'line') {
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(x + w, y + h)
        ctx.stroke()
      }
      ctx.setLineDash([])
    }

    annotations.forEach((annotation) => {
      const isSelected = annotation.id === selectedAnnotation
      const isHighlighted = highlightedPosition &&
        annotation.x === highlightedPosition.x &&
        annotation.y === highlightedPosition.y

      if (isHighlighted) {
        drawShape(annotation.shape, annotation.x, annotation.y, annotation.width, annotation.height, '#fbbf24', '#fef3c740', 4)
      } else {
        drawShape(annotation.shape, annotation.x, annotation.y, annotation.width, annotation.height, annotation.color, annotation.color + '20', isSelected ? 3 : 2)
      }

      if (isSelected) {
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 1
        ctx.setLineDash([])
        ctx.strokeRect(annotation.x - 2, annotation.y - 2, annotation.width + 4, annotation.height + 4)
      }
    })

    if (currentAnnotation) {
      const { startX, startY, currentX, currentY } = currentAnnotation
      drawShape(activeShape, startX, startY, currentX - startX, currentY - startY, annotationColor, annotationColor + '20', 2, true)
    }
  }, [annotations, selectedAnnotation, currentAnnotation, annotationColor, highlightedPosition])

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
    const isLinear = activeShape === 'arrow' || activeShape === 'line'
    const x = isLinear ? startX : Math.min(startX, currentX)
    const y = isLinear ? startY : Math.min(startY, currentY)
    const width = isLinear ? currentX - startX : Math.abs(currentX - startX)
    const height = isLinear ? currentY - startY : Math.abs(currentY - startY)
    const size = isLinear ? Math.hypot(width, height) : Math.max(Math.abs(width), Math.abs(height))

    if (size > 10) {
      setPendingAnnotation({ x, y, width, height, color: annotationColor })
      const shapeLabel = activeShape.charAt(0).toUpperCase() + activeShape.slice(1)
      setSelectedText(`${shapeLabel} annotation`)
      setShowAddNote(true)
    }

    setIsDrawing(false)
    setCurrentAnnotation(null)
  }

  // Generate thumbnail from annotation rectangle
  const generateThumbnail = async (annotation: { x: number, y: number, width: number, height: number }): Promise<string> => {
    if (!imageRef.current) {
      console.warn('No image ref available for thumbnail generation')
      return ''
    }
    
    try {
      const img = imageRef.current
      
      // Wait for image to be fully loaded
      if (!img.complete) {
        await new Promise((resolve) => {
          img.onload = resolve
        })
      }
      
      // Create offscreen canvas for cropping
      const canvas = document.createElement('canvas')
      const maxThumbSize = 80 // Max thumbnail dimension
      
      // Calculate scaled dimensions (maintain aspect ratio)
      const scale = Math.min(maxThumbSize / annotation.width, maxThumbSize / annotation.height)
      canvas.width = annotation.width * scale
      canvas.height = annotation.height * scale
      
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        console.warn('Failed to get 2d context for thumbnail')
        return ''
      }
      
      // Draw cropped area from image
      ctx.drawImage(
        img,
        annotation.x, annotation.y, annotation.width, annotation.height, // Source rectangle
        0, 0, canvas.width, canvas.height // Destination (scaled)
      )
      
      // Return as data URL
      return canvas.toDataURL('image/jpeg', 0.8)
    } catch (error) {
      console.error('Failed to generate thumbnail:', error)
      return ''
    }
  }

  // Handle add note submission
  const handleAddNote = async () => {
    if (!pendingAnnotation || !noteText.trim() || !onAddAnnotation) return

    // Generate thumbnail of annotated area
    const thumbnail = await generateThumbnail(pendingAnnotation)
    
    await onAddAnnotation(pendingAnnotation, noteText.trim(), thumbnail)
    
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
      {/* Shape Picker Toolbar */}
      <div className="border-b bg-background px-3 py-1.5 flex items-center gap-1">
        {([
          { shape: 'rectangle' as AnnotationShape, icon: Square, label: 'Rectangle' },
          { shape: 'circle' as AnnotationShape, icon: Circle, label: 'Circle' },
          { shape: 'arrow' as AnnotationShape, icon: ArrowUpRight, label: 'Arrow' },
          { shape: 'line' as AnnotationShape, icon: Minus, label: 'Line' },
        ]).map(({ shape, icon: Icon, label }) => (
          <button
            key={shape}
            onClick={() => setActiveShape(shape)}
            title={label}
            className={`p-1.5 rounded-md transition-colors ${
              activeShape === shape
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}
        <span className="text-xs text-muted-foreground ml-2">Draw on image to annotate</span>
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

      {/* Canvas Container - Scrollable for long screenshots */}
      <div 
        ref={containerRef}
        data-screenshot-container
        className="flex-1 bg-muted/30 p-4 overflow-auto"
        style={{
          maxHeight: 'calc(100vh - 200px)', // Ensure container has max height for scrolling
        }}
      >
        <div className="relative inline-block bg-white rounded border shadow-sm">
          {/* Image */}
          <img
            ref={imageRef}
            src={imageUrl}
            alt={imageAlt}
            crossOrigin="anonymous"
            className="block"
            style={{
              height: 'auto',
              width: 'auto',
              maxWidth: '100%',
              display: 'block' // Prevent inline spacing issues
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

