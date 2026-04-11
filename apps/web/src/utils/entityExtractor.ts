// ---------------------------------------------------------------------------
// Entity Extraction Engine
// High-quality, regex + heuristic extraction for 18 entity categories.
// Runs client-side (EntitiesView) and server-side (clip creation pipeline).
// ---------------------------------------------------------------------------

export interface ExtractedEntities {
  // People & Organisations
  persons: string[]
  organizations: string[]
  /** Geographic / place names (regex stays empty client-side; filled by server NLP merge). */
  locations: string[]

  // Digital Identifiers
  emails: string[]
  domains: string[]
  urls: string[]
  ipAddresses: string[]
  ipv6Addresses: string[]
  macAddresses: string[]

  // Communication
  phones: string[]
  socialHandles: string[]

  // Financial
  cryptoAddresses: string[]
  monetaryAmounts: string[]

  // Academic & Research
  dois: string[]
  isbns: string[]

  // OSINT / Security
  onionAddresses: string[]
  fileHashes: string[]
  cveIds: string[]

  // General
  hashtags: string[]
  coordinates: string[]
  dates: string[]

  // Page Metadata (extracted from HTML)
  metadata: PageMetadata
}

export interface PageMetadata {
  author?: string
  publishedDate?: string
  siteName?: string
  description?: string
  keywords?: string[]
  language?: string
  ogImage?: string
}

const EMPTY: ExtractedEntities = {
  persons: [], organizations: [], locations: [],
  emails: [], domains: [], urls: [], ipAddresses: [], ipv6Addresses: [], macAddresses: [],
  phones: [], socialHandles: [],
  cryptoAddresses: [], monetaryAmounts: [],
  dois: [], isbns: [],
  onionAddresses: [], fileHashes: [], cveIds: [],
  hashtags: [], coordinates: [], dates: [],
  metadata: {},
}

// ---------------------------------------------------------------------------
// Main entry
// ---------------------------------------------------------------------------

export function extractEntities(text: string, url?: string, html?: string): ExtractedEntities {
  if (!text && !html) return { ...EMPTY, metadata: {} }

  const src = cleanTextForExtraction(text || '')
  const result: ExtractedEntities = {
    emails:           extractEmails(src),
    domains:          extractDomains(src, url),
    urls:             extractUrls(src),
    ipAddresses:      extractIPv4(src),
    ipv6Addresses:    extractIPv6(src),
    macAddresses:     extractMAC(src),
    phones:           extractPhones(src),
    socialHandles:    extractSocialHandles(src),
    persons:          extractPersons(src),
    organizations:    extractOrganizations(src),
    locations:        [],
    cryptoAddresses:  extractCryptoAddresses(src),
    monetaryAmounts:  extractMonetaryAmounts(src),
    dois:             extractDOIs(src),
    isbns:            extractISBNs(src),
    onionAddresses:   extractOnionAddresses(src),
    fileHashes:       extractFileHashes(src),
    cveIds:           extractCVEIds(src),
    hashtags:         extractHashtags(src),
    coordinates:      extractCoordinates(src),
    dates:            extractDates(src),
    metadata:         html ? extractHTMLMetadata(html) : {},
  }

  // Cross-reference: remove persons that are actually organization names
  const orgSet = new Set(result.organizations.map(o => o.toLowerCase()))
  result.persons = result.persons.filter(p => !orgSet.has(p.toLowerCase()))

  // Cross-reference: if metadata has author, ensure it's in persons
  if (result.metadata.author && result.metadata.author !== 'Author Unknown') {
    const authorLower = result.metadata.author.toLowerCase()
    if (!result.persons.some(p => p.toLowerCase() === authorLower)) {
      result.persons.unshift(result.metadata.author)
    }
  }

  return refineExtractedEntities(result)
}

// Cleans web page text by removing navigation noise, repeated whitespace, etc.
function cleanTextForExtraction(text: string): string {
  return text
    .replace(/\b(Skip to (?:content|main|navigation)|Cookie (?:Policy|Settings|Consent)|Accept (?:All )?Cookies|Manage Preferences|Subscribe|Sign [Uu]p|Log [Ii]n|Newsletter)\b[^\n]*/gi, '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{3,}/g, ' ')
    .trim()
}

// ---------------------------------------------------------------------------
// Entity count helper
// ---------------------------------------------------------------------------

export function entityCount(entities: ExtractedEntities): number {
  let count = 0
  for (const [key, val] of Object.entries(entities)) {
    if (key === 'metadata') continue
    if (Array.isArray(val)) count += val.length
  }
  return count
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function dedup(arr: string[]): string[] {
  return [...new Set(arr)]
}

function dedupLower(arr: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const s of arr) {
    const lower = s.toLowerCase()
    if (!seen.has(lower)) { seen.add(lower); out.push(s) }
  }
  return out
}

// Common false-positive words to exclude from name/org detection
const STOP_WORDS = new Set([
  'The', 'This', 'That', 'These', 'Those', 'With', 'From', 'About', 'After',
  'Before', 'Above', 'Below', 'Between', 'Through', 'During', 'Until', 'Into',
  'Under', 'Over', 'Where', 'When', 'While', 'Which', 'Whether', 'Although',
  'Because', 'Since', 'However', 'Therefore', 'Moreover', 'Furthermore',
  'Nevertheless', 'Nonetheless', 'Meanwhile', 'Otherwise', 'Instead',
  'Despite', 'Within', 'Without', 'Around', 'Beyond', 'Along', 'Among',
  'Please', 'Click', 'Share', 'Read', 'More', 'Like', 'Just', 'Also',
  'Even', 'Still', 'Already', 'Every', 'Each', 'Most', 'Some', 'Many',
  'Such', 'Other', 'Another', 'Both', 'Several', 'Various', 'Several',
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
  'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December',
  'Next', 'Last', 'First', 'Second', 'Third', 'New', 'Open', 'Close',
  'Home', 'Menu', 'Back', 'Help', 'View', 'Sign', 'Log', 'Get', 'See',
  'How', 'Why', 'What', 'Who', 'Our', 'Your', 'All', 'Top', 'Best',
  'Privacy', 'Policy', 'Terms', 'Service', 'Contact', 'Support',
  'Google', 'Chrome', 'Firefox', 'Safari', 'Windows', 'Linux', 'Mac',
  'Image', 'Video', 'Audio', 'Source', 'Table', 'Data',
])

const STOP_WORDS_LOWER = new Set([...STOP_WORDS].map((w) => w.toLowerCase()))

/** Drop domains already represented by a full URL’s hostname (keeps URLs; removes redundant host-only rows). */
function dedupeDomainsCoveredByUrls(entities: ExtractedEntities): void {
  const hosts = new Set<string>()
  for (const u of entities.urls) {
    try {
      const h = new URL(u).hostname.replace(/^www\./i, '').toLowerCase()
      if (h) hosts.add(h)
    } catch {
      /* ignore */
    }
  }
  if (hosts.size === 0) return
  entities.domains = entities.domains.filter((d) => {
    const norm = d.replace(/^www\./i, '').toLowerCase()
    return !hosts.has(norm)
  })
}

function isWeakNlpSpan(s: string, minLen: number): boolean {
  const t = s.trim().replace(/[.,;:!?)]+$/, '').trim()
  if (t.length < minLen || t.length > 120) return true
  const low = t.toLowerCase()
  if (STOP_WORDS_LOWER.has(low)) return true
  if (/^\d+$/.test(t)) return true
  if (/^[^a-zA-Z]+$/.test(t)) return true
  return false
}

function filterNamedEntityNoise(entities: ExtractedEntities): void {
  entities.persons = entities.persons.filter((p) => !isWeakNlpSpan(p, 4))
  entities.organizations = entities.organizations.filter((o) => !isWeakNlpSpan(o, 2))
  entities.locations = entities.locations.filter((l) => !isWeakNlpSpan(l, 2))
}

function promoteSiteNameToOrganizations(entities: ExtractedEntities): void {
  const name = entities.metadata.siteName?.trim()
  if (!name || name.length < 2) return
  const low = name.toLowerCase()
  if (entities.organizations.some((o) => o.toLowerCase() === low)) return
  entities.organizations = dedupLower([name, ...entities.organizations])
}

function crossRefIdentityBuckets(entities: ExtractedEntities): void {
  const orgSet = new Set(entities.organizations.map((o) => o.toLowerCase()))
  entities.persons = entities.persons.filter((p) => !orgSet.has(p.toLowerCase()))
  entities.locations = entities.locations.filter((l) => !orgSet.has(l.toLowerCase()))
}

/**
 * Final quality pass: metadata promotion, digital dedupe, NLP noise trim, identity cross-ref.
 * Run again after server-side NLP merges.
 */
export function refineExtractedEntities(entities: ExtractedEntities): ExtractedEntities {
  const e: ExtractedEntities = JSON.parse(JSON.stringify(entities)) as ExtractedEntities

  promoteSiteNameToOrganizations(e)
  dedupeDomainsCoveredByUrls(e)
  filterNamedEntityNoise(e)
  crossRefIdentityBuckets(e)

  return e
}

// ---------------------------------------------------------------------------
// Email extraction
// ---------------------------------------------------------------------------

function extractEmails(text: string): string[] {
  return dedup(
    [...text.matchAll(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g)]
      .map(m => m[0].toLowerCase())
      .filter(e => !e.endsWith('.png') && !e.endsWith('.jpg') && !e.endsWith('.gif'))
  )
}

// ---------------------------------------------------------------------------
// Domain extraction — expanded TLD list
// ---------------------------------------------------------------------------

const TLDS = 'com|org|net|io|gov|edu|co|app|dev|info|me|tv|us|uk|de|fr|eu|au|ca|jp|cn|ru|br|in|nl|es|it|se|no|fi|dk|ch|at|be|pt|pl|cz|hu|ro|bg|hr|sk|si|lt|lv|ee|ie|nz|za|il|kr|tw|hk|sg|my|th|ph|vn|id|mx|ar|cl|pe|uy|ng|ke|gh|tz|eg|ma|dz|sa|ae|qa|bh|kw|om|jo|lb|pk|bd|lk|np|mm|la|kh|ac|ad|af|ag|ai|al|am|an|ao|aq|as|aw|ax|az|ba|bb|bf|bi|bj|bm|bn|bo|bs|bt|bv|bw|by|bz|cc|cd|cf|cg|ci|ck|cm|cr|cu|cv|cx|cy|dj|dm|do|ec|er|et|fj|fk|fm|fo|ga|gd|ge|gf|gg|gi|gl|gm|gn|gp|gq|gr|gs|gt|gu|gw|gy|hm|hn|ht|im|is|je|jm|ki|km|kn|kg|kz|lc|li|lr|ls|lu|ly|mc|md|mg|mh|mk|ml|mn|mo|mp|mq|mr|ms|mt|mu|mv|mw|mz|na|nc|ne|nf|ni|nr|nu|pa|pf|pg|pm|pn|pr|ps|pw|py|re|rs|rw|sb|sc|sd|sh|sl|sm|sn|so|sr|ss|st|sv|sx|sy|sz|tc|td|tg|tj|tk|tl|tm|tn|to|tr|tt|ug|uz|va|vc|ve|vg|vi|vu|wf|ws|ye|yt|zm|zw|aero|asia|biz|cat|coop|int|jobs|mobi|museum|name|post|pro|tel|travel|xxx|mil|arpa|nato|one|xyz|online|site|tech|store|shop|club|fun|space|top|wang|bid|win|vip|work|icu|buzz|design|art|blog|cloud|digital|email|global|group|live|network|news|pub|social|world|zone|academy|agency|builders|capital|center|company|consulting|education|engineering|expert|finance|foundation|fund|health|holdings|institute|international|management|marketing|media|partners|photography|properties|realty|solutions|systems|technology|ventures|church|city|community|energy|events|exchange|farm|fit|garden|haus|land|life|link|market|money|pizza|plus|report|review|school|services|studio|supply|tax|team|today|tools|training|website'

function extractDomains(text: string, url?: string): string[] {
  const rawUrls = [...text.matchAll(/https?:\/\/[^\s<>"')\]]+/gi)].map(m => m[0])
  const re = new RegExp(`\\b(?:[a-z0-9](?:[a-z0-9\\-]{0,61}[a-z0-9])?\\.)+(?:${TLDS})\\b`, 'gi')
  const domainMatches = [...text.matchAll(re)].map(m => m[0].toLowerCase())

  const allDomains = [
    ...rawUrls.map(u => { try { return new URL(u).hostname } catch { return '' } }).filter(Boolean),
    ...domainMatches,
  ]
  if (url) {
    try { allDomains.push(new URL(url).hostname) } catch { /* */ }
  }
  return dedup(
    allDomains
      .map(d => d.replace(/^www\./, ''))
      .filter(d => !d.includes('localhost') && d.includes('.') && d.length > 3)
  )
}

// ---------------------------------------------------------------------------
// URL extraction
// ---------------------------------------------------------------------------

function extractUrls(text: string): string[] {
  return dedup(
    [...text.matchAll(/https?:\/\/[^\s<>"')\]]{8,}/gi)]
      .map(m => m[0].replace(/[.,;:!?)]+$/, ''))
  ).slice(0, 100)
}

// ---------------------------------------------------------------------------
// IPv4 extraction
// ---------------------------------------------------------------------------

function extractIPv4(text: string): string[] {
  return dedup(
    [...text.matchAll(/\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d?\d)\b/g)]
      .map(m => m[0])
      .filter(ip => {
        const octets = ip.split('.')
        if (octets.every(o => o === '0')) return false
        if (ip === '127.0.0.1' || ip === '0.0.0.0') return false
        return true
      })
  )
}

// ---------------------------------------------------------------------------
// IPv6 extraction
// ---------------------------------------------------------------------------

function extractIPv6(text: string): string[] {
  return dedup(
    [...text.matchAll(/\b(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\b/g)]
      .map(m => m[0])
  )
}

// ---------------------------------------------------------------------------
// MAC Address extraction
// ---------------------------------------------------------------------------

function extractMAC(text: string): string[] {
  return dedup(
    [...text.matchAll(/\b(?:[0-9a-fA-F]{2}[:\-]){5}[0-9a-fA-F]{2}\b/g)]
      .map(m => m[0].toUpperCase())
  )
}

// ---------------------------------------------------------------------------
// Phone extraction — international formats
// ---------------------------------------------------------------------------

function extractPhones(text: string): string[] {
  return dedup(
    [...text.matchAll(/(?:\+?\d{1,3}[\s.\-]?)?\(?\d{2,4}\)?[\s.\-]?\d{3,4}[\s.\-]?\d{3,4}\b/g)]
      .map(m => m[0].trim())
      .filter(p => {
        const digits = p.replace(/\D/g, '')
        return digits.length >= 7 && digits.length <= 15
      })
  )
}

// ---------------------------------------------------------------------------
// Social Handles — @username patterns with platform awareness
// ---------------------------------------------------------------------------

const SOCIAL_PLATFORMS = ['twitter', 'x.com', 'instagram', 'linkedin', 'github', 'facebook', 'tiktok', 'youtube', 'reddit', 'mastodon', 'threads', 'bluesky', 'nostr', 'telegram', 'signal', 'discord', 'twitch', 'medium', 'substack', 'hackernews'] as const

function extractSocialHandles(text: string): string[] {
  const handles = [...text.matchAll(/@([a-zA-Z0-9_]{2,30})\b/g)]
    .map(m => '@' + m[1])
    .filter(h => {
      const bare = h.slice(1).toLowerCase()
      if (['media', 'import', 'keyframes', 'charset', 'font-face', 'supports', 'layer', 'page', 'apply', 'tailwind', 'screen'].includes(bare)) return false
      if (!h.includes('.') || SOCIAL_PLATFORMS.some(p => text.toLowerCase().includes(p))) return true
      return false
    })
  return dedup(handles)
}

// ---------------------------------------------------------------------------
// Person Name extraction — improved heuristics
// ---------------------------------------------------------------------------

const PERSON_CUE_PATTERN = /\b(?:by|author|contact|reporter|journalist|correspondent|contributor|columnist|analyst|editor|photographer|illustrator|creator|speaker|host|guest|interviewer|written\s+by|edited\s+by|published\s+by|reviewed\s+by|interview\s+with|featuring|credited\s+to|submitted\s+by|posted\s+by|curated\s+by|compiled\s+by|CEO|CTO|CFO|COO|CIO|CISO|CMO|CPO|founder|co-founder|cofounder|president|vice\s+president|chairman|chairwoman|director|managing\s+director|general\s+manager|professor|prof\.|dr\.|mr\.|mrs\.|ms\.|mx\.|judge|justice|senator|congressman|congresswoman|representative|rep\.|gov\.|mayor|commissioner|ambassador|secretary|minister|chancellor|dean|provost|lieutenant|captain|sergeant|colonel|general|detective|inspector|officer|agent|attorney|counsel|solicitor|barrister|advocate)\s*[:;\-–—]?\s*/gi

function extractPersons(text: string): string[] {
  const names: string[] = []

  // Pattern 1: Names after attribution cues (highest confidence)
  const afterCue = new RegExp(
    PERSON_CUE_PATTERN.source + '([A-Z][a-z]{1,20}(?:[\\s\\-][A-Z][a-z]{1,20}){1,3})',
    'gm'
  )
  for (const m of text.matchAll(afterCue)) {
    const name = m[1] || m[2]
    if (name) names.push(name)
  }

  // Pattern 2: Quoted attributions — "said John Smith" / "John Smith said"
  const SPEECH_VERBS = 'said|says|told|according\\s+to|stated|explained|noted|added|wrote|reported|warned|argued|claimed|insisted|suggested|revealed|confirmed|acknowledged|testified|alleged|declared|announced|emphasized|stressed|urged|cautioned|predicted|observed|recalled|speculated|commented|responded|replied|tweeted|posted'
  for (const m of text.matchAll(new RegExp(`["'""]\\s*(?:${SPEECH_VERBS})\\s+([A-Z][a-z]{1,20}(?:[\\s\\-][A-Z][a-z]{1,20}){1,2})`, 'g'))) {
    names.push(m[1])
  }
  for (const m of text.matchAll(new RegExp(`([A-Z][a-z]{1,20}(?:[\\s\\-][A-Z][a-z]{1,20}){1,2})\\s+(?:${SPEECH_VERBS})`, 'g'))) {
    names.push(m[1])
  }

  // Pattern 3: "According to X" / "X told Reuters" / "X, who is"
  for (const m of text.matchAll(/according\s+to\s+([A-Z][a-z]{1,20}(?:[\s\-][A-Z][a-z]{1,20}){1,2})/g)) {
    names.push(m[1])
  }
  for (const m of text.matchAll(/([A-Z][a-z]{1,20}(?:[\s\-][A-Z][a-z]{1,20}){1,2}),?\s+(?:who\s+(?:is|was|has|had)|a\s+(?:former|senior|chief|lead|veteran|prominent|notable))/g)) {
    names.push(m[1])
  }

  // Pattern 4: "Name, Title at Org" — e.g. "Jane Doe, CEO at Acme Corp"
  for (const m of text.matchAll(/([A-Z][a-z]{1,20}(?:[\s\-][A-Z][a-z]{1,20}){1,2}),?\s+(?:CEO|CTO|CFO|COO|president|director|professor|analyst|researcher|engineer|scientist|journalist|editor|manager|head|chief|founder|partner|principal)\b/g)) {
    names.push(m[1])
  }

  // Pattern 5: Title Case sequences after sentence boundaries
  for (const m of text.matchAll(/(?<=[.!?\n]\s{1,3})([A-Z][a-z]{1,20}[\s\-][A-Z][a-z]{1,20}(?:[\s\-][A-Z][a-z]{1,20})?)\b/g)) {
    names.push(m[1])
  }

  // Pattern 6: Email-derived names — "firstname.lastname@"
  for (const m of text.matchAll(/([a-z]{2,15})\.([a-z]{2,20})@/gi)) {
    const first = m[1].charAt(0).toUpperCase() + m[1].slice(1)
    const last = m[2].charAt(0).toUpperCase() + m[2].slice(1)
    names.push(`${first} ${last}`)
  }

  return dedupLower(
    names
      .map(n => n.trim().replace(/[,;:.!?]+$/, ''))
      .filter(n => {
        if (n.length < 4 || n.length > 60) return false
        const parts = n.split(/[\s\-]+/)
        if (parts.length < 2) return false
        if (parts.some(p => STOP_WORDS.has(p))) return false
        // Each part should look like a name part (start with uppercase, rest lowercase)
        if (!parts.every(p => /^[A-Z][a-z]/.test(p))) return false
        return true
      })
  ).slice(0, 50)
}

// ---------------------------------------------------------------------------
// Organization extraction
// ---------------------------------------------------------------------------

const ORG_SUFFIXES = /\b(Inc\.?|Corp\.?|LLC|Ltd\.?|GmbH|AG|SA|SAS|PLC|LP|LLP|Co\.?|Group|Foundation|Institute|University|Association|Authority|Commission|Committee|Council|Department|Agency|Bureau|Ministry|Consortium|Alliance|Federation|Union|Network|Trust|Fund|Bank|Exchange|Securities|Holdings|Ventures|Capital|Partners|Laboratories|Labs|Technologies|Systems|Solutions|Services|Media|Studios|Press|Publishing|Entertainment|Productions|Records|Games|Software|Research|Analytics|Intelligence|Consulting|Advisory|Management|Healthcare|Pharma|Therapeutics|Biotech|Genomics|Robotics|Dynamics|Motors|Aerospace|Defense|Energy|Power|Solar|Nuclear|Chemical|Materials|Logistics|Airlines|Railways|Telecom|Communications|Broadcasting|Semiconductor|Microsystems|Electronics|Instruments|Devices|Automation|Engineering)\b/

function extractOrganizations(text: string): string[] {
  const orgs: string[] = []

  // Pattern 1: Multi-word Title Case followed by org suffix
  const suffixRe = new RegExp(
    '([A-Z][a-zA-Z]{1,30}(?:\\s+(?:of|for|and|&)?\\s*[A-Z]?[a-zA-Z]{1,30}){0,5}\\s+' + ORG_SUFFIXES.source + ')',
    'g'
  )
  for (const m of text.matchAll(suffixRe)) {
    orgs.push(m[1])
  }

  // Pattern 2: Known organizational patterns (government, international bodies)
  for (const m of text.matchAll(/\b((?:The\s+)?(?:United\s+(?:States|Nations|Kingdom|Arab\s+Emirates)|European\s+(?:Union|Commission|Parliament|Central\s+Bank|Court)|World\s+(?:Health|Trade|Bank|Economic\s+Forum)|International\s+(?:Monetary|Criminal|Atomic|Olympic|Red\s+Cross)|Federal\s+(?:Bureau|Reserve|Trade|Aviation|Communications|Emergency)|National\s+(?:Security|Guard|Institute|Academy|Science|Park|Museum|Archives)|Central\s+(?:Intelligence|Bank)|Supreme\s+Court|Department\s+of\s+(?:Defense|State|Justice|Energy|Education|Commerce|Labor|Treasury|Homeland)|Ministry\s+of\s+[A-Z][a-zA-Z]+)(?:\s+(?:of|for|and)\s+[A-Z][a-zA-Z]+)*)/g)) {
    orgs.push(m[1])
  }

  // Pattern 3: Org with "University of X" / "X University" / "X Institute"
  for (const m of text.matchAll(/\b((?:University|Institut[eo]?|College|Academy|School)\s+(?:of|for|de)\s+[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+){0,3})/g)) {
    orgs.push(m[1])
  }
  for (const m of text.matchAll(/\b([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+){0,2}\s+(?:University|Institute|College|Academy|Hospital|Medical\s+Center|Research\s+Center|Laboratory|Observatory))\b/g)) {
    orgs.push(m[1])
  }

  // Pattern 4: Well-known tech companies and media outlets (partial list for high-confidence matching)
  for (const m of text.matchAll(/\b(Google|Microsoft|Apple|Amazon|Meta|Facebook|Twitter|Netflix|Tesla|SpaceX|OpenAI|Anthropic|DeepMind|IBM|Intel|AMD|NVIDIA|Samsung|Sony|Toyota|Boeing|Lockheed\s+Martin|Raytheon|Pfizer|Moderna|Johnson\s+&\s+Johnson|Reuters|Associated\s+Press|Bloomberg|BBC|CNN|NBC|CBS|ABC|Fox\s+News|Al\s+Jazeera|The\s+(?:New\s+York\s+Times|Washington\s+Post|Guardian|Wall\s+Street\s+Journal|Times|Economist|Atlantic|Telegraph|Independent)|NPR|Politico|Axios|ProPublica|BuzzFeed|Vice|Wired|TechCrunch|The\s+Verge|Ars\s+Technica|Hacker\s+News)\b/g)) {
    orgs.push(m[1])
  }

  // Pattern 5: Acronyms in context — "the FBI", "at NASA", "by the CIA"
  const COMMON_WORDS = new Set(['THE', 'AND', 'FOR', 'BUT', 'NOT', 'YOU', 'ALL', 'CAN', 'HER', 'WAS', 'ONE', 'OUR', 'OUT', 'ARE', 'HAS', 'HIS', 'HOW', 'ITS', 'MAY', 'NEW', 'NOW', 'OLD', 'SEE', 'WAY', 'WHO', 'GET', 'USE', 'CSS', 'URL', 'API', 'DOM', 'HTML', 'HTTP', 'HTTPS', 'JSON', 'XML', 'SQL', 'PHP', 'PDF', 'PNG', 'JPG', 'GIF', 'SVG', 'RSS', 'UTC', 'GMT', 'EST', 'PST', 'CST', 'MST', 'EDT', 'PDT', 'CDT', 'MDT', 'USD', 'EUR', 'GBP', 'BTC', 'ETH'])
  for (const m of text.matchAll(/\b(?:the|at|by|from|with|for|joined|left|founded)\s+([A-Z]{2,8})\b/g)) {
    if (!COMMON_WORDS.has(m[1])) {
      orgs.push(m[1])
    }
  }

  // Pattern 6: "at/for/from Organization Name" contextual extraction
  for (const m of text.matchAll(/\b(?:at|for|from|joined|left|works?\s+(?:at|for))\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+){0,3})\b/g)) {
    const candidate = m[1].trim()
    if (candidate.split(/\s+/).length >= 1 && candidate.length > 3 && !STOP_WORDS.has(candidate)) {
      orgs.push(candidate)
    }
  }

  return dedupLower(
    orgs
      .map(o => o.trim().replace(/[,;:.!?]+$/, ''))
      .filter(o => o.length >= 2 && o.length <= 100)
  ).slice(0, 50)
}

// ---------------------------------------------------------------------------
// Cryptocurrency Addresses
// ---------------------------------------------------------------------------

function extractCryptoAddresses(text: string): string[] {
  const addrs: string[] = []

  // Bitcoin (P2PKH, P2SH, Bech32)
  for (const m of text.matchAll(/\b(1[a-km-zA-HJ-NP-Z1-9]{25,34})\b/g)) addrs.push(m[1])
  for (const m of text.matchAll(/\b(3[a-km-zA-HJ-NP-Z1-9]{25,34})\b/g)) addrs.push(m[1])
  for (const m of text.matchAll(/\b(bc1[a-zA-HJ-NP-Z0-9]{25,90})\b/g)) addrs.push(m[1])

  // Ethereum (0x prefixed, 40 hex chars)
  for (const m of text.matchAll(/\b(0x[0-9a-fA-F]{40})\b/g)) addrs.push(m[1])

  // Monero (starts with 4, 95 chars)
  for (const m of text.matchAll(/\b(4[0-9AB][1-9A-HJ-NP-Za-km-z]{93})\b/g)) addrs.push(m[1])

  return dedup(addrs)
}

// ---------------------------------------------------------------------------
// Monetary Amounts
// ---------------------------------------------------------------------------

function extractMonetaryAmounts(text: string): string[] {
  const amounts: string[] = []

  // $123, €456.78, £1,234.56, ¥999
  for (const m of text.matchAll(/[$€£¥₹₿]\s?\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?(?:\s?(?:million|billion|trillion|[MBT]|mn|bn|tn))?/gi)) {
    amounts.push(m[0].trim())
  }

  // "123 USD", "456.78 EUR", etc
  for (const m of text.matchAll(/\b(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?)\s*(USD|EUR|GBP|JPY|CHF|AUD|CAD|CNY|INR|BTC|ETH|USDT|USDC)\b/gi)) {
    amounts.push(`${m[1]} ${m[2].toUpperCase()}`)
  }

  return dedup(amounts).slice(0, 50)
}

// ---------------------------------------------------------------------------
// DOIs (Digital Object Identifiers)
// ---------------------------------------------------------------------------

function extractDOIs(text: string): string[] {
  return dedup(
    [...text.matchAll(/\b(10\.\d{4,9}\/[^\s]{3,})\b/g)]
      .map(m => m[1].replace(/[.,;)]+$/, ''))
  )
}

// ---------------------------------------------------------------------------
// ISBNs
// ---------------------------------------------------------------------------

function extractISBNs(text: string): string[] {
  const isbns: string[] = []

  // ISBN-13
  for (const m of text.matchAll(/\b(?:ISBN[-\s]?(?:13)?[:;\s]?\s?)?(97[89][-\s]?\d[-\s]?\d{2,7}[-\s]?\d{1,7}[-\s]?\d)\b/gi)) {
    isbns.push(m[0].trim())
  }

  // ISBN-10
  for (const m of text.matchAll(/\bISBN[-\s]?(?:10)?[:;\s]?\s?(\d[-\s]?\d{2,7}[-\s]?\d{1,7}[-\s]?[\dXx])\b/gi)) {
    isbns.push(m[0].trim())
  }

  return dedup(isbns)
}

// ---------------------------------------------------------------------------
// .onion Addresses (Tor Hidden Services)
// ---------------------------------------------------------------------------

function extractOnionAddresses(text: string): string[] {
  return dedup(
    [...text.matchAll(/\b([a-z2-7]{16,56}\.onion)\b/gi)]
      .map(m => m[1].toLowerCase())
  )
}

// ---------------------------------------------------------------------------
// File Hashes (MD5, SHA-1, SHA-256, SHA-512)
// ---------------------------------------------------------------------------

function extractFileHashes(text: string): string[] {
  const hashes: string[] = []

  // SHA-256 (64 hex chars) — check first (longer)
  for (const m of text.matchAll(/\b([0-9a-fA-F]{64})\b/g)) {
    if (!m[1].match(/^0+$/)) hashes.push(`SHA-256: ${m[1]}`)
  }

  // SHA-1 (40 hex chars) — exclude Ethereum addresses
  for (const m of text.matchAll(/(?<!0x)\b([0-9a-fA-F]{40})\b/g)) {
    if (!m[1].match(/^0+$/) && !hashes.some(h => h.includes(m[1]))) {
      hashes.push(`SHA-1: ${m[1]}`)
    }
  }

  // MD5 (32 hex chars)
  for (const m of text.matchAll(/\b([0-9a-fA-F]{32})\b/g)) {
    if (!m[1].match(/^0+$/) && !hashes.some(h => h.includes(m[1]))) {
      hashes.push(`MD5: ${m[1]}`)
    }
  }

  return dedup(hashes).slice(0, 30)
}

// ---------------------------------------------------------------------------
// CVE IDs (Common Vulnerabilities and Exposures)
// ---------------------------------------------------------------------------

function extractCVEIds(text: string): string[] {
  return dedup(
    [...text.matchAll(/\b(CVE-\d{4}-\d{4,7})\b/gi)]
      .map(m => m[1].toUpperCase())
  )
}

// ---------------------------------------------------------------------------
// Hashtags
// ---------------------------------------------------------------------------

function extractHashtags(text: string): string[] {
  return dedup(
    [...text.matchAll(/(?:^|\s)(#[a-zA-Z][a-zA-Z0-9_]{1,49})\b/g)]
      .map(m => m[1])
      .filter(h => {
        const bare = h.slice(1).toLowerCase()
        // filter out CSS-like patterns
        if (['include', 'define', 'ifdef', 'endif', 'pragma', 'import', 'if', 'else'].includes(bare)) return false
        return true
      })
  ).slice(0, 100)
}

// ---------------------------------------------------------------------------
// Geographic Coordinates
// ---------------------------------------------------------------------------

function extractCoordinates(text: string): string[] {
  const coords: string[] = []

  // Decimal degrees: 40.7128, -74.0060 or 40.7128°N 74.0060°W
  for (const m of text.matchAll(/(-?\d{1,3}\.\d{3,8})\s*[°]?\s*[NS]?\s*[,;\s]+\s*(-?\d{1,3}\.\d{3,8})\s*[°]?\s*[EW]?/g)) {
    const lat = parseFloat(m[1])
    const lng = parseFloat(m[2])
    if (Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
      coords.push(`${m[1]}, ${m[2]}`)
    }
  }

  // DMS: 40°42'46"N 74°00'22"W
  for (const m of text.matchAll(/(\d{1,3})°\s*(\d{1,2})['′]\s*(\d{1,2}(?:\.\d+)?)[""″]?\s*([NS])\s*[,;\s]*\s*(\d{1,3})°\s*(\d{1,2})['′]\s*(\d{1,2}(?:\.\d+)?)[""″]?\s*([EW])/g)) {
    coords.push(`${m[1]}°${m[2]}'${m[3]}"${m[4]} ${m[5]}°${m[6]}'${m[7]}"${m[8]}`)
  }

  return dedup(coords)
}

// ---------------------------------------------------------------------------
// Date extraction — multiple formats
// ---------------------------------------------------------------------------

function extractDates(text: string): string[] {
  const dates: string[] = []

  // ISO-like: 2024-01-15, 2024/01/15
  for (const m of text.matchAll(/\b((?:19|20)\d{2}[-/](?:0[1-9]|1[0-2])[-/](?:0[1-9]|[12]\d|3[01]))\b/g)) {
    dates.push(m[1])
  }

  // US format: January 15, 2024 / Jan 15, 2024
  for (const m of text.matchAll(/\b((?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.?\s+\d{1,2},?\s+(?:19|20)\d{2})\b/gi)) {
    dates.push(m[1])
  }

  // European: 15 January 2024
  for (const m of text.matchAll(/\b(\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.?\s+(?:19|20)\d{2})\b/gi)) {
    dates.push(m[1])
  }

  // DD/MM/YYYY or MM/DD/YYYY
  for (const m of text.matchAll(/\b(\d{1,2}[/\-.]\d{1,2}[/\-.](?:19|20)\d{2})\b/g)) {
    dates.push(m[1])
  }

  return dedup(dates).slice(0, 50)
}

// ---------------------------------------------------------------------------
// HTML Metadata Extraction
// ---------------------------------------------------------------------------

export function extractHTMLMetadata(html: string): PageMetadata {
  if (!html) return {}
  const meta: PageMetadata = {}

  const getMetaContent = (nameOrProp: string): string | undefined => {
    const patterns = [
      new RegExp(`<meta[^>]+(?:name|property)=["']${nameOrProp}["'][^>]+content=["']([^"']+)["']`, 'i'),
      new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["']${nameOrProp}["']`, 'i'),
    ]
    for (const p of patterns) {
      const m = html.match(p)
      if (m) return m[1].trim()
    }
    return undefined
  }

  meta.author = getMetaContent('author') || getMetaContent('article:author') || getMetaContent('og:author')
  meta.publishedDate = getMetaContent('article:published_time') || getMetaContent('date') || getMetaContent('pubdate') || getMetaContent('publishdate') || getMetaContent('dc.date')
  meta.siteName = getMetaContent('og:site_name') || getMetaContent('application-name')
  meta.description = getMetaContent('og:description') || getMetaContent('description') || getMetaContent('twitter:description')
  meta.ogImage = getMetaContent('og:image') || getMetaContent('twitter:image')
  meta.language = getMetaContent('language') || getMetaContent('og:locale')

  const kw = getMetaContent('keywords') || getMetaContent('news_keywords')
  if (kw) {
    meta.keywords = kw.split(',').map(k => k.trim()).filter(Boolean).slice(0, 20)
  }

  // JSON-LD structured data
  const ldMatch = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i)
  if (ldMatch) {
    try {
      const ld = JSON.parse(ldMatch[1])
      const obj = Array.isArray(ld) ? ld[0] : ld
      if (!meta.author && obj.author) {
        meta.author = typeof obj.author === 'string' ? obj.author : obj.author?.name
      }
      if (!meta.publishedDate && obj.datePublished) {
        meta.publishedDate = obj.datePublished
      }
      if (!meta.siteName && obj.publisher?.name) {
        meta.siteName = obj.publisher.name
      }
    } catch { /* malformed JSON-LD */ }
  }

  // Clean empty values
  for (const key of Object.keys(meta) as (keyof PageMetadata)[]) {
    if (meta[key] === undefined || meta[key] === '') delete meta[key]
  }

  return meta
}

// ---------------------------------------------------------------------------
// Entity categories for UI grouping
// ---------------------------------------------------------------------------

export type EntityCategory = 'identity' | 'digital' | 'financial' | 'academic' | 'osint' | 'general' | 'metadata'

export interface EntitySection {
  key: keyof ExtractedEntities
  label: string
  icon: string
  category: EntityCategory
  categoryLabel: string
}

export const ENTITY_SECTIONS: EntitySection[] = [
  // Identity
  { key: 'persons',        label: 'People',              icon: 'user',         category: 'identity',  categoryLabel: 'People & Organizations' },
  { key: 'organizations',  label: 'Organizations',       icon: 'building',     category: 'identity',  categoryLabel: 'People & Organizations' },
  { key: 'locations',      label: 'Places',              icon: 'landmark',     category: 'identity',  categoryLabel: 'People & Organizations' },

  // Digital
  { key: 'emails',         label: 'Email Addresses',     icon: 'mail',         category: 'digital',   categoryLabel: 'Digital Identifiers' },
  { key: 'domains',        label: 'Domains',             icon: 'globe',        category: 'digital',   categoryLabel: 'Digital Identifiers' },
  { key: 'urls',           label: 'URLs',                icon: 'link',         category: 'digital',   categoryLabel: 'Digital Identifiers' },
  { key: 'ipAddresses',    label: 'IPv4 Addresses',      icon: 'server',       category: 'digital',   categoryLabel: 'Digital Identifiers' },
  { key: 'ipv6Addresses',  label: 'IPv6 Addresses',      icon: 'server',       category: 'digital',   categoryLabel: 'Digital Identifiers' },
  { key: 'macAddresses',   label: 'MAC Addresses',       icon: 'cpu',          category: 'digital',   categoryLabel: 'Digital Identifiers' },
  { key: 'phones',         label: 'Phone Numbers',       icon: 'phone',        category: 'digital',   categoryLabel: 'Digital Identifiers' },
  { key: 'socialHandles',  label: 'Social Handles',      icon: 'at-sign',      category: 'digital',   categoryLabel: 'Digital Identifiers' },

  // Financial
  { key: 'cryptoAddresses', label: 'Crypto Addresses',   icon: 'bitcoin',      category: 'financial', categoryLabel: 'Financial' },
  { key: 'monetaryAmounts', label: 'Monetary Amounts',   icon: 'dollar-sign',  category: 'financial', categoryLabel: 'Financial' },

  // Academic
  { key: 'dois',           label: 'DOIs',                icon: 'book-open',    category: 'academic',  categoryLabel: 'Academic & Research' },
  { key: 'isbns',          label: 'ISBNs',               icon: 'bookmark',     category: 'academic',  categoryLabel: 'Academic & Research' },

  // OSINT / Security
  { key: 'onionAddresses', label: 'Onion Addresses',     icon: 'shield',       category: 'osint',     categoryLabel: 'OSINT & Security' },
  { key: 'fileHashes',     label: 'File Hashes',         icon: 'fingerprint',  category: 'osint',     categoryLabel: 'OSINT & Security' },
  { key: 'cveIds',         label: 'CVE IDs',             icon: 'alert-triangle', category: 'osint',   categoryLabel: 'OSINT & Security' },

  // General
  { key: 'hashtags',       label: 'Hashtags',            icon: 'hash',         category: 'general',   categoryLabel: 'General' },
  { key: 'coordinates',    label: 'Coordinates',         icon: 'map-pin',      category: 'general',   categoryLabel: 'General' },
  { key: 'dates',          label: 'Dates',               icon: 'calendar',     category: 'general',   categoryLabel: 'General' },
]
