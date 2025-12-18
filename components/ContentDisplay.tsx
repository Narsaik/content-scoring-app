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

function getGoogleDriveEmbedUrl(rawUrl: string): string {
  try {
    const url = new URL(rawUrl)

    // Handle old ?id= style links
    if (url.hostname.includes('drive.google.com') && url.searchParams.get('id')) {
      const id = url.searchParams.get('id')
      return id ? `https://drive.google.com/file/d/${id}/preview` : rawUrl
    }

    // Handle /file/d/:id/...
    const fileMatch = url.pathname.match(/\/file\/d\/([^/]+)/)
    if (url.hostname.includes('drive.google.com') && fileMatch?.[1]) {
      const id = fileMatch[1]
      return `https://drive.google.com/file/d/${id}/preview`
    }

    // Handle docs (Docs, Sheets, Slides) /document|spreadsheets|presentation/d/:id/...
    const docsMatch = url.pathname.match(/\/(document|spreadsheets|presentation)\/d\/([^/]+)/)
    if (url.hostname.includes('docs.google.com') && docsMatch?.[1] && docsMatch?.[2]) {
      const type = docsMatch[1]
      const id = docsMatch[2]
      return `https://docs.google.com/${type}/d/${id}/preview`
    }

    return rawUrl
  } catch {
    return rawUrl
  }
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

  const isGoogleLink =
    content.link.includes('drive.google.com') || content.link.includes('docs.google.com')
  const embedUrl = isGoogleLink ? getGoogleDriveEmbedUrl(content.link) : content.link

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-4">
          <span className="truncate">{content.title || 'Content Review'}</span>
          <a
            href={content.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline flex items-center gap-1 shrink-0"
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
          {isGoogleLink ? (
            <iframe
              src={embedUrl}
              className="w-full h-96 border-0 rounded"
              title={content.title || 'Content Preview'}
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              allow="fullscreen"
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              Preview not available for this link. Use the &quot;Open Link&quot; button above to view
              the content.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
