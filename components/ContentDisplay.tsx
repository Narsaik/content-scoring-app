"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ExternalLink } from 'lucide-react'

interface ContentDisplayProps {
  content: {
    id: string
    title: string | null
    link: string
    creator_name: string
  } | null
}

export function ContentDisplay({ content }: ContentDisplayProps) {
  if (!content) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Waiting for content to be displayed...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{content.title || 'Content Review'}</span>
          <a
            href={content.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            Open Link
            <ExternalLink className="h-4 w-4" />
          </a>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Creator</p>
          <p className="font-medium">{content.creator_name}</p>
        </div>
        <div className="border rounded-lg p-4 bg-muted/50">
          <iframe
            src={content.link}
            className="w-full h-96 border-0 rounded"
            title={content.title || 'Content Preview'}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        </div>
      </CardContent>
    </Card>
  )
}

