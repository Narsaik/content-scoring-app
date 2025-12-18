"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { EditorScore } from '@/lib/types'

interface EditorScoresProps {
  scores: EditorScore[]
}

export function EditorScores({ scores }: EditorScoresProps) {
  if (scores.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Editor Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No scores available yet</p>
        </CardContent>
      </Card>
    )
  }

  const sortedScores = [...scores].sort(
    (a, b) => b.average_score - a.average_score
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Editor Performance Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedScores.map((score) => (
            <div
              key={score.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div>
                <p className="font-semibold">{score.creator_name}</p>
                <p className="text-sm text-muted-foreground">
                  {score.total_content_count} content
                  {score.total_content_count !== 1 ? ' pieces' : ' piece'} •{' '}
                  {score.total_votes} total votes
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">
                  {score.average_score.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">avg score</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

