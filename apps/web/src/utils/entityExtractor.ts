export interface ExtractedEntities {
  domains: string[]
  emails: string[]
  ipAddresses: string[]
  phones: string[]
  socialHandles: string[]
  names: string[]
}

const SOCIAL_PLATFORMS = ['twitter', 'x', 'instagram', 'linkedin', 'github', 'facebook', 'tiktok', 'youtube', 'reddit', 'mastodon'] as const

export function extractEntities(text: string, url?: string): ExtractedEntities {
  if (!text) return { domains: [], emails: [], ipAddresses: [], phones: [], socialHandles: [], names: [] }

  const emails = dedup(
    [...text.matchAll(/[\w.+-]+@[\w-]+\.[\w.-]{2,}/g)].map(m => m[0].toLowerCase())
  )

  const ipAddresses = dedup(
    [...text.matchAll(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g)]
      .map(m => m[0])
      .filter(ip => ip.split('.').every(o => +o >= 0 && +o <= 255))
  )

  const phones = dedup(
    [...text.matchAll(/(?:\+?\d{1,3}[\s.-]?)?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}\b/g)]
      .map(m => m[0].trim())
      .filter(p => p.replace(/\D/g, '').length >= 7 && p.replace(/\D/g, '').length <= 15)
  )

  const handles = dedup(
    [...text.matchAll(/@([\w.]{2,30})\b/g)]
      .map(m => '@' + m[1])
      .filter(h => !h.includes('.') || SOCIAL_PLATFORMS.some(p => text.toLowerCase().includes(p)))
  )

  // URL-like patterns in the text
  const rawUrls = [...text.matchAll(/https?:\/\/[^\s<>"')\]]+/gi)].map(m => m[0])
  const domainMatches = [...text.matchAll(/\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+(?:com|org|net|io|gov|edu|co|app|dev|info|me|tv|us|uk|de|fr|eu|au|ca|jp|cn|ru|br|in|nl)\b/gi)]
    .map(m => m[0].toLowerCase())

  let allDomains = [
    ...rawUrls.map(u => { try { return new URL(u).hostname } catch { return '' } }).filter(Boolean),
    ...domainMatches,
  ]
  if (url) {
    try { allDomains.push(new URL(url).hostname) } catch { /* ignore */ }
  }
  const domains = dedup(
    allDomains
      .map(d => d.replace(/^www\./, ''))
      .filter(d => !d.includes('localhost') && d.includes('.'))
  )

  // Simple name heuristic: 2+ capitalized words in sequence (not at sentence start)
  const nameMatches = [...text.matchAll(/(?<=[.!?\n]\s+|\b(?:by|author|from|contact|name)\s*[:\-]?\s*)([A-Z][a-z]{1,20}(?:\s+[A-Z][a-z]{1,20}){1,3})/g)]
  const names = dedup(nameMatches.map(m => m[1]).filter(n => n.split(/\s+/).length >= 2 && n.length <= 60))

  return { domains, emails, ipAddresses, phones, socialHandles: handles, names }
}

function dedup(arr: string[]): string[] {
  return [...new Set(arr)]
}

export function entityCount(entities: ExtractedEntities): number {
  return entities.domains.length + entities.emails.length + entities.ipAddresses.length +
    entities.phones.length + entities.socialHandles.length + entities.names.length
}
