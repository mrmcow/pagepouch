// Google Analytics 4 Configuration
// Visit https://analytics.google.com to get your Measurement ID

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ''

// Initialize Google Analytics
export const initGA = () => {
  if (typeof window === 'undefined') return
  if (!GA_MEASUREMENT_ID) {
    console.warn('GA4 Measurement ID not configured')
    return
  }

  // Load gtag.js script
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
  document.head.appendChild(script)

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || []
  function gtag(...args: any[]) {
    window.dataLayer.push(arguments)
  }
  window.gtag = gtag

  gtag('js', new Date())
  gtag('config', GA_MEASUREMENT_ID, {
    page_path: window.location.pathname,
    send_page_view: true,
  })
}

// Page view tracking
export const pageview = (url: string) => {
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined') return
  
  window.gtag?.('config', GA_MEASUREMENT_ID, {
    page_path: url,
  })
}

// Event tracking
export const event = (action: string, params?: Record<string, any>) => {
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined') return
  
  window.gtag?.('event', action, params)
}

// User properties
export const setUserProperties = (properties: Record<string, any>) => {
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined') return
  
  window.gtag?.('set', 'user_properties', properties)
}

// TypeScript declarations
declare global {
  interface Window {
    dataLayer: any[]
    gtag?: (...args: any[]) => void
  }
}

