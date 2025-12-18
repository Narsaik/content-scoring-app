"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { VoterInterface } from '@/components/VoterInterface'
import type { Session } from '@/lib/types'
import { useToast } from '@/components/ui/use-toast'

function getOrCreateVoterSessionId(): string {
  if (typeof window === 'undefined') return ''
  
  const key = 'voter_session_id'
  let sessionId = localStorage.getItem(key)
  
  if (!sessionId) {
    // Generate a unique ID
    sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
    localStorage.setItem(key, sessionId)
  }
  
  return sessionId
}

export default function VotePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [session, setSession] = useState<Session | null>(null)
  const [voterSessionId, setVoterSessionId] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const voterKey = params.voterKey as string
    setVoterSessionId(getOrCreateVoterSessionId())
    loadSession(voterKey)
  }, [params.voterKey])

  const loadSession = async (voterKey: string) => {
    try {
      const response = await fetch(`/api/sessions?voter_key=${voterKey}`)
      if (!response.ok) {
        throw new Error('Session not found')
      }
      const data = await response.json()
      setSession(data)
    } catch (error) {
      console.error('Error loading session:', error)
      toast({
        title: 'Error',
        description: 'Invalid voting link',
        variant: 'destructive',
      })
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  if (!session || !voterSessionId) {
    return null
  }

  return <VoterInterface session={session} voterSessionId={voterSessionId} />
}

