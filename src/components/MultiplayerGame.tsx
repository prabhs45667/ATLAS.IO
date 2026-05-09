'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import { connectSocket, disconnectSocket } from '@/src/lib/socket'
import { Lobby } from './Lobby'
import { WaitingRoom } from './WaitingRoom'
import { GameHUD } from './GameHUD'
import { GuessPanel } from './GuessPanel'
import { MultiplayerResults } from './MultiplayerResults'
import { MultiplayerFinal } from './MultiplayerFinal'
import { cn } from '@/src/lib/utils'
import type { Socket } from 'socket.io-client'

const PanoramaViewer = dynamic(
  () => import('./PanoramaViewer').then((mod) => mod.PanoramaViewer),
  { ssr: false }
)

const SynapticShift = dynamic(() => import('./SynapticShift'), { ssr: false })

type MultiplayerState =
  | 'connecting'
  | 'lobby'
  | 'waiting'
  | 'playing'
  | 'submitted'
  | 'results'
  | 'final'

interface Player {
  id: string
  name: string
  color: string
  totalScore: number
  connected: boolean
}

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
}

interface MultiplayerGameProps {
  onBack: () => void
}

export function MultiplayerGame({ onBack }: MultiplayerGameProps) {
  const [state, setState] = useState<MultiplayerState>('connecting')
  const [error, setError] = useState<string | null>(null)
  const socketRef = useRef<Socket | null>(null)

  const [roomCode, setRoomCode] = useState('')
  const [playerId, setPlayerId] = useState('')
  const [hostId, setHostId] = useState('')
  const [players, setPlayers] = useState<Player[]>([])
  const [maxPlayers, setMaxPlayers] = useState(4)
  const [timerSetting, setTimerSetting] = useState(30)

  const [panorama, setPanorama] = useState('')
  const [roundNumber, setRoundNumber] = useState(1)
  const [totalRounds, setTotalRounds] = useState(5)
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null)
  const [guessCount, setGuessCount] = useState(0)
  const [totalPlayers, setTotalPlayers] = useState(0)

  const [roundResults, setRoundResults] = useState<{
    location: Location
    playerResults: PlayerResult[]
    standings: Standing[]
  } | null>(null)
  const [finalStandings, setFinalStandings] = useState<Standing[]>([])

  const isHost = playerId === hostId
  const myScore = players.find((p) => p.id === playerId)?.totalScore ?? 0

  useEffect(() => {
    let mounted = true

    async function init() {
      try {
        const socket = await connectSocket()
        if (!mounted) return
        socketRef.current = socket

        socket.on('room-created', (data) => {
          setRoomCode(data.code)
          setPlayerId(data.playerId)
          setHostId(data.playerId)
          setPlayers(data.players)
          setMaxPlayers(data.config.maxPlayers)
          setTimerSetting(data.config.timer)
          setState('waiting')
        })

        socket.on('room-joined', (data) => {
          setRoomCode(data.code)
          setPlayerId(data.playerId)
          setHostId(data.hostId)
          setPlayers(data.players)
          setMaxPlayers(data.config.maxPlayers)
          setTimerSetting(data.config.timer)
          setState('waiting')
        })

        socket.on('player-joined', (data) => {
          setPlayers(data.players)
        })

        socket.on('player-left', (data) => {
          setPlayers(data.players)
        })

        socket.on('host-changed', (data) => {
          setHostId(data.hostId)
          setPlayers(data.players)
        })

        socket.on('game-started', (data) => {
          setPanorama(data.panorama)
          setRoundNumber(data.roundNumber)
          setTotalRounds(data.totalRounds)
          setSecondsLeft(data.timer > 0 ? data.timer : null)
          setPlayers(data.players)
          setGuessCount(0)
          setTotalPlayers(data.players.filter((p: Player) => p.connected).length)
          setState('playing')
        })

        socket.on('new-round', (data) => {
          setPanorama(data.panorama)
          setRoundNumber(data.roundNumber)
          setTotalRounds(data.totalRounds)
          setSecondsLeft(data.timer > 0 ? data.timer : null)
          setPlayers(data.players)
          setGuessCount(0)
          setTotalPlayers(data.players.filter((p: Player) => p.connected).length)
          setState('playing')
        })

        socket.on('timer-tick', (data) => {
          setSecondsLeft(data.secondsLeft)
        })

        socket.on('guess-acknowledged', (data) => {
          setGuessCount(data.guessCount)
          setTotalPlayers(data.totalPlayers)
        })

        socket.on('round-results', (data) => {
          setRoundResults(data)
          setPlayers((prev) =>
            prev.map((p) => {
              const standing = data.standings.find(
                (s: Standing) => s.playerId === p.id
              )
              return standing ? { ...p, totalScore: standing.totalScore } : p
            })
          )
          setState('results')
        })

        socket.on('game-over', (data) => {
          setFinalStandings(data.standings)
          setState('final')
        })

        socket.on('back-to-lobby', (data) => {
          setPlayers(data.players)
          setRoundNumber(1)
          setGuessCount(0)
          setRoundResults(null)
          setFinalStandings([])
          setState('waiting')
        })

        socket.on('error', (data) => {
          setError(data.message)
        })

        setState('lobby')
      } catch (err) {
        console.error('Failed to connect:', err)
        setError('Failed to connect to server')
      }
    }

    init()

    return () => {
      mounted = false
      disconnectSocket()
    }
  }, [])

  const handleCreateRoom = useCallback(
    (name: string, maxPlayers: number, timer: number) => {
      setError(null)
      socketRef.current?.emit('create-room', {
        playerName: name,
        maxPlayers,
        timer,
      })
    },
    []
  )

  const handleJoinRoom = useCallback((name: string, code: string) => {
    setError(null)
    socketRef.current?.emit('join-room', { code, playerName: name })
  }, [])

  const handleStartGame = useCallback(() => {
    socketRef.current?.emit('start-game')
  }, [])

  const handleSubmitGuess = useCallback((lat: number, lng: number, year: number) => {
    socketRef.current?.emit('submit-guess', { lat, lng, year })
    setState('submitted')
  }, [])

  const handleNextRound = useCallback(() => {
    socketRef.current?.emit('next-round')
  }, [])

  const handlePlayAgain = useCallback(() => {
    socketRef.current?.emit('play-again')
  }, [])

  const handleLeave = useCallback(() => {
    socketRef.current?.emit('leave-room')
    disconnectSocket()
    onBack()
  }, [onBack])

  const showShaderBg = state === 'connecting' || state === 'lobby' || state === 'waiting' || state === 'final'

  const shaderBackground = showShaderBg ? (
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
  ) : null

  if (state === 'connecting') {
    return (
      <>
        {shaderBackground}
        <div className="min-h-screen flex items-center justify-center relative z-10">
          <div className="text-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="label mt-4">Connecting</p>
          </div>
        </div>
      </>
    )
  }

  if (state === 'lobby') {
    return (
      <>
        {shaderBackground}
        <Lobby
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          onBack={onBack}
          error={error}
        />
      </>
    )
  }

  if (state === 'waiting') {
    return (
      <>
        {shaderBackground}
        <WaitingRoom
          code={roomCode}
          players={players}
          maxPlayers={maxPlayers}
          timer={timerSetting}
          isHost={isHost}
          onStartGame={handleStartGame}
          onLeave={handleLeave}
        />
      </>
    )
  }

  if (state === 'playing' || state === 'submitted') {
    return (
      <div className="fixed inset-0">
        <PanoramaViewer src={panorama} />

        <GameHUD round={roundNumber} totalRounds={totalRounds} score={myScore} />

        {/* Timer and guess count overlay */}
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-20 text-center">
          {secondsLeft !== null && (
            <div
              className={cn(
                'font-display text-4xl tabular-nums',
                secondsLeft <= 5 ? 'timer-critical' : 'text-foreground'
              )}
            >
              {secondsLeft}
            </div>
          )}
          <p className="label mt-1">
            {guessCount}/{totalPlayers} guessed
          </p>
        </div>

        {state === 'playing' && <GuessPanel onSubmit={handleSubmitGuess} />}

        {state === 'submitted' && (
          <div className="fixed bottom-6 right-6 z-30 w-[340px] hidden md:block">
            <div className="panel p-6 text-center">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-muted/50 mt-4">
                Waiting for other players...
              </p>
            </div>
          </div>
        )}

        {state === 'submitted' && (
          <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-surface border-t border-border p-4 text-center">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-muted/50 mt-2">Waiting for others...</p>
          </div>
        )}
      </div>
    )
  }

  if (state === 'results' && roundResults) {
    return (
      <MultiplayerResults
        location={roundResults.location}
        playerResults={roundResults.playerResults}
        standings={roundResults.standings}
        isHost={isHost}
        isLastRound={roundNumber >= totalRounds}
        onNext={handleNextRound}
      />
    )
  }

  if (state === 'final') {
    return (
      <>
        {shaderBackground}
        <MultiplayerFinal
          standings={finalStandings}
          currentPlayerId={playerId}
          isHost={isHost}
          onPlayAgain={handlePlayAgain}
          onLeave={handleLeave}
        />
      </>
    )
  }

  return null
}
