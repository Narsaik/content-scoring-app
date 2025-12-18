"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EditorScores } from '@/components/EditorScores'
import type { Session, ContentItem, Vote, EditorScore } from '@/lib/types'
import { useToast } from '@/components/ui/use-toast'

export default function ResultsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [session, setSession] = useState<Session | null>(null)
  const [contentItems, setContentItems] = useState<ContentItem[]>([])
  const [votes, setVotes] = useState<Vote[]>([])
  const [editorScores, setEditorScores] = useState<EditorScore[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const directorKey = params.directorKey as string
    loadSession(directorKey)
  }, [params.directorKey])

  const loadSession = async (directorKey: string) => {
    try {
      const response = await fetch(`/api/sessions?director_key=${directorKey}`)
      if (!response.ok) {
        throw new Error('Session not found')
      }
      const data = await response.json()
      setSession(data)
      await loadSessionData(data.id)
    } catch (error) {
      console.error('Error loading session:', error)
      toast({
        title: 'Error',
        description: 'Failed to load results',
        variant: 'destructive',
      })
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const loadSessionData = async (sessionId: string) => {
    try {
      // Load content items
      const contentResponse = await fetch(`/api/content?session_id=${sessionId}`)
      const contentData = await contentResponse.json()
      setContentItems(contentData.items || [])

      // Load all votes
      const votesResponse = await fetch(`/api/votes?session_id=${sessionId}`)
      const votesData = await votesResponse.json()
      setVotes(votesData.votes || [])

      // Load editor scores
      const scoresResponse = await fetch(`/api/scores?session_id=${sessionId}`)
      const scoresData = await scoresResponse.json()
      setEditorScores(scoresData.scores || [])
    } catch (error) {
      console.error('Error loading session data:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Results: {session.name || 'Untitled Session'}</CardTitle>
        </CardHeader>
      </Card>

      <EditorScores scores={editorScores} />

      <Card>
        <CardHeader>
          <CardTitle>All Content & Votes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {contentItems.map((item) => {
              const itemVotes = votes.filter(
                (vote) => vote.content_item_id === item.id
              )
              return (
                <div
                  key={item.id}
                  className="border rounded-lg p-4 space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">
                        {item.title || `Content ${item.order_index + 1}`}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Creator: {item.creator_name}
                      </p>
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline mt-1 inline-block"
                      >
                        {item.link}
                      </a>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">
                        {item.average_score?.toFixed(2) || '0.00'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.current_vote_count} votes
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs font-medium mb-2">Individual Votes:</p>
                    <div className="flex flex-wrap gap-2">
                      {itemVotes.map((vote) => (
                        <span
                          key={vote.id}
                          className="text-xs px-2 py-1 bg-muted rounded"
                        >
                          {vote.score}/10
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

