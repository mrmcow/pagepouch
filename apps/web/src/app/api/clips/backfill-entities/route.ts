import { createClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'
import { extractEntitiesServer } from '@/lib/entities/extractEntitiesServer'

const DEFAULT_LIMIT = 100

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sp = request.nextUrl.searchParams
    const force =
      sp.get('force') === '1' ||
      sp.get('force') === 'true' ||
      sp.get('all') === '1' ||
      sp.get('all') === 'true'
    const offset = Math.max(0, parseInt(sp.get('offset') || '0', 10) || 0)
    const limit = Math.min(
      100,
      Math.max(1, parseInt(sp.get('limit') || String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT)
    )

    let query = supabase
      .from('clips')
      .select('id, text_content, title, url, html_content')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    if (force) {
      query = query.range(offset, offset + limit - 1)
    } else {
      query = query.is('entities', null).limit(limit)
    }

    const { data: clips, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    let updated = 0
    for (const clip of clips || []) {
      const text = [clip.text_content || '', clip.title || '', clip.url || ''].join('\n')
      const entities = await extractEntitiesServer(text, clip.url, clip.html_content || undefined)

      const { error: updateError } = await supabase
        .from('clips')
        .update({ entities })
        .eq('id', clip.id)

      if (!updateError) updated++
    }

    const batchLen = (clips || []).length
    const nextOffset = force && batchLen === limit ? offset + limit : null

    return NextResponse.json({
      total: batchLen,
      updated,
      force,
      offset: force ? offset : undefined,
      nextOffset,
      message: force
        ? `Re-extracted entities for ${updated} clip(s)${nextOffset != null ? ` (next offset=${nextOffset})` : ''}`
        : `Extracted entities for ${updated} clips`,
    })
  } catch (error) {
    console.error('Backfill error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
