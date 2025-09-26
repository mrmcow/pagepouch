import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get clips with folder information
    const { data: clips, error: clipsError } = await supabase
      .from('clips')
      .select(`
        id,
        title,
        folder_id,
        created_at
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (clipsError) {
      console.error('Error fetching clips:', clipsError)
      return NextResponse.json({ error: 'Failed to fetch clips' }, { status: 500 })
    }

    // Get folders
    const { data: folders, error: foldersError } = await supabase
      .from('folders')
      .select('id, name, color')
      .eq('user_id', user.id)

    if (foldersError) {
      console.error('Error fetching folders:', foldersError)
      return NextResponse.json({ error: 'Failed to fetch folders' }, { status: 500 })
    }

    // Count clips per folder
    const folderCounts = {}
    for (const folder of folders || []) {
      const { count, error } = await supabase
        .from('clips')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('folder_id', folder.id)
      
      if (!error) {
        folderCounts[folder.id] = count
      }
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email
      },
      clips: clips || [],
      folders: folders || [],
      folderCounts,
      totalClips: clips?.length || 0
    })

  } catch (error) {
    console.error('Debug clips error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
