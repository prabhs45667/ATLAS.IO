'use client'

interface SplashScreenProps {
  onBegin: () => void
}

export function SplashScreen({ onBegin }: SplashScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden splash-fade-in">
      <div className="max-w-md w-full text-center relative z-10">
        {/* Ornamental divider */}
        <div className="ornament splash-ornament splash-reveal-1">
          <div className="ornament-diamond" />
        </div>

        {/* Title */}
        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-[0.2em] uppercase text-foreground mt-10 splash-reveal-2">
          ATLAS.IO
        </h1>

        {/* Subtitle */}
        <p className="font-display text-lg tracking-[0.14em] uppercase text-accent mt-4 splash-reveal-3">
          Guess the place & era
        </p>

        {/* Tagline */}
        <p className="text-sm text-muted/60 mt-8 splash-reveal-4">
          Where in the world. When in time.
        </p>

        {/* Begin button */}
        <button
          onClick={onBegin}
          className="mt-12 px-12 py-3.5 bg-primary text-background font-display font-semibold tracking-[0.18em] uppercase text-xs hover:bg-primary-dim transition-colors splash-reveal-5"
        >
          Begin
        </button>
      </div>
    </div>
  )
}
