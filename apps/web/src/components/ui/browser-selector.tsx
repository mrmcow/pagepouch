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
      downloadUrl: '/extension/downloads/pagepouch-extension-chrome.zip'
    },
    {
      id: 'firefox' as const,
      name: 'Firefox',
      icon: FirefoxIcon,
      status: 'available',
      description: 'Free • 2-minute setup • Works offline',
      buttonText: 'Add to Firefox - It\'s Free',
      storeUrl: '#', // Will be Firefox Add-ons URL
      downloadUrl: '/extension/downloads/pagepouch-extension-firefox.zip'
    }
  ]

  const selectedBrowserData = browsers.find(b => b.id === selectedBrowser)!

  return (
    <div className={`${className}`}>
      {/* Browser Toggle */}
      <div className="flex items-center justify-center mb-5">
        <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-1 flex w-full sm:w-auto">
          {browsers.map((browser) => {
            const IconComponent = browser.icon
            const isSelected = selectedBrowser === browser.id
            
            return (
              <button
                key={browser.id}
                onClick={() => setSelectedBrowser(browser.id)}
                className={`
                  flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all flex-1 sm:flex-initial
                  ${isSelected 
                    ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }
                `}
              >
                <IconComponent size={20} />
                <span className="whitespace-nowrap">{browser.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Primary Action Button */}
      <Button 
        size="lg" 
        className="w-full text-base sm:text-lg py-5 sm:py-6 h-auto font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        disabled={selectedBrowserData.status === 'coming-soon'}
        onClick={() => onDownloadClick?.(selectedBrowser)}
      >
        <DownloadIcon className="mr-2 h-5 w-5 flex-shrink-0" />
        <span className="truncate">Add to {selectedBrowserData.name} – It's Free</span>
      </Button>

      {/* Features */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-4">
        <div className="flex items-center gap-2">
          <CheckIcon className="h-4 w-4 text-green-600 flex-shrink-0" />
          <span className="whitespace-nowrap">Free trial</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckIcon className="h-4 w-4 text-green-600 flex-shrink-0" />
          <span className="whitespace-nowrap">Works instantly</span>
        </div>
      </div>
    </div>
  )
}
