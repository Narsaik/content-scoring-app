export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      sessions: {
        Row: {
          id: string
          name: string | null
          director_key: string
          voter_key: string
          status: 'draft' | 'active' | 'completed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name?: string | null
          director_key: string
          voter_key: string
          status?: 'draft' | 'active' | 'completed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          director_key?: string
          voter_key?: string
          status?: 'draft' | 'active' | 'completed'
          created_at?: string
          updated_at?: string
        }
      }
      content_items: {
        Row: {
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
        Insert: {
          id?: string
          session_id: string
          title?: string | null
          link: string
          creator_name: string
          order_index: number
          current_vote_count?: number
          average_score?: number | null
          status?: 'pending' | 'voting' | 'completed'
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          title?: string | null
          link?: string
          creator_name?: string
          order_index?: number
          current_vote_count?: number
          average_score?: number | null
          status?: 'pending' | 'voting' | 'completed'
          created_at?: string
        }
      }
      votes: {
        Row: {
          id: string
          content_item_id: string
          session_id: string
          score: number
          voter_session_id: string
          created_at: string
        }
        Insert: {
          id?: string
          content_item_id: string
          session_id: string
          score: number
          voter_session_id: string
          created_at?: string
        }
        Update: {
          id?: string
          content_item_id?: string
          session_id?: string
          score?: number
          voter_session_id?: string
          created_at?: string
        }
      }
      editor_scores: {
        Row: {
          id: string
          session_id: string
          creator_name: string
          total_content_count: number
          average_score: number
          total_votes: number
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          creator_name: string
          total_content_count: number
          average_score: number
          total_votes: number
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          creator_name?: string
          total_content_count?: number
          average_score?: number
          total_votes?: number
          created_at?: string
        }
      }
    }
  }
}

