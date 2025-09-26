import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    // Check for Bearer token (from extension) or use cookies (from web app)
    const authHeader = request.headers.get('authorization')
    let supabase
    let user
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // Extension authentication with Bearer token
      const token = authHeader.substring(7)
      console.log('Using Bearer token authentication for extension')
      
      // Create a client with the Bearer token
      supabase = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        }
      )
      
      // Verify the token and get user
      const { data: userData, error: authError } = await supabase.auth.getUser()
      
      if (authError || !userData.user) {
        console.error('Bearer token auth error:', authError)
        return NextResponse.json(
          { error: 'Invalid or expired token' },
          { status: 401 }
        )
      }
      
      user = userData.user
    } else {
      // Web app authentication with cookies
      console.log('Using cookie authentication for web app')
      supabase = createClient()
      
      const { data: userData, error: authError } = await supabase.auth.getUser()
      
      if (authError || !userData.user) {
        console.error('Cookie auth error:', authError)
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
      
      user = userData.user
    }

    // Fetch knowledge graphs for the user
    const { data: graphs, error } = await supabase
      .from('knowledge_graphs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching knowledge graphs:', error)
      return NextResponse.json({ error: 'Failed to fetch knowledge graphs' }, { status: 500 })
    }

    return NextResponse.json(graphs || [])
  } catch (error) {
    console.error('Knowledge graphs API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check for Bearer token (from extension) or use cookies (from web app)
    const authHeader = request.headers.get('authorization')
    let supabase
    let user
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // Extension authentication with Bearer token
      const token = authHeader.substring(7)
      console.log('Using Bearer token authentication for extension')
      
      // Create a client with the Bearer token
      supabase = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        }
      )
      
      // Verify the token and get user
      const { data: userData, error: authError } = await supabase.auth.getUser()
      
      if (authError || !userData.user) {
        console.error('Bearer token auth error:', authError)
        return NextResponse.json(
          { error: 'Invalid or expired token' },
          { status: 401 }
        )
      }
      
      user = userData.user
    } else {
      // Web app authentication with cookies
      console.log('Using cookie authentication for web app')
      supabase = createClient()
      
      const { data: userData, error: authError } = await supabase.auth.getUser()
      
      if (authError || !userData.user) {
        console.error('Cookie auth error:', authError)
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
      
      user = userData.user
    }

    const body = await request.json()
    const { title, description, folders } = body

    if (!title || !folders || folders.length === 0) {
      return NextResponse.json({ error: 'Title and folders are required' }, { status: 400 })
    }

    // Create the knowledge graph
    const { data: graph, error: createError } = await supabase
      .from('knowledge_graphs')
      .insert({
        user_id: user.id,
        title,
        description: description || null,
        folder_ids: folders,
        status: 'processing',
        node_count: 0,
        connection_count: 0
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating knowledge graph:', createError)
      return NextResponse.json({ error: 'Failed to create knowledge graph' }, { status: 500 })
    }

    // TODO: Trigger background processing to analyze content and build the graph
    // For now, we'll simulate processing by updating the status after a delay
    setTimeout(async () => {
      try {
        const { error: updateError } = await supabase
          .from('knowledge_graphs')
          .update({
            status: 'completed',
            node_count: Math.floor(Math.random() * 20) + 10, // Mock data
            connection_count: Math.floor(Math.random() * 30) + 15, // Mock data
            updated_at: new Date().toISOString()
          })
          .eq('id', graph.id)

        if (updateError) {
          console.error('Error updating graph status:', updateError)
        }
      } catch (error) {
        console.error('Error in background processing:', error)
      }
    }, 3000) // Simulate 3 second processing time

    return NextResponse.json(graph)
  } catch (error) {
    console.error('Knowledge graph creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
