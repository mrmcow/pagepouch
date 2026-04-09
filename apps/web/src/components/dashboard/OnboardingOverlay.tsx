'use client'

import { LogoIcon } from '@/components/ui/logo'
import { Download, Camera, Search } from 'lucide-react'

interface OnboardingOverlayProps {
  onInstallClick: () => void
  onDismiss: () => void
}

const steps = [
  {
    icon: Download,
    label: 'Install the extension',
    description: 'Add PageStash to Chrome or Firefox in seconds.',
  },
  {
    icon: Camera,
    label: 'Capture any page',
    description: 'One click saves the full page, screenshot & text.',
  },
  {
    icon: Search,
    label: 'Find anything instantly',
    description: 'Search across titles, content, and URLs.',
  },
]

export function OnboardingOverlay({ onInstallClick, onDismiss }: OnboardingOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-[2px]">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-xl p-10 flex flex-col items-center text-center">
        {/* Logo */}
        <div className="mb-5">
          <LogoIcon size={48} />
        </div>

        {/* Headline */}
        <h2 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">
          Welcome to PageStash
        </h2>
        <p className="text-slate-500 text-base mb-8 max-w-sm leading-relaxed">
          Your research deserves a permanent home.
        </p>

        {/* Steps */}
        <div className="flex flex-col sm:flex-row gap-6 w-full mb-10">
          {steps.map((step, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-3 px-2">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                <step.icon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 mb-1">{step.label}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={onInstallClick}
          className="h-11 px-8 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-colors flex items-center gap-2 mb-3"
        >
          <Download className="h-4 w-4" />
          Install Extension
        </button>

        <button
          onClick={() => {
            localStorage.setItem('pagestash-onboarding-dismissed', '1')
            onDismiss()
          }}
          className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
        >
          I&rsquo;ll set up later
        </button>
      </div>
    </div>
  )
}
