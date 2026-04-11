/**
 * Favicon URL for clip cards. Avoids Google's favicon service for localhost/private hosts
 * (which returns 404 on gstatic and clutters the console).
 */
export function getClipFaviconSrc(clip: { url: string; favicon_url?: string | null }): string | null {
  const fav = clip.favicon_url?.trim()
  if (fav && /^https?:\/\//i.test(fav)) {
    return fav
  }

  let hostname = ''
  try {
    hostname = new URL(clip.url).hostname.toLowerCase()
  } catch {
    return null
  }

  if (
    !hostname ||
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0' ||
    hostname.endsWith('.local') ||
    hostname.startsWith('192.168.') ||
    hostname.startsWith('10.') ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)
  ) {
    return null
  }

  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=32`
}
