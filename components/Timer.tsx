"use client"

import { useEffect, useState } from 'react'
import { Progress } from '@/components/ui/progress'

interface TimerProps {
  duration: number // in seconds
  onComplete?: () => void
  isActive: boolean
}

export function Timer({ duration, onComplete, isActive }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration)

  useEffect(() => {
    if (!isActive) {
      setTimeLeft(duration)
      return
    }

    if (timeLeft <= 0) {
      onComplete?.()
      return
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onComplete?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [timeLeft, isActive, duration, onComplete])

  useEffect(() => {
    if (isActive) {
      setTimeLeft(duration)
    }
  }, [isActive, duration])

  const progress = (timeLeft / duration) * 100
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">Time Remaining</span>
        <span className="font-mono text-lg">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  )
}

