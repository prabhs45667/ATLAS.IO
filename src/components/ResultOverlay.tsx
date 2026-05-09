'use client'

import dynamic from 'next/dynamic'
import { formatDistance, formatYearDiff, formatScore, formatYear } from '@/src/lib/utils'
import type { Round } from '@/src/data/rounds'
import type { RoundScoreResult } from '@/src/lib/scoring'

const ResultMap = dynamic(
  () => import('./ResultMap').then((mod) => mod.ResultMap),
  { ssr: false }
)

interface ResultOverlayProps {
  round: Round
  guessLat: number
  guessLng: number
  result: RoundScoreResult
  isLastRound: boolean
  onNext: () => void
}

export function ResultOverlay({
  round,
  guessLat,
  guessLng,
  result,
  isLastRound,
  onNext,
}: ResultOverlayProps) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-background/90 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-lg panel scale-in my-auto">
        {/* Map */}
        <div className="h-48 md:h-56">
          <ResultMap
            guessLat={guessLat}
            guessLng={guessLng}
            actualLat={round.lat}
            actualLng={round.lng}
          />
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Location header */}
          <div className="text-center">
            <h3 className="font-display text-2xl font-semibold tracking-[0.08em] text-foreground">
              {round.city}, {round.country}
            </h3>
            <p className="font-display text-lg text-primary mt-1">{formatYear(round.year)}</p>
            {round.clues && round.clues.length > 0 && (
              <div className="mt-3 text-left">
                <p className="label mb-2">Clues you could have spotted</p>
                <ul className="space-y-1">
                  {round.clues.map((clue, i) => (
                    <li key={i} className="text-sm text-muted/70 leading-relaxed flex gap-2">
                      <span className="text-primary shrink-0">—</span>
                      {clue}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Ornament */}
          <div className="ornament my-6">
            <div className="ornament-diamond" />
          </div>

          {/* Score breakdown */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-light border border-border-subtle p-4 text-center">
              <p className="label">Distance</p>
              <p className="font-display text-xl text-foreground mt-2">
                {formatDistance(result.distanceKm)}
              </p>
              <p className="font-display text-sm text-primary mt-1">
                +{formatScore(result.locationScore)}
              </p>
            </div>

            <div className="bg-surface-light border border-border-subtle p-4 text-center">
              <p className="label">Year Off</p>
              <p className="font-display text-xl text-foreground mt-2">
                {formatYearDiff(result.yearDiff)}
              </p>
              <p className="font-display text-sm text-primary mt-1">
                +{formatScore(result.yearScore)}
              </p>
            </div>
          </div>

          {/* Round total */}
          <div className="text-right mt-6">
            <p className="label">Round Total</p>
            <p className="font-display text-3xl text-primary tabular-nums mt-1">
              +{formatScore(result.totalScore)}
            </p>
          </div>

          {/* Next button */}
          <button
            onClick={onNext}
            className="w-full mt-6 py-3.5 bg-primary text-background font-display font-semibold tracking-[0.15em] uppercase text-xs hover:bg-primary-dim transition-colors"
          >
            {isLastRound ? 'See Final Results' : 'Next Round'}
          </button>
        </div>
      </div>
    </div>
  )
}
