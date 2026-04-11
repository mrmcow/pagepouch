import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowLeft,
  Puzzle,
  Shield,
  Zap,
  Lock,
  Server,
  ExternalLink,
} from 'lucide-react'
import { LogoIcon } from '@/components/ui/logo'

export const metadata: Metadata = {
  title: 'Extension documentation',
  description:
    'How the PageStash browser extension works: capture modes, permissions, security, and a short technical overview.',
}

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <header className="border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="pagestash-container px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <LogoIcon size={32} />
              <span className="text-xl font-bold text-slate-900 dark:text-white">PageStash</span>
            </Link>
            <Link
              href="/"
              className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors font-medium rounded-full px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-900"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      <main className="pagestash-container px-4 sm:px-6 py-12 sm:py-16">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-2xl mb-6 border border-blue-100 dark:border-blue-900/50">
            <Puzzle className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight mb-4">
            Browser extension
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-10">
            A short guide for anyone installing PageStash from the Chrome Web Store, Firefox Add-ons, or a direct
            download. This page explains what the extension does, why it asks for certain permissions, and how we keep
            your captures tied to your account.
          </p>

          <div className="space-y-12 text-slate-700 dark:text-slate-300">
            <section>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500" />
                What you can capture
              </h2>
              <ul className="space-y-2 list-disc pl-5 text-slate-600 dark:text-slate-400 leading-relaxed">
                <li>
                  <strong className="text-slate-800 dark:text-slate-200">Full page</strong> — scrolls the active tab
                  and stitches a long screenshot, plus HTML and plain text extracted from the page you see.
                </li>
                <li>
                  <strong className="text-slate-800 dark:text-slate-200">Visible area</strong> — one screenshot of what
                  is on screen right now, with the same HTML and text extraction.
                </li>
                <li>
                  <strong className="text-slate-800 dark:text-slate-200">Select area</strong> — drag a rectangle on the
                  page to crop a screenshot; we still save page text and metadata where the browser allows.
                </li>
              </ul>
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-500">
                Saving a page by <strong className="text-slate-700 dark:text-slate-300">pasting a URL</strong> in the web
                app is separate: that runs on our servers and may behave differently on sites that block automated
                fetches. The extension always captures the page as rendered in <em>your</em> browser.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-500" />
                Permissions and why we need them
              </h2>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/40 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-left">
                      <th className="py-3 px-4 font-semibold text-slate-900 dark:text-white">Permission</th>
                      <th className="py-3 px-4 font-semibold text-slate-900 dark:text-white">Purpose</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-600 dark:text-slate-400">
                    <tr className="border-b border-slate-200/80 dark:border-slate-800/80">
                      <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">activeTab</td>
                      <td className="py-3 px-4">
                        Act on the tab you opened the popup from: screenshot, read DOM for HTML/text, inject the area
                        selector only when you ask.
                      </td>
                    </tr>
                    <tr className="border-b border-slate-200/80 dark:border-slate-800/80">
                      <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">storage</td>
                      <td className="py-3 px-4">
                        Keep you signed in locally (session tokens) and remember small preferences. We do not use this
                        to track browsing history.
                      </td>
                    </tr>
                    <tr className="border-b border-slate-200/80 dark:border-slate-800/80">
                      <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">scripting</td>
                      <td className="py-3 px-4">
                        Run a short script in the active page to pull HTML and text, and to load the area-selection
                        overlay when you choose that mode. Firefox requires this permission explicitly.
                      </td>
                    </tr>
                    <tr className="border-b border-slate-200/80 dark:border-slate-800/80">
                      <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">Host access (http/https)</td>
                      <td className="py-3 px-4">
                        Talk to PageStash APIs and Supabase over HTTPS to save clips and sync your library. We do not
                        inject scripts into arbitrary sites in the background.
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">tabs (Firefox)</td>
                      <td className="py-3 px-4">
                        Firefox needs this for tab/window APIs used during capture (e.g. visible-tab screenshots).
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <Lock className="h-5 w-5 text-emerald-500" />
                Security and your data
              </h2>
              <ul className="space-y-2 list-disc pl-5 text-slate-600 dark:text-slate-400 leading-relaxed">
                <li>
                  You sign in with email and password (or your existing PageStash account). Session tokens are stored
                  in the extension and sent only over HTTPS to our backend.
                </li>
                <li>
                  Clips — screenshots, HTML, text, titles, URLs — are stored under your user account in our database and
                  file storage, with access controlled so only you can read your own content.
                </li>
                <li>
                  We do not sell your saved pages or use them to train third-party models. For retention, third-party
                  processors, and legal rights, see our full{' '}
                  <Link href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                    Privacy Policy
                  </Link>
                  .
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <Server className="h-5 w-5 text-violet-500" />
                Technical overview
              </h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Built as a small, focused extension on top of the same stack as the dashboard:
              </p>
              <ul className="space-y-2 list-disc pl-5 text-slate-600 dark:text-slate-400 leading-relaxed">
                <li>
                  <strong className="text-slate-800 dark:text-slate-200">Chrome / Edge</strong> — Manifest V3 background
                  service worker; popup UI saves clips via authenticated HTTPS API routes.
                </li>
                <li>
                  <strong className="text-slate-800 dark:text-slate-200">Firefox</strong> — Manifest V2-compatible build
                  with the same capture logic, adapted for Firefox&apos;s extension APIs.
                </li>
                <li>
                  Capture pipeline: read page DOM in the active tab → take screenshot(s) → upload image and metadata to
                  secure storage → attach the clip to your account so it appears on{' '}
                  <Link href="/dashboard" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                    the dashboard
                  </Link>
                  .
                </li>
              </ul>
            </section>

            <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/30 p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Official installs</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Prefer store builds for automatic updates and verified packages.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="https://chromewebstore.google.com/detail/pagestash/pimbnkabbjeacahcclicmfdkhojnjmif"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm font-medium text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Chrome Web Store
                  <ExternalLink className="h-4 w-4 opacity-70" />
                </a>
                <a
                  href="https://addons.mozilla.org/en-US/firefox/addon/pagestash/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm font-medium text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Firefox Add-ons
                  <ExternalLink className="h-4 w-4 opacity-70" />
                </a>
              </div>
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-500">
                Questions?{' '}
                <a href="mailto:support@pagestash.app" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                  support@pagestash.app
                </a>
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
