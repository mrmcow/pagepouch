'use client'

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LogoIcon } from '@/components/ui/logo'
import { ChromeIcon, FirefoxIcon } from '@/components/ui/browser-icons'
import { DownloadIcon, CheckIcon, ShieldCheckIcon, ZapIcon, SearchIcon, CloudIcon, ExternalLinkIcon } from 'lucide-react'

interface DownloadModalProps {
  isOpen: boolean
  onClose: () => void
  selectedBrowser: 'chrome' | 'firefox'
}

const STORE_URLS = {
  chrome: 'https://chromewebstore.google.com/detail/pagestash/pimbnkabbjeacahcclicmfdkhojnjmif',
  firefox: 'https://addons.mozilla.org/en-US/firefox/addon/pagestash/',
} as const

export function DownloadModal({ isOpen, onClose, selectedBrowser }: DownloadModalProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null)
  
  const browserData = {
    chrome: {
      name: 'Chrome',
      icon: ChromeIcon,
      storeName: 'Chrome Web Store',
      storeUrl: STORE_URLS.chrome,
      downloadUrl: '/extension/downloads/pagestash-extension-chrome.zip',
      manualInstructions: [
        'Download the ZIP file using the link below',
        'Extract the ZIP file to a folder on your computer',
        'Open chrome://extensions in your Chrome browser',
        'Enable "Developer mode" using the toggle in the top-right corner',
        'Click "Load unpacked" and select the extracted folder',
        'The PageStash extension icon will appear in your toolbar'
      ]
    },
    firefox: {
      name: 'Firefox',
      icon: FirefoxIcon,
      storeName: 'Firefox Add-ons',
      storeUrl: STORE_URLS.firefox,
      downloadUrl: '/extension/downloads/pagestash-extension-firefox.zip',
      manualInstructions: [
        'Download the ZIP file using the link below',
        'Open about:debugging in your Firefox browser',
        'Click "This Firefox" in the left sidebar',
        'Click "Load Temporary Add-on..." button',
        'Navigate to and select the manifest.json file from the extracted folder',
        'The PageStash extension will be active until you restart Firefox'
      ]
    }
  }

  const browser = browserData[selectedBrowser]
  const IconComponent = browser.icon

  const features = [
    { 
      icon: ZapIcon,
      title: 'One-Click Capture', 
      desc: 'Full-page screenshots and text extraction in seconds' 
    },
    { 
      icon: SearchIcon,
      title: 'Instant Search', 
      desc: 'Find any content across your entire library' 
    },
    { 
      icon: CloudIcon,
      title: 'Cloud Sync', 
      desc: 'Access your captures from anywhere, any device' 
    },
    { 
      icon: ShieldCheckIcon,
      title: 'Enterprise Security', 
      desc: 'Encrypted storage with SOC-2 compliance' 
    },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[92vh] border-none bg-transparent p-0 gap-0 overflow-hidden">
        <div ref={scrollRef} className="relative rounded-[28px] sm:rounded-[40px] border border-slate-200/50 bg-white shadow-[0_50px_140px_-70px_rgba(15,23,42,0.5)] dark:bg-slate-950 dark:border-white/10 overflow-y-auto max-h-[92vh]">
          <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-blue-50/40 to-transparent dark:from-blue-950/20 pointer-events-none" />
          
          {/* Header */}
          <div className="relative flex items-center justify-between gap-3 px-5 sm:px-10 pt-7 sm:pt-10 pb-5 sm:pb-6 border-b border-slate-100 dark:border-white/5">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-[16px] sm:rounded-[20px] bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 flex items-center justify-center border border-blue-100 dark:border-blue-900/50 shadow-sm flex-shrink-0">
                <IconComponent size={28} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] font-semibold text-slate-400 mb-0.5 sm:mb-1">Extension</p>
                <DialogTitle className="text-xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight truncate">
                  Add to {browser.name}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Install the PageStash extension for {browser.name}
                </DialogDescription>
              </div>
            </div>
            <Badge className="rounded-full px-3 sm:px-4 py-1 sm:py-1.5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs sm:text-sm font-semibold flex-shrink-0">
              v3.0.0
            </Badge>
          </div>

          <div className="relative px-5 sm:px-10 pb-7 sm:pb-10 space-y-5 sm:space-y-8 mt-2">
            {/* Primary CTA — Store install */}
            <div className="rounded-2xl sm:rounded-[32px] border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5 sm:p-8 dark:from-slate-900/40 dark:to-slate-950 dark:border-white/5 shadow-sm">
              <div className="flex flex-col items-center text-center gap-4 sm:gap-6">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white mb-1.5 sm:mb-2">
                    Install from the {browser.storeName}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Recommended — automatic updates, one-click install
                  </p>
                </div>

                <Button 
                  size="lg"
                  className="w-full sm:w-auto h-13 sm:h-14 px-6 sm:px-8 text-[15px] sm:text-base font-semibold rounded-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 shadow-lg hover:shadow-xl transition-all group"
                  asChild
                >
                  <a href={browser.storeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                    <ExternalLinkIcon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                    Get from {browser.storeName}
                  </a>
                </Button>

                <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <CheckIcon className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                    Free
                  </span>
                  <span className="w-1 h-1 rounded-full bg-slate-300 hidden sm:block" />
                  <span className="flex items-center gap-1.5">
                    <CheckIcon className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                    Auto-updates
                  </span>
                  <span className="w-1 h-1 rounded-full bg-slate-300 hidden sm:block" />
                  <span className="flex items-center gap-1.5">
                    <CheckIcon className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                    Verified
                  </span>
                </div>
              </div>
            </div>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {features.map((feature) => {
                const FeatureIcon = feature.icon
                return (
                  <div 
                    key={feature.title} 
                    className="group rounded-2xl sm:rounded-[24px] border border-slate-200 bg-white p-4 sm:p-5 flex gap-3 sm:gap-4 items-start dark:bg-slate-950 dark:border-white/5 hover:border-blue-200 dark:hover:border-blue-900/50 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300"
                  >
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <FeatureIcon className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-slate-900 dark:text-white mb-0.5 sm:mb-1">{feature.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {feature.desc}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Manual / Direct Download — collapsible */}
            <details 
              id="manual-install"
              className="group rounded-2xl sm:rounded-[28px] border border-slate-200 dark:border-white/5 overflow-hidden"
              onToggle={(e) => {
                const details = e.currentTarget as HTMLDetailsElement
                if (details.open) {
                  setTimeout(() => {
                    if (scrollRef.current) {
                      scrollRef.current.scrollBy({ top: 300, behavior: 'smooth' })
                    }
                  }, 150)
                }
              }}
            >
              <summary className="px-6 py-5 cursor-pointer list-none flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                <span className="font-semibold text-base text-slate-900 dark:text-white">
                  Manual Install (Direct Download)
                </span>
                <span className="text-slate-400 group-open:rotate-180 transition-transform duration-300">
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </span>
              </summary>
              <div className="px-6 pb-6 pt-2 bg-slate-50/50 dark:bg-slate-900/20 border-t border-slate-100 dark:border-white/5 animate-in slide-in-from-top-2 duration-300">
                <div className="mb-5">
                  <Button 
                    variant="outline" 
                    className="rounded-full" 
                    asChild
                  >
                    <a href={browser.downloadUrl} download>
                      <DownloadIcon className="mr-2 h-4 w-4" />
                      Download ZIP for {browser.name}
                    </a>
                  </Button>
                </div>
                <ol className="space-y-3">
                  {browser.manualInstructions.map((step, index) => (
                    <li key={index} className="flex gap-3.5 items-start">
                      <span className="w-7 h-7 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-bold dark:bg-white dark:text-slate-900 flex-shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      <span className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </details>

            {/* Footer Note */}
            <p className="text-center text-xs text-slate-400 dark:text-slate-500">
              Need help? <a href="/support" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Contact Support</a> or visit our <a href="/docs" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Documentation</a>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
