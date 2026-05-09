const { createServer } = require('http')
const { Server } = require('socket.io')

const server = createServer()
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
})

// Scoring functions (duplicated for server-side authority)
const EARTH_RADIUS_KM = 6371

function toRadians(degrees) {
  return degrees * (Math.PI / 180)
}

function haversineDistance(lat1, lng1, lat2, lng2) {
  const dLat = toRadians(lat2 - lat1)
  const dLng = toRadians(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return EARTH_RADIUS_KM * c
}

function locationScore(distanceKm) {
  return Math.round(5000 * Math.exp(-distanceKm / 2000))
}

function yearScore(guessYear, actualYear) {
  const diff = Math.abs(guessYear - actualYear)
  return Math.max(0, 1000 - diff * 20)
}

function calculateScore(guessLat, guessLng, guessYear, actualLat, actualLng, actualYear) {
  const distanceKm = haversineDistance(guessLat, guessLng, actualLat, actualLng)
  const locScore = locationScore(distanceKm)
  const yrScore = yearScore(guessYear, actualYear)
  return {
    locationScore: locScore,
    yearScore: yrScore,
    totalScore: locScore + yrScore,
    distanceKm: Math.round(distanceKm),
    yearDiff: Math.abs(guessYear - actualYear),
  }
}

// Rounds data — shared with the frontend
const path = require('path')
const rounds = require(path.join(__dirname, '..', 'src', 'data', 'rounds.json'))

// Player colors
const PLAYER_COLORS = ['#c06040', '#6b9e78', '#c4a870', '#7a8eb5', '#b07aa0', '#8fb8a0']

// Room storage
const rooms = new Map()

// Generate room code
function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code
  do {
    code = ''
    for (let i = 0; i < 4; i++) {
      code += chars[Math.floor(Math.random() * chars.length)]
    }
  } while (rooms.has(code))
  return code
}

// Shuffle array (Fisher-Yates)
function shuffleArray(array) {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

// Get player array from room
function getPlayersArray(room) {
  return Array.from(room.players.values())
}

// Get connected players count
function getConnectedPlayersCount(room) {
  return Array.from(room.players.values()).filter(p => p.connected).length
}

// Finish round
function finishRound(room) {
  if (room.timerInterval) {
    clearInterval(room.timerInterval)
    room.timerInterval = null
  }

  const currentRound = room.rounds[room.currentRoundIndex]
  const playerResults = []

  room.players.forEach((player, socketId) => {
    const guess = room.guesses.get(socketId)
    let result

    if (guess) {
      const score = calculateScore(
        guess.lat,
        guess.lng,
        guess.year,
        currentRound.lat,
        currentRound.lng,
        currentRound.year
      )
      player.totalScore += score.totalScore
      result = {
        playerId: socketId,
        name: player.name,
        color: player.color,
        guess: { lat: guess.lat, lng: guess.lng, year: guess.year },
        ...score,
      }
    } else {
      result = {
        playerId: socketId,
        name: player.name,
        color: player.color,
        guess: null,
        locationScore: 0,
        yearScore: 0,
        totalScore: 0,
        distanceKm: null,
        yearDiff: null,
      }
    }
    playerResults.push(result)
  })

  // Sort by total score descending
  playerResults.sort((a, b) => b.totalScore - a.totalScore)

  // Calculate standings
  const standings = getPlayersArray(room)
    .sort((a, b) => b.totalScore - a.totalScore)
    .map((p, idx) => ({
      rank: idx + 1,
      playerId: Array.from(room.players.entries()).find(([, v]) => v === p)?.[0],
      name: p.name,
      color: p.color,
      totalScore: p.totalScore,
    }))

  room.roundResults.push({
    roundNumber: room.currentRoundIndex + 1,
    location: {
      city: currentRound.city,
      country: currentRound.country,
      lat: currentRound.lat,
      lng: currentRound.lng,
      year: currentRound.year,
      description: currentRound.description,
      clues: currentRound.clues,
    },
    playerResults,
  })

  room.status = 'results'
  room.guesses.clear()

  io.to(room.code).emit('round-results', {
    location: {
      city: currentRound.city,
      country: currentRound.country,
      lat: currentRound.lat,
      lng: currentRound.lng,
      year: currentRound.year,
      description: currentRound.description,
      clues: currentRound.clues,
    },
    playerResults,
    standings,
  })
}

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)

  let currentRoom = null

  socket.on('create-room', ({ playerName, maxPlayers, timer }) => {
    const code = generateRoomCode()
    const room = {
      code,
      hostId: socket.id,
      maxPlayers: maxPlayers || 4,
      timer: timer || 30,
      status: 'waiting',
      players: new Map(),
      rounds: [],
      currentRoundIndex: 0,
      guesses: new Map(),
      roundResults: [],
      timerInterval: null,
    }

    room.players.set(socket.id, {
      id: socket.id,
      name: playerName,
      color: PLAYER_COLORS[0],
      totalScore: 0,
      connected: true,
    })

    rooms.set(code, room)
    socket.join(code)
    currentRoom = code

    socket.emit('room-created', {
      code,
      playerId: socket.id,
      players: getPlayersArray(room),
      config: { maxPlayers: room.maxPlayers, timer: room.timer },
    })

    console.log(`Room ${code} created by ${playerName}`)
  })

  socket.on('join-room', ({ code, playerName }) => {
    const room = rooms.get(code.toUpperCase())

    if (!room) {
      socket.emit('error', { message: 'Room not found' })
      return
    }

    if (room.status !== 'waiting') {
      socket.emit('error', { message: 'Game already in progress' })
      return
    }

    if (room.players.size >= room.maxPlayers) {
      socket.emit('error', { message: 'Room is full' })
      return
    }

    const colorIndex = room.players.size % PLAYER_COLORS.length
    room.players.set(socket.id, {
      id: socket.id,
      name: playerName,
      color: PLAYER_COLORS[colorIndex],
      totalScore: 0,
      connected: true,
    })

    socket.join(code)
    currentRoom = code

    socket.emit('room-joined', {
      code,
      playerId: socket.id,
      hostId: room.hostId,
      players: getPlayersArray(room),
      config: { maxPlayers: room.maxPlayers, timer: room.timer },
    })

    socket.to(code).emit('player-joined', {
      players: getPlayersArray(room),
    })

    console.log(`${playerName} joined room ${code}`)
  })

  socket.on('start-game', () => {
    if (!currentRoom) return
    const room = rooms.get(currentRoom)
    if (!room || room.hostId !== socket.id) return
    if (room.players.size < 2) {
      socket.emit('error', { message: 'Need at least 2 players to start' })
      return
    }

    room.rounds = shuffleArray(rounds).slice(0, 5)
    room.currentRoundIndex = 0
    room.status = 'playing'
    room.guesses.clear()
    room.roundResults = []

    // Reset scores
    room.players.forEach((player) => {
      player.totalScore = 0
    })

    const firstRound = room.rounds[0]

    io.to(currentRoom).emit('game-started', {
      panorama: firstRound.panorama,
      roundNumber: 1,
      totalRounds: 5,
      timer: room.timer,
      players: getPlayersArray(room),
    })

    // Start timer if applicable
    if (room.timer > 0) {
      let secondsLeft = room.timer
      room.timerInterval = setInterval(() => {
        secondsLeft--
        io.to(room.code).emit('timer-tick', { secondsLeft })
        if (secondsLeft <= 0) {
          finishRound(room)
        }
      }, 1000)
    }

    console.log(`Game started in room ${currentRoom}`)
  })

  socket.on('submit-guess', ({ lat, lng, year }) => {
    if (!currentRoom) return
    const room = rooms.get(currentRoom)
    if (!room || room.status !== 'playing') return
    if (room.guesses.has(socket.id)) return

    room.guesses.set(socket.id, { lat, lng, year })

    const guessCount = room.guesses.size
    const connectedCount = getConnectedPlayersCount(room)

    io.to(currentRoom).emit('guess-acknowledged', {
      guessCount,
      totalPlayers: connectedCount,
    })

    // Check if all connected players have guessed
    let allGuessed = true
    room.players.forEach((player, id) => {
      if (player.connected && !room.guesses.has(id)) {
        allGuessed = false
      }
    })

    if (allGuessed) {
      finishRound(room)
    }
  })

  socket.on('next-round', () => {
    if (!currentRoom) return
    const room = rooms.get(currentRoom)
    if (!room || room.hostId !== socket.id) return

    room.currentRoundIndex++

    if (room.currentRoundIndex >= room.rounds.length) {
      // Game over
      room.status = 'finished'

      const standings = getPlayersArray(room)
        .sort((a, b) => b.totalScore - a.totalScore)
        .map((p, idx) => ({
          rank: idx + 1,
          playerId: Array.from(room.players.entries()).find(([, v]) => v === p)?.[0],
          name: p.name,
          color: p.color,
          totalScore: p.totalScore,
        }))

      io.to(currentRoom).emit('game-over', {
        standings,
        roundDetails: room.roundResults,
      })
    } else {
      // Next round
      room.status = 'playing'
      room.guesses.clear()

      const nextRound = room.rounds[room.currentRoundIndex]

      io.to(currentRoom).emit('new-round', {
        panorama: nextRound.panorama,
        roundNumber: room.currentRoundIndex + 1,
        totalRounds: 5,
        timer: room.timer,
        players: getPlayersArray(room),
      })

      // Start timer
      if (room.timer > 0) {
        let secondsLeft = room.timer
        room.timerInterval = setInterval(() => {
          secondsLeft--
          io.to(room.code).emit('timer-tick', { secondsLeft })
          if (secondsLeft <= 0) {
            finishRound(room)
          }
        }, 1000)
      }
    }
  })

  socket.on('play-again', () => {
    if (!currentRoom) return
    const room = rooms.get(currentRoom)
    if (!room || room.hostId !== socket.id) return

    room.status = 'waiting'
    room.rounds = []
    room.currentRoundIndex = 0
    room.guesses.clear()
    room.roundResults = []

    room.players.forEach((player) => {
      player.totalScore = 0
    })

    io.to(currentRoom).emit('back-to-lobby', {
      players: getPlayersArray(room),
    })
  })

  socket.on('leave-room', () => {
    handleDisconnect()
  })

  function handleDisconnect() {
    if (!currentRoom) return
    const room = rooms.get(currentRoom)
    if (!room) return

    const player = room.players.get(socket.id)
    if (!player) return

    if (room.status === 'waiting') {
      // Remove player entirely
      room.players.delete(socket.id)
      socket.leave(currentRoom)

      if (room.players.size === 0) {
        // Destroy room
        if (room.timerInterval) clearInterval(room.timerInterval)
        rooms.delete(currentRoom)
        console.log(`Room ${currentRoom} destroyed (empty)`)
      } else {
        // Transfer host if needed
        if (room.hostId === socket.id) {
          room.hostId = room.players.keys().next().value
          io.to(currentRoom).emit('host-changed', {
            hostId: room.hostId,
            players: getPlayersArray(room),
          })
        } else {
          io.to(currentRoom).emit('player-left', {
            players: getPlayersArray(room),
          })
        }
      }
    } else {
      // Mid-game: mark as disconnected
      player.connected = false

      // Check if all remaining connected players have guessed
      if (room.status === 'playing') {
        let allGuessed = true
        room.players.forEach((p, id) => {
          if (p.connected && !room.guesses.has(id)) {
            allGuessed = false
          }
        })
        if (allGuessed && room.guesses.size > 0) {
          finishRound(room)
        }
      }

      // Transfer host if needed
      if (room.hostId === socket.id) {
        const connectedPlayer = Array.from(room.players.entries()).find(
          ([, p]) => p.connected
        )
        if (connectedPlayer) {
          room.hostId = connectedPlayer[0]
          io.to(currentRoom).emit('host-changed', {
            hostId: room.hostId,
            players: getPlayersArray(room),
          })
        }
      }

      io.to(currentRoom).emit('player-left', {
        players: getPlayersArray(room),
      })

      // Check if room is empty
      const connectedCount = getConnectedPlayersCount(room)
      if (connectedCount === 0) {
        if (room.timerInterval) clearInterval(room.timerInterval)
        rooms.delete(currentRoom)
        console.log(`Room ${currentRoom} destroyed (all disconnected)`)
      }
    }

    currentRoom = null
  }

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
    handleDisconnect()
  })
})

const PORT = process.env.PORT || process.env.SOCKET_PORT || 3001
server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`)
})
