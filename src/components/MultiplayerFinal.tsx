'use client'

import { formatScore, cn } from '@/src/lib/utils'

interface Standing {
  rank: number
  playerId: string
  name: string
  color: string
  totalScore: number
}

interface MultiplayerFinalProps {
  standings: Standing[]
  currentPlayerId: string
  isHost: boolean
  onPlayAgain: () => void
  onLeave: () => void
}

export function MultiplayerFinal({
  standings,
  currentPlayerId,
  isHost,
  onPlayAgain,
  onLeave,
}: MultiplayerFinalProps) {
  const myStanding = standings.find((s) => s.playerId === currentPlayerId)
  const isWinner = myStanding?.rank === 1
  const title = isWinner ? 'Victory' : 'Well Played'

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      <div className="atmosphere" />

      <div className="max-w-lg w-full relative z-10">
        {/* Header */}
        <div className="text-center reveal">
          <p className="label">Expedition complete</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-[0.14em] uppercase text-foreground mt-3">
            {title}
          </h2>
        </div>

        {/* Ornament */}
        <div className="ornament my-8 reveal-delayed-1">
          <div className="ornament-diamond" />
        </div>

        {/* Leaderboard */}
        <div className="panel reveal-delayed-2">
          <div className="px-5 py-3.5 border-b border-border">
            <p className="label">Final Leaderboard</p>
          </div>
          <div className="divide-y divide-border">
            {standings.map((standing) => {
              const isMe = standing.playerId === currentPlayerId
              return (
                <div
                  key={standing.playerId}
                  className={cn(
                    'px-5 py-4 flex items-center gap-4',
                    isMe && 'bg-primary-glow'
                  )}
                >
                  <span className="font-display text-xl text-muted/40 w-6 tabular-nums">
                    {standing.rank}
                  </span>
                  <div
                    className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: standing.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-foreground truncate">
                      {standing.name}
                      {isMe && (
                        <span className="label text-primary ml-2">You</span>
                      )}
                    </span>
                  </div>
                  <span className="font-display text-xl text-primary tabular-nums">
                    {formatScore(standing.totalScore)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Reference */}
        <p className="text-sm text-muted/40 text-center mt-4 reveal-delayed-3">
          Out of {formatScore(30000)} possible
        </p>

        {/* Actions */}
        <div className="mt-8 space-y-3 reveal-delayed-4">
          {isHost ? (
            <button
              onClick={onPlayAgain}
              className="w-full py-3.5 bg-primary text-background font-display font-semibold tracking-[0.15em] uppercase text-xs hover:bg-primary-dim transition-colors"
            >
              Play Again
            </button>
          ) : (
            <div className="py-3.5 text-sm text-muted/50 text-center">
              Waiting for host...
            </div>
          )}
          <button
            onClick={onLeave}
            className="w-full py-2 text-sm text-muted/50 hover:text-foreground transition-colors"
          >
            Leave Room
          </button>
        </div>
      </div>
    </div>
  )
}
