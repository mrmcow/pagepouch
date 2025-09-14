import { createClient } from '@/lib/supabase-server'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

  const { id } = params

  // Get tags for this clip
  const { data: clipTags, error } = await supabase
    .from('clip_tags')
    .select(`
      tag_id,
      tags (
        id,
        name,
        color
      )
    `)
    .eq('clip_id', id)

  if (error) {
    console.error('Error fetching clip tags:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const tags = clipTags.map(ct => ct.tags).filter(Boolean)
  return NextResponse.json(tags)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

  const { id } = params
  const { tagNames } = await request.json()

  if (!Array.isArray(tagNames)) {
    return NextResponse.json({ error: 'tagNames must be an array' }, { status: 400 })
  }

  // Verify clip ownership
  const { data: clip, error: clipError } = await supabase
    .from('clips')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (clipError || !clip) {
    return NextResponse.json({ error: 'Clip not found' }, { status: 404 })
  }

  // Start transaction-like operations
  try {
    // Remove existing tags for this clip
    await supabase
      .from('clip_tags')
      .delete()
      .eq('clip_id', id)

    if (tagNames.length === 0) {
      return NextResponse.json({ success: true })
    }

    // Create tags that don't exist and get all tag IDs
    const tagIds: string[] = []
    
    for (const tagName of tagNames) {
      if (!tagName || typeof tagName !== 'string') continue
      
      const trimmedName = tagName.trim()
      if (trimmedName.length === 0) continue

      // Try to get existing tag
      let { data: existingTag } = await supabase
        .from('tags')
        .select('id')
        .eq('user_id', user.id)
        .eq('name', trimmedName)
        .single()

      if (!existingTag) {
        // Create new tag
        const { data: newTag, error: tagError } = await supabase
          .from('tags')
          .insert({
            user_id: user.id,
            name: trimmedName,
          })
          .select('id')
          .single()

        if (tagError) {
          console.error('Error creating tag:', tagError)
          continue
        }
        existingTag = newTag
      }

      if (existingTag) {
        tagIds.push(existingTag.id)
      }
    }

    // Create clip-tag relationships
    if (tagIds.length > 0) {
      const clipTagInserts = tagIds.map(tagId => ({
        clip_id: id,
        tag_id: tagId,
      }))

      const { error: insertError } = await supabase
        .from('clip_tags')
        .insert(clipTagInserts)

      if (insertError) {
        console.error('Error creating clip-tag relationships:', insertError)
        return NextResponse.json({ error: insertError.message }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating clip tags:', error)
    return NextResponse.json({ error: 'Failed to update tags' }, { status: 500 })
  }
}
