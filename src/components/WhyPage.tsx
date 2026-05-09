'use client'

interface WhyPageProps {
  onBack: () => void
}

export function WhyPage({ onBack }: WhyPageProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <div className="max-w-2xl w-full text-center relative z-10">
        {/* Ornament */}
        <div className="ornament reveal">
          <div className="ornament-diamond" />
        </div>

        {/* Heading */}
        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-[0.2em] uppercase text-foreground mt-10 reveal-delayed-1">
          The Problem
        </h1>

        {/* Statement */}
        <p className="font-display text-xl md:text-2xl tracking-[0.14em] uppercase text-primary mt-6 reveal-delayed-2">
          Humans don&apos;t learn from history.
        </p>

        {/* Supporting text */}
        <p className="text-sm text-muted/60 mt-8 leading-relaxed max-w-md mx-auto reveal-delayed-3">
          This game is a closed loop to help humans step into the world of our
          past and not make the same mistakes again.
        </p>

        {/* Back button */}
        <button
          onClick={onBack}
          className="mt-12 px-12 py-3.5 border border-border text-foreground font-display font-semibold tracking-[0.18em] uppercase text-xs hover:border-primary/40 hover:text-primary transition-colors reveal-delayed-4"
        >
          Back
        </button>
      </div>
    </div>
  )
}
