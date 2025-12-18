// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { randomBytes } from 'crypto'

function generateKey(): string {
  return randomBytes(32).toString('base64url')
}

function isSupabaseConfigured() {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name } = body

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Session name is required' },
        { status: 400 }
      )
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        {
          error:
            'Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment variables.',
        },
        { status: 500 }
      )
    }

    const supabase = await createClient()

    const director_key = generateKey()
    const voter_key = generateKey()

    const { data, error } = await supabase
      .from('sessions')
      .insert({
        name,
        director_key,
        voter_key,
        status: 'draft',
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating session:', error)
      return NextResponse.json(
        {
          error:
            'Failed to create session. Ensure the sessions table exists in Supabase and RLS policies allow inserts.',
          details: error.message || error,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      session: data,
      director_key,
      voter_key,
    })
  } catch (error) {
    console.error('Error in POST /api/sessions:', error)
    return NextResponse.json(
      { error: 'Internal server error while creating session' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const director_key = searchParams.get('director_key')
    const voter_key = searchParams.get('voter_key')
    const id = searchParams.get('id')

    const supabase = await createClient()

    let query = supabase.from('sessions').select('*')

    if (id) {
      query = query.eq('id', id).single()
    } else if (director_key) {
      query = query.eq('director_key', director_key).single()
    } else if (voter_key) {
      query = query.eq('voter_key', voter_key).single()
    } else {
      return NextResponse.json(
        { error: 'Must provide id, director_key, or voter_key' },
        { status: 400 }
      )
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching session:', error)
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in GET /api/sessions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

