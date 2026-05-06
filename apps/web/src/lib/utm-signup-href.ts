/**
 * Builds `/auth/signup` query string for paid landers: defaults for Reddit OSINT
 * test can be overridden by incoming `utm_*` from the request (e.g. ad platform).
 */
const LP_DEFAULT_UTM: Record<string, string> = {
  utm_source: 'reddit',
  utm_medium: 'paid_social',
  utm_campaign: 'research_osint_test',
  utm_content: 'AG1AD3B_lp',
}

export function buildSignupSearchParams(
  incoming: Record<string, string | string[] | undefined>,
  defaultOverrides?: Record<string, string>,
): string {
  const merged: Record<string, string> = { ...LP_DEFAULT_UTM, ...defaultOverrides }
  for (const [key, value] of Object.entries(incoming)) {
    if (!key.startsWith('utm_')) continue
    if (value === undefined) continue
    const v = Array.isArray(value) ? value[0] : value
    if (v) merged[key] = v
  }
  return new URLSearchParams(merged).toString()
}
