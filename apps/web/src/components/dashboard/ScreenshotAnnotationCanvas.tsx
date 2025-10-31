'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Square, MousePointer, Trash2, Save } from 'lucide-react'

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
  onAddAnnotation?: (annotation: Omit<Annotation, 'id' | 'createdAt'>) => Promise<void>
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
  
  const [mode, setMode] = useState<'select' | 'draw'>('select')
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentAnnotation, setCurrentAnnotation] = useState<{
    startX: number
    startY: number
    currentX: number
    currentY: number
  } | null>(null)
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 })
  const [annotationColor, setAnnotationColor] = useState('#3b82f6')

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
    if (mode !== 'draw') {
      // Check if clicking on existing annotation
      const rect = canvasRef.current!.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      // Find annotation at click position (reverse order to get topmost)
      const clickedAnnotation = [...annotations].reverse().find(ann => {
        return x >= ann.x && x <= ann.x + ann.width &&
               y >= ann.y && y <= ann.y + ann.height
      })

      if (clickedAnnotation) {
        setSelectedAnnotation(clickedAnnotation.id)
        if (onClickAnnotation) {
          onClickAnnotation(clickedAnnotation)
        }
        redrawAnnotations()
      } else {
        setSelectedAnnotation(null)
        redrawAnnotations()
      }
      return
    }

    // Start drawing new annotation
    const rect = canvasRef.current!.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

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
  const handleMouseUp = async () => {
    if (!isDrawing || !currentAnnotation) return

    const { startX, startY, currentX, currentY } = currentAnnotation
    const x = Math.min(startX, currentX)
    const y = Math.min(startY, currentY)
    const width = Math.abs(currentX - startX)
    const height = Math.abs(currentY - startY)

    // Only save if annotation is big enough (at least 10x10 pixels)
    if (width > 10 && height > 10 && onAddAnnotation) {
      await onAddAnnotation({
        x,
        y,
        width,
        height,
        color: annotationColor
      })
    }

    setIsDrawing(false)
    setCurrentAnnotation(null)
    setMode('select') // Switch back to select mode after drawing
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
      <div className="flex items-center gap-2 p-3 border-b bg-background">
        <div className="flex items-center gap-1 border rounded-lg p-1">
          <Button
            variant={mode === 'select' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setMode('select')}
            className="h-8"
          >
            <MousePointer className="h-4 w-4 mr-1" />
            Select
          </Button>
          <Button
            variant={mode === 'draw' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setMode('draw')}
            className="h-8"
          >
            <Square className="h-4 w-4 mr-1" />
            Draw
          </Button>
        </div>

        {/* Color picker */}
        {mode === 'draw' && (
          <div className="flex items-center gap-2 ml-2">
            <span className="text-xs text-muted-foreground">Color:</span>
            <div className="flex gap-1">
              {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'].map((color) => (
                <button
                  key={color}
                  onClick={() => setAnnotationColor(color)}
                  className={`w-6 h-6 rounded border-2 ${
                    color === annotationColor ? 'border-foreground' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Delete button */}
        {selectedAnnotation && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDeleteAnnotation}
            className="h-8 ml-auto text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        )}

        {/* Instructions */}
        <div className="ml-auto text-xs text-muted-foreground">
          {mode === 'draw' 
            ? 'Click and drag to draw annotation' 
            : 'Click annotation to view note'}
        </div>
      </div>

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
              className="absolute top-0 left-0 cursor-crosshair"
              style={{
                cursor: mode === 'draw' ? 'crosshair' : 'pointer'
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

