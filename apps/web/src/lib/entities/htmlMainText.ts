/**
 * Pull article-like plain text from HTML so NLP sees body copy, not only stored text_content.
 * Server-only (cheerio).
 */
import * as cheerio from 'cheerio'

function collapseWhitespace(s: string): string {
  return s.replace(/\s+/g, ' ').replace(/\n{3,}/g, '\n\n').trim()
}

/**
 * Block-level tags whose boundaries imply a word break. cheerio's default
 * `.text()` walks descendant text nodes with NO separator, so a grid like
 * `<div><h3>NFL</h3><p>Super Bowl</p></div><div><h3>BBC</h3>` collapses to
 * `"NFLSuper BowlBBC"` — which then propagates into NLP and key-phrase
 * mining as fused garbage tokens (`"Capturenfl Super"`,
 * `"CorporationBritish Broadcasting"`). Inserting a leading space on every
 * block-level element before reading text fixes this at the root.
 */
const BLOCK_TAGS = new Set([
  'p', 'div', 'section', 'article', 'header', 'footer', 'main', 'nav', 'aside',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'li', 'ul', 'ol', 'dl', 'dt', 'dd',
  'tr', 'td', 'th', 'tbody', 'thead', 'tfoot', 'caption', 'table',
  'br', 'hr',
  'blockquote', 'figure', 'figcaption',
  'pre', 'address',
  'form', 'fieldset',
])

/**
 * Minimal structural shape we walk over. cheerio's underlying nodes are from
 * domhandler — we avoid importing those types directly to keep the surface
 * compatible across cheerio major versions.
 */
type DomLikeNode = {
  type?: string
  data?: string
  tagName?: string
  children?: DomLikeNode[]
}

/** Read text from a cheerio node, inserting spaces at block-element boundaries. */
function blockSafeText(node: DomLikeNode | null | undefined): string {
  if (!node) return ''
  const out: string[] = []
  const walk = (n: DomLikeNode) => {
    if (n.type === 'text') {
      if (n.data) out.push(n.data)
      return
    }
    const tag = n.tagName?.toLowerCase()
    const isBlock = !!tag && BLOCK_TAGS.has(tag)
    if (isBlock) out.push(' ')
    const children = n.children || []
    for (const child of children) walk(child)
    if (isBlock) out.push(' ')
  }
  walk(node)
  return out.join('')
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
        const t = collapseWhitespace(blockSafeText(el as unknown as DomLikeNode))
        if (t.length > 120) chunks.push(t)
      })
    }

    let body = ''
    if (chunks.length > 0) {
      body = collapseWhitespace(chunks.join('\n\n'))
    } else {
      const bodyEl = $('body').get(0) as unknown as DomLikeNode | undefined
      body = bodyEl
        ? collapseWhitespace(blockSafeText(bodyEl))
        : collapseWhitespace($('body').text())
    }

    return body.slice(0, maxChars)
  } catch {
    return ''
  }
}
