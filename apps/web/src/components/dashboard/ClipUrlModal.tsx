'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, Link2, Loader2, CheckCircle2, AlertCircle, Camera, FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase'

interface ClipUrlModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ClipUrlModal({ isOpen, onClose, onSuccess }: ClipUrlModalProps) {
  const [url, setUrl] = useState('')
  const [isCapturing, setIsCapturing] = useState(false)
  const [captureStatus, setCaptureStatus] = useState<'idle' | 'capturing' | 'screenshotting' | 'processing' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [progress, setProgress] = useState(0)
  const [captureMessage, setCaptureMessage] = useState('')

  if (!isOpen) return null

  const validateUrl = (urlString: string): boolean => {
    try {
      const urlObj = new URL(urlString)
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
    } catch {
      return false
    }
  }

  const handleCapture = async () => {
    // Validate URL
    if (!url.trim()) {
      setErrorMessage('Please enter a URL')
      return
    }

    // Add https:// if protocol is missing
    let processedUrl = url.trim()
    if (!processedUrl.match(/^https?:\/\//i)) {
      processedUrl = 'https://' + processedUrl
    }

    if (!validateUrl(processedUrl)) {
      setErrorMessage('Please enter a valid URL (e.g., https://example.com)')
      return
    }

    setIsCapturing(true)
    setCaptureStatus('capturing')
    setErrorMessage('')
    setCaptureMessage('Connecting to page...')
    setProgress(10)

    try {
      const supabase = createClient()
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        throw new Error('Please sign in to capture pages')
      }

      setProgress(20)
      setCaptureStatus('screenshotting')
      setCaptureMessage('Rendering page & taking screenshot...')

      const response = await fetch('/api/clips/capture-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ url: processedUrl }),
      })

      setProgress(80)
      setCaptureStatus('processing')
      setCaptureMessage('Saving to your library...')

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to capture webpage')
      }

      setProgress(100)
      setCaptureStatus('success')
      const hasScreenshot = data.message?.includes('screenshot')
      setCaptureMessage(hasScreenshot ? 'Captured with screenshot!' : 'Captured successfully!')

      setTimeout(() => {
        onSuccess()
        handleClose()
      }, 1500)
    } catch (error: any) {
      console.error('Capture error:', error)
      setCaptureStatus('error')
      setErrorMessage(error.message || 'Failed to capture webpage. Please try again.')
      setIsCapturing(false)
    }
  }

  const handleClose = () => {
    if (isCapturing) return
    setUrl('')
    setIsCapturing(false)
    setCaptureStatus('idle')
    setErrorMessage('')
    setCaptureMessage('')
    setProgress(0)
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isCapturing) {
      handleCapture()
    }
    if (e.key === 'Escape' && !isCapturing) {
      handleClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-background border rounded-lg shadow-2xl w-full max-w-lg mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
              <Link2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Clip URL</h2>
              <p className="text-sm text-muted-foreground">
                Capture any webpage to your library
              </p>
            </div>
          </div>
          {!isCapturing && (
            <button
              onClick={handleClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              title="Close (Esc)"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* URL Input */}
          <div className="space-y-2">
            <label htmlFor="clip-url" className="text-sm font-medium">
              Website URL
            </label>
            <Input
              id="clip-url"
              type="url"
              placeholder="https://example.com/article"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value)
                setErrorMessage('')
              }}
              onKeyDown={handleKeyDown}
              disabled={isCapturing}
              className="text-base"
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              Captures HTML, text, and a screenshot of the page. If a site blocks automated access, use the browser extension instead.
            </p>
          </div>

          {/* Progress */}
          {isCapturing && (
            <div className="space-y-3">
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-700 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Step indicators */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-sm">
                  {captureStatus === 'success' ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                  ) : (
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600 flex-shrink-0" />
                  )}
                  <span className={captureStatus === 'success' ? 'text-green-600 font-medium' : 'text-muted-foreground'}>
                    {captureMessage}
                  </span>
                </div>

                {captureStatus !== 'success' && (
                  <div className="flex items-center gap-4 text-xs text-muted-foreground/60 pl-6">
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      HTML + Text
                    </span>
                    <span className="flex items-center gap-1">
                      <Camera className="h-3 w-3" />
                      Screenshot
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{errorMessage}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-muted/30">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isCapturing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCapture}
            disabled={isCapturing || !url.trim()}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            {isCapturing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Capturing...
              </>
            ) : (
              <>
                <Link2 className="mr-2 h-4 w-4" />
                Capture Page
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

