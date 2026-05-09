'use client'

import { useState } from 'react'
import { cn } from '@/src/lib/utils'

interface LobbyProps {
  onCreateRoom: (name: string, maxPlayers: number, timer: number) => void
  onJoinRoom: (name: string, code: string) => void
  onBack: () => void
  error: string | null
}

export function Lobby({ onCreateRoom, onJoinRoom, onBack, error }: LobbyProps) {
  const [mode, setMode] = useState<'select' | 'create' | 'join'>('select')
  const [name, setName] = useState('')
  const [maxPlayers, setMaxPlayers] = useState(4)
  const [timer, setTimer] = useState(30)
  const [code, setCode] = useState('')

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onCreateRoom(name.trim(), maxPlayers, timer)
    }
  }

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim() && code.trim().length === 4) {
      onJoinRoom(name.trim(), code.trim().toUpperCase())
    }
  }

  if (mode === 'select') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
        <div className="atmosphere" />
        <div className="max-w-md w-full text-center relative z-10">
          <p className="label reveal">Multiplayer</p>
          <h2 className="font-display text-3xl font-semibold tracking-[0.14em] uppercase text-foreground mt-3 reveal-delayed-1">
            Lobby
          </h2>

          <div className="ornament mt-6 reveal-delayed-2">
            <div className="ornament-diamond" />
          </div>

          <div className="flex flex-col gap-4 mt-10">
            <button
              onClick={() => setMode('create')}
              className="w-full py-4 bg-primary text-background font-display font-semibold tracking-[0.15em] uppercase text-xs hover:bg-primary-dim transition-colors reveal-delayed-3"
            >
              Create Room
            </button>
            <button
              onClick={() => setMode('join')}
              className="w-full py-4 panel text-foreground font-display font-semibold tracking-[0.15em] uppercase text-xs surface-interactive reveal-delayed-4"
            >
              Join Room
            </button>
          </div>

          <button
            onClick={onBack}
            className="mt-10 text-sm text-muted/50 hover:text-foreground transition-colors reveal-delayed-5"
          >
            Back to Mode Select
          </button>
        </div>
      </div>
    )
  }

  if (mode === 'create') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
        <div className="atmosphere" />
        <div className="max-w-md w-full relative z-10">
          <div className="text-center">
            <p className="label">Create Room</p>
            <h2 className="font-display text-2xl font-semibold tracking-[0.14em] uppercase text-foreground mt-3">
              Room Settings
            </h2>
          </div>

          <form onSubmit={handleCreateSubmit} className="mt-8 space-y-6">
            <div>
              <label className="label block mb-2.5">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                maxLength={20}
                className="w-full px-4 py-3 bg-surface border border-border text-foreground placeholder:text-muted/30 focus:border-primary/40 focus:outline-none"
              />
            </div>

            <div>
              <label className="label block mb-2.5">Max Players</label>
              <div className="grid grid-cols-5 gap-2">
                {[2, 3, 4, 5, 6].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setMaxPlayers(n)}
                    className={cn(
                      'py-2.5 font-display text-sm transition-colors',
                      maxPlayers === n
                        ? 'bg-primary text-background'
                        : 'bg-surface border border-border text-muted hover:border-primary/30'
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label block mb-2.5">Timer per Round</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 20, label: '20s' },
                  { value: 30, label: '30s' },
                  { value: 0, label: 'No Limit' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setTimer(opt.value)}
                    className={cn(
                      'py-2.5 font-display text-sm transition-colors',
                      timer === opt.value
                        ? 'bg-primary text-background'
                        : 'bg-surface border border-border text-muted hover:border-primary/30'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p className="text-sm text-primary text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={!name.trim()}
              className={cn(
                'w-full py-3.5 font-display font-semibold tracking-[0.15em] uppercase text-xs transition-colors',
                name.trim()
                  ? 'bg-primary text-background hover:bg-primary-dim'
                  : 'bg-surface-light text-muted/50 cursor-not-allowed'
              )}
            >
              Create Room
            </button>
          </form>

          <button
            onClick={() => setMode('select')}
            className="w-full mt-5 text-sm text-muted/50 hover:text-foreground transition-colors text-center"
          >
            Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <div className="atmosphere" />
      <div className="max-w-md w-full relative z-10">
        <div className="text-center">
          <p className="label">Join Room</p>
          <h2 className="font-display text-2xl font-semibold tracking-[0.14em] uppercase text-foreground mt-3">
            Enter Code
          </h2>
        </div>

        <form onSubmit={handleJoinSubmit} className="mt-8 space-y-6">
          <div>
            <label className="label block mb-2.5">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              maxLength={20}
              className="w-full px-4 py-3 bg-surface border border-border text-foreground placeholder:text-muted/30 focus:border-primary/40 focus:outline-none"
            />
          </div>

          <div>
            <label className="label block mb-2.5">Room Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 4))}
              placeholder="XXXX"
              maxLength={4}
              className="w-full px-4 py-4 bg-surface border border-border text-foreground text-center font-display text-2xl tracking-[0.35em] uppercase placeholder:text-muted/30 focus:border-primary/40 focus:outline-none"
            />
          </div>

          {error && (
            <p className="text-sm text-primary text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={!name.trim() || code.length !== 4}
            className={cn(
              'w-full py-3.5 font-display font-semibold tracking-[0.15em] uppercase text-xs transition-colors',
              name.trim() && code.length === 4
                ? 'bg-primary text-background hover:bg-primary-dim'
                : 'bg-surface-light text-muted/50 cursor-not-allowed'
            )}
          >
            Join Room
          </button>
        </form>

        <button
          onClick={() => setMode('select')}
          className="w-full mt-5 text-sm text-muted/50 hover:text-foreground transition-colors text-center"
        >
          Back
        </button>
      </div>
    </div>
  )
}
