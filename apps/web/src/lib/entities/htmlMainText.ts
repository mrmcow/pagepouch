/**
 * Pull article-like plain text from HTML so NLP sees body copy, not only stored text_content.
 * Server-only (cheerio).
 */
import * as cheerio from 'cheerio'

function collapseWhitespace(s: string): string {
  return s.replace(/\s+/g, ' ').replace(/\n{3,}/g, '\n\n').trim()
}

/**
 * Best-effort main content extraction; capped for NLP budget.
 */
export function extractMainTextFromHtml(html: string, maxChars: number): string {
  if (!html || html.length < 20) return ''

  try {
    const $ = cheerio.load(html)
    $('script, style, noscript, svg, iframe, template, nav, footer, header, aside').remove()

    const selectors = [
      'article',
      '[role="main"]',
      'main',
      '#content',
      '#main',
      '.article-body',
      '.post-content',
      '.entry-content',
      '.story-body',
      '.article__body',
    ]

    const chunks: string[] = []
    for (const sel of selectors) {
      $(sel).each((_, el) => {
        const t = collapseWhitespace($(el).text())
        if (t.length > 120) chunks.push(t)
      })
    }

    let body = ''
    if (chunks.length > 0) {
      body = collapseWhitespace(chunks.join('\n\n'))
    } else {
      body = collapseWhitespace($('body').text())
    }

    return body.slice(0, maxChars)
  } catch {
    return ''
  }
}
