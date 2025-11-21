// Enhanced CTA Tracking Hook
// Tracks CTA clicks with full context (scroll depth, time on page, section visible)

import { useCallback, useEffect, useState } from 'react'
import * as analytics from '@/lib/analytics'
import { getCurrentScrollDepth } from './useScrollTracking'

interface CTATrackingOptions {
  ctaId: string
  ctaText: string
  ctaLocation: string
}

export function useCTATracking({ ctaId, ctaText, ctaLocation }: CTATrackingOptions) {
  const [pageLoadTime] = useState(Date.now())
  const [ctaClickCount, setCtaClickCount] = useState(0)

  const trackClick = useCallback(() => {
    const timeOnPage = (Date.now() - pageLoadTime) / 1000
    const scrollDepth = getCurrentScrollDepth()
    
    analytics.trackCTAClick({
      cta_id: ctaId,
      cta_text: ctaText,
      cta_location: ctaLocation,
      scroll_depth: scrollDepth,
      time_on_page: timeOnPage,
    })
    
    setCtaClickCount(prev => prev + 1)
  }, [ctaId, ctaText, ctaLocation, pageLoadTime])

  return {
    trackClick,
    ctaClickCount,
  }
}

// Hook for tracking hover intent on CTAs
export function useCTAHoverTracking({
  elementId,
  elementType = 'cta_button',
}: {
  elementId: string
  elementType?: 'cta_button' | 'pricing_card' | 'browser_selector' | 'link'
}) {
  const [hoverStartTime, setHoverStartTime] = useState<number | null>(null)

  const handleMouseEnter = useCallback(() => {
    setHoverStartTime(Date.now())
  }, [])

  const handleMouseLeave = useCallback(() => {
    if (hoverStartTime) {
      const hoverDuration = Date.now() - hoverStartTime
      
      analytics.trackElementHover({
        element_type: elementType,
        element_id: elementId,
        hover_duration: hoverDuration,
      })
      
      setHoverStartTime(null)
    }
  }, [hoverStartTime, elementId, elementType])

  return {
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
  }
}

// Exit Intent Tracking Hook
export function useExitIntentTracking() {
  const [pageLoadTime] = useState(Date.now())
  const [ctaInteractions, setCtaInteractions] = useState(0)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleMouseLeave = (e: MouseEvent) => {
      // Detect if mouse is leaving toward top of window (close button)
      if (e.clientY <= 0) {
        const timeOnPage = (Date.now() - pageLoadTime) / 1000
        const scrollDepth = getCurrentScrollDepth()
        
        // Determine current section
        const sections = ['hero', 'pricing', 'how_it_works', 'features', 'final_cta', 'faq']
        let currentSection = 'unknown'
        
        sections.forEach(section => {
          const element = document.querySelector(`[data-section="${section}"]`)
          if (element) {
            const rect = element.getBoundingClientRect()
            if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
              currentSection = section
            }
          }
        })
        
        analytics.trackExitIntent({
          page_section: currentSection,
          scroll_depth: scrollDepth,
          time_on_page: timeOnPage,
          cta_interactions: ctaInteractions,
        })
      }
    }

    document.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [pageLoadTime, ctaInteractions])

  return {
    incrementCTAInteractions: () => setCtaInteractions(prev => prev + 1),
  }
}

// Simple button click tracker with automatic context
export function useButtonClickTracking() {
  const [pageLoadTime] = useState(Date.now())

  const trackButtonClick = useCallback((
    buttonId: string,
    buttonText: string,
    buttonLocation: string,
    destination?: string
  ) => {
    const timeOnPage = (Date.now() - pageLoadTime) / 1000
    const scrollDepth = getCurrentScrollDepth()
    
    analytics.trackButtonClick({
      button_id: buttonId,
      button_text: buttonText,
      button_location: buttonLocation,
      destination,
    })
    
    analytics.trackCTAClick({
      cta_id: buttonId,
      cta_text: buttonText,
      cta_location: buttonLocation,
      scroll_depth: scrollDepth,
      time_on_page: timeOnPage,
    })
  }, [pageLoadTime])

  return trackButtonClick
}

