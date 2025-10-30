'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import * as analytics from '@/lib/analytics'
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
  RocketIcon,
  CameraIcon,
  CodeIcon,
  FileTextIcon
} from 'lucide-react'

// Enhanced browser detection with download URLs
const getBrowserInfo = () => {
  if (typeof window === 'undefined') return { 
    name: 'Chrome', 
    icon: 'chrome', 
    downloadUrl: '/extension/downloads/pagestash-extension-chrome.zip',
    directDownload: true
  }
  
  const userAgent = window.navigator.userAgent
  console.log('🔍 User Agent:', userAgent) // Debug log
  
  // Firefox detection - must check Firefox specifically (NOT just Gecko, as Chrome also has Gecko in UA)
  if (userAgent.includes('Firefox')) {
    console.log('✅ Firefox detected!') // Debug log
    return { 
      name: 'Firefox', 
      icon: 'firefox', 
      downloadUrl: '/extension/downloads/pagestash-extension-firefox.zip',
      storeUrl: 'https://addons.mozilla.org/en-US/firefox/addon/pagestash/',
      directDownload: true,
      installInstructions: 'Download and install via about:debugging'
    }
  }
  
  // Default to Chrome for all other browsers (Chrome, Edge, Safari, etc.)
  console.log('✅ Chrome detected (default)') // Debug log
  return { 
    name: 'Chrome', 
    icon: 'chrome', 
    downloadUrl: '/extension/downloads/pagestash-extension-chrome.zip',
    storeUrl: 'https://chrome.google.com/webstore/detail/pagestash/extension-id',
    directDownload: true,
    installInstructions: 'Download and install via chrome://extensions'
  }
}


export default function HomePage() {
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false)
  const [selectedBrowser, setSelectedBrowser] = useState<'chrome' | 'firefox'>('chrome')
  // Initialize with Chrome as default to avoid hydration mismatch
  const [detectedBrowser, setDetectedBrowser] = useState<any>({ name: 'Chrome', icon: 'chrome' })

  // Detect browser on component mount
  React.useEffect(() => {
    const browserInfo = getBrowserInfo()
    console.log('🔍 Detected browser:', browserInfo) // Debug log with emoji for visibility
    setDetectedBrowser(browserInfo)
    setSelectedBrowser(browserInfo.name.toLowerCase() as 'chrome' | 'firefox')
  }, [])

  const handleDownloadClick = (browser?: 'chrome' | 'firefox') => {
    if (browser) {
      setSelectedBrowser(browser)
    }
    
    // Track extension download click
    analytics.trackExtensionDownloadClicked({
      browser: browser || selectedBrowser,
      source: 'homepage'
    })
    
    setIsDownloadModalOpen(true)
  }

  const handleSmartDownload = () => {
    console.log('Smart download clicked, detected browser:', detectedBrowser) // Debug log
    
    // Always use the modal for better UX with instructions
    const browserType = detectedBrowser?.name === 'Firefox' ? 'firefox' : 'chrome'
    handleDownloadClick(browserType)
  }

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-950">
      {/* Clean Header - Fixed */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
        <div className="pagestash-container">
          <div className="px-4 py-4 flex items-center justify-between">
            <LogoWithText size={32} className="sm:hidden" />
            <LogoWithText size={40} className="hidden sm:block" />
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" className="font-medium hidden sm:inline-flex" asChild>
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button size="sm" className="font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" asChild>
                <Link href="/auth/signup">
                  <span className="hidden sm:inline">Start Free</span>
                  <span className="sm:hidden">Free</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Clean & Direct */}
      <section className="pt-20 sm:pt-24 lg:pt-32 pb-16 sm:pb-20 lg:pb-24">
        <div className="pagestash-container">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Side - Hero Text */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 text-balance leading-tight text-slate-900 dark:text-white">
                Capture the web
              <br />
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">like a pro</span>
            </h1>
            
              <p className="text-lg sm:text-xl lg:text-2xl text-slate-600 dark:text-slate-300 mb-8 lg:mb-10 text-balance leading-relaxed max-w-xl mx-auto lg:mx-0">
                The only web archival tool built for researchers, analysts, and professionals who demand instant capture, intelligent search, and beautiful organization.
            </p>

            {/* Social Proof */}
              <div className="flex flex-col md:flex-row md:flex-wrap items-center justify-center lg:justify-start gap-3 md:gap-6 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                  <UsersIcon className="h-4 w-4 text-slate-400 flex-shrink-0" />
                <span>10,000+ researchers</span>
              </div>
              <div className="flex items-center gap-2">
                  <TrendingUpIcon className="h-4 w-4 text-slate-400 flex-shrink-0" />
                <span>2M+ pages captured</span>
              </div>
              <div className="flex items-center gap-2">
                  <StarIcon className="h-4 w-4 fill-current text-yellow-500 flex-shrink-0" />
                <span>4.9/5 rating</span>
              </div>
            </div>
          </div>

            {/* Right Side - CTA Box */}
            <div className="w-full">
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 lg:p-10 shadow-sm">
                <div className="text-center mb-6 sm:mb-8">
                  <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">Start Your Free Trial</h3>
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">50 clips free • Free trial • 2-minute setup</p>
            </div>
            
                <BrowserSelector onDownloadClick={handleDownloadClick} />
                
                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 text-center">
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                    or start with the web dashboard
                  </p>
              <Button 
                variant="outline" 
                size="lg"
                    className="font-medium w-full" 
                asChild
              >
                <Link href="/auth/signup">
                      <RocketIcon className="mr-2 h-5 w-5" />
                      Open Dashboard
                </Link>
              </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 sm:py-24 px-4 bg-slate-50 dark:bg-slate-900">
        <div className="pagestash-container">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-slate-900 dark:text-white">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Start free, upgrade when you need more capacity for serious research work.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-8">
            {/* Free Tier */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">Free Trial</h3>
                <div className="text-5xl font-bold mb-4 text-slate-900 dark:text-white">$0</div>
                <p className="text-slate-600 dark:text-slate-400">Perfect for trying PageStash</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                  <CheckIcon className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span><strong>50 clips</strong> per month</span>
                </li>
                <li className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                  <CheckIcon className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span><strong>100MB</strong> storage</span>
                </li>
                <li className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                  <CheckIcon className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span>Full-text search</span>
                </li>
                <li className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                  <CheckIcon className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span>Folders & organization</span>
                </li>
                <li className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                  <CheckIcon className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span>Chrome & Firefox extensions</span>
                </li>
              </ul>
              
              <Button 
                className="w-full font-medium" 
                variant="outline"
                onClick={handleSmartDownload}
              >
                <DownloadIcon className="mr-2 h-4 w-4" />
                Start Free Trial
              </Button>
            </div>

            {/* Pro Tier */}
            <div className="relative bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg p-8 border border-blue-500 mt-6 transition-transform duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer">
              <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2 z-10">
                <div className="bg-white text-blue-600 px-4 py-1.5 text-xs font-semibold tracking-wide shadow-sm border border-slate-200 whitespace-nowrap">
                  MOST POPULAR
                  </div>
                </div>
              
              <div className="text-center mb-8 text-white pt-4">
                <h3 className="text-2xl font-bold mb-2">PageStash Pro</h3>
                <div className="flex items-baseline justify-center gap-2 mb-2">
                  <span className="text-5xl font-bold">$4</span>
                  <span className="text-xl">/month</span>
                </div>
                <p className="text-sm">or $40/year (save $8)</p>
              </div>
              
              <ul className="space-y-3 mb-8 text-white">
                <li className="flex items-center gap-3">
                  <CheckIcon className="h-5 w-5 flex-shrink-0" />
                  <span><strong>1,000 clips</strong> per month</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckIcon className="h-5 w-5 flex-shrink-0" />
                  <span><strong>5GB</strong> storage</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckIcon className="h-5 w-5 flex-shrink-0" />
                  <span>Full-text search</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckIcon className="h-5 w-5 flex-shrink-0" />
                  <span>Unlimited folders & tags</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckIcon className="h-5 w-5 flex-shrink-0" />
                  <span>Priority support</span>
                </li>
              </ul>
              
              <Button 
                className="w-full font-medium bg-white text-blue-600 hover:bg-blue-50 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl" 
                asChild
              >
                <Link href="/auth/signup">
                  Upgrade to Pro
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <ZapIcon className="h-4 w-4" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works - MOVED UP for better sequencing */}
      <section className="py-20 sm:py-24 px-4 bg-white dark:bg-slate-950">
        <div className="pagestash-container">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-slate-900 dark:text-white">
              Start capturing in 3 simple steps
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              From installation to your first captured page in under a minute.
            </p>
            </div>
            
          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto mb-20">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Install Extension</h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Add PageStash to Chrome or Firefox in one click. Sign up free to start capturing instantly.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Capture Content</h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Click the PageStash icon on any webpage. Full screenshot and text captured automatically.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Search & Organize</h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Access your dashboard to search, organize with folders, and find content instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Overview with Visual Depth */}
      <section className="py-20 sm:py-24 px-4 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 relative">
        {/* Add subtle pattern for depth */}
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]" style={{backgroundImage: "radial-gradient(circle at 2px 2px, rgb(0 0 0) 1px, transparent 0)", backgroundSize: "32px 32px"}}></div>
        
        <div className="pagestash-container relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-slate-900 dark:text-white">
              Everything you need to capture and organize
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Built for researchers and analysts who demand the best tools.
            </p>
          </div>

          {/* Dashboard Mockup */}
          <div className="max-w-5xl mx-auto mb-16">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-6 shadow-lg">
                {/* Browser Chrome */}
                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="flex-1 text-center">
                    <div className="bg-slate-100 dark:bg-slate-800 rounded-lg px-4 py-2 text-sm text-slate-600 dark:text-slate-400">
                      pagestash.com/dashboard
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
                      {/* Clip Card 1 - Realistic News Article */}
                      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="aspect-video bg-white relative overflow-hidden border-b border-slate-200">
                          <div className="absolute inset-0 flex flex-col p-3 text-xs">
                            {/* Fake news header */}
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-6 h-6 bg-red-600 rounded flex items-center justify-center text-white font-bold text-[10px]">BBC</div>
                              <div className="text-[10px] text-slate-400">News • Technology</div>
                            </div>
                            {/* Headline */}
                            <div className="font-bold text-slate-900 text-sm mb-2 leading-tight">AI Breakthrough: New Model Achieves Human-Level Reasoning</div>
                            {/* Excerpt */}
                            <div className="text-[10px] text-slate-600 leading-relaxed">Researchers at leading tech labs have announced a significant advancement in artificial intelligence, with their latest model demonstrating unprecedented...</div>
                            {/* Image placeholder */}
                            <div className="mt-auto h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded"></div>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-medium text-sm text-slate-800 dark:text-slate-200 mb-1">AI Breakthrough Announcement</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">bbc.com/technology • 2 days ago</p>
                        </div>
                      </div>

                      {/* Clip Card 2 - Financial News */}
                      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="aspect-video bg-white relative overflow-hidden border-b border-slate-200">
                          <div className="absolute inset-0 flex flex-col p-3 text-xs">
                            {/* Bloomberg style header */}
                            <div className="flex items-center justify-between mb-3">
                              <div className="font-bold text-black text-sm">BLOOMBERG</div>
                              <div className="text-[10px] text-slate-400">Markets</div>
                            </div>
                            {/* Headline */}
                            <div className="font-bold text-slate-900 text-sm mb-2 leading-tight">Tech Stocks Rally on Strong Earnings Reports</div>
                            {/* Excerpt */}
                            <div className="text-[10px] text-slate-600 leading-relaxed">Major technology companies exceeded analyst expectations in Q4, driving a surge in market valuations across the sector...</div>
                            {/* Chart placeholder */}
                            <div className="mt-auto h-12 bg-gradient-to-r from-green-50 via-emerald-100 to-green-50 rounded flex items-end justify-around p-1">
                              <div className="w-1 h-6 bg-green-500"></div>
                              <div className="w-1 h-8 bg-green-600"></div>
                              <div className="w-1 h-10 bg-green-500"></div>
                              <div className="w-1 h-7 bg-green-600"></div>
                              <div className="w-1 h-11 bg-green-700"></div>
                            </div>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-medium text-sm text-slate-800 dark:text-slate-200 mb-1">Q4 Earnings Market Analysis</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">bloomberg.com • 1 week ago</p>
                        </div>
                      </div>

                      {/* Clip Card 3 - Medium Article */}
                      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="aspect-video bg-white relative overflow-hidden border-b border-slate-200">
                          <div className="absolute inset-0 flex flex-col p-3 text-xs">
                            {/* Medium style header */}
                            <div className="flex items-center gap-2 mb-3">
                              <div className="text-black font-bold text-base">M</div>
                              <div className="text-[10px] text-slate-400">Design • UX Research</div>
                        </div>
                            {/* Headline */}
                            <div className="font-bold text-slate-900 text-sm mb-2 leading-tight">The Evolution of Design Systems in 2025</div>
                            {/* Excerpt */}
                            <div className="text-[10px] text-slate-600 leading-relaxed">Modern design systems have transformed how teams build products. Here's what we learned from implementing design systems at scale...</div>
                            {/* Author info */}
                            <div className="mt-auto flex items-center gap-2">
                              <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full"></div>
                              <div className="text-[9px] text-slate-500">Sarah Chen • 8 min read</div>
                        </div>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-medium text-sm text-slate-800 dark:text-slate-200 mb-1">Design Systems 2025 Trends</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">medium.com • 3 days ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Extension Popup Mockup */}
            <div className="text-center">
              <div className="mb-6">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-6 shadow-md max-w-sm mx-auto">
                  <div className="flex items-center gap-3 mb-4">
                    <LogoIcon size={24} />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">PageStash</span>
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
              <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">One-Click Capture</h3>
              <p className="text-slate-600 dark:text-slate-300">Simple extension popup for instant page capture</p>
            </div>

            {/* Search Results Mockup */}
            <div className="text-center">
              <div className="mb-6">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-6 shadow-md max-w-sm mx-auto">
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
              <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Instant Search</h3>
              <p className="text-slate-600 dark:text-slate-300">Find any content across all your captures</p>
            </div>

            {/* Organization Mockup */}
            <div className="text-center">
              <div className="mb-6">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-6 shadow-md max-w-sm mx-auto">
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
              <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Smart Organization</h3>
              <p className="text-slate-600 dark:text-slate-300">Folders, tags, and notes keep everything organized</p>
            </div>
          </div>

          {/* Preview Pane Showcase - New Section */}
          <div className="mt-20 max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">Rich Preview Experience</h3>
              <p className="text-xl text-slate-600 dark:text-slate-300">View, annotate, and interact with your captured pages</p>
            </div>
            
            {/* Preview Pane Mockup */}
            <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden">
              {/* Modal Header */}
              <div className="bg-slate-50 dark:bg-slate-800 px-6 py-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">6 of 50</span>
                  <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded text-xs font-medium text-blue-700 dark:text-blue-300">
                    <FolderIcon className="h-3 w-3" />
                    Research
          </div>
                </div>
                <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-sm font-medium">
                  Open Original →
                </button>
                </div>

              {/* Tab Navigation */}
              <div className="bg-white dark:bg-slate-900 px-6 py-3 flex items-center gap-6 border-b border-slate-200 dark:border-slate-700">
                <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium border border-blue-200 dark:border-blue-800">
                  <CameraIcon className="h-4 w-4" />
                  Screenshot
                </button>
                <button className="flex items-center gap-2 px-3 py-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 text-sm font-medium">
                  <CodeIcon className="h-4 w-4" />
                  HTML
                </button>
                <button className="flex items-center gap-2 px-3 py-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 text-sm font-medium">
                  <FileTextIcon className="h-4 w-4" />
                  Text
                </button>
            </div>

              {/* Content Area - Split View */}
              <div className="grid lg:grid-cols-3 h-[500px]">
                {/* Preview Content - Scrollable */}
                <div className="lg:col-span-2 bg-slate-50 dark:bg-slate-950 overflow-y-auto">
                  {/* Simulated Article Content */}
                  <div className="p-8 max-w-3xl mx-auto">
                    {/* Article Header */}
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded flex items-center justify-center text-white font-bold text-sm">
                          TC
                </div>
                        <div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">TechCrunch • Technology</div>
                </div>
              </div>
                      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
                        The Future of AI Research: Breaking New Ground
                      </h1>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        By Sarah Johnson • October 30, 2025 • 8 min read
                      </p>
            </div>

                    {/* Featured Image */}
                    <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-lg mb-6 overflow-hidden">
                      <img 
                        src="https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=450&fit=crop&auto=format" 
                        alt="AI and Technology"
                        className="w-full h-full object-cover"
                      />
                </div>

                    {/* Article Content */}
                    <div className="prose prose-slate dark:prose-invert max-w-none">
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                        Artificial intelligence research has reached an inflection point. Recent breakthroughs in machine learning 
                        are transforming how we approach complex problems across industries.
                      </p>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                        Leading researchers at top institutions have demonstrated remarkable progress in natural language 
                        understanding, computer vision, and reinforcement learning. These advances promise to reshape 
                        technology as we know it.
                      </p>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-6 mb-3">Key Developments</h2>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                        The integration of large language models with reasoning capabilities has opened new possibilities 
                        for AI applications. From scientific discovery to creative endeavors, these tools are becoming 
                        indispensable partners in human innovation.
                      </p>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                        Industry leaders emphasize the importance of responsible AI development, ensuring these powerful 
                        technologies benefit society while minimizing potential risks.
                      </p>
                      <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 my-6">
                        <p className="text-sm italic text-slate-700 dark:text-slate-300">
                          "We're witnessing a transformation that will define the next decade of technology."
                        </p>
                </div>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        As we look ahead, the convergence of AI capabilities with domain expertise continues to unlock 
                        unprecedented opportunities for innovation and discovery.
                      </p>
              </div>
            </div>
          </div>

                {/* Sidebar - Metadata & Notes */}
                <div className="lg:col-span-1 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 p-6 overflow-y-auto">
                  {/* Title */}
                  <div className="mb-6">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 block">
                      Title
                    </label>
                    <div className="text-sm text-slate-900 dark:text-slate-200 font-medium">
                      The Future of AI Research: Breaking New Ground
                    </div>
            </div>
            
                  {/* URL */}
                  <div className="mb-6">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 block">
                      URL
                    </label>
                    <div className="text-xs text-blue-600 dark:text-blue-400 truncate">
                      techcrunch.com/2025/10/ai-research...
              </div>
              </div>

                  {/* Captured Date */}
                  <div className="mb-6">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 block">
                      Captured
                    </label>
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      10/30/2025, 2:34:26 PM
              </div>
              </div>

                  {/* Folder */}
                  <div className="mb-6">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 block">
                      Folder
                    </label>
                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <FolderIcon className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-slate-700 dark:text-slate-300">Research</span>
            </div>
          </div>
          
                  {/* Notes */}
                  <div className="mb-6">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 block">
                      Notes
                    </label>
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 min-h-[100px] text-sm text-slate-600 dark:text-slate-400">
                      <span className="italic">Add your notes...</span>
                </div>
            </div>

                  {/* Tags */}
                  <div>
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 block">
                      Tags
                    </label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="text" 
                        placeholder="Add tag" 
                        className="flex-1 px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                      />
                      <button className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-lg">
                        +
                      </button>
                </div>
                    <div className="text-xs text-slate-400 mt-2">No tags</div>
            </div>

                  {/* Keyboard Shortcuts Hint */}
                  <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                    <div className="text-xs text-slate-400 space-y-1">
                      <div>← → Navigate</div>
                      <div>1-3 Tabs</div>
                      <div>Esc Close</div>
                </div>
                </div>
              </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 sm:py-24 px-4 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <div className="pagestash-container">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-white">
              Ready to capture the web like a pro?
            </h2>
            <p className="text-xl mb-12 text-slate-300">
              Join thousands of researchers who rely on PageStash for their most critical work.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-2xl mx-auto mb-8">
                <Button 
                  size="lg" 
                className="text-lg font-semibold bg-white text-slate-900 hover:bg-slate-100 px-8 py-6 h-auto"
                  onClick={handleSmartDownload}
                >
                <DownloadIcon className="mr-2 h-5 w-5" />
                {detectedBrowser?.name ? `Add to ${detectedBrowser.name}` : 'Install Extension'}
                </Button>
                
                <Button 
                  size="lg" 
                variant="outline"
                className="text-lg font-semibold bg-transparent text-white border-2 border-white hover:bg-white hover:text-blue-600 transition-all px-8 py-6 h-auto"
                  asChild
                >
                  <Link href="/auth/signup">
                  Open Dashboard
                  </Link>
                </Button>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-300">
                <div className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4" />
                <span>50 clips free</span>
                </div>
                <div className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4" />
                <span>Free trial</span>
                </div>
                <div className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4" />
                <span>2-minute setup</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="pagestash-container py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-3">
              <LogoIcon size={32} />
              <span className="text-xl font-bold text-slate-900 dark:text-white">PageStash</span>
            </div>

            <div className="flex items-center gap-8 text-sm">
              <Link href="/blog" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                Blog
              </Link>
              <Link href="/dashboard" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                Dashboard
              </Link>
              <Link href="/privacy" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                Privacy
              </Link>
              <Link href="/terms" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                Terms
              </Link>
              <a href="mailto:support@pagestash.app" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                Support
              </a>
            </div>

            <div className="text-sm text-slate-500 dark:text-slate-400">
              &copy; 2025 PageStash
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
