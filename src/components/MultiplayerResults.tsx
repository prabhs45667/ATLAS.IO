'use client'

import dynamic from 'next/dynamic'
import { formatDistance, formatYearDiff, formatScore } from '@/src/lib/utils'

const MultiplayerResultMap = dynamic(
  () => import('./MultiplayerResultMap').then((mod) => mod.MultiplayerResultMap),
  { ssr: false }
)

interface PlayerResult {
  playerId: string
  name: string
  color: string
  guess: { lat: number; lng: number; year: number } | null
  locationScore: number
  yearScore: number
  totalScore: number
  distanceKm: number | null
  yearDiff: number | null
}

interface Standing {
  rank: number
  playerId: string
  name: string
  color: string
  totalScore: number
}

interface Location {
  city: string
  country: string
  lat: number
  lng: number
  year: number
  description?: string
  clues?: string[]
}

interface MultiplayerResultsProps {
  location: Location
  playerResults: PlayerResult[]
  standings: Standing[]
  isHost: boolean
  isLastRound: boolean
  onNext: () => void
}

export function MultiplayerResults({
  location,
  playerResults,
  standings,
  isHost,
  isLastRound,
  onNext,
}: MultiplayerResultsProps) {
  const guessMarkers = playerResults
    .filter((p) => p.guess)
    .map((p) => ({
      lat: p.guess!.lat,
      lng: p.guess!.lng,
      color: p.color,
      name: p.name,
    }))

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-background/90 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-2xl panel my-4 scale-in">
        {/* Map */}
        <div className="h-48 md:h-64">
          <MultiplayerResultMap
            actualLat={location.lat}
            actualLng={location.lng}
            guessMarkers={guessMarkers}
          />
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Location header */}
          <div className="text-center">
            <h3 className="font-display text-2xl font-semibold tracking-[0.08em] text-foreground">
              {location.city}, {location.country}
            </h3>
            <p className="font-display text-lg text-primary mt-1">{location.year}</p>
            {location.clues && location.clues.length > 0 && (
              <div className="mt-3 text-left">
                <p className="label mb-2">Clues you could have spotted</p>
                <ul className="space-y-1">
                  {location.clues.map((clue: string, i: number) => (
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

          {/* Player results */}
          <div className="space-y-2">
            <p className="label mb-3">Round Scores</p>
            {playerResults
              .sort((a, b) => b.totalScore - a.totalScore)
              .map((player) => (
                <div
                  key={player.playerId}
                  className="bg-surface-light border border-border-subtle p-3.5 flex items-center gap-3"
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: player.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{player.name}</p>
                    {player.guess ? (
                      <p className="text-[10px] text-muted/50">
                        {formatDistance(player.distanceKm!)} — {formatYearDiff(player.yearDiff!)}
                      </p>
                    ) : (
                      <p className="text-[10px] text-muted/50">No guess</p>
                    )}
                  </div>
                  <span className="font-display text-lg text-primary tabular-nums">
                    +{formatScore(player.totalScore)}
                  </span>
                </div>
              ))}
          </div>

          {/* Standings */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="label mb-4">Current Standings</p>
            <div className="flex gap-6 justify-center">
              {standings.slice(0, 3).map((standing) => (
                <div key={standing.playerId} className="text-center">
                  <div
                    className="w-8 h-8 rounded-full mx-auto flex items-center justify-center"
                    style={{ backgroundColor: standing.color }}
                  >
                    <span className="font-display text-sm text-background font-semibold">
                      {standing.rank}
                    </span>
                  </div>
                  <p className="text-xs text-foreground mt-1.5 truncate max-w-[80px]">
                    {standing.name}
                  </p>
                  <p className="font-display text-sm text-primary tabular-nums">
                    {formatScore(standing.totalScore)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Action */}
          <div className="mt-6">
            {isHost ? (
              <button
                onClick={onNext}
                className="w-full py-3.5 bg-primary text-background font-display font-semibold tracking-[0.15em] uppercase text-xs hover:bg-primary-dim transition-colors"
              >
                {isLastRound ? 'See Final Results' : 'Next Round'}
              </button>
            ) : (
              <div className="py-3.5 text-sm text-muted/50 text-center">
                Waiting for host...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
