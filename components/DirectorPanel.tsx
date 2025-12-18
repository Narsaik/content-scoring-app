"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ContentDisplay } from './ContentDisplay'
import { ResultsDisplay } from './ResultsDisplay'
import { EditorScores } from './EditorScores'
import type { ContentItem, Session, EditorScore } from '@/lib/types'
import { Copy, Check } from 'lucide-react'

interface DirectorPanelProps {
  session: Session
  directorKey: string
}

export function DirectorPanel({ session, directorKey }: DirectorPanelProps) {
  const [contentItems, setContentItems] = useState<ContentItem[]>([])
  const [currentContent, setCurrentContent] = useState<ContentItem | null>(null)
  const [editorScores, setEditorScores] = useState<EditorScore[]>([])
  const [voterUrl, setVoterUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/vote/${session.voter_key}`
      setVoterUrl(url)
    }
    loadContentItems()
  }, [session.id])

  useEffect(() => {
    // Find current voting content
    const voting = contentItems.find((item) => item.status === 'voting')
    if (voting) {
      setCurrentContent(voting)
    } else {
      // Find first pending content
      const pending = contentItems.find((item) => item.status === 'pending')
      if (pending) {
        setCurrentContent(pending)
      } else {
        // Find last completed content
        const completed = [...contentItems]
          .filter((item) => item.status === 'completed')
          .sort((a, b) => b.order_index - a.order_index)[0]
        setCurrentContent(completed || null)
      }
    }
  }, [contentItems])

  const loadContentItems = async () => {
    try {
      const response = await fetch(`/api/content?session_id=${session.id}`)
      const data = await response.json()
      setContentItems(data.items || [])
    } catch (error) {
      console.error('Error loading content items:', error)
    }
  }

  const handleNextContent = async () => {
    if (!currentContent) return

    setLoading(true)
    try {
      // Mark current as completed
      await fetch(`/api/content/${currentContent.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      })

      // Find next pending item
      const nextItem = contentItems.find(
        (item) => item.status === 'pending' && item.order_index > currentContent.order_index
      )

      if (nextItem) {
        // Set next item to voting
        await fetch(`/api/content/${nextItem.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'voting' }),
        })
      } else {
        // All content reviewed, calculate editor scores
        await fetch(`/api/scores?session_id=${session.id}`)
        // Update session status
        await fetch(`/api/sessions/${session.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'completed' }),
        })
      }

      await loadContentItems()
    } catch (error) {
      console.error('Error advancing content:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewResults = async () => {
    try {
      const response = await fetch(`/api/scores?session_id=${session.id}`)
      const data = await response.json()
      setEditorScores(data.scores || [])
    } catch (error) {
      console.error('Error loading editor scores:', error)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(voterUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const pendingCount = contentItems.filter((item) => item.status === 'pending').length
  const completedCount = contentItems.filter((item) => item.status === 'completed').length
  const isAllComplete = pendingCount === 0 && currentContent?.status !== 'voting'

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Session: {session.name || 'Untitled'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Voter URL (Share this with your team)</Label>
            <div className="flex gap-2 mt-2">
              <Input value={voterUrl} readOnly className="flex-1" />
              <Button onClick={copyToClipboard} variant="outline">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div className="flex gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Pending: </span>
              <span className="font-semibold">{pendingCount}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Completed: </span>
              <span className="font-semibold">{completedCount}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Total: </span>
              <span className="font-semibold">{contentItems.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {currentContent && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ContentDisplay content={currentContent} />
          <div className="space-y-4">
            <ResultsDisplay
              averageScore={currentContent.average_score}
              voteCount={currentContent.current_vote_count}
            />
            <div className="space-y-2">
              <Button
                onClick={handleNextContent}
                disabled={loading || isAllComplete}
                size="lg"
                className="w-full"
              >
                {isAllComplete ? 'All Content Reviewed' : 'Next Content'}
              </Button>
              {isAllComplete && (
                <Button
                  onClick={handleViewResults}
                  variant="outline"
                  size="lg"
                  className="w-full"
                >
                  View Editor Scores
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {editorScores.length > 0 && (
        <EditorScores scores={editorScores} />
      )}
    </div>
  )
}

