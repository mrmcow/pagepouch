/**
 * Server-only entity extraction: regex/heuristics + Readability + fused-text repair + compromise.
 * Dynamic imports keep heavy deps out of the client bundle.
 */
import { extractKeyPhrases } from '@/lib/entities/keyPhrases'
import { extractMainTextFromHtml } from '@/lib/entities/htmlMainText'
import { parseReadableArticle, type ReadableArticle } from '@/lib/entities/readableArticle'
import { repairFusedProse } from '@/lib/entities/repairFusedText'
import {
  extractEntities,
  refineExtractedEntities,
  type ExtractedEntities,
} from '@/utils/entityExtractor'

const NLP_TEXT_MAX = 55_000
const HTML_TEXT_BUDGET = 28_000

function cleanSpan(s: string): string {
  return s.trim().replace(/[.,;:!?)]+$/, '').trim()
}

function mergeUnique(base: string[], extra: string[]): string[] {
  const seen = new Set(base.map((x) => x.toLowerCase()))
  const out = [...base]
  for (const raw of extra) {
    const c = cleanSpan(raw)
    if (c.length < 2 || c.length > 120) continue
    const low = c.toLowerCase()
    if (!seen.has(low)) {
      seen.add(low)
      out.push(c)
    }
  }
  return out
}

function looksLikePersonByline(s: string): boolean {
  const t = s.trim()
  return /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3}$/.test(t) && t.length < 80
}

/**
 * Merge Readability article text, cheerio main blocks, and repaired capture text
 * so regex + NLP see separated words instead of DOM-fused runs.
 */
function buildServerCorpus(
  rawText: string,
  html: string | undefined,
  url: string | undefined,
  article: ReadableArticle | null
): string {
  const parts: string[] = []
  if (article) {
    if (article.title) parts.push(article.title)
    if (article.textContent) parts.push(article.textContent.slice(0, 42_000))
    if (article.excerpt) parts.push(article.excerpt)
    if (article.byline && looksLikePersonByline(article.byline)) {
      parts.push(article.byline)
    }
  }
  if (html?.trim()) {
    const fromCheerio = extractMainTextFromHtml(html, HTML_TEXT_BUDGET)
    if (fromCheerio.length > 80) parts.push(fromCheerio)
  }
  parts.push(repairFusedProse(rawText || ''))
  return parts.filter(Boolean).join('\n\n').slice(0, 120_000)
}

export async function extractEntitiesServer(
  text: string,
  url?: string,
  html?: string
): Promise<ExtractedEntities> {
  let article: ReadableArticle | null = null
  if (html?.trim() && url) {
    article = parseReadableArticle(html, url)
  }

  const merged = buildServerCorpus(text || '', html, url, article)
  const base = extractEntities(merged || text || '', url, html)

  const phraseSource = (article?.textContent || merged).slice(0, 80_000)
  base.keyPhrases = extractKeyPhrases(phraseSource, 24)

  const slice = merged.slice(0, NLP_TEXT_MAX)
  if (slice.length < 40) {
    return refineExtractedEntities(base)
  }

  try {
    const nlp = (await import('compromise')).default
    const doc = nlp(slice)
    const nlpPeople = doc.people().out('array') as string[]
    const nlpOrgs = doc.organizations().out('array') as string[]
    const nlpPlaces = doc.places().out('array') as string[]

    base.persons = mergeUnique(base.persons, nlpPeople)
    base.organizations = mergeUnique(base.organizations, nlpOrgs)
    base.locations = mergeUnique(base.locations, nlpPlaces)

    if (article?.byline && looksLikePersonByline(article.byline)) {
      base.persons = mergeUnique(base.persons, [article.byline])
    }
  } catch (e) {
    console.error('[extractEntitiesServer] compromise failed', e)
  }

  return refineExtractedEntities(base)
}
