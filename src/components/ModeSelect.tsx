'use client'

interface ModeSelectProps {
  onSolo: () => void
  onLightning: () => void
  onDemo: () => void
  onMultiplayer: () => void
  onLeaderboard: () => void
}

export function ModeSelect({ onSolo, onLightning, onDemo, onMultiplayer, onLeaderboard }: ModeSelectProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">

      <div className="max-w-2xl w-full text-center relative z-10">
        {/* Header */}
        <p className="label reveal">
          Select your expedition
        </p>
        <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-[0.14em] uppercase text-foreground mt-3 reveal-delayed-1">
          Choose Mode
        </h2>

        {/* Ornament */}
        <div className="ornament mt-6 reveal-delayed-2">
          <div className="ornament-diamond" />
        </div>

        {/* Mode cards */}
        <div className="grid md:grid-cols-2 gap-5 mt-10">
          {/* Solo */}
          <button
            onClick={onSolo}
            className="panel p-8 text-left surface-interactive group reveal-delayed-3"
          >
            <h3 className="font-display text-xl font-semibold tracking-[0.12em] uppercase text-foreground group-hover:text-primary transition-colors">
              Solo
            </h3>
            <p className="text-xs text-muted/70 leading-relaxed mt-3">
              Five random historic moments, 30 seconds each.
            </p>
            <p className="label mt-6">
              5 rounds — 30s per round
            </p>
          </button>

          {/* Lightning */}
          <button
            onClick={onLightning}
            className="panel p-8 text-left surface-interactive group reveal-delayed-4"
          >
            <h3 className="font-display text-xl font-semibold tracking-[0.12em] uppercase text-foreground group-hover:text-primary transition-colors">
              Lightning
            </h3>
            <p className="text-xs text-muted/70 leading-relaxed mt-3">
              Same as solo, but you only get 10 seconds per round.
            </p>
            <p className="label mt-6">
              5 rounds — 10s per round
            </p>
          </button>

          {/* Multiplayer */}
          <button
            onClick={onMultiplayer}
            className="panel p-8 text-left surface-interactive group reveal-delayed-5"
          >
            <h3 className="font-display text-xl font-semibold tracking-[0.12em] uppercase text-foreground group-hover:text-primary transition-colors">
              Multiplayer
            </h3>
            <p className="text-xs text-muted/70 leading-relaxed mt-3">
              Compete against friends in real-time with a shared room code.
            </p>
            <p className="label mt-6">
              2-6 players — optional timer
            </p>
          </button>

          {/* Demo */}
          <button
            onClick={onDemo}
            className="panel p-8 text-left surface-interactive group reveal-delayed-6"
          >
            <h3 className="font-display text-xl font-semibold tracking-[0.12em] uppercase text-foreground group-hover:text-primary transition-colors">
              Demo
            </h3>
            <p className="text-xs text-muted/70 leading-relaxed mt-3">
              A curated set of rounds in fixed order for the hackathon showcase.
            </p>
            <p className="label mt-6">
              5 rounds — 30s per round
            </p>
          </button>
        </div>

        {/* Leaderboard link */}
        <button
          onClick={onLeaderboard}
          className="mt-10 label hover:text-primary transition-colors reveal-delayed-7"
        >
          View Hall of Records
        </button>
      </div>
    </div>
  )
}
