// @ts-nocheck
// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { session_id, items } = body

    if (!session_id || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'session_id and items array are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify session exists
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('id')
      .eq('id', session_id)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // Prepare content items with order_index
    const contentItems = items.map((item: any, index: number) => ({
      session_id,
      link: item.link,
      creator_name: item.creator_name,
      title: item.title || null,
      order_index: index,
      status: 'pending',
    }))

    const { data, error } = await supabase
      .from('content_items')
      .insert(contentItems)
      .select()

    if (error) {
      console.error('Error creating content items:', error)
      return NextResponse.json(
        { error: 'Failed to create content items' },
        { status: 500 }
      )
    }

    return NextResponse.json({ items: data })
  } catch (error) {
    console.error('Error in POST /api/content:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const session_id = searchParams.get('session_id')
    const status = searchParams.get('status')

    if (!session_id) {
      return NextResponse.json(
        { error: 'session_id is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    let query = supabase
      .from('content_items')
      .select('*')
      .eq('session_id', session_id)
      .order('order_index', { ascending: true })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching content items:', error)
      return NextResponse.json(
        { error: 'Failed to fetch content items' },
        { status: 500 }
      )
    }

    return NextResponse.json({ items: data || [] })
  } catch (error) {
    console.error('Error in GET /api/content:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

