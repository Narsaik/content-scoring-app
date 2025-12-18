"use client"

import { useState, useEffect } from 'react'
import { ContentDisplay } from './ContentDisplay'
import { VoteSlider } from './VoteSlider'
import { Timer } from './Timer'
import { ResultsDisplay } from './ResultsDisplay'
import type { ContentItem, Session } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'

interface VoterInterfaceProps {
  session: Session
  voterSessionId: string
}

export function VoterInterface({ session, voterSessionId }: VoterInterfaceProps) {
  const [currentContent, setCurrentContent] = useState<ContentItem | null>(null)
  const [hasVoted, setHasVoted] = useState(false)
  const [isVotingActive, setIsVotingActive] = useState(false)

  useEffect(() => {
    loadCurrentContent()
    
    // Set up real-time subscription
    const supabase = createClient()
    const channel = supabase
      .channel('content-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'content_items',
          filter: `session_id=eq.${session.id}`,
        },
        () => {
          loadCurrentContent()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [session.id])

  useEffect(() => {
    if (currentContent?.status === 'voting') {
      setIsVotingActive(true)
      // Check if user has already voted
      checkExistingVote()
    } else {
      setIsVotingActive(false)
    }
  }, [currentContent])

  const loadCurrentContent = async () => {
    try {
      const response = await fetch(`/api/content?session_id=${session.id}&status=voting`)
      const data = await response.json()
      if (data.items && data.items.length > 0) {
        setCurrentContent(data.items[0])
      } else {
        // Check for completed content to show results
        const completedResponse = await fetch(`/api/content?session_id=${session.id}&status=completed`)
        const completedData = await completedResponse.json()
        if (completedData.items && completedData.items.length > 0) {
          // Show most recently completed
          const sorted = completedData.items.sort((a: ContentItem, b: ContentItem) => 
            b.order_index - a.order_index
          )
          setCurrentContent(sorted[0])
        }
      }
    } catch (error) {
      console.error('Error loading current content:', error)
    }
  }

  const checkExistingVote = async () => {
    if (!currentContent) return
    try {
      const response = await fetch(`/api/votes?content_item_id=${currentContent.id}`)
      const data = await response.json()
      const userVote = data.votes?.find(
        (vote: any) => vote.voter_session_id === voterSessionId
      )
      setHasVoted(!!userVote)
    } catch (error) {
      console.error('Error checking existing vote:', error)
    }
  }

  const handleVote = async (score: number) => {
    if (!currentContent) return

    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content_item_id: currentContent.id,
          session_id: session.id,
          score,
          voter_session_id: voterSessionId,
        }),
      })

      if (response.ok) {
        setHasVoted(true)
        // Reload content to get updated scores
        setTimeout(() => loadCurrentContent(), 500)
      }
    } catch (error) {
      console.error('Error submitting vote:', error)
    }
  }

  const isVoting = currentContent?.status === 'voting' && isVotingActive

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-4xl">
      <ContentDisplay content={currentContent} />

      {isVoting && (
        <div className="space-y-6">
          <Timer
            duration={60}
            isActive={isVoting && !hasVoted}
            onComplete={() => setIsVotingActive(false)}
          />
          {!hasVoted ? (
            <VoteSlider onVote={handleVote} disabled={!isVotingActive} />
          ) : (
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-lg font-semibold">Thank you for voting!</p>
              <p className="text-sm text-muted-foreground mt-1">
                Results will be displayed when voting ends.
              </p>
            </div>
          )}
        </div>
      )}

      {currentContent && currentContent.status === 'completed' && (
        <ResultsDisplay
          averageScore={currentContent.average_score}
          voteCount={currentContent.current_vote_count}
        />
      )}

      {!currentContent && (
        <div className="text-center p-8 text-muted-foreground">
          <p>Waiting for content to be displayed...</p>
        </div>
      )}
    </div>
  )
}

