'use client'

import { useState } from 'react'
import { formatScore, formatYear } from '@/src/lib/utils'
import type { Round } from '@/src/data/rounds'
import type { RoundScoreResult } from '@/src/lib/scoring'
import { submitScore } from '@/src/lib/leaderboard'
import { Leaderboard } from './Leaderboard'

interface RoundResult {
  round: Round
  result: RoundScoreResult
}

interface FinalResultsProps {
  totalScore: number
  roundResults: RoundResult[]
  onPlayAgain: () => void
}

function getTitle(score: number, maxScore: number): string {
  const percentage = score / maxScore
  if (percentage >= 0.8) return 'Masterful'
  if (percentage >= 0.5) return 'Well Traveled'
  return 'Keep Exploring'
}

type SubmitState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'submitted'; entryId: string }
  | { status: 'error'; message: string }

export function FinalResults({
  totalScore,
  roundResults,
  onPlayAgain,
}: FinalResultsProps) {
  const maxScore = roundResults.length * 6000
  const title = getTitle(totalScore, maxScore)

  const [name, setName] = useState('')
  const [submitState, setSubmitState] = useState<SubmitState>({ status: 'idle' })
  const [refreshKey, setRefreshKey] = useState(0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    setSubmitState({ status: 'submitting' })
    const { entry, error } = await submitScore(
      trimmed,
      totalScore,
      roundResults.length,
    )
    if (error || !entry) {
      setSubmitState({ status: 'error', message: error ?? 'Failed to submit score' })
      return
    }
    setSubmitState({ status: 'submitted', entryId: entry.id })
    setRefreshKey((k) => k + 1)
  }

  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-12 relative overflow-hidden">

      <div className="max-w-lg w-full relative z-10">
        {/* Header */}
        <div className="text-center reveal mt-8">
          <p className="label">Expedition complete</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-[0.14em] uppercase text-foreground mt-3">
            {title}
          </h2>
        </div>

        {/* Total score */}
        <div className="text-center mt-8 reveal-delayed-1">
          <p className="font-display text-primary tabular-nums" style={{ fontSize: 'clamp(3rem, 6vw, 4.5rem)' }}>
            {formatScore(totalScore)}
          </p>
          <p className="text-sm text-muted/50 mt-2">
            out of {formatScore(maxScore)} possible
          </p>
        </div>

        {/* Ornament */}
        <div className="ornament my-8 reveal-delayed-2">
          <div className="ornament-diamond" />
        </div>

        {/* Score submission */}
        <div className="panel reveal-delayed-3">
          <div className="px-5 py-3.5 border-b border-border">
            <p className="label">
              {submitState.status === 'submitted'
                ? 'Recorded in the archives'
                : 'Sign the ledger'}
            </p>
          </div>
          <div className="p-5">
            {submitState.status === 'submitted' ? (
              <p className="text-sm text-foreground/80">
                Your score has been etched into the Hall of Records.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="flex gap-3">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  maxLength={32}
                  required
                  disabled={submitState.status === 'submitting'}
                  className="flex-1 px-3 py-2.5 text-sm text-foreground bg-surface-light border border-border focus:border-primary focus:outline-none disabled:opacity-50 placeholder:text-muted/30"
                />
                <button
                  type="submit"
                  disabled={
                    submitState.status === 'submitting' || !name.trim()
                  }
                  className="px-5 py-2.5 bg-primary text-background font-display font-semibold tracking-[0.15em] uppercase text-[10px] hover:bg-primary-dim transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {submitState.status === 'submitting' ? 'Saving' : 'Submit'}
                </button>
              </form>
            )}
            {submitState.status === 'error' && (
              <p className="text-xs text-primary mt-2">{submitState.message}</p>
            )}
          </div>
        </div>

        {/* Round breakdown */}
        <div className="panel reveal-delayed-3 mt-5">
          <div className="px-5 py-3.5 border-b border-border">
            <p className="label">Round Breakdown</p>
          </div>
          <div className="divide-y divide-border">
            {roundResults.map((r, idx) => (
              <div key={r.round.id} className="px-5 py-3.5 flex items-center gap-4">
                <span className="font-display text-lg text-muted/40 w-6 tabular-nums">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">
                    {r.round.city}, {r.round.country} ({formatYear(r.round.year)})
                  </p>
                  <p className="text-[10px] text-muted/50 mt-0.5">
                    Location +{formatScore(r.result.locationScore)} — Year +
                    {formatScore(r.result.yearScore)}
                  </p>
                </div>
                <span className="font-display text-lg text-primary tabular-nums">
                  {formatScore(r.result.totalScore)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="mt-5 reveal-delayed-4">
          <Leaderboard
            highlightId={
              submitState.status === 'submitted' ? submitState.entryId : null
            }
            refreshKey={refreshKey}
          />
        </div>

        {/* Play again */}
        <button
          onClick={onPlayAgain}
          className="w-full mt-8 py-3.5 bg-primary text-background font-display font-semibold tracking-[0.15em] uppercase text-xs hover:bg-primary-dim transition-colors reveal-delayed-4"
        >
          Begin Again
        </button>
      </div>
    </div>
  )
}
