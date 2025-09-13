import { createClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Verify folder belongs to user
    const { data: existingFolder, error: fetchError } = await supabase
      .from('folders')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingFolder) {
      return NextResponse.json(
        { error: 'Folder not found' },
        { status: 404 }
      )
    }

    const { data, error } = await supabase
      .from('folders')
      .update({
        name: name.trim(),
        color: color || '#6B7280',
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Database update error:', error)
      return NextResponse.json(
        { error: 'Failed to update folder' },
        { status: 500 }
      )
    }

    return NextResponse.json({ folder: data })
  } catch (error) {
    console.error('Update folder error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const deleteClips = searchParams.get('deleteClips') === 'true'

    // Verify folder belongs to user
    const { data: existingFolder, error: fetchError } = await supabase
      .from('folders')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingFolder) {
      return NextResponse.json(
        { error: 'Folder not found' },
        { status: 404 }
      )
    }

    if (deleteClips) {
      // Delete all clips in the folder
      const { error: clipsError } = await supabase
        .from('clips')
        .delete()
        .eq('folder_id', params.id)
        .eq('user_id', user.id)

      if (clipsError) {
        console.error('Error deleting clips:', clipsError)
        return NextResponse.json(
          { error: 'Failed to delete clips' },
          { status: 500 }
        )
      }
    } else {
      // Move clips to no folder (set folder_id to null)
      const { error: updateError } = await supabase
        .from('clips')
        .update({ folder_id: null })
        .eq('folder_id', params.id)
        .eq('user_id', user.id)

      if (updateError) {
        console.error('Error updating clips:', updateError)
        return NextResponse.json(
          { error: 'Failed to update clips' },
          { status: 500 }
        )
      }
    }

    // Delete the folder
    const { error: deleteError } = await supabase
      .from('folders')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Error deleting folder:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete folder' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete folder error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
