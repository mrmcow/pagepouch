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
  PlayIcon,
  SparklesIcon,
  TrendingUpIcon,
  UsersIcon,
  CrownIcon,
  InfinityIcon,
  DatabaseIcon,
  BrainIcon,
  RocketIcon
} from 'lucide-react'

// Enhanced browser detection with download URLs
const getBrowserInfo = () => {
  if (typeof window === 'undefined') return { 
    name: 'Chrome', 
    icon: 'chrome', 
    downloadUrl: '/extension/downloads/pagepouch-extension-chrome.zip',
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
    downloadUrl: '/extension/downloads/pagepouch-extension-chrome.zip',
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
    // Always use the modal for better UX with instructions
    const browserType = detectedBrowser?.name === 'Firefox' ? 'firefox' : 'chrome'
    handleDownloadClick(browserType)
  }
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* Floating Header */}
      <header className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-6xl px-4">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-lg shadow-black/5">
          <div className="px-6 py-4 flex items-center justify-between">
            <LogoWithText size={40} />
            <div className="flex items-center space-x-3">
              <Button variant="ghost" className="font-medium hover:bg-slate-100/50 dark:hover:bg-slate-800/50" asChild>
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button className="font-medium group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25" asChild>
                <Link href="/auth/signup">
                  <SparklesIcon className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                  Start Free
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Premium & Unique */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        {/* Sophisticated Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-500/15 to-indigo-500/15 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          {/* Subtle geometric elements */}
          <div className="absolute top-40 right-20 w-2 h-2 bg-blue-400/30 rounded-full animate-ping"></div>
          <div className="absolute bottom-40 left-20 w-1 h-1 bg-indigo-400/40 rounded-full animate-ping delay-500"></div>
        </div>
        
        <div className="pagepouch-container relative">
          <div className="text-center mb-16">

            <h1 className="text-6xl lg:text-8xl font-bold mb-8 text-balance leading-tight">
              <span className="bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-900 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent">
                Capture the web
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                like a pro
              </span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-slate-600 dark:text-slate-300 mb-12 max-w-4xl mx-auto text-balance leading-relaxed">
              The only web archival tool built for researchers, analysts, and professionals who demand 
              <span className="font-semibold text-slate-800 dark:text-slate-200"> instant capture, intelligent search, and beautiful organization.</span>
            </p>

            {/* Social Proof */}
            <div className="flex items-center justify-center gap-8 mb-12 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <UsersIcon className="h-4 w-4" />
                <span>10,000+ researchers</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUpIcon className="h-4 w-4" />
                <span>2M+ pages captured</span>
              </div>
              <div className="flex items-center gap-2">
                <StarIcon className="h-4 w-4 fill-current text-yellow-500" />
                <span>4.9/5 rating</span>
              </div>
            </div>
          </div>

          {/* Premium CTA Section - Sophisticated Design */}
          <div className="max-w-xl mx-auto">
            <div className="relative">
              {/* Subtle glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-3xl blur-xl"></div>
              <div className="relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/30 dark:border-slate-700/30 rounded-3xl p-10 shadow-2xl shadow-blue-500/10">
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold mb-3 text-slate-800 dark:text-slate-200">Start Your Free Trial</h3>
                  <p className="text-lg text-slate-600 dark:text-slate-400">50 clips free • No credit card required • Instant setup</p>
                </div>
                
                <div className="flex justify-center mb-8">
                  <BrowserSelector onDownloadClick={handleDownloadClick} />
                </div>
                
                <div className="text-center">
                  <div className="relative mb-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-white dark:bg-slate-900 px-3 text-slate-500 dark:text-slate-400">or</span>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="font-medium border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 px-8 shadow-sm hover:shadow-md transition-all duration-200" 
                    asChild
                  >
                    <Link href="/auth/signup">
                      <RocketIcon className="mr-2 h-4 w-4" />
                      Start with web dashboard
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-white/50 to-slate-50/80 dark:from-slate-900/50 dark:to-slate-800/80">
        <div className="pagepouch-container">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-balance">
              <span className="text-slate-800 dark:text-slate-200">Choose your</span>
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> research power</span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto text-balance">
              Start free, upgrade when you need unlimited capturing for serious research work.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto items-start">
            {/* Free Tier - Enhanced Depth */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-200/30 to-slate-300/30 rounded-3xl blur-sm group-hover:blur-md transition-all duration-300"></div>
              <div className="relative bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/60 rounded-3xl p-8 shadow-xl shadow-slate-500/10 hover:shadow-2xl hover:shadow-slate-500/15 transition-all duration-300">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2 text-slate-800 dark:text-slate-200">Free Trial</h3>
                <div className="text-4xl font-bold mb-4 text-slate-800 dark:text-slate-200">$0</div>
                <p className="text-slate-600 dark:text-slate-400">Perfect for trying PagePouch</p>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <CheckIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300"><strong>50 clips</strong> per month</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300"><strong>100MB</strong> storage</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">Full-text search</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">Folders & organization</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">Chrome & Firefox extensions</span>
                </li>
              </ul>
              
              <Button 
                className="w-full font-medium bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 shadow-lg hover:shadow-xl transition-all duration-200" 
                onClick={handleSmartDownload}
              >
                <DownloadIcon className="mr-2 h-4 w-4" />
                Start Free Trial
              </Button>
              </div>
            </div>

            {/* Pro Tier - Sophisticated Highlight */}
            <div className="relative group transform scale-105">
              {/* Enhanced glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/40 to-indigo-500/40 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              <div className="relative bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl p-8 shadow-2xl shadow-blue-500/30 border border-blue-400/40 hover:shadow-3xl hover:shadow-blue-500/40 transition-all duration-300">
                {/* Refined Badge */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-white text-blue-600 rounded-2xl px-6 py-2 shadow-xl border border-blue-100/50 backdrop-blur-sm">
                    <span className="text-sm font-semibold tracking-wide">RECOMMENDED</span>
                  </div>
                </div>
              
              <div className="text-center mb-8 text-white pt-4">
                <h3 className="text-2xl font-bold mb-2">PagePouch Pro</h3>
                <div className="flex items-baseline justify-center gap-2 mb-4">
                  <span className="text-4xl font-bold">$4</span>
                  <span className="text-lg opacity-80">/month</span>
                </div>
                <p className="opacity-90">For serious researchers</p>
                <div className="mt-2 text-sm opacity-75">
                  or $40/year (save $8)
                </div>
              </div>
              
              <ul className="space-y-4 mb-8 text-white">
                <li className="flex items-center gap-3">
                  <CheckIcon className="h-5 w-5 text-green-300 flex-shrink-0" />
                  <span><strong>1,000 clips</strong> per month</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckIcon className="h-5 w-5 text-green-300 flex-shrink-0" />
                  <span><strong>5GB</strong> storage</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckIcon className="h-5 w-5 text-green-300 flex-shrink-0" />
                  <span>Full-text search</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckIcon className="h-5 w-5 text-green-300 flex-shrink-0" />
                  <span>Unlimited folders & tags</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckIcon className="h-5 w-5 text-green-300 flex-shrink-0" />
                  <span>Beautiful dashboard</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckIcon className="h-5 w-5 text-green-300 flex-shrink-0" />
                  <span>Priority support</span>
                </li>
              </ul>
              
              <Button 
                className="w-full font-medium bg-white text-blue-600 hover:bg-slate-50 shadow-lg hover:shadow-xl transition-all duration-200" 
                asChild
              >
                <Link href="/auth/signup">
                  <SparklesIcon className="mr-2 h-4 w-4" />
                  Upgrade to Pro
                </Link>
              </Button>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Start with the free trial, upgrade anytime. No long-term commitments.
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheckIcon className="h-4 w-4" />
                <span>30-day money back</span>
              </div>
              <div className="flex items-center gap-2">
                <ZapIcon className="h-4 w-4" />
                <span>Instant activation</span>
              </div>
              <div className="flex items-center gap-2">
                <UsersIcon className="h-4 w-4" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* App Screenshots Showcase */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="pagepouch-container">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600/10 to-pink-600/10 border border-purple-200/50 dark:border-purple-800/50 rounded-full px-4 py-2 mb-8">
              <SparklesIcon className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                See PagePouch in Action
              </span>
            </div>
            
            <h2 className="text-4xl lg:text-5xl font-bold mb-8 text-balance">
              <span className="text-slate-800 dark:text-slate-200">Beautiful dashboard,</span>
              <br />
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">powerful features</span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto text-balance">
              Experience the most elegant way to capture, organize, and search your web research.
            </p>
          </div>

          {/* Dashboard Mockup */}
          <div className="max-w-6xl mx-auto mb-20">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl blur-2xl"></div>
              <div className="relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-3xl p-8 shadow-2xl shadow-purple-500/10">
                {/* Browser Chrome */}
                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="flex-1 text-center">
                    <div className="bg-slate-100 dark:bg-slate-800 rounded-lg px-4 py-2 text-sm text-slate-600 dark:text-slate-400">
                      pagepouch.com/dashboard
                    </div>
                  </div>
                </div>

                {/* Dashboard Content */}
                <div className="grid lg:grid-cols-4 gap-6">
                  {/* Sidebar */}
                  <div className="lg:col-span-1">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">All Clips (247)</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-slate-600 dark:text-slate-400">Research (89)</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-sm text-slate-600 dark:text-slate-400">Articles (156)</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="text-sm text-slate-600 dark:text-slate-400">References (23)</span>
                      </div>
                    </div>
                  </div>

                  {/* Main Content */}
                  <div className="lg:col-span-3">
                    {/* Search Bar */}
                    <div className="mb-6">
                      <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <div className="bg-slate-100 dark:bg-slate-800 rounded-lg pl-10 pr-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                          Search across all your captured content...
                        </div>
                      </div>
                    </div>

                    {/* Clips Grid */}
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {/* Clip Card 1 */}
                      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="aspect-video bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center">
                          <div className="text-xs text-slate-500 dark:text-slate-400">Screenshot Preview</div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-medium text-sm text-slate-800 dark:text-slate-200 mb-1">AI Research Paper</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">arxiv.org • 2 days ago</p>
                        </div>
                      </div>

                      {/* Clip Card 2 */}
                      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="aspect-video bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 flex items-center justify-center">
                          <div className="text-xs text-slate-500 dark:text-slate-400">Screenshot Preview</div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-medium text-sm text-slate-800 dark:text-slate-200 mb-1">Market Analysis</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">bloomberg.com • 1 week ago</p>
                        </div>
                      </div>

                      {/* Clip Card 3 */}
                      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="aspect-video bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 flex items-center justify-center">
                          <div className="text-xs text-slate-500 dark:text-slate-400">Screenshot Preview</div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-medium text-sm text-slate-800 dark:text-slate-200 mb-1">Design Trends</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">dribbble.com • 3 days ago</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Extension Popup Mockup */}
            <div className="text-center">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-2xl blur-xl"></div>
                <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-xl max-w-sm mx-auto">
                  <div className="flex items-center gap-3 mb-4">
                    <LogoIcon size={24} />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">PagePouch</span>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                      <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Folder</div>
                      <div className="text-sm text-slate-700 dark:text-slate-300">Research</div>
                    </div>
                    <Button size="sm" className="w-full">
                      📸 Capture Page
                    </Button>
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-800 dark:text-slate-200">One-Click Capture</h3>
              <p className="text-slate-600 dark:text-slate-300">Simple extension popup for instant page capture</p>
            </div>

            {/* Search Results Mockup */}
            <div className="text-center">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl"></div>
                <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-xl max-w-sm mx-auto">
                  <div className="mb-4">
                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-lg p-2">
                      <SearchIcon className="h-4 w-4 text-slate-400" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">machine learning</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-left p-2 bg-blue-50 dark:bg-blue-900/20 rounded border-l-2 border-blue-500">
                      <div className="text-xs font-medium text-slate-700 dark:text-slate-300">AI Research Paper</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">...machine learning algorithms...</div>
                    </div>
                    <div className="text-left p-2 bg-green-50 dark:bg-green-900/20 rounded border-l-2 border-green-500">
                      <div className="text-xs font-medium text-slate-700 dark:text-slate-300">ML Tutorial</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">...introduction to machine learning...</div>
                    </div>
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-800 dark:text-slate-200">Instant Search</h3>
              <p className="text-slate-600 dark:text-slate-300">Find any content across all your captures</p>
            </div>

            {/* Organization Mockup */}
            <div className="text-center">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl"></div>
                <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-xl max-w-sm mx-auto">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                      <FolderIcon className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-slate-700 dark:text-slate-300">Research (89)</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded">
                      <FolderIcon className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-slate-700 dark:text-slate-300">Articles (156)</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                      <FolderIcon className="h-4 w-4 text-purple-500" />
                      <span className="text-sm text-slate-700 dark:text-slate-300">References (23)</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex flex-wrap gap-1">
                        <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">AI</span>
                        <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">ML</span>
                        <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">Research</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-800 dark:text-slate-200">Smart Organization</h3>
              <p className="text-slate-600 dark:text-slate-300">Folders, tags, and notes keep everything organized</p>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Features Section */}
      <section className="py-24 px-4 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(255,119,198,0.1),transparent_50%)]"></div>
        
        <div className="pagepouch-container relative">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border border-blue-200/50 dark:border-blue-800/50 rounded-full px-4 py-2 mb-8">
              <BrainIcon className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Built for Intelligence Work
              </span>
            </div>
            
            <h2 className="text-4xl lg:text-6xl font-bold mb-8 text-balance">
              <span className="text-slate-800 dark:text-slate-200">Why professionals choose</span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">PagePouch</span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto text-balance leading-relaxed">
              The only web archival tool designed from the ground up for researchers, analysts, and knowledge workers who demand perfection.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Feature 1 - Lightning Capture */}
            <div className="group">
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-3xl p-8 shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-black/10 transition-all duration-300 hover:-translate-y-2 h-full flex flex-col">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <ZapIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-200">Lightning Capture</h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6 flex-grow">
                  One-click capture of any webpage with full screenshot, HTML source, metadata, and text extraction. Never lose content again with our reliable archival system.
                </p>
                <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 font-medium">
                  <span>Perfect capture every time</span>
                  <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* Feature 2 - Intelligent Search */}
            <div className="group">
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-3xl p-8 shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-black/10 transition-all duration-300 hover:-translate-y-2 h-full flex flex-col">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <SearchIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-200">Intelligent Search</h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6 flex-grow">
                  Full-text search across all captured content with advanced filters, tags, and date ranges. Find any piece of information instantly with powerful search algorithms.
                </p>
                <div className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400 font-medium">
                  <span>Search like a pro</span>
                  <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* Feature 3 - Smart Organization */}
            <div className="group">
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-3xl p-8 shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-black/10 transition-all duration-300 hover:-translate-y-2 h-full flex flex-col">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <DatabaseIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-200">Smart Organization</h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6 flex-grow">
                  Unlimited folders, custom tags, and rich notes with instant organization tools. Keep your research structured, accessible, and perfectly organized for maximum productivity.
                </p>
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 font-medium">
                  <span>Stay organized effortlessly</span>
                  <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-20 bg-gradient-to-r from-slate-800 to-slate-900 dark:from-slate-700 dark:to-slate-800 rounded-3xl p-12 text-white">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold mb-4">Trusted by researchers worldwide</h3>
              <p className="text-slate-300 text-lg">Join thousands of professionals who rely on PagePouch for their most important work</p>
            </div>
            
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold mb-2 text-blue-400">10K+</div>
                <div className="text-slate-300">Active Researchers</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2 text-indigo-400">2M+</div>
                <div className="text-slate-300">Pages Captured</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2 text-purple-400">99.9%</div>
                <div className="text-slate-300">Uptime</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2 text-pink-400">4.9★</div>
                <div className="text-slate-300">User Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works - Conversion Focused */}
      <section className="py-24 px-4 relative overflow-hidden">
        {/* Subtle Professional Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50/80 via-white to-blue-50/30 dark:from-slate-900/80 dark:via-slate-800 dark:to-slate-700/80"></div>
        <div className="absolute inset-0 opacity-40" style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e2e8f0' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"}}></div>
        
        <div className="pagepouch-container relative">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600/10 to-emerald-600/10 border border-green-200/50 dark:border-green-800/50 rounded-full px-4 py-2 mb-8">
              <RocketIcon className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                Ready in 60 seconds
              </span>
            </div>
            
            <h2 className="text-4xl lg:text-5xl font-bold mb-8 text-balance">
              <span className="text-slate-800 dark:text-slate-200">Start capturing in</span>
              <br />
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">3 simple steps</span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto text-balance">
              From installation to your first captured page in under a minute. No complex setup required.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-12 max-w-5xl mx-auto mb-16">
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl font-bold text-white">1</span>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckIcon className="h-3 w-3 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-200">Install Extension</h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Add PagePouch to Chrome or Firefox in one click. Works instantly, no account required to start.
              </p>
            </div>

            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-purple-500/25 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl font-bold text-white">2</span>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <ZapIcon className="h-3 w-3 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-200">One-Click Capture</h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Visit any webpage and click the PagePouch icon. Full screenshot, HTML, and text captured automatically.
              </p>
            </div>

            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-green-500/25 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl font-bold text-white">3</span>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <SearchIcon className="h-3 w-3 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-200">Search & Organize</h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Access your beautiful dashboard to search, organize with folders, and find any captured content instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section - Professional */}
      <section className="py-24 px-4 relative overflow-hidden">
        {/* Professional gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.15),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(99,102,241,0.15),transparent_50%)]"></div>
        <div className="absolute inset-0" style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"}}></div>
        
        <div className="pagepouch-container relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-8">
              <SparklesIcon className="h-4 w-4 text-blue-300" />
              <span className="text-sm font-medium text-blue-200">
                Trusted by 10,000+ researchers
              </span>
            </div>
            
            <h2 className="text-4xl lg:text-6xl font-bold mb-8 text-balance text-white">
              Ready to capture the web
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent"> like a pro?</span>
            </h2>
            <p className="text-xl mb-12 text-slate-300 text-balance leading-relaxed">
              Join thousands of analysts and researchers who rely on PagePouch for their most critical work. 
              <br />Start capturing in under 60 seconds.
            </p>
            
            {/* Two-column CTA */}
            <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto mb-12">
              {/* Extension CTA */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <DownloadIcon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2 text-white">Browser Extension</h3>
                  <p className="text-slate-300">Start capturing immediately</p>
                </div>
                
                <Button 
                  size="lg" 
                  className="w-full text-lg py-4 h-auto font-semibold group bg-white text-slate-900 hover:bg-slate-100 shadow-lg mb-4"
                  onClick={handleSmartDownload}
                >
                  <DownloadIcon className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  {detectedBrowser ? `Add to ${detectedBrowser.name}` : 'Install Extension'}
                </Button>
                
                <div className="flex items-center justify-center gap-4 text-sm text-slate-300">
                  <div className="flex items-center gap-1">
                    <CheckIcon className="h-4 w-4 text-green-400" />
                    <span>50 clips free</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckIcon className="h-4 w-4 text-green-400" />
                    <span>No signup needed</span>
                  </div>
                </div>
              </div>

              {/* Web App CTA */}
              <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 backdrop-blur-xl border border-blue-400/30 rounded-3xl p-8">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <RocketIcon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2 text-white">Web Dashboard</h3>
                  <p className="text-slate-300">Full research workspace</p>
                </div>
                
                <Button 
                  size="lg" 
                  className="w-full text-lg py-4 h-auto font-semibold group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg mb-4"
                  asChild
                >
                  <Link href="/auth/signup">
                    <SparklesIcon className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                    Start Free Trial
                  </Link>
                </Button>
                
                <div className="flex items-center justify-center gap-4 text-sm text-slate-300">
                  <div className="flex items-center gap-1">
                    <CheckIcon className="h-4 w-4 text-green-400" />
                    <span>Full dashboard</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckIcon className="h-4 w-4 text-green-400" />
                    <span>Advanced search</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-slate-400 text-sm mb-4">
                Available for Chrome and Firefox • No credit card required • Cancel anytime
              </p>
              <div className="flex items-center justify-center gap-6 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <ShieldCheckIcon className="h-4 w-4" />
                  <span>30-day guarantee</span>
                </div>
                <div className="flex items-center gap-2">
                  <ZapIcon className="h-4 w-4" />
                  <span>Instant setup</span>
                </div>
                <div className="flex items-center gap-2">
                  <UsersIcon className="h-4 w-4" />
                  <span>10K+ users</span>
                </div>
              </div>
            </div>
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
