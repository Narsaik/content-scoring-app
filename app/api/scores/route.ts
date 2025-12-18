// @ts-nocheck
// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const session_id = searchParams.get('session_id')

    if (!session_id) {
      return NextResponse.json(
        { error: 'session_id is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Check if editor scores already exist
    const { data: existingScores } = await supabase
      .from('editor_scores')
      .select('*')
      .eq('session_id', session_id)

    if (existingScores && existingScores.length > 0) {
      return NextResponse.json({ scores: existingScores })
    }

    // Calculate editor scores
    const { data: contentItems, error: contentError } = await supabase
      .from('content_items')
      .select('id, creator_name, average_score, current_vote_count')
      .eq('session_id', session_id)
      .eq('status', 'completed')

    if (contentError) {
      console.error('Error fetching content items:', contentError)
      return NextResponse.json(
        { error: 'Failed to fetch content items' },
        { status: 500 }
      )
    }

    // Group by creator_name and calculate averages
    const creatorStats: Record<
      string,
      { total_content: number; total_votes: number; scores: number[] }
    > = {}

    contentItems?.forEach((item) => {
      if (!item.creator_name) return

      if (!creatorStats[item.creator_name]) {
        creatorStats[item.creator_name] = {
          total_content: 0,
          total_votes: 0,
          scores: [],
        }
      }

      creatorStats[item.creator_name].total_content += 1
      creatorStats[item.creator_name].total_votes += item.current_vote_count || 0
      if (item.average_score !== null) {
        creatorStats[item.creator_name].scores.push(item.average_score)
      }
    })

    // Calculate averages and insert into editor_scores
    const editorScores = Object.entries(creatorStats).map(
      ([creator_name, stats]) => {
        const average_score =
          stats.scores.length > 0
            ? stats.scores.reduce((a, b) => a + b, 0) / stats.scores.length
            : 0
        const roundedAverage = Math.round(average_score * 100) / 100

        return {
          session_id,
          creator_name,
          total_content_count: stats.total_content,
          average_score: roundedAverage,
          total_votes: stats.total_votes,
        }
      }
    )

    if (editorScores.length > 0) {
      const { data, error } = await supabase
        .from('editor_scores')
        .insert(editorScores)
        .select()

      if (error) {
        console.error('Error creating editor scores:', error)
        return NextResponse.json(
          { error: 'Failed to calculate editor scores' },
          { status: 500 }
        )
      }

      return NextResponse.json({ scores: data })
    }

    return NextResponse.json({ scores: [] })
  } catch (error) {
    console.error('Error in GET /api/scores:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

