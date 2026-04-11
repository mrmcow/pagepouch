/**
 * Server-only entity extraction: regex/heuristics + local NLP (compromise).
 * Dynamic import keeps compromise out of the client bundle.
 */
import { extractMainTextFromHtml } from '@/lib/entities/htmlMainText'
import {
  extractEntities,
  refineExtractedEntities,
  type ExtractedEntities,
} from '@/utils/entityExtractor'

const NLP_TEXT_MAX = 52_000
const HTML_TEXT_BUDGET = 38_000

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

/** Prefer article/main text from HTML, plus clip text — capped for compromise. */
function buildNlpCorpus(text: string, html?: string): string {
  const parts: string[] = []
  if (html?.trim()) {
    const fromHtml = extractMainTextFromHtml(html, HTML_TEXT_BUDGET)
    if (fromHtml.length > 80) parts.push(fromHtml)
  }
  const t = (text || '').trim()
  if (t) parts.push(t.slice(0, NLP_TEXT_MAX))
  return parts.join('\n\n').slice(0, NLP_TEXT_MAX)
}

export async function extractEntitiesServer(
  text: string,
  url?: string,
  html?: string
): Promise<ExtractedEntities> {
  const base = extractEntities(text, url, html)

  const slice = buildNlpCorpus(text, html)
  if (slice.length < 40) return base

  try {
    const nlp = (await import('compromise')).default
    const doc = nlp(slice)
    const nlpPeople = doc.people().out('array') as string[]
    const nlpOrgs = doc.organizations().out('array') as string[]
    const nlpPlaces = doc.places().out('array') as string[]

    base.persons = mergeUnique(base.persons, nlpPeople)
    base.organizations = mergeUnique(base.organizations, nlpOrgs)
    base.locations = mergeUnique(base.locations, nlpPlaces)
  } catch (e) {
    console.error('[extractEntitiesServer] compromise failed', e)
  }

  return refineExtractedEntities(base)
}
