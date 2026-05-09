'use client'

import { cn } from '@/src/lib/utils'

interface Player {
  id: string
  name: string
  color: string
  totalScore: number
  connected: boolean
}

interface WaitingRoomProps {
  code: string
  players: Player[]
  maxPlayers: number
  timer: number
  isHost: boolean
  onStartGame: () => void
  onLeave: () => void
}

export function WaitingRoom({
  code,
  players,
  maxPlayers,
  timer,
  isHost,
  onStartGame,
  onLeave,
}: WaitingRoomProps) {
  const emptySlots = maxPlayers - players.length

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      <div className="atmosphere" />

      <div className="max-w-md w-full text-center relative z-10">
        {/* Room code */}
        <p className="label reveal">Room Code</p>
        <div className="mt-3 px-8 py-5 border border-border inline-block reveal-delayed-1">
          <span className="font-display text-4xl md:text-5xl tracking-[0.35em] text-primary">
            {code}
          </span>
        </div>
        <p className="text-sm text-muted/50 mt-3 reveal-delayed-2">
          Share this code with friends
        </p>

        {/* Settings summary */}
        <p className="label mt-6 reveal-delayed-3">
          {maxPlayers} players max — {timer > 0 ? `${timer}s timer` : 'No timer'} — 5 rounds
        </p>

        {/* Ornament */}
        <div className="ornament my-6 reveal-delayed-3">
          <div className="ornament-diamond" />
        </div>

        {/* Player list */}
        <div className="panel reveal-delayed-4">
          <div className="px-4 py-3 border-b border-border">
            <p className="label">
              Players ({players.length}/{maxPlayers})
            </p>
          </div>
          <div className="divide-y divide-border">
            {players.map((player, idx) => (
              <div key={player.id} className="px-5 py-3.5 flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: player.color }}
                />
                <span className="flex-1 text-left text-sm text-foreground">
                  {player.name}
                </span>
                {idx === 0 && (
                  <span className="label text-accent">Host</span>
                )}
                {!player.connected && (
                  <span className="label">Offline</span>
                )}
              </div>
            ))}
            {Array.from({ length: emptySlots }).map((_, idx) => (
              <div
                key={`empty-${idx}`}
                className="px-5 py-3.5 flex items-center gap-3"
              >
                <div className="w-3 h-3 rounded-full border border-dashed border-border" />
                <span className="text-sm text-muted/30">Waiting for player...</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 space-y-3 reveal-delayed-5">
          {isHost ? (
            <button
              onClick={onStartGame}
              disabled={players.length < 2}
              className={cn(
                'w-full py-3.5 font-display font-semibold tracking-[0.15em] uppercase text-xs transition-colors',
                players.length >= 2
                  ? 'bg-primary text-background hover:bg-primary-dim'
                  : 'bg-surface-light text-muted/50 cursor-not-allowed'
              )}
            >
              {players.length >= 2 ? 'Start Game' : 'Need at least 2 players'}
            </button>
          ) : (
            <div className="py-3.5 text-sm text-muted/50">
              Waiting for host to start...
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
