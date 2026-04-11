import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase client not available' }, { status: 500 })
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Step 1: get clip IDs owned by this user
  const { data: clips, error: clipsError } = await supabase
    .from('clips')
    .select('id')
    .eq('user_id', user.id)

  if (clipsError) {
    console.error('Error fetching user clips:', clipsError)
    return NextResponse.json({ error: clipsError.message }, { status: 500 })
  }

  const clipIds = (clips || []).map((c: { id: string }) => c.id)
  if (clipIds.length === 0) {
    return NextResponse.json({})
  }

  // Step 2: get all clip_tags rows for those clips
  const { data, error } = await supabase
    .from('clip_tags')
    .select('clip_id, tag_id')
    .in('clip_id', clipIds)

  if (error) {
    console.error('Error fetching clip-tags:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const map: Record<string, string[]> = {}
  for (const row of data || []) {
    if (!map[row.clip_id]) map[row.clip_id] = []
    map[row.clip_id].push(row.tag_id)
  }

  return NextResponse.json(map)
}
