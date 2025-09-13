'use client'

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LogoIcon } from '@/components/ui/logo'
import { ChromeIcon, FirefoxIcon } from '@/components/ui/browser-icons'
import { DownloadIcon, ExternalLinkIcon, CheckIcon, FileIcon, BookOpenIcon } from 'lucide-react'

interface DownloadModalProps {
  isOpen: boolean
  onClose: () => void
  selectedBrowser: 'chrome' | 'firefox'
}

export function DownloadModal({ isOpen, onClose, selectedBrowser }: DownloadModalProps) {
  const browserData = {
    chrome: {
      name: 'Chrome',
      icon: ChromeIcon,
      instructions: [
        'Download the ZIP file below',
        'Extract to a folder on your computer',
        'Open Chrome → Settings → Extensions',
        'Enable "Developer mode" (top right)',
        'Click "Load unpacked" and select the extracted folder'
      ]
    },
    firefox: {
      name: 'Firefox',
      icon: FirefoxIcon,
      instructions: [
        'Download the ZIP file below',
        'Keep the file as ZIP (don\'t extract)',
        'Open Firefox → Add-ons Manager (Ctrl+Shift+A)',
        'Click the gear icon → "Install Add-on From File"',
        'Select the downloaded ZIP file'
      ]
    }
  }

  const browser = browserData[selectedBrowser]
  const IconComponent = browser.icon

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-4">
            <LogoIcon size={40} />
            <div>
              <DialogTitle className="text-2xl">PagePouch Extension</DialogTitle>
              <p className="text-muted-foreground">Direct download for {browser.name}</p>
            </div>
            <Badge className="ml-auto">v1.0.5 Beta</Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Download Section */}
          <div className="bg-muted/50 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <IconComponent size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Download for {browser.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Get early access before it hits the official store
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button size="lg" className="flex-1" asChild>
                <a href="/extension/downloads/pagepouch-extension.zip" download>
                  <DownloadIcon className="mr-2 h-5 w-5" />
                  Download Extension ZIP
                </a>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a href="/extension/downloads/download.html" target="_blank">
                  <BookOpenIcon className="mr-2 h-5 w-5" />
                  Installation Guide
                </a>
              </Button>
            </div>

            <p className="text-xs text-muted-foreground mt-3">
              <strong>Build Date:</strong> September 13, 2025 • <strong>Size:</strong> ~2.1 MB
            </p>
          </div>

          {/* Installation Steps */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                {selectedBrowser === 'chrome' ? '🔧' : '🦊'}
              </span>
              Installation Steps for {browser.name}
            </h4>
            <ol className="space-y-3">
              {browser.instructions.map((step, index) => (
                <li key={index} className="flex gap-3">
                  <span className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <span className="text-sm">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckIcon className="h-4 w-4 text-success" />
                <span className="font-medium text-sm">Smart Capture</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Full page scroll capture and visible area screenshots
              </p>
            </div>
            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckIcon className="h-4 w-4 text-success" />
                <span className="font-medium text-sm">Cloud Sync</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Sign in to sync captures across all devices
              </p>
            </div>
            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckIcon className="h-4 w-4 text-success" />
                <span className="font-medium text-sm">Instant Search</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Find anything in seconds with full-text search
              </p>
            </div>
            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckIcon className="h-4 w-4 text-success" />
                <span className="font-medium text-sm">Secure & Private</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Your data is encrypted and secure
              </p>
            </div>
          </div>

          {/* Beta Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                β
              </div>
              <div>
                <h5 className="font-medium text-blue-900 mb-1">Beta Version</h5>
                <p className="text-sm text-blue-700">
                  This is a beta version for testing. The official store release is coming soon! 
                  Report any issues to help us improve.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
