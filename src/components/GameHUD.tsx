'use client'

import { formatScore, cn } from '@/src/lib/utils'

interface GameHUDProps {
  round: number
  totalRounds: number
  score: number
  timeRemaining?: number | null
}

export function GameHUD({ round, totalRounds, score, timeRemaining }: GameHUDProps) {
  const showTimer = typeof timeRemaining === 'number'
  const isUrgent = showTimer && timeRemaining! <= 10

  return (
    <div className="fixed top-0 left-0 right-0 z-20 pointer-events-none">
      <div className="hud-backdrop px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="pointer-events-auto">
            <span className="font-display text-lg font-bold tracking-[0.14em] uppercase text-foreground/90">
              ATLAS.IO
            </span>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-10">
            {/* Round */}
            <div className="text-right">
              <p className="label">Round</p>
              <p className="font-display text-lg text-foreground tabular-nums mt-0.5">
                {round}<span className="text-muted/40">/{totalRounds}</span>
              </p>
            </div>

            {/* Timer */}
            {showTimer && (
              <div className="text-right">
                <p className="label">Time</p>
                <p
                  className={cn(
                    'font-display text-lg tabular-nums mt-0.5',
                    isUrgent ? 'timer-critical' : 'text-foreground'
                  )}
                >
                  {String(Math.max(0, timeRemaining!)).padStart(2, '0')}s
                </p>
              </div>
            )}

            {/* Score */}
            <div className="text-right">
              <p className="label">Score</p>
              <p className="font-display text-lg text-primary tabular-nums mt-0.5">
                {formatScore(score)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
