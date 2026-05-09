'use client'

import { useEffect, useState } from 'react'
import { fetchTopScores, type LeaderboardEntry } from '@/src/lib/leaderboard'
import { formatScore } from '@/src/lib/utils'

interface LeaderboardProps {
  highlightId?: string | null
  limit?: number
  refreshKey?: number
}

export function Leaderboard({ highlightId, limit = 25, refreshKey = 0 }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchTopScores(limit)
      .then((data) => {
        if (cancelled) return
        setEntries(data)
      })
      .catch(() => {
        if (cancelled) return
        setEntries([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [limit, refreshKey])

  return (
    <div className="panel">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <h3 className="font-display text-xl text-primary tracking-wide">Hall of Records</h3>
        <span className="label">Top {limit}</span>
      </div>

      {loading ? (
        <div className="p-10 text-center">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted/50 mt-3">Loading records</p>
        </div>
      ) : entries.length === 0 ? (
        <div className="p-10 text-center text-muted/50 text-sm">
          No records yet. Be the first to leave your mark.
        </div>
      ) : (
        <ol className="divide-y divide-border">
          {entries.map((entry, index) => {
            const rank = index + 1
            const isHighlight = entry.id === highlightId
            return (
              <li
                key={entry.id}
                className={
                  'flex items-center gap-4 px-5 py-3 transition-colors ' +
                  (isHighlight
                    ? 'bg-primary-glow'
                    : 'hover:bg-surface-light')
                }
              >
                <span
                  className={
                    'font-display text-lg w-8 tabular-nums ' +
                    (rank === 1
                      ? 'text-primary'
                      : rank <= 3
                        ? 'text-foreground'
                        : 'text-muted/40')
                  }
                >
                  {rank}
                </span>
                <span className="flex-1 text-foreground truncate text-sm">
                  {entry.player_name}
                  {isHighlight && (
                    <span className="ml-2 label text-primary">You</span>
                  )}
                </span>
                <span className="font-display text-lg text-primary tabular-nums">
                  {formatScore(entry.score)}
                </span>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
