'use client'

import { Button } from '@/components/ui/button'
import { X, Download, Chrome, Sparkles } from 'lucide-react'

interface ClipUrlModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ClipUrlModal({ isOpen, onClose }: ClipUrlModalProps) {
  if (!isOpen) return null

  const handleInstallExtension = () => {
    // Open download in new tab
    window.open('/extension/downloads/pagestash-extension-chrome.zip', '_blank')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-background border rounded-lg shadow-2xl w-full max-w-lg mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <Chrome className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Capture Webpages</h2>
              <p className="text-sm text-muted-foreground">
                Use the browser extension for best results
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="Close (Esc)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Feature highlight */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900 mb-1">
                  Full-Page Capture with Extension
                </h3>
                <p className="text-sm text-blue-800">
                  The PageStash browser extension captures complete webpages including:
                </p>
                <ul className="text-sm text-blue-800 mt-2 space-y-1 ml-4">
                  <li>• Full-page screenshots (even beyond viewport)</li>
                  <li>• Complete HTML & text content</li>
                  <li>• Page metadata & favicons</li>
                  <li>• Works on any website you visit</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Installation */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Quick Install:</h4>
            <ol className="text-sm text-muted-foreground space-y-2 ml-4">
              <li>1. Download the extension below</li>
              <li>2. Unzip the downloaded file</li>
              <li>3. Open Chrome Extensions (chrome://extensions)</li>
              <li>4. Enable "Developer mode" (top right)</li>
              <li>5. Click "Load unpacked" and select the unzipped folder</li>
            </ol>
          </div>

          {/* Note */}
          <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
            💡 <strong>Tip:</strong> Once installed, click the PageStash extension icon on any webpage to save it instantly!
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-muted/30">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            onClick={handleInstallExtension}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            <Download className="mr-2 h-4 w-4" />
            Download Extension
          </Button>
        </div>
      </div>
    </div>
  )
}
