/**
 * Export utilities for generating various file formats from clips
 * Supports: Citations (APA/MLA/Chicago), Markdown, CSV, JSON
 */

import { Clip, Folder } from '@pagestash/shared'

// Export format types
export type ExportFormat = 
  | 'markdown'
  | 'csv'
  | 'json'
  | 'bibliography_apa'
  | 'bibliography_mla'
  | 'bibliography_chicago'
  | 'html'

export interface ExportOptions {
  includeScreenshots?: boolean
  includeNotes?: boolean
  includeMetadata?: boolean
  sortBy?: 'date' | 'title' | 'alphabetical'
  groupBy?: 'none' | 'folder' | 'date'
}

// Citation metadata extraction
interface CitationMetadata {
  author: string
  year: number
  title: string
  url: string
  accessDate: string
  siteName: string
  publishedDate?: string
}

function extractCitationMetadata(clip: Clip): CitationMetadata {
  const url = new URL(clip.url)
  const capturedDate = new Date(clip.created_at)
  
  return {
    author: extractAuthor(clip) || 'Author Unknown',
    year: capturedDate.getFullYear(),
    title: clip.title || url.pathname,
    url: clip.url,
    accessDate: formatAccessDate(capturedDate),
    siteName: url.hostname.replace('www.', ''),
    publishedDate: formatDate(capturedDate)
  }
}

function extractAuthor(clip: Clip): string | null {
  // Try to extract author from title or URL
  // Format: "Article Title - Author Name" or "Article Title | Author Name"
  if (clip.title.includes(' - ')) {
    const parts = clip.title.split(' - ')
    if (parts.length > 1) {
      return parts[parts.length - 1].trim()
    }
  }
  if (clip.title.includes(' | ')) {
    const parts = clip.title.split(' | ')
    if (parts.length > 1) {
      return parts[parts.length - 1].trim()
    }
  }
  return null
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function formatAccessDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// APA Format: Author, A. A. (Year). Title. Site Name. URL
function formatAPA(metadata: CitationMetadata): string {
  return `${metadata.author} (${metadata.year}). ${metadata.title}. ${metadata.siteName}. ${metadata.url}`
}

// MLA Format: Author. "Title." Site Name, Date, URL.
function formatMLA(metadata: CitationMetadata): string {
  return `${metadata.author}. "${metadata.title}." ${metadata.siteName}, ${metadata.publishedDate}, ${metadata.url}.`
}

// Chicago Format: Author. "Title." Site Name. Date. URL.
function formatChicago(metadata: CitationMetadata): string {
  return `${metadata.author}. "${metadata.title}." ${metadata.siteName}. ${metadata.publishedDate}. ${metadata.url}.`
}

// Sort clips based on options
function sortClips(clips: Clip[], sortBy: ExportOptions['sortBy']): Clip[] {
  const sorted = [...clips]
  
  switch (sortBy) {
    case 'alphabetical':
      return sorted.sort((a, b) => a.title.localeCompare(b.title))
    case 'title':
      return sorted.sort((a, b) => a.title.localeCompare(b.title))
    case 'date':
      return sorted.sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
    default:
      return sorted
  }
}

// ============================================================================
// EXPORT FORMAT GENERATORS
// ============================================================================

/**
 * Export clips as Bibliography (APA/MLA/Chicago)
 */
export function exportBibliography(
  clips: Clip[], 
  style: 'apa' | 'mla' | 'chicago',
  options: ExportOptions = {}
): string {
  const sortedClips = sortClips(clips, 'alphabetical')
  
  const citations = sortedClips.map(clip => {
    const metadata = extractCitationMetadata(clip)
    
    switch (style) {
      case 'apa':
        return formatAPA(metadata)
      case 'mla':
        return formatMLA(metadata)
      case 'chicago':
        return formatChicago(metadata)
    }
  })
  
  const styleName = style.toUpperCase()
  let output = `# References (${styleName} Format)\n\n`
  output += `Generated from PageStash on ${formatDate(new Date())}\n`
  output += `Total sources: ${clips.length}\n\n`
  output += `---\n\n`
  output += citations.join('\n\n')
  
  return output
}

/**
 * Export clips as Markdown with optional backlinks
 */
export function exportMarkdown(
  clips: Clip[], 
  folders: Folder[] = [],
  options: ExportOptions = {}
): string {
  const sortedClips = sortClips(clips, options.sortBy || 'date')
  
  let output = `# PageStash Export\n\n`
  output += `Exported on ${formatDate(new Date())}\n`
  output += `Total clips: ${clips.length}\n\n`
  output += `---\n\n`
  
  sortedClips.forEach((clip, index) => {
    const folder = folders.find(f => f.id === clip.folder_id)
    
    output += `## ${index + 1}. ${clip.title}\n\n`
    
    // Metadata section
    if (options.includeMetadata !== false) {
      output += `**URL:** ${clip.url}\n`
      output += `**Captured:** ${formatDate(new Date(clip.created_at))}\n`
      if (folder) {
        output += `**Folder:** ${folder.name}\n`
      }
      if (clip.is_favorite) {
        output += `**Favorite:** ⭐\n`
      }
      output += `\n`
    }
    
    // Screenshot reference
    if (options.includeScreenshots !== false && clip.screenshot_url) {
      output += `![Screenshot](${clip.screenshot_url})\n\n`
    }
    
    // Notes
    if (options.includeNotes !== false && clip.notes) {
      output += `### Notes\n\n`
      output += `${clip.notes}\n\n`
    }
    
    // Text content preview
    if (clip.text_content) {
      const preview = clip.text_content.substring(0, 500)
      output += `### Content Preview\n\n`
      output += `${preview}${clip.text_content.length > 500 ? '...' : ''}\n\n`
    }
    
    output += `---\n\n`
  })
  
  return output
}

/**
 * Export clips as CSV
 */
export function exportCSV(
  clips: Clip[],
  folders: Folder[] = [],
  options: ExportOptions = {}
): string {
  const sortedClips = sortClips(clips, options.sortBy || 'date')
  
  // CSV Header
  let csv = 'Title,URL,Captured Date,Folder,Is Favorite,Notes,Screenshot URL\n'
  
  sortedClips.forEach(clip => {
    const folder = folders.find(f => f.id === clip.folder_id)
    const folderName = folder ? folder.name : ''
    
    // Escape quotes and commas
    const escapeCSV = (value: string) => {
      if (!value) return ''
      const escaped = value.replace(/"/g, '""')
      return `"${escaped}"`
    }
    
    csv += [
      escapeCSV(clip.title),
      escapeCSV(clip.url),
      formatDate(new Date(clip.created_at)),
      escapeCSV(folderName),
      clip.is_favorite ? 'Yes' : 'No',
      escapeCSV(clip.notes || ''),
      escapeCSV(clip.screenshot_url || '')
    ].join(',') + '\n'
  })
  
  return csv
}

/**
 * Export clips as JSON
 */
export function exportJSON(
  clips: Clip[],
  folders: Folder[] = [],
  options: ExportOptions = {}
): string {
  const sortedClips = sortClips(clips, options.sortBy || 'date')
  
  const exportData = {
    exported_at: new Date().toISOString(),
    exported_from: 'PageStash',
    total_clips: clips.length,
    clips: sortedClips.map(clip => {
      const folder = folders.find(f => f.id === clip.folder_id)
      
      return {
        id: clip.id,
        title: clip.title,
        url: clip.url,
        captured_at: clip.created_at,
        folder: folder ? folder.name : null,
        is_favorite: clip.is_favorite,
        notes: clip.notes || null,
        screenshot_url: clip.screenshot_url || null,
        text_content: options.includeMetadata ? clip.text_content : null,
      }
    })
  }
  
  return JSON.stringify(exportData, null, 2)
}

/**
 * Export clips as HTML
 */
export function exportHTML(
  clips: Clip[],
  folders: Folder[] = [],
  options: ExportOptions = {}
): string {
  const sortedClips = sortClips(clips, options.sortBy || 'date')
  
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PageStash Export - ${new Date().toLocaleDateString()}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      max-width: 900px;
      margin: 40px auto;
      padding: 20px;
      line-height: 1.6;
      color: #333;
    }
    h1 {
      color: #2563eb;
      border-bottom: 3px solid #2563eb;
      padding-bottom: 10px;
    }
    h2 {
      color: #1e40af;
      margin-top: 40px;
    }
    .clip {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
      background: #f9fafb;
    }
    .clip-title {
      font-size: 1.5em;
      font-weight: bold;
      margin-bottom: 10px;
      color: #1f2937;
    }
    .clip-meta {
      color: #6b7280;
      font-size: 0.9em;
      margin-bottom: 15px;
    }
    .clip-notes {
      background: white;
      padding: 15px;
      border-left: 4px solid #2563eb;
      margin: 15px 0;
    }
    .clip-screenshot {
      max-width: 100%;
      border-radius: 4px;
      margin: 15px 0;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .favorite {
      color: #f59e0b;
    }
    a {
      color: #2563eb;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <h1>PageStash Export</h1>
  <p>Exported on ${formatDate(new Date())}</p>
  <p>Total clips: ${clips.length}</p>
  <hr>
`
  
  sortedClips.forEach((clip, index) => {
    const folder = folders.find(f => f.id === clip.folder_id)
    
    html += `
  <div class="clip">
    <div class="clip-title">
      ${index + 1}. ${escapeHTML(clip.title)}
      ${clip.is_favorite ? '<span class="favorite">⭐</span>' : ''}
    </div>
    <div class="clip-meta">
      <strong>URL:</strong> <a href="${clip.url}" target="_blank">${escapeHTML(clip.url)}</a><br>
      <strong>Captured:</strong> ${formatDate(new Date(clip.created_at))}<br>
      ${folder ? `<strong>Folder:</strong> ${escapeHTML(folder.name)}<br>` : ''}
    </div>
`
    
    if (clip.screenshot_url) {
      html += `    <img src="${clip.screenshot_url}" alt="Screenshot" class="clip-screenshot">\n`
    }
    
    if (clip.notes) {
      html += `
    <div class="clip-notes">
      <strong>Notes:</strong><br>
      ${escapeHTML(clip.notes).replace(/\n/g, '<br>')}
    </div>
`
    }
    
    html += `  </div>\n`
  })
  
  html += `
</body>
</html>`
  
  return html
}

function escapeHTML(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

// ============================================================================
// MAIN EXPORT FUNCTION
// ============================================================================

/**
 * Main export function - generates file for download
 */
export async function exportClips(
  clips: Clip[],
  format: ExportFormat,
  folders: Folder[] = [],
  options: ExportOptions = {}
): Promise<{ content: string; filename: string; mimeType: string }> {
  let content: string
  let filename: string
  let mimeType: string
  
  const timestamp = new Date().toISOString().split('T')[0]
  
  switch (format) {
    case 'bibliography_apa':
      content = exportBibliography(clips, 'apa', options)
      filename = `pagestash-bibliography-apa-${timestamp}.txt`
      mimeType = 'text/plain'
      break
      
    case 'bibliography_mla':
      content = exportBibliography(clips, 'mla', options)
      filename = `pagestash-bibliography-mla-${timestamp}.txt`
      mimeType = 'text/plain'
      break
      
    case 'bibliography_chicago':
      content = exportBibliography(clips, 'chicago', options)
      filename = `pagestash-bibliography-chicago-${timestamp}.txt`
      mimeType = 'text/plain'
      break
      
    case 'markdown':
      content = exportMarkdown(clips, folders, options)
      filename = `pagestash-export-${timestamp}.md`
      mimeType = 'text/markdown'
      break
      
    case 'csv':
      content = exportCSV(clips, folders, options)
      filename = `pagestash-export-${timestamp}.csv`
      mimeType = 'text/csv'
      break
      
    case 'json':
      content = exportJSON(clips, folders, options)
      filename = `pagestash-export-${timestamp}.json`
      mimeType = 'application/json'
      break
      
    case 'html':
      content = exportHTML(clips, folders, options)
      filename = `pagestash-export-${timestamp}.html`
      mimeType = 'text/html'
      break
      
    default:
      throw new Error(`Unsupported export format: ${format}`)
  }
  
  return { content, filename, mimeType }
}

/**
 * Trigger file download in browser
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

