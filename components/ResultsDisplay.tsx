"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ResultsDisplayProps {
  averageScore: number | null
  voteCount: number
  totalPossibleVotes?: number
}

export function ResultsDisplay({
  averageScore,
  voteCount,
  totalPossibleVotes,
}: ResultsDisplayProps) {
  if (voteCount === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Results</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No votes yet</p>
        </CardContent>
      </Card>
    )
  }

  const score = averageScore !== null ? averageScore.toFixed(2) : '0.00'

  return (
    <Card>
      <CardHeader>
        <CardTitle>Results</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">Average Score</p>
          <p className="text-5xl font-bold text-primary">{score}</p>
          <p className="text-sm text-muted-foreground mt-2">out of 10</p>
        </div>
        <div className="border-t pt-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total Votes</span>
            <span className="text-lg font-semibold">
              {voteCount}
              {totalPossibleVotes && ` / ${totalPossibleVotes}`}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

