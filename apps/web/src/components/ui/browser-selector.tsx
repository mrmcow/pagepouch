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
      downloadUrl: '/extension/downloads/pagepouch-extension.zip'
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
    <div className={`bg-white rounded-2xl shadow-xl border p-8 max-w-md w-full ${className}`}>
      {/* Browser Toggle */}
      <div className="flex items-center justify-center mb-6">
        <div className="bg-muted rounded-lg p-1 flex">
          {browsers.map((browser) => {
            const IconComponent = browser.icon
            const isSelected = selectedBrowser === browser.id
            
            return (
              <button
                key={browser.id}
                onClick={() => setSelectedBrowser(browser.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all
                  ${isSelected 
                    ? 'bg-white shadow-sm text-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                  }
                `}
              >
                <IconComponent size={20} />
                {browser.name}
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected Browser Info */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <selectedBrowserData.icon size={32} />
        </div>
        <h3 className="text-2xl font-bold mb-2">
          Install for {selectedBrowserData.name}
        </h3>
        <p className="text-muted-foreground">
          {selectedBrowserData.description}
        </p>
      </div>

      {/* Primary Action Button */}
      <Button 
        size="lg" 
        className="w-full text-lg py-4 h-auto font-semibold group mb-4"
        disabled={selectedBrowserData.status === 'coming-soon'}
        onClick={() => onDownloadClick?.(selectedBrowser)}
      >
        <DownloadIcon className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
        {selectedBrowserData.buttonText}
      </Button>

      {/* Download Options */}
      <div className="text-center mb-4">
        <p className="text-xs text-muted-foreground mb-2">
          or{' '}
          <button 
            onClick={() => onDownloadClick?.(selectedBrowser)}
            className="text-primary hover:underline font-medium"
          >
            download directly
          </button>
          {' '}for manual installation
        </p>
      </div>

      {/* Features */}
      <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <CheckIcon className="h-4 w-4 text-success" />
          <span>No signup needed</span>
        </div>
        <div className="flex items-center gap-1">
          <CheckIcon className="h-4 w-4 text-success" />
          <span>Works instantly</span>
        </div>
      </div>
    </div>
  )
}
