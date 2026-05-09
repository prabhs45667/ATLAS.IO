import roundsData from './rounds.json'

export interface Round {
  id: string
  panorama: string
  lat: number
  lng: number
  year: number
  city: string
  country: string
  description?: string
  clues?: string[]
}

export const rounds: Round[] = roundsData
