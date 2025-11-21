'use client'

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LogoIcon } from '@/components/ui/logo'
import { ChromeIcon, FirefoxIcon } from '@/components/ui/browser-icons'
import { DownloadIcon, CheckIcon, ShieldCheckIcon, ZapIcon, SearchIcon, CloudIcon } from 'lucide-react'

interface DownloadModalProps {
  isOpen: boolean
  onClose: () => void
  selectedBrowser: 'chrome' | 'firefox'
}

export function DownloadModal({ isOpen, onClose, selectedBrowser }: DownloadModalProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null)
  
  const browserData = {
    chrome: {
      name: 'Chrome',
      icon: ChromeIcon,
      downloadUrl: '/extension/downloads/pagestash-extension-chrome.zip',
      instructions: [
        'Click "Download for Chrome" above to save the extension package',
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
      downloadUrl: '/extension/downloads/pagestash-extension-firefox.zip',
      instructions: [
        'Click "Download for Firefox" above to save the extension package',
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
      <DialogContent className="max-w-3xl max-h-[90vh] border-none bg-transparent p-0 gap-0 overflow-hidden">
        <div ref={scrollRef} className="relative rounded-[40px] border border-slate-200/50 bg-white shadow-[0_50px_140px_-70px_rgba(15,23,42,0.5)] dark:bg-slate-950 dark:border-white/10 overflow-y-auto max-h-[90vh]">
          {/* Subtle gradient backdrop */}
          <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-blue-50/40 to-transparent dark:from-blue-950/20 pointer-events-none" />
          
          {/* Header */}
          <div className="relative flex flex-wrap items-start gap-5 px-8 sm:px-10 pt-10 pb-6 border-b border-slate-100 dark:border-white/5">
            <div className="flex items-center gap-4 flex-1 min-w-[280px]">
              <div className="w-16 h-16 rounded-[20px] bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 flex items-center justify-center border border-blue-100 dark:border-blue-900/50 shadow-sm">
                <IconComponent size={36} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] font-semibold text-slate-400 mb-1">Extension</p>
                <DialogTitle className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Add to {browser.name}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Download and install the PageStash extension for {browser.name}
                </DialogDescription>
              </div>
            </div>
            <Badge className="rounded-full px-4 py-1.5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-sm font-semibold">
              v1.2.5
            </Badge>
          </div>

          <div className="relative px-8 sm:px-10 pb-10 space-y-8 mt-2">
            {/* Main Download CTA */}
            <div className="rounded-[32px] border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-8 dark:from-slate-900/40 dark:to-slate-950 dark:border-white/5 shadow-sm">
              <div className="text-center space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                    Start capturing in under a minute
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Early access • No credit card • Free trial included
                  </p>
                </div>

                <Button 
                  size="lg" 
                  className="h-14 px-8 text-base font-semibold rounded-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 shadow-lg hover:shadow-xl transition-all group" 
                  asChild
                >
                  <a href={browser.downloadUrl} download>
                    <DownloadIcon className="mr-2.5 h-5 w-5 group-hover:translate-y-0.5 transition-transform" />
                    Download for {browser.name}
                  </a>
                </Button>

                <div className="flex items-center justify-center gap-4 text-xs text-slate-400 pt-2">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    2.1 MB
                  </span>
                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                  <span>Build: Nov 21, 2025</span>
                </div>
              </div>
            </div>

            {/* Feature Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              {features.map((feature) => {
                const FeatureIcon = feature.icon
                return (
                  <div 
                    key={feature.title} 
                    className="group rounded-[24px] border border-slate-200 bg-white p-5 flex gap-4 items-start dark:bg-slate-950 dark:border-white/5 hover:border-blue-200 dark:hover:border-blue-900/50 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <FeatureIcon className="w-5 h-5" strokeWidth={2} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-slate-900 dark:text-white mb-1">{feature.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {feature.desc}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Installation Steps - Collapsible Style */}
            <details 
              id="installation-instructions"
              className="group rounded-[28px] border border-slate-200 dark:border-white/5 overflow-hidden"
              onToggle={(e) => {
                const details = e.currentTarget as HTMLDetailsElement
                if (details.open) {
                  setTimeout(() => {
                    // Scroll the modal content container down smoothly
                    if (scrollRef.current) {
                      scrollRef.current.scrollBy({ top: 300, behavior: 'smooth' })
                    }
                  }, 150)
                }
              }}
            >
              <summary className="px-6 py-5 cursor-pointer list-none flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                <span className="font-semibold text-base text-slate-900 dark:text-white">
                  Installation Instructions
                </span>
                <span className="text-slate-400 group-open:rotate-180 transition-transform duration-300">
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </span>
              </summary>
              <div className="px-6 pb-6 pt-2 bg-slate-50/50 dark:bg-slate-900/20 border-t border-slate-100 dark:border-white/5 animate-in slide-in-from-top-2 duration-300">
                <ol className="space-y-3 mt-4">
                  {browser.instructions.map((step, index) => (
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
