/**
 * Export utilities for generating various file formats from clips
 * Supports: Citations (APA/MLA/Chicago), Markdown, CSV, JSON, HTML
 */

import { Clip, Folder } from '@pagestash/shared'
import { extractEntities, entityCount, ENTITY_SECTIONS, type ExtractedEntities } from '@/utils/entityExtractor'

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
  includeEntities?: boolean
  includeFullContent?: boolean
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
  
  // Prefer metadata author if available
  const entities = getClipEntities(clip)
  const metaAuthor = entities?.metadata?.author

  return {
    author: metaAuthor || extractAuthor(clip) || 'Author Unknown',
    year: capturedDate.getFullYear(),
    title: clip.title || url.pathname,
    url: clip.url,
    accessDate: formatAccessDate(capturedDate),
    siteName: entities?.metadata?.siteName || url.hostname.replace('www.', ''),
    publishedDate: entities?.metadata?.publishedDate || formatDate(capturedDate)
  }
}

function extractAuthor(clip: Clip): string | null {
  if (clip.title.includes(' - ')) {
    const parts = clip.title.split(' - ')
    if (parts.length > 1) return parts[parts.length - 1].trim()
  }
  if (clip.title.includes(' | ')) {
    const parts = clip.title.split(' | ')
    if (parts.length > 1) return parts[parts.length - 1].trim()
  }
  return null
}

function getClipEntities(clip: Clip): ExtractedEntities | null {
  const stored = (clip as any).entities as ExtractedEntities | null
  if (stored && entityCount(stored) > 0) return stored

  const text = [clip.text_content || '', clip.title || '', clip.url || ''].join('\n')
  if (!text.trim()) return null
  return extractEntities(text, clip.url)
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

// APA Format
function formatAPA(metadata: CitationMetadata): string {
  return `${metadata.author} (${metadata.year}). ${metadata.title}. ${metadata.siteName}. ${metadata.url}`
}

// MLA Format
function formatMLA(metadata: CitationMetadata): string {
  return `${metadata.author}. "${metadata.title}." ${metadata.siteName}, ${metadata.publishedDate}, ${metadata.url}.`
}

// Chicago Format
function formatChicago(metadata: CitationMetadata): string {
  return `${metadata.author}. "${metadata.title}." ${metadata.siteName}. ${metadata.publishedDate}. ${metadata.url}.`
}

function sortClips(clips: Clip[], sortBy: ExportOptions['sortBy']): Clip[] {
  const sorted = [...clips]
  switch (sortBy) {
    case 'alphabetical':
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

function formatEntitiesText(entities: ExtractedEntities): string {
  const lines: string[] = []
  
  for (const section of ENTITY_SECTIONS) {
    const items = entities[section.key as keyof ExtractedEntities]
    if (!Array.isArray(items) || items.length === 0) continue
    lines.push(`  ${section.label}: ${items.join(', ')}`)
  }

  const meta = entities.metadata
  if (meta) {
    const metaParts: string[] = []
    if (meta.author) metaParts.push(`Author: ${meta.author}`)
    if (meta.siteName) metaParts.push(`Site: ${meta.siteName}`)
    if (meta.publishedDate) metaParts.push(`Published: ${meta.publishedDate}`)
    if (meta.language) metaParts.push(`Language: ${meta.language}`)
    if (metaParts.length > 0) lines.push(`  Page Metadata: ${metaParts.join(' | ')}`)
    if (meta.keywords?.length) lines.push(`  Keywords: ${meta.keywords.join(', ')}`)
  }

  return lines.join('\n')
}

// ============================================================================
// EXPORT FORMAT GENERATORS
// ============================================================================

export function exportBibliography(
  clips: Clip[], 
  style: 'apa' | 'mla' | 'chicago',
  options: ExportOptions = {}
): string {
  const sortedClips = sortClips(clips, 'alphabetical')
  
  const citations = sortedClips.map(clip => {
    const metadata = extractCitationMetadata(clip)
    switch (style) {
      case 'apa': return formatAPA(metadata)
      case 'mla': return formatMLA(metadata)
      case 'chicago': return formatChicago(metadata)
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
    
    if (options.includeMetadata !== false) {
      output += `**URL:** ${clip.url}\n`
      output += `**Captured:** ${formatDate(new Date(clip.created_at))}\n`
      if (folder) output += `**Folder:** ${folder.name}\n`
      if (clip.is_favorite) output += `**Favorite:** ⭐\n`
      output += `\n`
    }
    
    if (options.includeScreenshots !== false && clip.screenshot_url) {
      output += `![Screenshot](${clip.screenshot_url})\n\n`
    }
    
    if (options.includeNotes !== false && clip.notes) {
      output += `### Notes\n\n${clip.notes}\n\n`
    }
    
    if (options.includeFullContent && clip.text_content) {
      output += `### Full Content\n\n${clip.text_content}\n\n`
    } else if (clip.text_content) {
      const preview = clip.text_content.substring(0, 500)
      output += `### Content Preview\n\n${preview}${clip.text_content.length > 500 ? '...' : ''}\n\n`
    }

    if (options.includeEntities) {
      const entities = getClipEntities(clip)
      if (entities && entityCount(entities) > 0) {
        output += `### Extracted Entities\n\n`
        output += formatEntitiesText(entities) + '\n\n'
      }
    }
    
    output += `---\n\n`
  })
  
  return output
}

export function exportCSV(
  clips: Clip[],
  folders: Folder[] = [],
  options: ExportOptions = {}
): string {
  const sortedClips = sortClips(clips, options.sortBy || 'date')
  
  const escapeCSV = (value: string) => {
    if (!value) return ''
    const escaped = value.replace(/"/g, '""')
    return `"${escaped}"`
  }

  // Build dynamic header
  const headers = [
    'Title', 'URL', 'Captured Date', 'Folder', 'Is Favorite',
    'Notes', 'Screenshot URL',
  ]
  if (options.includeFullContent) headers.push('Text Content')
  if (options.includeEntities) {
    headers.push(
      'People', 'Organizations', 'Emails', 'Domains', 'IP Addresses',
      'Phone Numbers', 'Social Handles', 'Crypto Addresses',
      'Monetary Amounts', 'DOIs', 'ISBNs', 'Onion Addresses',
      'File Hashes', 'CVE IDs', 'Hashtags', 'Coordinates', 'Dates',
      'Meta Author', 'Meta Site', 'Meta Published', 'Meta Keywords'
    )
  }

  let csv = headers.join(',') + '\n'
  
  sortedClips.forEach(clip => {
    const folder = folders.find(f => f.id === clip.folder_id)
    const folderName = folder ? folder.name : ''
    
    const row = [
      escapeCSV(clip.title),
      escapeCSV(clip.url),
      formatDate(new Date(clip.created_at)),
      escapeCSV(folderName),
      clip.is_favorite ? 'Yes' : 'No',
      escapeCSV(clip.notes || ''),
      escapeCSV(clip.screenshot_url || ''),
    ]

    if (options.includeFullContent) {
      row.push(escapeCSV(clip.text_content || ''))
    }

    if (options.includeEntities) {
      const entities = getClipEntities(clip)
      if (entities) {
        row.push(
          escapeCSV(entities.persons.join('; ')),
          escapeCSV(entities.organizations.join('; ')),
          escapeCSV(entities.emails.join('; ')),
          escapeCSV(entities.domains.join('; ')),
          escapeCSV(entities.ipAddresses.join('; ')),
          escapeCSV(entities.phones.join('; ')),
          escapeCSV(entities.socialHandles.join('; ')),
          escapeCSV(entities.cryptoAddresses.join('; ')),
          escapeCSV(entities.monetaryAmounts.join('; ')),
          escapeCSV(entities.dois.join('; ')),
          escapeCSV(entities.isbns.join('; ')),
          escapeCSV(entities.onionAddresses.join('; ')),
          escapeCSV(entities.fileHashes.join('; ')),
          escapeCSV(entities.cveIds.join('; ')),
          escapeCSV(entities.hashtags.join('; ')),
          escapeCSV(entities.coordinates.join('; ')),
          escapeCSV(entities.dates.join('; ')),
          escapeCSV(entities.metadata?.author || ''),
          escapeCSV(entities.metadata?.siteName || ''),
          escapeCSV(entities.metadata?.publishedDate || ''),
          escapeCSV((entities.metadata?.keywords || []).join('; ')),
        )
      } else {
        row.push(...Array(21).fill(''))
      }
    }

    csv += row.join(',') + '\n'
  })
  
  return csv
}

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
      
      const clipData: Record<string, any> = {
        id: clip.id,
        title: clip.title,
        url: clip.url,
        captured_at: clip.created_at,
        folder: folder ? folder.name : null,
        is_favorite: clip.is_favorite,
        notes: clip.notes || null,
        screenshot_url: clip.screenshot_url || null,
      }

      if (options.includeFullContent) {
        clipData.text_content = clip.text_content || null
      }

      if (options.includeEntities) {
        const entities = getClipEntities(clip)
        if (entities) {
          const { metadata, ...entityFields } = entities
          clipData.entities = entityFields
          if (Object.keys(metadata || {}).length > 0) {
            clipData.page_metadata = metadata
          }
        }
      }

      return clipData
    })
  }
  
  return JSON.stringify(exportData, null, 2)
}

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
      background: #fafafa;
    }
    h1 { color: #2563eb; border-bottom: 3px solid #2563eb; padding-bottom: 10px; }
    h2 { color: #1e40af; margin-top: 40px; }
    .clip {
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 24px;
      margin: 20px 0;
      background: #fff;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    }
    .clip-title { font-size: 1.4em; font-weight: bold; margin-bottom: 10px; color: #1f2937; }
    .clip-meta { color: #6b7280; font-size: 0.9em; margin-bottom: 15px; }
    .clip-notes { background: #f0f4ff; padding: 15px; border-left: 4px solid #2563eb; margin: 15px 0; border-radius: 0 8px 8px 0; }
    .clip-screenshot { max-width: 100%; border-radius: 8px; margin: 15px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .clip-content { background: #f9fafb; padding: 16px; border-radius: 8px; margin: 15px 0; font-size: 0.9em; line-height: 1.7; white-space: pre-wrap; word-break: break-word; }
    .entities { margin: 15px 0; }
    .entity-category { margin: 10px 0; padding: 12px; background: #f0f4ff; border-radius: 8px; }
    .entity-category h4 { margin: 0 0 8px; font-size: 0.8em; text-transform: uppercase; letter-spacing: 0.5px; color: #4f46e5; }
    .entity-item { display: inline-block; background: #e0e7ff; color: #3730a3; padding: 2px 10px; border-radius: 6px; margin: 2px 4px 2px 0; font-size: 0.85em; font-family: 'SF Mono', Monaco, monospace; }
    .metadata-block { background: #ecfdf5; padding: 12px 16px; border-radius: 8px; margin: 10px 0; font-size: 0.85em; }
    .metadata-block span { color: #047857; }
    .favorite { color: #f59e0b; }
    a { color: #2563eb; text-decoration: none; }
    a:hover { text-decoration: underline; }
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
    
    if (options.includeScreenshots !== false && clip.screenshot_url) {
      html += `    <img src="${clip.screenshot_url}" alt="Screenshot" class="clip-screenshot">\n`
    }
    
    if (options.includeNotes !== false && clip.notes) {
      html += `
    <div class="clip-notes">
      <strong>Notes:</strong><br>
      ${escapeHTML(clip.notes).replace(/\n/g, '<br>')}
    </div>
`
    }

    if (options.includeFullContent && clip.text_content) {
      html += `    <div class="clip-content">${escapeHTML(clip.text_content)}</div>\n`
    }

    if (options.includeEntities) {
      const entities = getClipEntities(clip)
      if (entities && entityCount(entities) > 0) {
        html += `    <div class="entities">\n`

        const meta = entities.metadata
        if (meta && Object.keys(meta).some(k => meta[k as keyof typeof meta])) {
          html += `      <div class="metadata-block">\n`
          if (meta.author) html += `        <span>Author:</span> ${escapeHTML(meta.author)} &nbsp;`
          if (meta.siteName) html += `        <span>Site:</span> ${escapeHTML(meta.siteName)} &nbsp;`
          if (meta.publishedDate) html += `        <span>Published:</span> ${escapeHTML(meta.publishedDate)}`
          html += `\n      </div>\n`
        }

        for (const section of ENTITY_SECTIONS) {
          const items = entities[section.key as keyof ExtractedEntities]
          if (!Array.isArray(items) || items.length === 0) continue
          html += `      <div class="entity-category">\n`
          html += `        <h4>${escapeHTML(section.label)}</h4>\n`
          html += `        ${items.map(item => `<span class="entity-item">${escapeHTML(item)}</span>`).join('')}\n`
          html += `      </div>\n`
        }

        html += `    </div>\n`
      }
    }
    
    html += `  </div>\n`
  })
  
  html += `
</body>
</html>`
  
  return html
}

function escapeHTML(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// ============================================================================
// MAIN EXPORT FUNCTION
// ============================================================================

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
