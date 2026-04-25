/**
 * Favicon URL for clip cards. Avoids Google's favicon service for localhost/private hosts
 * (which returns 404 on gstatic and clutters the console). Also strips/upgrades insecure
 * favicon URLs so the dashboard never triggers mixed-content warnings on HTTPS.
 */

function isPrivateOrLocalHost(hostname: string): boolean {
  const h = hostname.toLowerCase()
  return (
    !h ||
    h === 'localhost' ||
    h === '127.0.0.1' ||
    h === '0.0.0.0' ||
    h.endsWith('.local') ||
    h.startsWith('192.168.') ||
    h.startsWith('10.') ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(h)
  )
}

export function getClipFaviconSrc(clip: { url: string; favicon_url?: string | null }): string | null {
  const fav = clip.favicon_url?.trim()
  if (fav && /^https?:\/\//i.test(fav)) {
    try {
      const favUrl = new URL(fav)
      // Drop favicons hosted on localhost/private networks — they 404 in production
      // and trigger Mixed Content warnings when served as http:// from the dashboard.
      if (favUrl.protocol === 'http:' && isPrivateOrLocalHost(favUrl.hostname)) {
        // Fall through to the Google s2 fallback below using the clip's own hostname.
      } else if (favUrl.protocol === 'http:') {
        // Public http favicon — upgrade to https so the browser doesn't block it.
        favUrl.protocol = 'https:'
        return favUrl.toString()
      } else {
        return fav
      }
    } catch {
      // ignore — fall through to fallback
    }
  }

  let hostname = ''
  try {
    hostname = new URL(clip.url).hostname.toLowerCase()
  } catch {
    return null
  }

  if (isPrivateOrLocalHost(hostname)) {
    return null
  }

  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=32`
}
