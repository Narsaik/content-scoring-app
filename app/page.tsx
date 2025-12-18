"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'

export default function HomePage() {
  const [sessionName, setSessionName] = useState('')
  const [contentLinks, setContentLinks] = useState('')
  const [creatorNames, setCreatorNames] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleCreateSession = async () => {
    if (!sessionName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a session name',
        variant: 'destructive',
      })
      return
    }

    if (!contentLinks.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter at least one content link',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      // Create session
      const sessionResponse = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: sessionName }),
      })

      const sessionData = await sessionResponse.json()

      if (!sessionResponse.ok) {
        throw new Error(sessionData?.error || 'Failed to create session')
      }
      const sessionId = sessionData.session.id
      const directorKey = sessionData.director_key

      // Parse content links (one per line)
      const links = contentLinks
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0)

      // Parse creator names (one per line, same order as links)
      const creators = creatorNames
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0)

      if (creators.length === 0) {
        toast({
          title: 'Warning',
          description: 'No creator names provided. Using "Unknown" for all content.',
        })
      }

      // Create content items
      const contentItems = links.map((link, index) => ({
        link,
        creator_name: creators[index] || 'Unknown',
        title: `Content ${index + 1}`,
      }))

      const contentResponse = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          items: contentItems,
        }),
      })

      if (!contentResponse.ok) {
        throw new Error('Failed to create content items')
      }

      // Navigate to director panel
      router.push(`/director/${sessionId}?key=${directorKey}`)
    } catch (error) {
      console.error('Error creating session:', error)
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to create session. Please check configuration and try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-3xl">Content Scoring App</CardTitle>
          <CardDescription>
            Create a new scoring session for your team meeting
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="session-name">Session Name</Label>
            <Input
              id="session-name"
              placeholder="e.g., Weekly Review - Week 1"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content-links">
              Content Links (one per line)
            </Label>
            <Textarea
              id="content-links"
              placeholder="https://drive.google.com/file/...&#10;https://drive.google.com/file/...&#10;..."
              value={contentLinks}
              onChange={(e) => setContentLinks(e.target.value)}
              rows={8}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Paste all Google Drive links, one per line
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="creator-names">
              Creator Names (one per line, optional)
            </Label>
            <Textarea
              id="creator-names"
              placeholder="John Doe&#10;Jane Smith&#10;..."
              value={creatorNames}
              onChange={(e) => setCreatorNames(e.target.value)}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Enter creator names in the same order as links. Leave empty to use "Unknown".
            </p>
          </div>

          <Button
            onClick={handleCreateSession}
            disabled={loading}
            size="lg"
            className="w-full"
          >
            {loading ? 'Creating Session...' : 'Create Session'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

