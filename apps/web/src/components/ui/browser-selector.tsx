'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChromeIcon, FirefoxIcon } from '@/components/ui/browser-icons'
import { DownloadIcon, ExternalLinkIcon, CheckIcon } from 'lucide-react'

interface BrowserSelectorProps {
  onDownloadClick?: (browser: 'chrome' | 'firefox') => void
  className?: string
}

export function BrowserSelector({ onDownloadClick, className = '' }: BrowserSelectorProps) {
  const [selectedBrowser, setSelectedBrowser] = useState<'chrome' | 'firefox'>('chrome')

  // Auto-detect browser and set initial selection
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userAgent = window.navigator.userAgent
      if (userAgent.includes('Firefox')) {
        setSelectedBrowser('firefox')
      }
      // For all other browsers (Chrome, Edge, Safari, etc.), keep Chrome as default
    }
  }, [])

  const browsers = [
    {
      id: 'chrome' as const,
      name: 'Chrome',
      icon: ChromeIcon,
      status: 'available',
      description: 'Free • 2-minute setup • Works offline',
      buttonText: 'Add to Chrome - It\'s Free',
      storeUrl: '#', // Will be Chrome Web Store URL
      downloadUrl: '/extension/downloads/pagestash-extension-chrome.zip'
    },
    {
      id: 'firefox' as const,
      name: 'Firefox',
      icon: FirefoxIcon,
      status: 'available',
      description: 'Free • 2-minute setup • Works offline',
      buttonText: 'Add to Firefox - It\'s Free',
      storeUrl: '#', // Will be Firefox Add-ons URL
      downloadUrl: '/extension/downloads/pagestash-extension-firefox.zip'
    }
  ]

  const selectedBrowserData = browsers.find(b => b.id === selectedBrowser)!

  return (
    <div className={`${className}`}>
      {/* Modern Rounded Browser Switcher */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex items-center p-1.5 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 shadow-inner">
          {browsers.map((browser) => {
            const IconComponent = browser.icon
            const isSelected = selectedBrowser === browser.id
            
            return (
              <button
                key={browser.id}
                onClick={() => setSelectedBrowser(browser.id)}
                className={`
                  relative flex items-center gap-2.5 px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ease-out
                  ${isSelected 
                    ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }
                `}
              >
                <IconComponent size={18} className={isSelected ? 'opacity-100' : 'opacity-70 grayscale'} />
                <span>{browser.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Primary Action Button - Enterprise Style */}
      <Button 
        size="lg" 
        className="w-full sm:h-16 text-lg font-bold bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 rounded-xl"
        disabled={selectedBrowserData.status === 'coming-soon'}
        onClick={() => onDownloadClick?.(selectedBrowser)}
      >
        <DownloadIcon className="mr-3 h-6 w-6" />
        Add to {selectedBrowserData.name} — It's Free
      </Button>

      {/* Trust Indicators */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mt-6 text-sm font-medium text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <CheckIcon className="h-4 w-4 text-emerald-500" />
          <span>No credit card required</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckIcon className="h-4 w-4 text-emerald-500" />
          <span>2-minute setup</span>
        </div>
      </div>
    </div>
  )
}
