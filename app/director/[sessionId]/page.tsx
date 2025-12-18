"use client"

import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { DirectorPanel } from '@/components/DirectorPanel'
import type { Session } from '@/lib/types'
import { useToast } from '@/components/ui/use-toast'

export default function DirectorPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const sessionId = params.sessionId as string
    const directorKey = searchParams.get('key')

    if (!directorKey) {
      toast({
        title: 'Access Denied',
        description: 'Director key is required',
        variant: 'destructive',
      })
      router.push('/')
      return
    }

    loadSession(sessionId, directorKey)
  }, [params.sessionId, searchParams])

  const loadSession = async (sessionId: string, directorKey: string) => {
    try {
      const response = await fetch(`/api/sessions?director_key=${directorKey}`)
      if (!response.ok) {
        throw new Error('Session not found')
      }
      const data = await response.json()
      if (data.id !== sessionId) {
        throw new Error('Session ID mismatch')
      }
      setSession(data)
    } catch (error) {
      console.error('Error loading session:', error)
      toast({
        title: 'Error',
        description: 'Failed to load session',
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

  if (!session) {
    return null
  }

  const directorKey = searchParams.get('key') || ''

  return <DirectorPanel session={session} directorKey={directorKey} />
}

