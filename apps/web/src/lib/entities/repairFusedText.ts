/**
 * Heal concatenated DOM text (e.g. "Video & AudioBritish Broadcasting...") for NLP / regex.
 * Inserts spaces at lowercase/digit → capitalised-word boundaries (iterative).
 */
export function repairFusedProse(text: string): string {
  if (!text || text.length < 12) return text
  let s = text.replace(/\r\n/g, '\n')
  for (let n = 0; n < 10; n++) {
    const next = s.replace(/([a-z0-9%&\)])([A-Z][a-z]{2,})/g, '$1 $2')
    if (next === s) break
    s = next
  }
  return s.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim()
}

/** Long DOM titles often fuse words; short titles left untouched (avoids breaking product names). */
export function sanitizeClipTitle(title: string, maxLen = 300): string {
  const t = title.trim()
  if (!t) return t
  if (t.length < 48) return t.slice(0, maxLen)
  return repairFusedProse(t).slice(0, maxLen).trim()
}
