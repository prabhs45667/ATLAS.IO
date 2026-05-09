const EARTH_RADIUS_KM = 6371

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
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

export function locationScore(distanceKm: number): number {
  return Math.round(5000 * Math.exp(-distanceKm / 2000))
}

export function yearScore(guessYear: number, actualYear: number): number {
  const diff = Math.abs(guessYear - actualYear)
  return Math.max(0, 1000 - diff * 20)
}

export interface RoundScoreResult {
  locationScore: number
  yearScore: number
  totalScore: number
  distanceKm: number
  yearDiff: number
}

export function calculateRoundScore(
  guessLat: number,
  guessLng: number,
  guessYear: number,
  actualLat: number,
  actualLng: number,
  actualYear: number
): RoundScoreResult {
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
