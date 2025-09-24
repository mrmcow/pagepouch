'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LogoWithText, LogoIcon } from '@/components/ui/logo'
import { BrowserSelector } from '@/components/ui/browser-selector'
import { DownloadModal } from '@/components/ui/download-modal'
import { 
  ZapIcon,
  SearchIcon, 
  FolderIcon, 
  ShieldCheckIcon,
  DownloadIcon,
  BookmarkIcon,
  ArrowRightIcon,
  CheckIcon,
  StarIcon,
  PlayIcon
} from 'lucide-react'

// Enhanced browser detection with download URLs
const getBrowserInfo = () => {
  if (typeof window === 'undefined') return { 
    name: 'Chrome', 
    icon: 'chrome', 
    downloadUrl: '/extension/downloads/pagepouch-extension.zip',
    directDownload: true
  }
  
  const userAgent = window.navigator.userAgent
  console.log('User Agent:', userAgent) // Debug log
  
  // More robust Firefox detection
  if (userAgent.includes('Firefox') || userAgent.includes('Gecko')) {
    console.log('Firefox detected!') // Debug log
    return { 
      name: 'Firefox', 
      icon: 'firefox', 
      downloadUrl: '/extension/downloads/pagepouch-extension-firefox.zip',
      storeUrl: 'https://addons.mozilla.org/en-US/firefox/addon/pagepouch/',
      directDownload: true,
      installInstructions: 'Download and install via about:debugging'
    }
  }
  
  // Default to Chrome for all other browsers (Chrome, Edge, Safari, etc.)
  console.log('Chrome detected (default)') // Debug log
  return { 
    name: 'Chrome', 
    icon: 'chrome', 
    downloadUrl: '/extension/downloads/pagepouch-extension.zip',
    storeUrl: 'https://chrome.google.com/webstore/detail/pagepouch/extension-id',
    directDownload: true,
    installInstructions: 'Download and install via chrome://extensions'
  }
}


export default function HomePage() {
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false)
  const [selectedBrowser, setSelectedBrowser] = useState<'chrome' | 'firefox'>('chrome')
  const [detectedBrowser, setDetectedBrowser] = useState<any>(null)

  // Detect browser on component mount
  React.useEffect(() => {
    const browserInfo = getBrowserInfo()
    console.log('Detected browser:', browserInfo) // Debug log
    setDetectedBrowser(browserInfo)
    setSelectedBrowser(browserInfo.name.toLowerCase() as 'chrome' | 'firefox')
  }, [])

  const handleDownloadClick = (browser?: 'chrome' | 'firefox') => {
    if (browser) {
      setSelectedBrowser(browser)
    }
    setIsDownloadModalOpen(true)
  }

  const handleSmartDownload = () => {
    console.log('Smart download clicked, detected browser:', detectedBrowser) // Debug log
    if (detectedBrowser?.directDownload) {
      // Direct download for detected browser
      console.log('Downloading:', detectedBrowser.downloadUrl) // Debug log
      window.open(detectedBrowser.downloadUrl, '_blank')
    } else {
      // Fallback to modal
      console.log('Falling back to modal') // Debug log
      handleDownloadClick()
    }
  }
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="pagepouch-container px-4 py-4 flex items-center justify-between">
          <LogoWithText size={40} />
          <div className="flex items-center space-x-4">
            <Button variant="ghost" className="font-medium" asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button className="font-medium group" asChild>
              <Link href="/auth/signup">
                <DownloadIcon className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                Start Free Trial
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section - Extension Focused */}
      <section className="py-16 lg:py-24 px-4">
        <div className="pagepouch-container">
          <div className="text-center mb-12">
            <h1 className="text-5xl lg:text-7xl font-bold mb-8 text-balance">
              <span className="pagepouch-gradient-text">Capture any webpage</span>
              <br />
              <span className="text-foreground">with one click</span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto text-balance leading-relaxed">
              Install the PagePouch extension and start saving web content instantly. 
              Perfect for researchers, analysts, and anyone who needs to archive the web.
            </p>
          </div>

          {/* Primary CTA - Install Extension */}
          <div className="flex flex-col items-center mb-16">
            <BrowserSelector onDownloadClick={handleDownloadClick} />
          </div>

          {/* Quick Demo */}
          <div className="text-center mb-16">
            <div className="bg-muted/50 rounded-2xl p-8 max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold mb-4">See it in action</h3>
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="flex items-center gap-3 mb-4">
                  <LogoIcon size={32} />
                  <span className="font-medium">PagePouch Extension</span>
                  <div className="ml-auto">
                    <Button size="sm" className="font-medium">
                      📸 Capture Page
                    </Button>
                  </div>
                </div>
                <div className="text-left text-sm text-muted-foreground">
                  Click the extension icon → Page captured automatically → Organized in your library
                </div>
              </div>
              <Button variant="outline" className="mt-6 font-medium group">
                <PlayIcon className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                Watch 30-second Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Why PagePouch Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="pagepouch-container">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-balance">
              Why researchers choose 
              <span className="pagepouch-gradient-text">PagePouch</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
              Built specifically for analysts who need reliable, searchable web archival with zero friction.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <ZapIcon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">One-Click Capture</h3>
              <p className="text-muted-foreground text-sm">
                Save any webpage instantly - screenshot, HTML, and metadata captured automatically.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <SearchIcon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Instant Search</h3>
              <p className="text-muted-foreground text-sm">
                Find anything in seconds with full-text search across all your saved content.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <ShieldCheckIcon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Secure & Private</h3>
              <p className="text-muted-foreground text-sm">
                Your data is encrypted and secure. Perfect for sensitive research work.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 px-4">
        <div className="pagepouch-container">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Start capturing in 
              <span className="pagepouch-gradient-text">3 simple steps</span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold mb-3">Install Extension</h3>
              <p className="text-muted-foreground">
                Add PagePouch to your browser in one click. No account needed to start.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold mb-3">Click to Capture</h3>
              <p className="text-muted-foreground">
                Visit any webpage and click the PagePouch icon to save it instantly.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold mb-3">Search & Organize</h3>
              <p className="text-muted-foreground">
                Find your clips instantly with powerful search and organize with folders and tags.
              </p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Button 
              size="lg" 
              className="text-lg px-8 py-4 h-auto font-semibold group"
              onClick={handleSmartDownload}
            >
              <DownloadIcon className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
              {detectedBrowser ? `Add to ${detectedBrowser.name}` : 'Install PagePouch Extension'}
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-r from-primary to-blue-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="pagepouch-container relative">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-balance">
              Start capturing the web today
            </h2>
            <p className="text-xl mb-12 opacity-90 text-balance">
              Join thousands of researchers and analysts who rely on PagePouch for their most important work. 
              Install the extension and start capturing in under 2 minutes.
            </p>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto mb-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🌐</span>
                </div>
                <h3 className="text-2xl font-bold mb-2">Free Extension</h3>
                <p className="opacity-90">No account required • Works instantly</p>
              </div>
              
              <Button 
                size="lg" 
                variant="secondary" 
                className="w-full text-lg py-4 h-auto font-semibold group mb-4"
                onClick={handleSmartDownload}
              >
                <DownloadIcon className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                {detectedBrowser ? `Add to ${detectedBrowser.name} - It's Free` : 'Add Extension - It\'s Free'}
              </Button>
              
              <div className="text-center mb-4">
                <p className="text-xs opacity-75">
                  or{' '}
                  <button 
                    onClick={handleSmartDownload}
                    className="text-white hover:underline font-medium"
                  >
                    download directly
                  </button>
                  {' '}for manual installation
                  {detectedBrowser?.installInstructions && (
                    <span className="block mt-1 text-xs opacity-60">
                      {detectedBrowser.installInstructions}
                    </span>
                  )}
                </p>
              </div>
              
              <div className="flex items-center justify-center gap-6 text-sm opacity-90">
                <div className="flex items-center gap-1">
                  <CheckIcon className="h-4 w-4" />
                  <span>100 clips free</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckIcon className="h-4 w-4" />
                  <span>No signup needed</span>
                </div>
              </div>
            </div>
            
            <p className="text-sm opacity-75">
              {detectedBrowser?.name === 'Firefox' ? 'Also available for Chrome' : 'Also available for Firefox'}
              {' • '}
              <button 
                onClick={() => handleDownloadClick(detectedBrowser?.name === 'Firefox' ? 'chrome' : 'firefox')}
                className="text-white hover:underline font-medium"
              >
                Download for {detectedBrowser?.name === 'Firefox' ? 'Chrome' : 'Firefox'}
              </button>
              {' • '}
              <a 
                href="/extension/downloads/pagepouch-extension-firefox.zip"
                className="text-white hover:underline font-medium"
                download="pagepouch-extension-firefox.zip"
              >
                Direct Firefox Download
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-4 bg-muted/30">
        <div className="pagepouch-container">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <LogoIcon size={32} />
              <span className="text-xl font-bold">PagePouch</span>
            </div>
            <div className="text-center md:text-right">
              <p className="text-muted-foreground mb-2">
                Built with ❤️ for analysts and researchers
              </p>
              <p className="text-sm text-muted-foreground">
                &copy; 2025 PagePouch. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Download Modal */}
      <DownloadModal 
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        selectedBrowser={selectedBrowser}
      />
    </div>
  )
}
