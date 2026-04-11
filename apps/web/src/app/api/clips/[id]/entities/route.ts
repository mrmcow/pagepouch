import { createClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'
import { extractEntitiesServer } from '@/lib/entities/extractEntitiesServer'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: clip, error } = await supabase
      .from('clips')
      .select('id, text_content, title, url, html_content, entities')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (error || !clip) {
      return NextResponse.json({ error: 'Clip not found' }, { status: 404 })
    }

    if (clip.entities) {
      return NextResponse.json({ entities: clip.entities, source: 'stored' })
    }

    const text = [clip.text_content || '', clip.title || '', clip.url || ''].join('\n')
    const entities = await extractEntitiesServer(text, clip.url, clip.html_content || undefined)

    const { error: updateError } = await supabase
      .from('clips')
      .update({ entities })
      .eq('id', clip.id)

    if (updateError) {
      console.error('Failed to persist entities:', updateError)
    }

    return NextResponse.json({ entities, source: 'extracted' })
  } catch (error) {
    console.error('Entity extraction error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: clip, error } = await supabase
      .from('clips')
      .select('id, text_content, title, url, html_content')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (error || !clip) {
      return NextResponse.json({ error: 'Clip not found' }, { status: 404 })
    }

    const text = [clip.text_content || '', clip.title || '', clip.url || ''].join('\n')
    const entities = await extractEntitiesServer(text, clip.url, clip.html_content || undefined)

    const { error: updateError } = await supabase
      .from('clips')
      .update({ entities })
      .eq('id', clip.id)

    if (updateError) {
      console.error('Failed to persist entities:', updateError)
      return NextResponse.json({ error: 'Failed to save entities' }, { status: 500 })
    }

    return NextResponse.json({ entities, source: 'extracted' })
  } catch (error) {
    console.error('Entity re-extraction error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
