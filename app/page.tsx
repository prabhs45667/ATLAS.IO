'use client'

import { useState, useCallback, useEffect } from 'react'

const ROUND_TIME_SECONDS = 30
const LIGHTNING_TIME_SECONDS = 10
import dynamic from 'next/dynamic'
import { SplashScreen } from '@/src/components/SplashScreen'

const SynapticShift = dynamic(() => import('@/src/components/SynapticShift'), { ssr: false })
import { ModeSelect } from '@/src/components/ModeSelect'
import { GameHUD } from '@/src/components/GameHUD'
import { GuessPanel } from '@/src/components/GuessPanel'
import { ResultOverlay } from '@/src/components/ResultOverlay'
import { FinalResults } from '@/src/components/FinalResults'
import { LeaderboardPage } from '@/src/components/LeaderboardPage'
import { WhyPage } from '@/src/components/WhyPage'
import { rounds, type Round } from '@/src/data/rounds'
import { calculateRoundScore, type RoundScoreResult } from '@/src/lib/scoring'
import { shuffleArray } from '@/src/lib/utils'

const PanoramaViewer = dynamic(
  () => import('@/src/components/PanoramaViewer').then((mod) => mod.PanoramaViewer),
  { ssr: false }
)

const MultiplayerGame = dynamic(
  () => import('@/src/components/MultiplayerGame').then((mod) => mod.MultiplayerGame),
  { ssr: false }
)

type AppMode = 'splash' | 'mode-select' | 'solo' | 'multiplayer' | 'leaderboard' | 'why'
type SoloState = 'playing' | 'result' | 'final'

interface RoundResult {
  round: Round
  guessLat: number
  guessLng: number
  result: RoundScoreResult
}

export default function Home() {
  const [appMode, setAppMode] = useState<AppMode>('splash')
  const [soloState, setSoloState] = useState<SoloState>('playing')
  const [gameRounds, setGameRounds] = useState<Round[]>([])
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0)
  const [totalScore, setTotalScore] = useState(0)
  const [roundResults, setRoundResults] = useState<RoundResult[]>([])
  const [currentGuess, setCurrentGuess] = useState<{
    lat: number
    lng: number
    result: RoundScoreResult
  } | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<number>(ROUND_TIME_SECONDS)
  const [forceSubmit, setForceSubmit] = useState(false)
  const [panoramaReady, setPanoramaReady] = useState(false)
  const [roundTime, setRoundTime] = useState(ROUND_TIME_SECONDS)

  const currentRound = gameRounds[currentRoundIndex]

  // Countdown timer for solo mode rounds. Only starts after the panorama
  // image has finished loading. Resets each new round and stops once the
  // player submits (state moves from 'playing' to 'result').
  useEffect(() => {
    if (appMode !== 'solo' || soloState !== 'playing' || !panoramaReady) return

    // Reset timer to full when panorama finishes loading
    setTimeRemaining(roundTime)

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          setForceSubmit(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [appMode, soloState, currentRoundIndex, panoramaReady, roundTime])

  const handleBegin = () => {
    setAppMode('mode-select')
  }

  const DEMO_ROUND_IDS = ['06', '07', '03', '05', '08']

  const handleSolo = () => {
    const selected = shuffleArray(rounds).slice(0, 5)
    setGameRounds(selected)
    setCurrentRoundIndex(0)
    setTotalScore(0)
    setRoundResults([])
    setCurrentGuess(null)
    setSoloState('playing')
    setRoundTime(ROUND_TIME_SECONDS)
    setTimeRemaining(ROUND_TIME_SECONDS)
    setForceSubmit(false)
    setPanoramaReady(false)
    setAppMode('solo')
  }

  const handleLightning = () => {
    const selected = shuffleArray(rounds).slice(0, 5)
    setGameRounds(selected)
    setCurrentRoundIndex(0)
    setTotalScore(0)
    setRoundResults([])
    setCurrentGuess(null)
    setSoloState('playing')
    setRoundTime(LIGHTNING_TIME_SECONDS)
    setTimeRemaining(LIGHTNING_TIME_SECONDS)
    setForceSubmit(false)
    setPanoramaReady(false)
    setAppMode('solo')
  }

  const handleDemo = () => {
    const selected = DEMO_ROUND_IDS.map((id) => rounds.find((r) => r.id === id)!).filter(Boolean)
    setGameRounds(selected)
    setCurrentRoundIndex(0)
    setTotalScore(0)
    setRoundResults([])
    setCurrentGuess(null)
    setSoloState('playing')
    setRoundTime(ROUND_TIME_SECONDS)
    setTimeRemaining(ROUND_TIME_SECONDS)
    setForceSubmit(false)
    setPanoramaReady(false)
    setAppMode('solo')
  }

  const handleMultiplayer = () => {
    setAppMode('multiplayer')
  }

  const handleLeaderboard = () => {
    setAppMode('leaderboard')
  }

  const handleBackToMenu = useCallback(() => {
    setAppMode('mode-select')
  }, [])

  const handleSubmitGuess = (lat: number, lng: number, year: number) => {
    if (!currentRound) return

    const result = calculateRoundScore(
      lat,
      lng,
      year,
      currentRound.lat,
      currentRound.lng,
      currentRound.year
    )

    setCurrentGuess({ lat, lng, result })
    setTotalScore((prev) => prev + result.totalScore)
    setRoundResults((prev) => [
      ...prev,
      { round: currentRound, guessLat: lat, guessLng: lng, result },
    ])
    setSoloState('result')
  }

  const handleNextRound = () => {
    if (currentRoundIndex >= gameRounds.length - 1) {
      setSoloState('final')
    } else {
      setCurrentRoundIndex((prev) => prev + 1)
      setCurrentGuess(null)
      setSoloState('playing')
      setTimeRemaining(roundTime)
      setForceSubmit(false)
      setPanoramaReady(false)
    }
  }

  const handlePlayAgain = () => {
    setAppMode('mode-select')
  }

  // Show shader background on menu screens (splash, mode-select, leaderboard, final results)
  const showShaderBg = appMode === 'splash' || appMode === 'mode-select' || appMode === 'leaderboard' || appMode === 'why' || (appMode === 'solo' && soloState === 'final')

  // Solo gameplay (not final results)
  if (appMode === 'solo' && soloState !== 'final') {
    return (
      <div className="fixed inset-0">
        {currentRound && <PanoramaViewer src={currentRound.panorama} onLoad={() => setPanoramaReady(true)} />}

        <GameHUD
          round={currentRoundIndex + 1}
          totalRounds={gameRounds.length}
          score={totalScore}
          timeRemaining={soloState === 'playing' ? timeRemaining : null}
        />

        {soloState === 'playing' && (
          <GuessPanel
            key={currentRoundIndex}
            onSubmit={handleSubmitGuess}
            forceSubmit={forceSubmit}
          />
        )}

        {soloState === 'result' && currentRound && currentGuess && (
          <ResultOverlay
            round={currentRound}
            guessLat={currentGuess.lat}
            guessLng={currentGuess.lng}
            result={currentGuess.result}
            isLastRound={currentRoundIndex >= gameRounds.length - 1}
            onNext={handleNextRound}
          />
        )}
      </div>
    )
  }

  if (appMode === 'multiplayer') {
    return <MultiplayerGame onBack={handleBackToMenu} />
  }

  // All other screens share the shader background
  return (
    <>
      {showShaderBg && (
        <div className="fixed inset-0 z-0">
          <SynapticShift
            color="#C06A3A"
            speed={0.3}
            scale={0.5}
            intensity={1.6}
            falloff={1.18}
            complexity={12}
            breathing
          />
        </div>
      )}

      {appMode === 'splash' && <SplashScreen onBegin={handleBegin} />}

      {appMode === 'mode-select' && (
        <ModeSelect
          onSolo={handleSolo}
          onLightning={handleLightning}
          onDemo={handleDemo}
          onMultiplayer={handleMultiplayer}
          onLeaderboard={handleLeaderboard}
        />
      )}

      {appMode === 'leaderboard' && <LeaderboardPage onBack={handleBackToMenu} onWhy={() => setAppMode('why')} />}

      {appMode === 'why' && <WhyPage onBack={() => setAppMode('leaderboard')} />}

      {appMode === 'solo' && soloState === 'final' && (
        <FinalResults
          totalScore={totalScore}
          roundResults={roundResults}
          onPlayAgain={handlePlayAgain}
        />
      )}
    </>
  )
}
