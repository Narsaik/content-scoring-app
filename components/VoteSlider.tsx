"use client"

import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface VoteSliderProps {
  onVote: (score: number) => void
  disabled?: boolean
  initialValue?: number
}

export function VoteSlider({ onVote, disabled = false, initialValue = 5 }: VoteSliderProps) {
  const [value, setValue] = useState([initialValue])
  const [hasVoted, setHasVoted] = useState(false)

  const handleSubmit = () => {
    if (disabled || hasVoted) return
    onVote(value[0])
    setHasVoted(true)
  }

  return (
    <div className="w-full space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="vote-slider" className="text-lg font-semibold">
            Your Vote
          </Label>
          <span className="text-3xl font-bold text-primary">
            {value[0]}/10
          </span>
        </div>
        <Slider
          id="vote-slider"
          min={0}
          max={10}
          step={1}
          value={value}
          onValueChange={setValue}
          disabled={disabled || hasVoted}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0</span>
          <span>5</span>
          <span>10</span>
        </div>
      </div>
      <Button
        onClick={handleSubmit}
        disabled={disabled || hasVoted}
        size="lg"
        className="w-full"
      >
        {hasVoted ? 'Vote Submitted ✓' : 'Submit Vote'}
      </Button>
    </div>
  )
}

