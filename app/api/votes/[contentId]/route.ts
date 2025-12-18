// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ contentId: string }> }
) {
  try {
    const { contentId } = await params
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('votes')
      .select('*')
      .eq('content_item_id', contentId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching votes:', error)
      return NextResponse.json(
        { error: 'Failed to fetch votes' },
        { status: 500 }
      )
    }

    return NextResponse.json({ votes: data || [] })
  } catch (error) {
    console.error('Error in GET /api/votes/[contentId]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

