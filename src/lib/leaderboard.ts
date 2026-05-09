import { createClient } from '@/lib/supabase/client'

export interface LeaderboardEntry {
  id: string
  player_name: string
  score: number
  rounds_played: number
  created_at: string
}

export async function submitScore(
  playerName: string,
  score: number,
  roundsPlayed: number,
): Promise<{ entry: LeaderboardEntry | null; error: string | null }> {
  const supabase = createClient()
  const trimmed = playerName.trim().slice(0, 32)
  if (!trimmed) {
    return { entry: null, error: 'Name is required' }
  }

  const { data, error } = await supabase
    .from('leaderboard')
    .insert({
      player_name: trimmed,
      score,
      rounds_played: roundsPlayed,
    })
    .select()
    .single()

  if (error) {
    return { entry: null, error: error.message }
  }
  return { entry: data as LeaderboardEntry, error: null }
}

export async function fetchTopScores(limit = 25): Promise<LeaderboardEntry[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('leaderboard')
    .select('*')
    .order('score', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(limit)

  if (error || !data) return []
  return data as LeaderboardEntry[]
}

export async function getRank(score: number): Promise<number> {
  const supabase = createClient()
  const { count } = await supabase
    .from('leaderboard')
    .select('*', { count: 'exact', head: true })
    .gt('score', score)
  return (count ?? 0) + 1
}
