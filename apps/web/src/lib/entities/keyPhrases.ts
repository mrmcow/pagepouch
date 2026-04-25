/**
 * Lightweight key-phrase mining (frequency + bigrams) — no ML, English-biased.
 */
const EXTRA_STOP = new Set(
  `the and for are but not you all can her was one our out has his how its may new now old see way who get use any has had
   were been from they them their this that with have will would could should about into than then also just more most some
   such only over such well back after before here when where while which being each other both many very what your
   page home site menu link click read next last first view sign news video audio world breaking inbox folder folders
   tags tag favorites recent dashboard library copy export delete edit save new clip clips`.split(/\s+/)
)

function tokenize(corpus: string): string[] {
  const m = corpus.toLowerCase().match(/[a-z][a-z'-]{2,}/g)
  return m || []
}

/**
 * Many UI captures (dashboards, listings) produce nonsense bigrams where one
 * token is a long fused run from adjacent DOM text (e.g. "Capturenfl",
 * "Sportbbc", "Comoct"). Reject phrases where any token mixes >=3 vowels
 * with no internal break and contains a sub-string that looks like two
 * concatenated words. Conservative: only triggers on very long single tokens.
 */
function isFusedToken(word: string): boolean {
  if (word.length < 9) return false
  // Three or more consonant-clusters back-to-back signals jammed words.
  const consonantRuns = word.match(/[bcdfghjklmnpqrstvwxyz]{4,}/gi)
  if (consonantRuns && consonantRuns.length >= 1) return true
  // Vowel-then-consonant-then-vowel pattern repeated 4+ times ⇒ likely two words.
  return word.length >= 12 && /[aeiou]/.test(word) && /[^aeiou]/.test(word)
    ? word.length >= 14
    : false
}

export function extractKeyPhrases(corpus: string, limit = 22): string[] {
  const raw = tokenize(corpus)
  const words = raw.filter((w) => w.length >= 4 && !EXTRA_STOP.has(w) && !isFusedToken(w))
  if (words.length < 12) return []

  const uni = new Map<string, number>()
  for (const w of words) uni.set(w, (uni.get(w) || 0) + 1)

  const bi = new Map<string, number>()
  for (let i = 0; i < words.length - 1; i++) {
    const a = words[i]
    const b = words[i + 1]
    if (a === b || EXTRA_STOP.has(b)) continue
    if (isFusedToken(a) || isFusedToken(b)) continue
    const key = `${a} ${b}`
    bi.set(key, (bi.get(key) || 0) + 1)
  }

  type Scored = { phrase: string; score: number; isBigram: boolean }
  const scored: Scored[] = []
  for (const [phrase, c] of bi) {
    if (c >= 2) scored.push({ phrase, score: c * 4, isBigram: true })
  }
  for (const [w, c] of uni) {
    if (c >= 4) scored.push({ phrase: w, score: c, isBigram: false })
  }

  scored.sort((a, b) => b.score - a.score)

  const out: string[] = []
  const seen = new Set<string>()
  for (const { phrase, isBigram } of scored) {
    const low = phrase.toLowerCase()
    if (seen.has(low)) continue
    seen.add(low)
    const pretty = isBigram
      ? phrase.replace(/\b\w/g, (c) => c.toUpperCase())
      : phrase.charAt(0).toUpperCase() + phrase.slice(1)
    out.push(pretty)
    if (out.length >= limit) break
  }
  return out
}
