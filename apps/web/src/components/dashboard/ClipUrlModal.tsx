'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, Link2, Loader2, CheckCircle2, AlertCircle, Camera, FileText, Clock, Mail, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase'

interface UsageData {
  clips_this_month: number
  clips_limit: number
  clips_remaining: number
  subscription_tier: string
  warning_level: string
}

interface LimitInfo {
  clips_limit: number
  clips_this_month: number
  subscription_tier: string
  days_until_reset: number
  reset_date: string
}

interface ClipUrlModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (usage?: UsageData) => void
}

export function ClipUrlModal({ isOpen, onClose, onSuccess }: ClipUrlModalProps) {
  const [url, setUrl] = useState('')
  const [isCapturing, setIsCapturing] = useState(false)
  const [captureStatus, setCaptureStatus] = useState<'idle' | 'capturing' | 'screenshotting' | 'processing' | 'success' | 'error' | 'limit_reached'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [progress, setProgress] = useState(0)
  const [captureMessage, setCaptureMessage] = useState('')
  const [limitInfo, setLimitInfo] = useState<LimitInfo | null>(null)

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
    if (!url.trim()) {
      setErrorMessage('Please enter a URL')
      return
    }

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
    setLimitInfo(null)
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

      if (response.status === 429) {
        setLimitInfo({
          clips_limit: data.clips_limit,
          clips_this_month: data.clips_this_month,
          subscription_tier: data.subscription_tier,
          days_until_reset: data.days_until_reset,
          reset_date: data.reset_date,
        })
        setCaptureStatus('limit_reached')
        setIsCapturing(false)
        return
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to capture webpage')
      }

      setProgress(100)
      setCaptureStatus('success')
      const hasScreenshot = data.message?.includes('screenshot')
      setCaptureMessage(hasScreenshot ? 'Captured with screenshot!' : 'Captured successfully!')

      setTimeout(() => {
        onSuccess(data.usage)
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
    if (isCapturing && captureStatus !== 'limit_reached') return
    setUrl('')
    setIsCapturing(false)
    setCaptureStatus('idle')
    setErrorMessage('')
    setCaptureMessage('')
    setLimitInfo(null)
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

  if (captureStatus === 'limit_reached' && limitInfo) {
    const isPro = limitInfo.subscription_tier === 'pro'
    const resetDateFormatted = new Date(limitInfo.reset_date + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric'
    })

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="bg-background border rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
          <div className={`px-6 pt-8 pb-6 text-center ${
            isPro 
              ? 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30' 
              : 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30'
          }`}>
            <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 ${
              isPro 
                ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-200/50 dark:shadow-amber-900/30' 
                : 'bg-gradient-to-br from-blue-400 to-indigo-500 shadow-lg shadow-blue-200/50 dark:shadow-blue-900/30'
            }`}>
              <Clock className="h-7 w-7 text-white" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-1">
              Monthly Limit Reached
            </h2>
            <p className="text-sm text-muted-foreground">
              You&apos;ve used all <span className="font-semibold">{limitInfo.clips_limit}</span> clips this month
            </p>
          </div>

          <div className="px-6 py-5 space-y-4">
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-red-400 to-red-500 rounded-full" style={{ width: '100%' }} />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{limitInfo.clips_this_month} / {limitInfo.clips_limit} clips used</span>
              <span className="font-medium text-foreground">{limitInfo.days_until_reset} days until reset</span>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border/50">
              <Clock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Resets {resetDateFormatted}</p>
                <p className="text-xs text-muted-foreground">Your clip allowance refreshes at the start of each billing cycle</p>
              </div>
            </div>

            {isPro ? (
              <a
                href="mailto:support@pagestash.app?subject=Pro%20Plan%20-%20Clip%20Limit%20Inquiry"
                className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/30 hover:bg-amber-100 dark:hover:bg-amber-950/30 transition-colors"
              >
                <Mail className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-300">Need more clips?</p>
                  <p className="text-xs text-amber-700/80 dark:text-amber-400/60">Contact support to discuss your needs</p>
                </div>
              </a>
            ) : (
              <button
                onClick={() => {
                  handleClose()
                  window.location.href = '/dashboard?upgrade=true'
                }}
                className="w-full flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all group"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/20">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-white">Upgrade to Pro</p>
                  <p className="text-xs text-blue-100">1,000 clips/month, 5GB storage, and more</p>
                </div>
              </button>
            )}
          </div>

          <div className="px-6 pb-6">
            <Button variant="outline" onClick={handleClose} className="w-full">
              Close
            </Button>
          </div>
        </div>
      </div>
    )
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
            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 dark:text-red-300">{errorMessage}</p>
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

