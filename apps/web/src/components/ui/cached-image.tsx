'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface CachedImageProps {
  src: string
  alt: string
  className?: string
  width: number
  height: number
  priority?: boolean
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  onLoad?: () => void
  onError?: () => void
  sizes?: string
  style?: React.CSSProperties
}

// In-memory cache for image load states
const imageCache = new Map<string, 'loading' | 'loaded' | 'error'>()
const imagePreloadCache = new Set<string>()

// Preload images in the background
const preloadImage = (src: string) => {
  if (imagePreloadCache.has(src) || imageCache.get(src) === 'loaded') {
    return Promise.resolve()
  }

  imagePreloadCache.add(src)
  
  return new Promise<void>((resolve, reject) => {
    const img = new window.Image()
    img.onload = () => {
      imageCache.set(src, 'loaded')
      resolve()
    }
    img.onerror = () => {
      imageCache.set(src, 'error')
      reject()
    }
    img.src = src
  })
}

// Batch preload multiple images
export const preloadImages = (urls: string[]) => {
  return Promise.allSettled(urls.map(preloadImage))
}

export function CachedImage({
  src,
  alt,
  className,
  width,
  height,
  priority = false,
  quality = 85,
  placeholder = 'empty',
  blurDataURL,
  onLoad,
  onError,
  sizes,
  style,
  ...props
}: CachedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [isInView, setIsInView] = useState(priority)
  const imgRef = useRef<HTMLDivElement>(null)

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: '50px', // Start loading 50px before the image comes into view
        threshold: 0.1,
      }
    )

    observer.observe(imgRef.current)

    return () => observer.disconnect()
  }, [priority])

  // Check cache status
  useEffect(() => {
    const cacheStatus = imageCache.get(src)
    if (cacheStatus === 'loaded') {
      setIsLoading(false)
    } else if (cacheStatus === 'error') {
      setHasError(true)
      setIsLoading(false)
    }
  }, [src])

  const handleLoad = () => {
    imageCache.set(src, 'loaded')
    setIsLoading(false)
    setHasError(false)
    onLoad?.()
  }

  const handleError = () => {
    imageCache.set(src, 'error')
    setHasError(true)
    setIsLoading(false)
    onError?.()
  }

  // Generate a simple blur placeholder
  const generateBlurDataURL = (width: number = 10, height: number = 10) => {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#f3f4f6'
      ctx.fillRect(0, 0, width, height)
    }
    return canvas.toDataURL()
  }

  if (hasError) {
    return (
      <div 
        ref={imgRef}
        className={cn(
          'bg-gray-100 flex items-center justify-center text-gray-400 text-xs',
          className
        )}
        style={style}
      >
        <div className="text-center">
          <div className="text-lg">📷</div>
          <div>Image unavailable</div>
        </div>
      </div>
    )
  }

  return (
    <div ref={imgRef} className="relative">
      {/* Loading placeholder */}
      {isLoading && (
        <div 
          className="bg-gray-100 animate-pulse flex items-center justify-center"
          style={{ width, height }}
        >
          <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        </div>
      )}
      
      {/* Actual image - only render when in view or priority */}
      {(isInView || priority) && (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          quality={quality}
          placeholder={placeholder}
          blurDataURL={blurDataURL || (placeholder === 'blur' ? generateBlurDataURL() : undefined)}
          sizes={sizes}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'transition-opacity duration-300',
            isLoading ? 'opacity-0' : 'opacity-100',
            className
          )}
          style={{
            objectFit: 'cover',
            objectPosition: 'top',
            ...style
          }}
          // Enable aggressive caching
          unoptimized={false}
          {...props}
        />
      )}
    </div>
  )
}

// Hook for managing image cache
export const useImageCache = () => {
  const clearCache = () => {
    imageCache.clear()
    imagePreloadCache.clear()
  }

  const getCacheSize = () => imageCache.size

  const getCacheStatus = (src: string) => imageCache.get(src)

  const preloadClipImages = (clips: Array<{ screenshot_url?: string }>) => {
    const urls = clips
      .map(clip => clip.screenshot_url)
      .filter(Boolean) as string[]
    
    return preloadImages(urls)
  }

  return {
    clearCache,
    getCacheSize,
    getCacheStatus,
    preloadClipImages,
    preloadImages
  }
}

