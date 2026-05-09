'use client'

import { Leaderboard } from './Leaderboard'

interface LeaderboardPageProps {
  onBack: () => void
  onWhy: () => void
}

export function LeaderboardPage({ onBack, onWhy }: LeaderboardPageProps) {
  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-12 relative overflow-hidden">

      <div className="max-w-xl w-full relative z-10">
        <div className="text-center reveal mt-4">
          <p className="label">Solo Mode</p>
          <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-[0.14em] uppercase text-foreground mt-3">
            Hall of Records
          </h2>
        </div>

        <div className="ornament my-8 reveal-delayed-1">
          <div className="ornament-diamond" />
        </div>

        <div className="reveal-delayed-2">
          <Leaderboard limit={50} />
        </div>

        <button
          onClick={onBack}
          className="w-full mt-8 py-3.5 border border-border text-foreground font-display font-semibold tracking-[0.15em] uppercase text-xs hover:border-primary/40 hover:text-primary transition-colors reveal-delayed-3"
        >
          Back to Menu
        </button>

        <button
          onClick={onWhy}
          className="w-full mt-4 py-3.5 border border-border text-foreground font-display font-semibold tracking-[0.15em] uppercase text-xs hover:border-primary/40 hover:text-primary transition-colors reveal-delayed-4"
        >
          Why We Built This
        </button>
      </div>
    </div>
  )
}
