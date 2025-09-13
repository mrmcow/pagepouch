import { createClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data, error } = await supabase
      .from('folders')
      .select('id, name, color, created_at, updated_at')
      .eq('user_id', user.id)
      .order('name')

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch folders' },
        { status: 500 }
      )
    }

    return NextResponse.json({ folders: data || [] })
  } catch (error) {
    console.error('Get folders error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { name, color } = await request.json()

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Folder name is required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('folders')
      .insert({
        user_id: user.id,
        name: name.trim(),
        color: color || '#6B7280',
      })
      .select()
      .single()

    if (error) {
      console.error('Database insert error:', error)
      return NextResponse.json(
        { error: 'Failed to create folder' },
        { status: 500 }
      )
    }

    return NextResponse.json({ folder: data }, { status: 201 })
  } catch (error) {
    console.error('Create folder error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
