export interface Session {
  id: string
  name: string | null
  director_key: string
  voter_key: string
  status: 'draft' | 'active' | 'completed'
  created_at: string
  updated_at: string
}

export interface ContentItem {
  id: string
  session_id: string
  title: string | null
  link: string
  creator_name: string
  order_index: number
  current_vote_count: number
  average_score: number | null
  status: 'pending' | 'voting' | 'completed'
  created_at: string
}

export interface Vote {
  id: string
  content_item_id: string
  session_id: string
  score: number
  voter_session_id: string
  created_at: string
}

export interface EditorScore {
  id: string
  session_id: string
  creator_name: string
  total_content_count: number
  average_score: number
  total_votes: number
  created_at: string
}

export interface CreateSessionRequest {
  name: string
}

export interface CreateContentRequest {
  session_id: string
  items: Array<{
    link: string
    creator_name: string
    title?: string
  }>
}

export interface SubmitVoteRequest {
  content_item_id: string
  session_id: string
  score: number
  voter_session_id: string
}

