// Scroll Depth Tracking Hook
// Tracks when users scroll to 25%, 50%, 75%, 100% of page

import { useEffect, useRef } from 'react'
import * as analytics from '@/lib/analytics'

export function useScrollTracking() {
  const milestones = useRef({
    25: false,
    50: false,
    75: false,
    100: false,
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleScroll = () => {
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      
      // Calculate scroll percentage
      const scrollPercentage = (scrollTop / (documentHeight - windowHeight)) * 100
      
      // Track milestones
      if (scrollPercentage >= 25 && !milestones.current[25]) {
        milestones.current[25] = true
        analytics.trackScrollDepth(25)
      }
      
      if (scrollPercentage >= 50 && !milestones.current[50]) {
        milestones.current[50] = true
        analytics.trackScrollDepth(50)
      }
      
      if (scrollPercentage >= 75 && !milestones.current[75]) {
        milestones.current[75] = true
        analytics.trackScrollDepth(75)
      }
      
      if (scrollPercentage >= 100 && !milestones.current[100]) {
        milestones.current[100] = true
        analytics.trackScrollDepth(100)
      }
    }

    // Add scroll listener with throttle
    let throttleTimeout: NodeJS.Timeout | null = null
    const throttledScroll = () => {
      if (throttleTimeout === null) {
        throttleTimeout = setTimeout(() => {
          handleScroll()
          throttleTimeout = null
        }, 100) // Throttle to every 100ms
      }
    }

    window.addEventListener('scroll', throttledScroll)
    
    // Initial check
    handleScroll()

    return () => {
      window.removeEventListener('scroll', throttledScroll)
      if (throttleTimeout) {
        clearTimeout(throttleTimeout)
      }
    }
  }, [])
}

// Get current scroll depth (utility)
export function getCurrentScrollDepth(): number {
  if (typeof window === 'undefined') return 0
  
  const windowHeight = window.innerHeight
  const documentHeight = document.documentElement.scrollHeight
  const scrollTop = window.scrollY || document.documentElement.scrollTop
  
  return Math.round((scrollTop / (documentHeight - windowHeight)) * 100)
}

