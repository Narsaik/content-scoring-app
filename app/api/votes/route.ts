// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content_item_id, session_id, score, voter_session_id } = body

    if (
      !content_item_id ||
      !session_id ||
      score === undefined ||
      !voter_session_id
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (score < 0 || score > 10 || !Number.isInteger(score)) {
      return NextResponse.json(
        { error: 'Score must be an integer between 0 and 10' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Check if vote already exists (prevent duplicate votes)
    const { data: existingVote } = await supabase
      .from('votes')
      .select('id')
      .eq('content_item_id', content_item_id)
      .eq('voter_session_id', voter_session_id)
      .single()

    if (existingVote) {
      // Update existing vote
      const { data, error } = await supabase
        .from('votes')
        .update({ score })
        .eq('id', existingVote.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating vote:', error)
        return NextResponse.json(
          { error: 'Failed to update vote' },
          { status: 500 }
        )
      }

      // Recalculate average score
      await recalculateAverageScore(content_item_id, supabase)

      return NextResponse.json(data)
    }

    // Create new vote
    const { data, error } = await supabase
      .from('votes')
      .insert({
        content_item_id,
        session_id,
        score,
        voter_session_id,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating vote:', error)
      return NextResponse.json(
        { error: 'Failed to create vote' },
        { status: 500 }
      )
    }

    // Recalculate average score
    await recalculateAverageScore(content_item_id, supabase)

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in POST /api/votes:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function recalculateAverageScore(
  content_item_id: string,
  supabase: any
) {
  const { data: votes } = await supabase
    .from('votes')
    .select('score')
    .eq('content_item_id', content_item_id)

  if (votes && votes.length > 0) {
    const sum = votes.reduce((acc: number, vote: any) => acc + vote.score, 0)
    const average = sum / votes.length
    const roundedAverage = Math.round(average * 100) / 100

    await supabase
      .from('content_items')
      .update({
        average_score: roundedAverage,
        current_vote_count: votes.length,
      })
      .eq('id', content_item_id)
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const content_item_id = searchParams.get('content_item_id')
    const session_id = searchParams.get('session_id')

    if (!content_item_id && !session_id) {
      return NextResponse.json(
        { error: 'Must provide content_item_id or session_id' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    let query = supabase.from('votes').select('*')

    if (content_item_id) {
      query = query.eq('content_item_id', content_item_id)
    }

    if (session_id) {
      query = query.eq('session_id', session_id)
    }

    const { data, error } = await query.order('created_at', {
      ascending: false,
    })

    if (error) {
      console.error('Error fetching votes:', error)
      return NextResponse.json(
        { error: 'Failed to fetch votes' },
        { status: 500 }
      )
    }

    return NextResponse.json({ votes: data || [] })
  } catch (error) {
    console.error('Error in GET /api/votes:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

