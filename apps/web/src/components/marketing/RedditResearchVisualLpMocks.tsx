import { cn } from '@/lib/utils'
import { ChromeIcon, FirefoxIcon, TorOnionMark } from '@/components/ui/browser-icons'

/** Canonical listing URLs — keep in sync with `download-modal.tsx`. */
export const PAGESTASH_CHROME_WEB_STORE_URL =
  'https://chromewebstore.google.com/detail/pagestash/pimbnkabbjeacahcclicmfdkhojnjmif' as const
export const PAGESTASH_FIREFOX_AMO_URL = 'https://addons.mozilla.org/en-US/firefox/addon/pagestash/' as const

/**
 * Logo-first browser proof: Chrome + Firefox store links; Tor onion links to the same
 * Firefox Add-ons listing (Tor Browser installs Firefox extensions).
 */
export function LpBrowserLogoDock({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200/90 bg-white/80 px-3 py-3 shadow-[0_1px_0_rgba(15,23,42,0.04),0_12px_40px_-20px_rgba(15,23,42,0.12)] backdrop-blur-md dark:border-white/10 dark:bg-slate-900/70 dark:shadow-[0_1px_0_rgba(255,255,255,0.06),0_12px_40px_-20px_rgba(0,0,0,0.45)] sm:px-4 sm:py-4',
        className,
      )}
    >
      <div className="flex items-center justify-center gap-6 sm:gap-10">
        <a
          href={PAGESTASH_CHROME_WEB_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col items-center rounded-xl outline-none ring-offset-2 ring-offset-[#fafafa] transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-blue-500 dark:ring-offset-slate-950"
          aria-label="PageStash on Chrome Web Store"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200/80 transition group-hover:ring-blue-400/40 dark:bg-slate-800 dark:ring-white/10">
            <ChromeIcon size={28} className="drop-shadow-sm" />
          </span>
        </a>
        <a
          href={PAGESTASH_FIREFOX_AMO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col items-center rounded-xl outline-none ring-offset-2 ring-offset-[#fafafa] transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-orange-500 dark:ring-offset-slate-950"
          aria-label="PageStash on Firefox Add-ons"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200/80 transition group-hover:ring-orange-400/40 dark:bg-slate-800 dark:ring-white/10">
            <FirefoxIcon size={28} className="drop-shadow-sm" />
          </span>
        </a>
        <a
          href={PAGESTASH_FIREFOX_AMO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col items-center rounded-xl outline-none ring-offset-2 ring-offset-[#fafafa] transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-violet-500 dark:ring-offset-slate-950"
          aria-label="PageStash for Tor Browser — same listing on Firefox Add-ons"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-b from-violet-50 to-white shadow-sm ring-1 ring-violet-200/70 transition group-hover:ring-violet-400/50 dark:from-violet-950/40 dark:to-slate-900 dark:ring-violet-500/25">
            <TorOnionMark size={26} className="drop-shadow-sm" />
          </span>
        </a>
      </div>

      <p className="mt-2.5 border-t border-slate-200/70 pt-2.5 text-center text-[10px] leading-snug text-slate-600 dark:border-white/10 dark:text-slate-400 sm:hidden">
        <span className="font-semibold text-slate-800 dark:text-slate-200">300+ researchers &amp; teams</span>
        <span className="mx-1 text-slate-300 dark:text-slate-600">·</span>
        <a
          href={PAGESTASH_CHROME_WEB_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-blue-600 underline-offset-2 hover:underline dark:text-blue-400"
        >
          Chrome
        </a>
        <span className="mx-0.5 text-slate-300 dark:text-slate-600">&amp;</span>
        <a
          href={PAGESTASH_FIREFOX_AMO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-blue-600 underline-offset-2 hover:underline dark:text-blue-400"
        >
          Firefox
        </a>
        <span className="mx-1 text-slate-300 dark:text-slate-600">·</span>
        <span className="text-slate-500 dark:text-slate-500">Tor → same listing</span>
        <span className="mt-1 block text-slate-500 dark:text-slate-500">Encrypted · export anytime</span>
      </p>
      <p className="mt-3 hidden border-t border-slate-200/70 pt-3 text-center text-[11px] leading-snug text-slate-600 dark:border-white/10 dark:text-slate-400 sm:block">
        <span className="font-semibold text-slate-800 dark:text-slate-200">300+ researchers &amp; teams</span>
        <span className="mx-1.5 text-slate-300 dark:text-slate-600">·</span>
        <a
          href={PAGESTASH_CHROME_WEB_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-blue-600 underline-offset-2 hover:underline dark:text-blue-400"
        >
          Chrome Web Store
        </a>
        <span className="mx-1 text-slate-300 dark:text-slate-600">&amp;</span>
        <a
          href={PAGESTASH_FIREFOX_AMO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-blue-600 underline-offset-2 hover:underline dark:text-blue-400"
        >
          Firefox Add-ons
        </a>
        <span className="mx-1.5 text-slate-300 dark:text-slate-600">·</span>
        <span className="text-slate-500 dark:text-slate-500">Tor uses the Firefox listing</span>
      </p>
      <p className="mt-1.5 hidden text-center text-[10px] leading-relaxed text-slate-500 dark:text-slate-500 sm:block">
        Encrypted in transit and at rest · exports when you need files outside the app
      </p>
    </div>
  )
}
