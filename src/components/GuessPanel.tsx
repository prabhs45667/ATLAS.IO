'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { cn } from '@/src/lib/utils'

const GuessMap = dynamic(
  () => import('./GuessMap').then((mod) => mod.GuessMap),
  { ssr: false }
)

interface GuessPanelProps {
  onSubmit: (lat: number, lng: number, year: number) => void
  forceSubmit?: boolean
}

const MIN_YEAR = -3000
const MAX_YEAR = 2025

function formatYear(year: number): string {
  if (year < 0) {
    return `${Math.abs(year)} BC`
  } else if (year < 1000) {
    return `${year} AD`
  }
  return String(year)
}

function parseYearInput(input: string): number | null {
  const trimmed = input.trim().toUpperCase()

  const bcMatch = trimmed.match(/^(\d+)\s*(BC|BCE)$/i)
  if (bcMatch) {
    const value = -Math.abs(parseInt(bcMatch[1], 10))
    return value >= MIN_YEAR ? value : null
  }

  const adMatch = trimmed.match(/^(\d+)\s*(AD|CE)?$/i)
  if (adMatch) {
    const value = parseInt(adMatch[1], 10)
    return value <= MAX_YEAR ? value : null
  }

  return null
}

export function GuessPanel({ onSubmit, forceSubmit }: GuessPanelProps) {
  const [guessLat, setGuessLat] = useState<number | null>(null)
  const [guessLng, setGuessLng] = useState<number | null>(null)
  const [year, setYear] = useState(1000)
  const [yearInput, setYearInput] = useState('1000')
  const [expanded, setExpanded] = useState(false)
  const submittedRef = useRef(false)

  const handleGuess = useCallback((lat: number, lng: number) => {
    setGuessLat(lat)
    setGuessLng(lng)
  }, [])

  const handleSubmit = () => {
    if (submittedRef.current) return
    if (guessLat !== null && guessLng !== null) {
      submittedRef.current = true
      onSubmit(guessLat, guessLng, year)
    }
  }

  useEffect(() => {
    if (!forceSubmit || submittedRef.current) return
    submittedRef.current = true
    const lat = guessLat ?? 0
    const lng = guessLng ?? 0
    onSubmit(lat, lng, year)
  }, [forceSubmit, guessLat, guessLng, year, onSubmit])

  const hasPin = guessLat !== null && guessLng !== null

  const yearControls = (
    <>
      <div className="flex items-center justify-between mb-3">
        <span className="label">Year</span>
        <input
          type="text"
          value={yearInput}
          onChange={(e) => {
            setYearInput(e.target.value)
            const parsed = parseYearInput(e.target.value)
            if (parsed !== null) {
              setYear(parsed)
            }
          }}
          onBlur={() => setYearInput(formatYear(year))}
          placeholder="e.g. 117 AD, 500 BC"
          className="w-28 px-2 py-1 text-right font-display text-lg text-primary tabular-nums bg-surface-light border border-border focus:border-primary focus:outline-none"
        />
      </div>
      <input
        type="range"
        min={MIN_YEAR}
        max={MAX_YEAR}
        step={1}
        value={year}
        onChange={(e) => {
          const val = Number(e.target.value)
          setYear(val)
          setYearInput(formatYear(val))
        }}
        className="w-full"
      />
      <div className="flex justify-between mt-1.5">
        <span className="text-[10px] text-muted/30">3000 BC</span>
        <span className="text-[10px] text-muted/30">1000 AD</span>
        <span className="text-[10px] text-muted/30">2025</span>
      </div>
    </>
  )

  const submitButton = (
    <button
      onClick={handleSubmit}
      disabled={!hasPin}
      className={cn(
        'w-full py-3.5 font-display font-semibold tracking-[0.15em] uppercase text-xs transition-colors',
        hasPin
          ? 'bg-primary text-background hover:bg-primary-dim'
          : 'bg-surface-light text-muted/50 cursor-not-allowed'
      )}
    >
      {hasPin ? 'Submit Guess' : 'Place your pin on the map'}
    </button>
  )

  return (
    <>
      {/* Desktop panel */}
      <div className="hidden md:block fixed bottom-6 right-6 z-30 w-[340px]">
        <div className="panel shadow-2xl shadow-background/50">
          <div className="h-44">
            <GuessMap onGuess={handleGuess} guessLat={guessLat} guessLng={guessLng} />
          </div>
          <div className="p-4 border-t border-border">
            {yearControls}
          </div>
          <div className="p-4 pt-0">
            {submitButton}
          </div>
        </div>
      </div>

      {/* Mobile panel */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30">
        {expanded && (
          <div className="bg-surface border-t border-border">
            <div className="h-48">
              <GuessMap onGuess={handleGuess} guessLat={guessLat} guessLng={guessLng} />
            </div>
            <div className="p-4 border-t border-border">
              {yearControls}
            </div>
            <div className="p-4 pt-0">
              {submitButton}
            </div>
          </div>
        )}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full py-3.5 bg-primary text-background font-display font-semibold tracking-[0.15em] uppercase text-xs"
        >
          {expanded ? 'Hide Map' : 'Make Your Guess'}
        </button>
      </div>
    </>
  )
}
