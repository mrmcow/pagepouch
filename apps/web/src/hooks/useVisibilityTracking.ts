// Section Visibility Tracking Hook
// Uses Intersection Observer to track when sections come into view

import { useEffect, useRef } from 'react'
import * as analytics from '@/lib/analytics'
import { getCurrentScrollDepth } from './useScrollTracking'

interface VisibilityTrackingOptions {
  sectionName: string
  threshold?: number // Percentage of section that must be visible (0-1)
  minTimeInView?: number // Minimum time in view before tracking (ms)
}

export function useVisibilityTracking({
  sectionName,
  threshold = 0.5, // 50% of section must be visible
  minTimeInView = 2000, // 2 seconds minimum
}: VisibilityTrackingOptions) {
  const sectionRef = useRef<HTMLElement>(null)
  const timeInViewRef = useRef<number>(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const hasTrackedRef = useRef(false)
  const entryTimeRef = useRef<number>(0)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Section entered viewport
            entryTimeRef.current = Date.now()
            
            // Start timer to track minimum time in view
            timerRef.current = setTimeout(() => {
              if (!hasTrackedRef.current) {
                const timeInView = (Date.now() - entryTimeRef.current) / 1000
                const scrollDepth = getCurrentScrollDepth()
                const deviceType = window.innerWidth < 768 ? 'mobile' : 'desktop'
                
                analytics.trackSectionViewed({
                  section_name: sectionName,
                  time_in_view: timeInView,
                  scroll_percentage_when_viewed: scrollDepth,
                  device_type: deviceType,
                })
                
                hasTrackedRef.current = true
              }
            }, minTimeInView)
          } else {
            // Section left viewport
            if (timerRef.current) {
              clearTimeout(timerRef.current)
              timerRef.current = null
            }
            
            // Calculate total time in view for engagement tracking
            if (entryTimeRef.current > 0) {
              const timeSpent = (Date.now() - entryTimeRef.current) / 1000
              timeInViewRef.current += timeSpent
              
              // If user spent significant time, track engagement
              if (timeSpent >= 3 && hasTrackedRef.current) {
                analytics.trackSectionEngagement({
                  section_name: sectionName,
                  time_spent: timeInViewRef.current,
                })
              }
            }
            
            entryTimeRef.current = 0
          }
        })
      },
      {
        threshold: threshold,
        rootMargin: '0px', // No margin
      }
    )

    observer.observe(section)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
      observer.disconnect()
    }
  }, [sectionName, threshold, minTimeInView])

  return sectionRef
}

// Hook for tracking multiple sections at once
export function useMultipleSectionTracking(sections: string[]) {
  const refs = useRef<Map<string, HTMLElement | null>>(new Map())
  
  useEffect(() => {
    sections.forEach(sectionName => {
      const element = refs.current.get(sectionName)
      if (!element) return
      
      // Create observer for each section
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const scrollDepth = getCurrentScrollDepth()
              const deviceType = window.innerWidth < 768 ? 'mobile' : 'desktop'
              
              analytics.trackSectionViewed({
                section_name: sectionName,
                time_in_view: 2, // Simplified - just tracking view
                scroll_percentage_when_viewed: scrollDepth,
                device_type: deviceType,
              })
            }
          })
        },
        {
          threshold: 0.5,
        }
      )
      
      observer.observe(element)
      
      return () => observer.disconnect()
    })
  }, [sections])
  
  return (sectionName: string) => (element: HTMLElement | null) => {
    refs.current.set(sectionName, element)
  }
}

