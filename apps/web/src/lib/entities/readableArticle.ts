/**
 * Mozilla Readability + jsdom: article body and clean title (server-only).
 */
import { Readability } from '@mozilla/readability'
import { JSDOM } from 'jsdom'

export interface ReadableArticle {
  title: string
  textContent: string
  excerpt: string
  byline: string | null
}

export function parseReadableArticle(html: string, pageUrl: string): ReadableArticle | null {
  if (!html?.trim() || html.length < 200) return null
  try {
    const dom = new JSDOM(html, { url: pageUrl || 'https://example.com/' })
    const reader = new Readability(dom.window.document as unknown as Document)
    const parsed = reader.parse()
    if (!parsed?.textContent || parsed.textContent.length < 80) return null
    return {
      title: (parsed.title || '').trim(),
      textContent: parsed.textContent.trim(),
      excerpt: (parsed.excerpt || '').trim(),
      byline: parsed.byline?.trim() || null,
    }
  } catch {
    return null
  }
}
