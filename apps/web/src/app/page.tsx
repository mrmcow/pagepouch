'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { trackExtensionDownloadClicked } from '@/lib/analytics'
import { LogoWithText, LogoIcon } from '@/components/ui/logo'
import { ChromeIcon } from '@/components/ui/browser-icons'
import { BrowserSelector } from '@/components/ui/browser-selector'
const DownloadModal = dynamic(
  () =>
    import('@/components/ui/download-modal').then((mod) => ({
      default: mod.DownloadModal,
    })),
  { ssr: false }
)
import { useScrollTracking } from '@/hooks/useScrollTracking'
import { useVisibilityTracking } from '@/hooks/useVisibilityTracking'
import { useExitIntentTracking, useButtonClickTracking } from '@/hooks/useCTATracking'
import { 
  ZapIcon,
  SearchIcon, 
  FolderIcon, 
  ShieldCheckIcon,
  DownloadIcon,
  ArrowRightIcon,
  CheckIcon,
  CameraIcon,
  LifeBuoyIcon,
  MessageCircleIcon,
  HelpCircleIcon,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// Enhanced browser detection with download URLs
const getBrowserInfo = () => {
  if (typeof window === 'undefined') return { 
    name: 'Chrome', 
    icon: 'chrome', 
    downloadUrl: '/extension/downloads/pagestash-extension-chrome.zip',
    directDownload: true
  }
  
  const userAgent = window.navigator.userAgent
  
  // Firefox detection - must check Firefox specifically (NOT just Gecko, as Chrome also has Gecko in UA)
  if (userAgent.includes('Firefox')) {
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
  return { 
    name: 'Chrome', 
    icon: 'chrome', 
    downloadUrl: '/extension/downloads/pagestash-extension-chrome.zip',
    storeUrl: 'https://chromewebstore.google.com/detail/pagestash/pimbnkabbjeacahcclicmfdkhojnjmif',
    directDownload: true,
    installInstructions: 'Download and install via chrome://extensions'
  }
}


export default function HomePage() {
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false)
  const [selectedBrowser, setSelectedBrowser] = useState<'chrome' | 'firefox'>('chrome')
  // Initialize with Chrome as default to avoid hydration mismatch
  const [detectedBrowser, setDetectedBrowser] = useState<any>({ name: 'Chrome', icon: 'chrome' })
  const [isScrolled, setIsScrolled] = useState(false)

  // Analytics Hooks
  useScrollTracking() // Track scroll depth automatically
  const { incrementCTAInteractions } = useExitIntentTracking() // Track exit intent
  const trackButtonClick = useButtonClickTracking() // Track button clicks with context
  
  // Section visibility tracking
  const heroRef = useVisibilityTracking({ sectionName: 'hero', threshold: 0.3 })
  const pricingRef = useVisibilityTracking({ sectionName: 'pricing', threshold: 0.5 })
  const howItWorksRef = useVisibilityTracking<HTMLDivElement>({ sectionName: 'how_it_works', threshold: 0.5 })
  const featuresRef = useVisibilityTracking<HTMLDivElement>({ sectionName: 'features', threshold: 0.5 })
  const previewPaneRef = useVisibilityTracking<HTMLDivElement>({ sectionName: 'preview_pane', threshold: 0.5 })
  const finalCTARef = useVisibilityTracking<HTMLDivElement>({ sectionName: 'final_cta', threshold: 0.5 })
  const faqRef = useVisibilityTracking<HTMLDivElement>({ sectionName: 'faq', threshold: 0.5 })

  // Detect browser on component mount
  React.useEffect(() => {
    const browserInfo = getBrowserInfo()
    setDetectedBrowser(browserInfo)
    setSelectedBrowser(browserInfo.name.toLowerCase() as 'chrome' | 'firefox')
  }, [])

  React.useEffect(() => {
    if (typeof window === 'undefined') return
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 16)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleDownloadClick = (browser?: 'chrome' | 'firefox', location: string = 'hero') => {
    if (browser) {
      setSelectedBrowser(browser)
    }
    
    // Track extension download click
    trackExtensionDownloadClicked({
      browser: browser || selectedBrowser,
      source: 'homepage'
    })
    
    // Track CTA click with context
    trackButtonClick(
      `extension_download_${browser || selectedBrowser}_${location}`,
      `Add to ${browser === 'firefox' ? 'Firefox' : 'Chrome'}`,
      location
    )
    
    incrementCTAInteractions()
    setIsDownloadModalOpen(true)
  }

  const handleSmartDownload = () => {
    const browserType = detectedBrowser?.name === 'Firefox' ? 'firefox' : 'chrome'
    handleDownloadClick(browserType)
  }

  return (
    <>
      {/* JSON-LD Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'PageStash',
            applicationCategory: 'ProductivityApplication',
            operatingSystem: 'Chrome, Firefox, Edge, Brave',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
              availability: 'https://schema.org/InStock',
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '4.9',
              ratingCount: '10000',
              bestRating: '5',
            },
            description: 'PageStash archives every web page exactly as you saw it — full screenshot, full text — and lets you search what\'s inside weeks later. The web clipper for researchers who actually need to find what they saved.',
            url: 'https://www.pagestash.app',
            image: 'https://www.pagestash.app/og-image.png',
            author: {
              '@type': 'Organization',
              name: 'PageStash',
            },
            provider: {
              '@type': 'Organization',
              name: 'PageStash',
              url: 'https://www.pagestash.app',
            },
          }),
        }}
      />
      
      {/* FAQ Schema for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'How does PageStash work?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'PageStash is a browser extension that captures full-page screenshots and extracts text from any webpage with a single click. All your captures are automatically synced to your secure dashboard where you can search, organize, and access them from anywhere.',
                },
              },
              {
                '@type': 'Question',
                name: 'Is my data secure and private?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Yes. Your data is encrypted in transit and at rest. We use industry-standard security practices and never share your data with third parties. You can delete your account and all associated data at any time.',
                },
              },
              {
                '@type': 'Question',
                name: 'What browsers are supported?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'PageStash works on Google Chrome, Microsoft Edge, Brave, and Mozilla Firefox. Simply download the extension for your browser and sign up for a free account to get started.',
                },
              },
              {
                '@type': 'Question',
                name: "What's included in the free plan?",
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'The free plan includes 10 clips per month, 100MB of storage, full-text search, folders & organization, and both Chrome & Firefox extensions. Perfect for trying PageStash and light usage.',
                },
              },
              {
                '@type': 'Question',
                name: 'Can I upgrade or downgrade my plan?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Yes. You can upgrade to Pro at any time to get 1,000 clips per month and 5GB of storage. You can also cancel anytime with no fees or penalties. Your data will remain accessible even if you downgrade.',
                },
              },
              {
                '@type': 'Question',
                name: 'Can I export my captured content?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Yes. You can download your screenshots and extracted text at any time. Pro users also have access to bulk export features for easy backup and portability.',
                },
              },
            ],
          }),
        }}
      />
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-950 selection:bg-blue-100 selection:text-blue-900">
      {/* Clean Header - Enterprise Grade */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div
          className={`pointer-events-auto transition-opacity duration-500 ${
            isScrolled ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <div className="pagestash-container px-4 sm:px-6 flex items-center justify-between py-3.5 sm:py-6 text-slate-900 dark:text-slate-100">
            <LogoWithText size={36} className="sm:[&_svg]:w-11 sm:[&_svg]:h-11" />
            <div className="flex items-center gap-2 sm:gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                className="font-medium hidden sm:inline-flex rounded-full text-slate-600 hover:text-slate-900 dark:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-white/10 px-4" 
                asChild
                onClick={() => {
                  trackButtonClick('header_signin', 'Sign In', 'header', '/auth/login')
                  incrementCTAInteractions()
                }}
              >
                <Link href="/auth/login">Log in</Link>
              </Button>
              <Button 
                size="sm" 
                className="font-semibold bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 shadow-md hover:shadow-lg transition-all px-4 sm:px-6 h-9 sm:h-10 text-sm rounded-full" 
                asChild
                onClick={() => {
                  trackButtonClick('header_start_free', 'Start Free', 'header', '/auth/signup')
                  incrementCTAInteractions()
                }}
              >
                <Link href="/auth/signup">
                  <span className="hidden sm:inline">Get Started</span>
                  <span className="sm:hidden">Start</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {isScrolled && (
          <>
            <div className="fixed top-4 left-3 sm:left-6 z-50">
              <div className="inline-flex items-center bg-white dark:bg-slate-900 rounded-full pl-3 pr-4 py-2 shadow-[0_20px_60px_-30px_rgba(2,6,23,1)] border border-white/70 dark:border-white/20 backdrop-blur-xl">
                <LogoWithText
                  size={32}
                  textClassName="!text-slate-900 dark:!text-white font-semibold !tracking-tight dark:drop-shadow-[0_1px_2px_rgba(0,0,0,0.75)]"
                />
              </div>
            </div>
            <div className="fixed top-4 right-3 sm:right-6 z-50 flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                className="font-medium hidden sm:inline-flex rounded-full text-slate-900 bg-white/90 border border-white/70 shadow px-5 py-2 hover:bg-white pointer-events-auto" 
                asChild
                onClick={() => {
                  trackButtonClick('header_signin', 'Sign In', 'header', '/auth/login')
                  incrementCTAInteractions()
                }}
              >
                <Link href="/auth/login">Log in</Link>
              </Button>
              <Button 
                size="sm" 
                className="font-semibold bg-slate-900 text-white hover:bg-slate-800 shadow-md hover:shadow-lg transition-all px-6 h-10 rounded-full pointer-events-auto" 
                asChild
                onClick={() => {
                  trackButtonClick('header_start_free', 'Start Free', 'header', '/auth/signup')
                  incrementCTAInteractions()
                }}
              >
                <Link href="/auth/signup">
                  <span className="hidden sm:inline">Get Started</span>
                  <span className="sm:hidden">Start</span>
                </Link>
              </Button>
            </div>
          </>
        )}
      </header>

      {/* Hero + Pricing share one continuous background */}
      <div className="bg-gradient-to-b from-white via-white to-slate-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900/50">

      {/* Hero Section - Elite & Precise */}
      <section 
        ref={heroRef}
        data-section="hero"
        className="relative pt-14 sm:pt-32 lg:pt-32 pb-6 sm:pb-14 px-4 sm:px-6"
      >
        {/* overflow-hidden scoped to orb container only — avoids paint-layer edge on section boundary */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]" />
          <div className="absolute -top-32 -right-32 w-[520px] h-[520px] bg-gradient-to-br from-blue-500/30 via-cyan-500/20 to-transparent blur-[160px]" />
          <div className="absolute bottom-[-200px] -left-24 w-[480px] h-[480px] bg-gradient-to-tr from-indigo-500/20 via-blue-500/10 to-transparent blur-[150px]" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white to-transparent dark:from-slate-950" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 sm:gap-16 lg:gap-24 items-center">
            {/* Left Side - Hero Text */}
            <div className="w-full text-center lg:text-left flex flex-col gap-3 sm:gap-6">
              {/* PRO badge */}
              <div className="inline-flex items-center gap-1.5 sm:gap-2 pl-2 sm:pl-3 pr-3 sm:pr-5 py-1.5 sm:py-[0.75rem] rounded-full bg-white/80 dark:bg-slate-900/65 text-slate-900 dark:text-white self-center lg:self-start shadow-sm sm:shadow-[0_18px_45px_-35px_rgba(15,23,42,1)] border border-slate-200/60 dark:border-white/15">
                <span className="inline-flex items-center justify-center px-1.5 sm:px-3 py-[0.15rem] sm:py-[0.3rem] rounded-full text-[9px] sm:text-[11px] uppercase tracking-[0.2em] sm:tracking-[0.4em] bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold">
                  PRO
                </span>
                <span className="text-[11px] sm:text-sm font-medium tracking-tight text-slate-600 dark:text-slate-200">Page Graphs</span>
              </div>

              {/* Headline block — tightly grouped */}
              <div className="space-y-2 sm:space-y-3">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.05]">
                  <span className="block">Your research,</span>
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-400 pb-2">
                    permanently.
                  </span>
                </h1>
                <p className="text-lg sm:text-xl text-slate-500 dark:text-slate-400 font-medium">
                  Pages disappear. Evidence gets edited. Links die.
                </p>
              </div>

              {/* Body copy */}
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg mx-auto lg:mx-0 font-light">
                PageStash captures every page as it existed: screenshot, full text, html. So you can find it, cite it, and prove it long after the original is gone.
              </p>

              {/* Trust signals */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-4 sm:gap-x-6 gap-y-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 border-t border-slate-200/70 dark:border-white/10 pt-4 sm:pt-5 mt-1">
                <span className="flex items-center gap-1.5">
                  <ShieldCheckIcon className="h-4 w-4 text-blue-500 flex-shrink-0" />
                  Encrypted at rest
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckIcon className="h-4 w-4 text-blue-500 flex-shrink-0" />
                  No ads. No tracking.
                </span>
                <span className="flex items-center gap-1.5">
                  <ZapIcon className="h-4 w-4 text-blue-500 flex-shrink-0" />
                  One-click capture
                </span>
              </div>
            </div>

            {/* Right Side - CTA Box - Frosted Glass Enterprise */}
            <div className="w-full max-w-lg mx-auto lg:max-w-xl lg:mx-0">
              <div className="relative rounded-2xl sm:rounded-[30px] bg-white dark:bg-slate-950/85 backdrop-blur-xl p-6 sm:p-10 lg:p-12 shadow-[0_45px_140px_-60px_rgba(15,23,42,0.9)]">
                <div className="absolute -top-12 -right-6 w-32 h-32 bg-gradient-to-b from-blue-500/40 to-transparent blur-3xl opacity-70 pointer-events-none hidden sm:block" />
                <div className="absolute -bottom-14 -left-8 w-40 h-40 bg-gradient-to-tr from-cyan-400/20 to-transparent blur-[90px] opacity-70 pointer-events-none hidden sm:block" />
                <div className="relative text-center mb-6 sm:mb-10">
                  <h3 className="text-xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2 sm:mb-3 tracking-tight">Start Your Free Trial</h3>
                  <p className="text-sm sm:text-base text-slate-500 dark:text-slate-300">Full access • No credit card • 10 free clips</p>
            </div>
            
                <div className="relative">
                <BrowserSelector onDownloadClick={handleDownloadClick} />
                </div>
                
                <div className="relative mt-5 sm:mt-8 pt-5 sm:pt-8 border-t border-slate-200 dark:border-slate-800 text-center">
              <Button 
                    variant="link" 
                    className="text-slate-500 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                asChild
                onClick={() => {
                  trackButtonClick('hero_signin', 'Sign In', 'hero_cta_box', '/auth/login')
                  incrementCTAInteractions()
                }}
              >
                    <Link href="/auth/login" className="flex items-center gap-2">
                      Already have an account? Sign in <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section - Enterprise Clean */}
      <section 
        ref={pricingRef}
        data-section="pricing"
        className="relative pt-10 sm:pt-20 pb-16 sm:pb-32 px-4 overflow-hidden"
      >
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(#fff_1px,transparent_1px)]" />

        <div className="pagestash-container relative z-10">
          <div className="text-center mb-8 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-6 text-slate-900 dark:text-white tracking-tight">
              Simple, transparent pricing
            </h2>
            <p className="text-base sm:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Start free. Upgrade when you need more power.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <div className="group relative bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 hover:-translate-y-1 transition-all duration-300">
              <div className="relative text-left mb-5 sm:mb-8">
                <h3 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2 text-slate-900 dark:text-white">Free</h3>
                <div className="text-4xl sm:text-5xl font-bold mb-2 sm:mb-4 text-slate-900 dark:text-white tracking-tight">$0</div>
                <p className="text-slate-500 dark:text-slate-400">Perfect for trying PageStash</p>
              </div>
              
              <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-10">
                <li className="flex items-center gap-3 text-sm sm:text-base text-slate-700 dark:text-slate-300">
                  <CheckIcon className="h-4 w-4 sm:h-5 sm:w-5 text-slate-900 dark:text-white flex-shrink-0" />
                  <span><strong>10 clips</strong> per month</span>
                </li>
                <li className="flex items-center gap-3 text-sm sm:text-base text-slate-700 dark:text-slate-300">
                  <CheckIcon className="h-4 w-4 sm:h-5 sm:w-5 text-slate-900 dark:text-white flex-shrink-0" />
                  <span><strong>100MB</strong> storage</span>
                </li>
                <li className="flex items-center gap-3 text-sm sm:text-base text-slate-700 dark:text-slate-300">
                  <CheckIcon className="h-4 w-4 sm:h-5 sm:w-5 text-slate-900 dark:text-white flex-shrink-0" />
                  <span>Full-text search</span>
                </li>
                <li className="flex items-center gap-3 text-sm sm:text-base text-slate-700 dark:text-slate-300">
                  <CheckIcon className="h-4 w-4 sm:h-5 sm:w-5 text-slate-900 dark:text-white flex-shrink-0" />
                  <span>Chrome & Firefox extensions</span>
                </li>
              </ul>
              
              <Button 
                className="w-full font-semibold bg-white border-2 border-slate-200 text-slate-900 hover:bg-slate-50 hover:border-slate-300 dark:bg-transparent dark:border-slate-700 dark:text-white dark:hover:bg-slate-800 h-11 sm:h-12 rounded-xl transition-all" 
                onClick={() => {
                  handleSmartDownload()
                  trackButtonClick('pricing_free_start_trial', 'Start Free Trial', 'pricing_free_card')
                }}
              >
                Start Free Trial
              </Button>
            </div>

            {/* Pro Tier */}
            <div className="group relative bg-slate-900 dark:bg-white rounded-2xl p-6 sm:p-10 shadow-2xl ring-1 ring-slate-900/10 hover:shadow-[0_30px_90px_-40px_rgba(59,130,246,0.6)] hover:-translate-y-1 hover:ring-2 hover:ring-blue-500/20 transition-all duration-300">
              <div className="absolute -top-4 right-6 sm:right-8">
                <div className="bg-blue-600 text-white px-3 sm:px-4 py-1 sm:py-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider shadow-lg rounded-full">
                  Most Popular
                  </div>
                </div>
              
              <div className="relative text-left mb-5 sm:mb-8">
                <h3 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2 text-white dark:text-slate-900">Pro</h3>
                <div className="flex items-baseline gap-2 mb-2 sm:mb-4">
                  <span className="text-4xl sm:text-5xl font-bold text-white dark:text-slate-900 tracking-tight">$12</span>
                  <span className="text-base sm:text-lg text-slate-400 dark:text-slate-500">/month</span>
                </div>
                <p className="text-slate-400 dark:text-slate-500">For serious researchers</p>
              </div>
              
              <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-10">
                <li className="flex items-center gap-3 text-sm sm:text-base text-slate-300 dark:text-slate-600">
                  <CheckIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400 dark:text-blue-600 flex-shrink-0" />
                  <span><strong>1,000 clips</strong> per month</span>
                </li>
                <li className="flex items-center gap-3 text-sm sm:text-base text-slate-300 dark:text-slate-600">
                  <CheckIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400 dark:text-blue-600 flex-shrink-0" />
                  <span><strong>5GB</strong> storage</span>
                </li>
                <li className="flex items-center gap-3 text-sm sm:text-base text-slate-300 dark:text-slate-600">
                  <CheckIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400 dark:text-blue-600 flex-shrink-0" />
                  <span>Unlimited folders & tags</span>
                </li>
                <li className="flex items-center gap-3 text-sm sm:text-base text-slate-300 dark:text-slate-600">
                  <CheckIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400 dark:text-blue-600 flex-shrink-0" />
                  <span>Priority support</span>
                </li>
              </ul>
              
              <Button 
                className="w-full font-bold bg-blue-600 text-white hover:bg-blue-500 hover:scale-[1.02] shadow-lg shadow-blue-500/25 h-11 sm:h-12 rounded-xl transition-all duration-300 border-0" 
                asChild
                onClick={() => {
                  trackButtonClick('pricing_pro_upgrade', 'Upgrade to Pro', 'pricing_pro_card', '/auth/signup')
                  incrementCTAInteractions()
                }}
              >
                <Link href="/auth/signup">
                  Get Started with Pro
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      </div>{/* end hero+pricing gradient wrapper */}

      {/* How it Works - Signature Flow */}
      <section 
        ref={howItWorksRef}
        data-section="how_it_works"
        className="relative py-16 sm:py-32 px-4 overflow-hidden bg-[#020617] text-white"
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),transparent_60%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.05)_1px,transparent_1px)] bg-[size:32px_32px]" />
        </div>
        <div className="pagestash-container relative z-10">
          <div className="text-center mb-10 sm:mb-20">
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.4em] text-blue-200 mb-4 sm:mb-6">Workflow</p>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
              Start capturing in 3 precise steps
            </h2>
            <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto font-light">
              From installation to searchable archive in under a minute.
            </p>
            </div>
            
          <div className="grid md:grid-cols-3 gap-6 lg:gap-10">
            {[
              {
                number: '01',
                title: 'Install the extension',
                desc: 'Secure install for Chrome, Firefox, or Tor Browser with automatic updates and enterprise permissions baked in.',
                accent: 'from-blue-500 to-cyan-500',
                icon: <ChromeIcon size={36} />,
                chips: ['Chrome', 'Firefox', 'Tor'],
              },
              {
                number: '02',
                title: 'Capture anything',
                desc: 'One click saves the full page, screenshot, DOM, and metadata. Every capture is checksum verified.',
                accent: 'from-cyan-500 to-blue-400',
                icon: <CameraIcon className="w-9 h-9 text-cyan-200" />,
                chips: ['Full page', 'Text', 'Notes'],
              },
              {
                number: '03',
                title: 'Organize & search',
                desc: 'Every capture lands in your workspace. Full-text search finds it in seconds. Page Graphs shows how everything connects.',
                accent: 'from-indigo-500 to-blue-500',
                icon: <SearchIcon className="w-9 h-9 text-indigo-200" />,
                chips: ['Folders', 'Graph'],
              }
            ].map((card) => (
              <div key={card.number} className="group relative rounded-2xl sm:rounded-[32px] bg-white/5 border border-white/10 p-5 sm:p-8 backdrop-blur-xl shadow-[0_40px_90px_-50px_rgba(2,6,23,1)] hover:bg-white/8 hover:border-white/20 hover:shadow-[0_50px_110px_-50px_rgba(59,130,246,0.4)] hover:-translate-y-2 transition-all duration-500">
                <div className="flex items-center justify-between mb-5 sm:mb-8">
                  <div className={`w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br ${card.accent} flex items-center justify-center text-base sm:text-xl font-semibold`}>
                    {card.number}
              </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-white/15 transition-all duration-500">
                    {card.icon}
            </div>
              </div>
                <h3 className="text-lg sm:text-2xl font-semibold mb-2 sm:mb-3">{card.title}</h3>
                <p className="text-sm sm:text-base text-slate-200 leading-relaxed mb-5 sm:mb-8">{card.desc}</p>
                <div className="flex flex-wrap gap-2 text-xs text-slate-200">
                  {card.chips.map((chip) => (
                    <span key={chip} className="px-3 py-1 rounded-full border border-white/15 bg-white/5 uppercase tracking-[0.3em] text-[10px]">
                      {chip}
                    </span>
                  ))}
            </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Overview with Visual Depth */}
      <section 
        ref={featuresRef}
        data-section="features"
        className="py-14 sm:py-32 px-4 relative overflow-hidden bg-white dark:bg-slate-950"
      >
        <div className="pagestash-container relative">
          <div className="text-center mb-10 sm:mb-20">
            <h2 className="text-2xl sm:text-5xl font-bold mb-3 sm:mb-6 text-slate-900 dark:text-white tracking-tight">
              A powerful workspace for your web memory
            </h2>
            <p className="text-base sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-light">
              Built for researchers and analysts who demand the best tools.
            </p>
          </div>

          {/* Dashboard Mockup - High Fidelity */}
          <div className="max-w-6xl mx-auto mb-14 sm:mb-24">
            <div className="relative group">
              <div className="absolute -inset-6 bg-gradient-to-r from-blue-500/15 via-cyan-400/10 to-transparent blur-3xl opacity-40 group-hover:opacity-70 transition-all duration-500 hidden sm:block" />
              <div className="relative rounded-2xl sm:rounded-[40px] border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 shadow-[0_50px_120px_-50px_rgba(15,23,42,0.8)]">
                <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100 dark:border-white/5">
                  <div className="flex gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                    <span className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
                    <span className="w-3 h-3 rounded-full bg-[#28C840]" />
                  </div>
                  <div className="flex-1 text-center">
                    <div className="inline-flex items-center px-4 py-1 rounded-full bg-slate-100 text-xs text-slate-600 font-medium dark:bg-slate-900 dark:text-slate-300">
                      pagestash.app/dashboard
                    </div>
                  </div>
                </div>

                <div className="flex flex-col lg:flex-row">
                  {/* Sidebar — hidden on small mobile to save space */}
                  <div className="hidden sm:block lg:w-64 p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-white/5 bg-slate-50/70 dark:bg-slate-950/40 sm:rounded-bl-none lg:rounded-bl-[40px]">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-4">Folders</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between px-3 py-2 rounded-2xl bg-white shadow-sm border border-slate-100">
                        <span className="text-sm font-semibold text-slate-900">All Clips</span>
                        <span className="text-xs text-slate-400">247</span>
                      </div>
                      <div className="flex items-center gap-3 px-3 py-2 rounded-2xl hover:bg-white/70 transition">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        <span className="text-sm text-slate-600 dark:text-slate-300">Research Projects</span>
                      </div>
                      <div className="flex items-center gap-3 px-3 py-2 rounded-2xl hover:bg-white/70 transition">
                        <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                        <span className="text-sm text-slate-600 dark:text-slate-300">Market Analysis</span>
                      </div>
                      <div className="flex items-center gap-3 px-3 py-2 rounded-2xl hover:bg-white/70 transition">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span className="text-sm text-slate-600 dark:text-slate-300">Design Inspiration</span>
                      </div>
                    </div>
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 p-4 sm:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">All Clips</h3>
                      <div className="relative flex-1">
                        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="text" 
                          className="w-full bg-slate-100 dark:bg-slate-900 rounded-full py-3 pl-12 pr-4 text-sm text-slate-600 dark:text-slate-300 border border-transparent focus:border-blue-500/40 focus:ring-0"
                          placeholder="Search content..."
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                      {[
                        { 
                          tag: 'BBC', 
                          category: 'News • Technology',
                          title: 'AI Breakthrough: New Model Achieves Human-Level Reasoning', 
                          excerpt: 'Researchers at leading tech labs have announced a significant advancement in artificial intelligence, with their latest model demonstrating unprecedented...', 
                          accent: 'text-orange-600',
                          meta: 'bbc.com/technology • 2 days ago'
                        },
                        { 
                          tag: 'BLOOMBERG', 
                          category: 'Markets',
                          title: 'Tech Stocks Rally on Strong Earnings Reports', 
                          excerpt: 'Major technology companies exceeded analyst expectations in Q4, driving a surge in market valuations across the sector...', 
                          accent: 'text-blue-600',
                          meta: 'bloomberg.com • 1 week ago'
                        },
                        { 
                          tag: 'M', 
                          category: 'Design • UX Research',
                          title: 'The Evolution of Design Systems in 2025', 
                          excerpt: 'Modern design systems have transformed how teams build products. Here\'s what we learned from implementing design systems at scale...', 
                          accent: 'text-emerald-600',
                          meta: 'Sarah Chen • 8 min read'
                        },
                      ].map((card, index) => (
                        <div key={card.title} className="group rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-lg hover:border-slate-200 dark:hover:border-slate-700 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <div className={`text-xs font-bold tracking-wide ${card.accent} flex items-center gap-2`}>
                              <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-white font-bold text-xs ${card.accent === 'text-orange-600' ? 'bg-orange-600' : card.accent === 'text-blue-600' ? 'bg-blue-600' : 'bg-emerald-600'}`}>
                                {card.tag}
                            </div>
                              <span className="text-slate-500 dark:text-slate-400 font-normal">{card.category}</span>
                          </div>
                        </div>
                          <p className="font-semibold text-slate-900 dark:text-white leading-snug mb-2 text-sm">
                            {card.title}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed mb-3">
                            {card.excerpt}
                          </p>
                          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                            <p className="text-xs text-slate-400 dark:text-slate-500">{card.meta}</p>
                        </div>
                      </div>
                      ))}
                            </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12 lg:gap-16 max-w-5xl mx-auto mt-10 sm:mt-16">
            {/* Extension Popup Mockup */}
            <div className="text-center group">
              <div className="mb-8">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-6 shadow-md max-w-sm mx-auto group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-300">
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
            <div className="text-center group">
              <div className="mb-8">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-6 shadow-md max-w-sm mx-auto group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-300">
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
            <div className="text-center group">
              <div className="mb-8">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-6 shadow-md max-w-sm mx-auto group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-300">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                      <FolderIcon className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-slate-700 dark:text-slate-300">Research (89)</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded">
                      <FolderIcon className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-slate-700 dark:text-slate-300">Articles (156)</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-orange-50 dark:bg-orange-900/20 rounded">
                      <FolderIcon className="h-4 w-4 text-orange-500" />
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

          {/* Knowledge Graph Feature Section */}
          <div className="mt-16 sm:mt-32 max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-10 sm:gap-16 items-center">
              {/* Left: text */}
              <div className="space-y-4 sm:space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-widest">Pro feature</span>
                </div>
                <h3 className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                  See how your research connects.
                </h3>
                <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                  PageStash automatically maps connections between your saved pages — by domain, topic, and tag. See your research as a living network, not a flat list.
                </p>
                <ul className="space-y-3">
                  {[
                    'Auto-generated connection graph from your clips',
                    'Filter by folder, tag, or domain',
                    'Click any node to open the original clip',
                    'Discover patterns you didn\'t know were there',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                      <CheckIcon className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="pt-2">
                  <span className="text-sm text-slate-500 dark:text-slate-400">Included in <strong className="text-slate-900 dark:text-white">Pro</strong> — upgrade any time.</span>
                </div>
              </div>

              {/* Right: visual graph mockup */}
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-blue-500/10 blur-2xl rounded-3xl" />
                <div className="relative rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xl overflow-hidden">
                  <div className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-6">Connection Map — Research folder</div>
                  {/* SVG graph mockup */}
                  <svg viewBox="0 0 380 280" className="w-full" xmlns="http://www.w3.org/2000/svg">
                    {/* Edges */}
                    <line x1="190" y1="140" x2="100" y2="80" stroke="#e2e8f0" strokeWidth="1.5"/>
                    <line x1="190" y1="140" x2="290" y2="80" stroke="#e2e8f0" strokeWidth="1.5"/>
                    <line x1="190" y1="140" x2="80" y2="200" stroke="#e2e8f0" strokeWidth="1.5"/>
                    <line x1="190" y1="140" x2="310" y2="200" stroke="#e2e8f0" strokeWidth="1.5"/>
                    <line x1="190" y1="140" x2="190" y2="240" stroke="#e2e8f0" strokeWidth="1.5"/>
                    <line x1="100" y1="80" x2="290" y2="80" stroke="#e2e8f0" strokeWidth="1"/>
                    <line x1="80" y1="200" x2="190" y2="240" stroke="#e2e8f0" strokeWidth="1"/>
                    <line x1="310" y1="200" x2="190" y2="240" stroke="#e2e8f0" strokeWidth="1"/>
                    {/* Central node */}
                    <circle cx="190" cy="140" r="22" fill="#7c3aed" opacity="0.9"/>
                    <text x="190" y="144" textAnchor="middle" fill="white" fontSize="10" fontWeight="600">AI</text>
                    {/* Satellite nodes */}
                    <circle cx="100" cy="80" r="16" fill="#3b82f6" opacity="0.8"/>
                    <text x="100" y="84" textAnchor="middle" fill="white" fontSize="9">ML</text>
                    <circle cx="290" cy="80" r="16" fill="#3b82f6" opacity="0.8"/>
                    <text x="290" y="84" textAnchor="middle" fill="white" fontSize="9">LLM</text>
                    <circle cx="80" cy="200" r="14" fill="#8b5cf6" opacity="0.7"/>
                    <text x="80" y="204" textAnchor="middle" fill="white" fontSize="9">NLP</text>
                    <circle cx="310" cy="200" r="14" fill="#8b5cf6" opacity="0.7"/>
                    <text x="310" y="204" textAnchor="middle" fill="white" fontSize="9">RAG</text>
                    <circle cx="190" cy="240" r="13" fill="#a78bfa" opacity="0.7"/>
                    <text x="190" y="244" textAnchor="middle" fill="white" fontSize="9">GPT</text>
                    {/* Outer ring nodes */}
                    <circle cx="50" cy="120" r="10" fill="#ddd6fe" stroke="#7c3aed" strokeWidth="1"/>
                    <circle cx="340" cy="140" r="10" fill="#ddd6fe" stroke="#7c3aed" strokeWidth="1"/>
                    <circle cx="150" cy="40" r="10" fill="#ddd6fe" stroke="#3b82f6" strokeWidth="1"/>
                    <circle cx="240" cy="40" r="10" fill="#ddd6fe" stroke="#3b82f6" strokeWidth="1"/>
                    <line x1="100" y1="80" x2="50" y2="120" stroke="#e9d5ff" strokeWidth="1" strokeDasharray="3,2"/>
                    <line x1="290" y1="80" x2="340" y2="140" stroke="#e9d5ff" strokeWidth="1" strokeDasharray="3,2"/>
                    <line x1="100" y1="80" x2="150" y2="40" stroke="#dbeafe" strokeWidth="1" strokeDasharray="3,2"/>
                    <line x1="290" y1="80" x2="240" y2="40" stroke="#dbeafe" strokeWidth="1" strokeDasharray="3,2"/>
                  </svg>
                  <div className="flex items-center gap-4 mt-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-600 inline-block"/><span>Primary topic</span></div>
                    <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block"/><span>Related</span></div>
                    <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-200 border border-blue-400 inline-block"/><span>Connected</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Pane Showcase - Reader Experience */}
          <div 
            ref={previewPaneRef}
            data-section="preview_pane"
            className="mt-16 sm:mt-32 max-w-5xl mx-auto"
          >
            <div className="text-center mb-8 sm:mb-16">
              <h3 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-slate-900 dark:text-white">Rich Preview Experience</h3>
              <p className="text-base sm:text-xl text-slate-600 dark:text-slate-400 font-light">
                View, annotate, and interact with your captured pages
              </p>
            </div>
            
            {/* Reader Mockup */}
            <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden ring-1 ring-slate-900/5">
              {/* Toolbar */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
                 <div className="flex items-center gap-4">
                   <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">6 of 10</div>
                   <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700"></div>
                   <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 font-medium">
                     <FolderIcon className="w-4 h-4" />
                    Research
          </div>
                </div>
                 <div className="flex items-center gap-3">
                   <Button size="sm" variant="ghost" className="text-sm">Open Original →</Button>
                   <div className="flex gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                     <button className="px-3 py-1 text-xs font-medium rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm">Screenshot</button>
                     <button className="px-3 py-1 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">HTML</button>
                     <button className="px-3 py-1 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">Text</button>
                </div>
                   <div className="flex gap-1">
                     <button className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
                       <span className="text-xs">←</span>
                </button>
                     <button className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
                       <span className="text-xs">→</span>
                </button>
                   </div>
            </div>
            </div>

              <div className="grid lg:grid-cols-12 min-h-0 sm:min-h-[600px]">
                {/* Article Content */}
                <div className="lg:col-span-8 p-5 sm:p-8 lg:p-12 overflow-y-auto bg-white dark:bg-slate-950">
                  <article className="prose prose-slate dark:prose-invert max-w-none prose-lg">
                    <div className="flex items-center gap-3 mb-6 not-prose">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg">
                          TC
                </div>
                        <div>
                        <div className="font-semibold text-slate-900 dark:text-white">TechCrunch • Technology</div>
                </div>
              </div>
                    
                    <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-slate-900 dark:text-white leading-tight">
                        The Future of AI Research: Breaking New Ground
                      </h1>
                    
                    <div className="flex items-center gap-4 mb-8 not-prose text-sm text-slate-500 dark:text-slate-400">
                      <span>By Sarah Johnson</span>
                      <span>•</span>
                      <span>October 30, 2025</span>
                      <span>•</span>
                      <span>8 min read</span>
            </div>

                    <div className="flex flex-wrap gap-2 mb-8 not-prose">
                      <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">AI and Technology</span>
                </div>

                    <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                      Artificial intelligence research has reached an inflection point. Recent breakthroughs in machine learning are transforming how we approach complex problems across industries.
                    </p>
                    
                    <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                      Leading researchers at top institutions have demonstrated remarkable progress in natural language understanding, computer vision, and reinforcement learning. These advances promise to reshape technology as we know it.
                    </p>

                    <h2 className="text-2xl font-bold mt-8 mb-4 text-slate-900 dark:text-white">Key Developments</h2>
                    
                    <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                      The integration of large language models with reasoning capabilities has opened new possibilities for AI applications. From scientific discovery to creative endeavors, these tools are becoming indispensable partners in human innovation.
                    </p>

                    <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                      Industry leaders emphasize the importance of responsible AI development, ensuring these powerful technologies benefit society while minimizing potential risks.
                    </p>

                    <div className="my-8 p-6 bg-slate-100 dark:bg-slate-800/50 rounded-2xl not-prose border-l-4 border-blue-500">
                      <p className="text-xl font-medium text-slate-900 dark:text-white italic">
                          "We're witnessing a transformation that will define the next decade of technology."
                        </p>
                </div>

                    <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                      As we look ahead, the convergence of AI capabilities with domain expertise continues to unlock unprecedented opportunities for innovation and discovery.
                    </p>
                  </article>
          </div>

                {/* Sidebar Metadata — hidden on small mobile */}
                <div className="hidden sm:block lg:col-span-4 border-t sm:border-t-0 lg:border-l border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-5 sm:p-6 space-y-6 sm:space-y-8">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Metadata</h4>
                    <div className="space-y-4">
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Source URL</div>
                        <div className="text-sm text-blue-600 dark:text-blue-400 truncate">techcrunch.com/2025/10/...</div>
                    </div>
                      <div>
                         <div className="text-xs text-slate-500 mb-1">Captured</div>
                         <div className="text-sm text-slate-700 dark:text-slate-300">Oct 30, 2025 2:34 PM</div>
            </div>
              </div>
              </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Organization</h4>
                    <div className="space-y-4">
                       <div>
                         <div className="text-xs text-slate-500 mb-2">Folder</div>
                         <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 p-2 rounded border border-slate-200 dark:border-slate-700">
                           <FolderIcon className="w-4 h-4 text-blue-500" />
                           Research
              </div>
              </div>
                  <div>
                         <div className="text-xs text-slate-500 mb-2">Tags</div>
                         <div className="flex flex-wrap gap-2">
                           <span className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-medium text-slate-600 dark:text-slate-400">AI</span>
                           <span className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-medium text-slate-600 dark:text-slate-400">Tech</span>
                           <button className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs text-slate-500 hover:text-slate-700">+</button>
                </div>
                </div>
                </div>
                </div>
              </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section - Enterprise Dark */}
      <section 
        ref={finalCTARef}
        data-section="final_cta"
        className="relative py-16 sm:py-32 px-4 overflow-hidden bg-slate-950 text-white"
      >
        {/* Subtle grid on dark background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
        
        <div className="pagestash-container relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-5xl lg:text-6xl font-bold mb-5 sm:mb-8 tracking-tight text-white">
              Your research deserves better than bookmarks.
            </h2>
            <p className="text-base sm:text-xl mb-8 sm:mb-12 text-slate-400 max-w-2xl mx-auto">
              Start free. Capture 10 pages a month. Upgrade when you need more.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-2xl mx-auto mb-8 sm:mb-12">
                <Button 
                  size="lg" 
                  className="text-base sm:text-lg font-bold bg-white text-slate-950 hover:bg-slate-100 px-8 sm:px-10 py-4 sm:py-6 h-auto rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all"
                  onClick={() => {
                    handleSmartDownload()
                    trackButtonClick(
                      'final_cta_extension',
                      detectedBrowser?.name ? `Add to ${detectedBrowser.name}` : 'Install Extension',
                      'final_cta_section'
                    )
                  }}
                >
                <DownloadIcon className="mr-3 h-5 w-5" />
                {detectedBrowser?.name ? `Add to ${detectedBrowser.name}` : 'Install Extension'}
                </Button>
                
                <Button 
                  size="lg" 
                variant="outline"
                  className="text-base sm:text-lg font-bold bg-transparent text-white border-2 border-slate-700 hover:bg-slate-800 hover:text-white hover:border-slate-600 transition-all px-8 sm:px-10 py-4 sm:py-6 h-auto rounded-xl"
                  asChild
                  onClick={() => {
                    trackButtonClick('final_cta_dashboard', 'Open Dashboard', 'final_cta_section', '/auth/signup')
                    incrementCTAInteractions()
                  }}
                >
                  <Link href="/auth/signup">
                  Open Dashboard
                  </Link>
                </Button>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm font-medium text-slate-500">
                <div className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4 text-emerald-500" />
                <span>10 clips/month free</span>
                </div>
                <div className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4 text-emerald-500" />
                <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4 text-emerald-500" />
                <span>SOC-2 Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section - Clean */}
      <section 
        id="faq" 
        ref={faqRef}
        data-section="faq"
        className="py-14 sm:py-32 px-4 bg-white dark:bg-slate-950"
      >
        <div className="pagestash-container">
          <div className="text-center mb-8 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-6 text-slate-900 dark:text-white tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-base sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-light">
              Everything you need to know about PageStash.
            </p>
            </div>
            
          <div className="max-w-3xl mx-auto space-y-4">
            {/* FAQ Item 1 */}
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl sm:rounded-2xl p-5 sm:p-8 border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2 sm:mb-3">
                How does PageStash work?
              </h3>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                PageStash is a browser extension that captures full-page screenshots and extracts text from any webpage with a single click. All your captures are automatically synced to your secure dashboard where you can search, organize, and access them from anywhere.
              </p>
            </div>

            {/* FAQ Item 2 */}
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl sm:rounded-2xl p-5 sm:p-8 border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2 sm:mb-3">
                Is my data secure and private?
              </h3>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                Yes. Your data is encrypted in transit and at rest. We use industry-standard security practices and never share your data with third parties. You can delete your account and all associated data at any time.
              </p>
            </div>
            
            {/* FAQ Item 3 */}
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl sm:rounded-2xl p-5 sm:p-8 border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2 sm:mb-3">
                What browsers are supported?
              </h3>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                PageStash works on Google Chrome, Microsoft Edge, Brave, and Mozilla Firefox. Simply download the extension for your browser and sign up for a free account to get started.
              </p>
            </div>

            {/* FAQ Item 4 */}
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl sm:rounded-2xl p-5 sm:p-8 border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2 sm:mb-3">
                What's included in the free plan?
              </h3>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                The free plan includes 10 clips per month, 100MB of storage, full-text search, folders & organization, and both Chrome & Firefox extensions. Perfect for trying PageStash and light usage.
            </p>
          </div>

            {/* FAQ Item 5 */}
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl sm:rounded-2xl p-5 sm:p-8 border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2 sm:mb-3">
                Can I upgrade or downgrade my plan?
              </h3>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                Yes. You can upgrade to Pro at any time to get 1,000 clips per month and 5GB of storage. You can also cancel anytime with no fees or penalties. Your data will remain accessible even if you downgrade.
                      </p>
            </div>

            {/* FAQ Item 6 */}
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl sm:rounded-2xl p-5 sm:p-8 border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2 sm:mb-3">
                Can I export my captured content?
              </h3>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                Yes. You can download your screenshots and extracted text at any time. Pro users also have access to bulk export features for easy backup and portability.
              </p>
            </div>
          </div>

          {/* Still have questions */}
          <div className="text-center mt-10 sm:mt-16">
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 mb-4 sm:mb-6 font-medium">
              Still have questions?
            </p>
            <Button 
              variant="outline" 
              size="lg" 
              className="h-12 px-8 font-medium border-2 border-slate-200 hover:border-slate-900 hover:bg-slate-900 hover:text-white transition-all rounded-full"
              asChild
              onClick={() => {
                trackButtonClick('faq_contact_support', 'Contact Support', 'faq_section', 'mailto:support@pagestash.app')
              }}
            >
              <a href="mailto:support@pagestash.app">
                <MessageCircleIcon className="mr-2 h-5 w-5" />
                Contact Support
              </a>
                </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="pagestash-container py-8 sm:py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 text-center md:text-left">
            <div className="flex items-center space-x-3 justify-center md:justify-start">
              <LogoIcon size={32} />
              <span className="text-xl font-bold text-slate-900 dark:text-white">PageStash</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
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
              &copy; 2026 PageStash
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Help Button - Minimalist */}
      <div className="fixed bottom-6 right-4 sm:bottom-8 sm:right-8 z-[9999]" style={{ bottom: 'max(1.5rem, env(safe-area-inset-bottom, 1.5rem))' }}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              size="lg"
              className="h-11 w-11 sm:h-14 sm:w-14 rounded-full shadow-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition-all duration-300 ring-1 ring-white/20 flex items-center justify-center"
              title="Help & Support"
            >
              <span className="text-xl sm:text-2xl font-bold">?</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="w-64 mb-2">
            <DropdownMenuItem asChild>
              <Link href="#faq" className="flex items-center cursor-pointer py-3">
                <HelpCircleIcon className="mr-3 h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-medium">FAQs</div>
                  <div className="text-xs text-slate-500">Common questions</div>
                </div>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a 
                href="mailto:support@pagestash.app?subject=Feedback&body=Hi PageStash team,%0D%0A%0D%0AI have some feedback to share:%0D%0A%0D%0A" 
                className="flex items-center cursor-pointer py-3"
              >
                <MessageCircleIcon className="mr-3 h-5 w-5 text-green-600" />
                <div>
                  <div className="font-medium">Submit Feedback</div>
                  <div className="text-xs text-slate-500">Share your thoughts</div>
                </div>
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a 
                href="mailto:support@pagestash.app?subject=Support Request&body=Hi PageStash support team,%0D%0A%0D%0AI need help with:%0D%0A%0D%0A" 
                className="flex items-center cursor-pointer py-3"
              >
                <LifeBuoyIcon className="mr-3 h-5 w-5 text-orange-600" />
                <div>
                  <div className="font-medium">Contact Support</div>
                  <div className="text-xs text-slate-500">Get help from our team</div>
                </div>
              </a>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Download Modal — only mounted when open to avoid loading the chunk eagerly */}
      {isDownloadModalOpen && (
        <DownloadModal 
          isOpen={isDownloadModalOpen}
          onClose={() => setIsDownloadModalOpen(false)}
          selectedBrowser={selectedBrowser}
        />
      )}
    </div>
    </>
  )
}
