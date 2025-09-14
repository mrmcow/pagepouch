import { createClient } from '@/lib/supabase-server'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
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

  const { data: tags, error } = await supabase
    .from('tags')
    .select('*')
    .eq('user_id', user.id)
    .order('name')

  if (error) {
    console.error('Error fetching tags:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(tags)
}

export async function POST(request: NextRequest) {
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

  const { name, color } = await request.json()

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return NextResponse.json({ error: 'Tag name is required' }, { status: 400 })
  }

  const { data: tag, error } = await supabase
    .from('tags')
    .insert({
      user_id: user.id,
      name: name.trim(),
      color: color || null,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') { // Unique constraint violation
      return NextResponse.json({ error: 'Tag already exists' }, { status: 409 })
    }
    console.error('Error creating tag:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(tag)
}
