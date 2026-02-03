"use client"

import useSWR, { mutate } from "swr"
import { createClient } from "@/lib/supabase/client"

// Types
export type Player = {
  id: string
  name: string
  number: number
  is_active: boolean
  total_goals: number
  created_at: string
}

export type Match = {
  id: string
  self_score: number
  opponent_score: number
  opponent_name: string
  match_date: string
  duration_seconds: number
  photo_url: string | null
  created_at: string
}

export type MatchEvent = {
  id: string
  match_id: string
  event_type: "goal" | "foul" | "substitution"
  team: "self" | "opponent"
  player_id: string | null
  minute: number
  created_at: string
}

export type MatchScorer = {
  id: string
  match_id: string
  player_id: string
  goals: number
  player?: Player
}

const supabase = createClient()

// Fetchers
const fetchPlayers = async (): Promise<Player[]> => {
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .order("number", { ascending: true })
  
  if (error) throw error
  return data || []
}

const fetchMatches = async (): Promise<Match[]> => {
  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .order("match_date", { ascending: false })
  
  if (error) throw error
  return data || []
}

const fetchMatchScorers = async (matchId: string): Promise<MatchScorer[]> => {
  const { data, error } = await supabase
    .from("match_scorers")
    .select("*, player:players(*)")
    .eq("match_id", matchId)
  
  if (error) throw error
  return data || []
}

// Hooks
export function usePlayers() {
  const { data, error, isLoading } = useSWR("players", fetchPlayers)
  
  return {
    players: data || [],
    isLoading,
    error,
  }
}

export function useActivePlayers() {
  const { players, isLoading, error } = usePlayers()
  
  return {
    players: players.filter(p => p.is_active),
    isLoading,
    error,
  }
}

export function useMatches() {
  const { data, error, isLoading } = useSWR("matches", fetchMatches)
  
  return {
    matches: data || [],
    isLoading,
    error,
  }
}

export function useMatchScorers(matchId: string | null) {
  const { data, error, isLoading } = useSWR(
    matchId ? `match-scorers-${matchId}` : null,
    () => matchId ? fetchMatchScorers(matchId) : []
  )
  
  return {
    scorers: data || [],
    isLoading,
    error,
  }
}

export function useLeaderboard() {
  const { players, isLoading, error } = usePlayers()
  
  const leaderboard = [...players]
    .filter(p => p.total_goals > 0)
    .sort((a, b) => b.total_goals - a.total_goals)
    .slice(0, 10)
  
  return {
    leaderboard,
    isLoading,
    error,
  }
}

// Mutations
export async function createPlayer(name: string, number: number): Promise<Player> {
  const { data, error } = await supabase
    .from("players")
    .insert({ name, number, is_active: true, total_goals: 0 })
    .select()
    .single()
  
  if (error) throw error
  mutate("players")
  return data
}

export async function updatePlayer(
  id: string, 
  updates: Partial<Pick<Player, "name" | "number" | "is_active">>
): Promise<Player> {
  const { data, error } = await supabase
    .from("players")
    .update(updates)
    .eq("id", id)
    .select()
    .single()
  
  if (error) throw error
  mutate("players")
  return data
}

export async function deletePlayer(id: string): Promise<void> {
  const { error } = await supabase
    .from("players")
    .delete()
    .eq("id", id)
  
  if (error) throw error
  mutate("players")
}

export async function createMatch(matchData: {
  self_score: number
  opponent_score: number
  opponent_name: string
  match_date: string
  duration_seconds: number
  photo_url?: string | null
  scorers: { player_id: string; goals: number }[]
}): Promise<Match> {
  // Insert match
  const { data: match, error: matchError } = await supabase
    .from("matches")
    .insert({
      self_score: matchData.self_score,
      opponent_score: matchData.opponent_score,
      opponent_name: matchData.opponent_name,
      match_date: matchData.match_date,
      duration_seconds: matchData.duration_seconds,
      photo_url: matchData.photo_url || null,
    })
    .select()
    .single()
  
  if (matchError) throw matchError
  
  // Insert scorers
  if (matchData.scorers.length > 0) {
    const scorersToInsert = matchData.scorers
      .filter(s => s.goals > 0)
      .map(s => ({
        match_id: match.id,
        player_id: s.player_id,
        goals: s.goals,
      }))
    
    if (scorersToInsert.length > 0) {
      const { error: scorersError } = await supabase
        .from("match_scorers")
        .insert(scorersToInsert)
      
      if (scorersError) throw scorersError
      
      // Update player total goals
      for (const scorer of scorersToInsert) {
        await supabase.rpc("increment_player_goals", {
          player_id_param: scorer.player_id,
          goals_to_add: scorer.goals,
        })
      }
    }
  }
  
  mutate("players")
  mutate("matches")
  return match
}

export async function deleteMatch(id: string): Promise<void> {
  // First get the scorers to decrement player goals
  const { data: scorers } = await supabase
    .from("match_scorers")
    .select("player_id, goals")
    .eq("match_id", id)
  
  // Decrement player goals
  if (scorers) {
    for (const scorer of scorers) {
      await supabase.rpc("decrement_player_goals", {
        player_id_param: scorer.player_id,
        goals_to_subtract: scorer.goals,
      })
    }
  }
  
  // Delete match (cascade will delete scorers)
  const { error } = await supabase
    .from("matches")
    .delete()
    .eq("id", id)
  
  if (error) throw error
  mutate("players")
  mutate("matches")
}

// Convenience function to save a match with scorer data
export async function saveMatch(
  homeTeam: string,
  awayTeam: string,
  homeScore: number,
  awayScore: number,
  scorers: { playerId: string | number; goals: number }[]
): Promise<Match> {
  return createMatch({
    self_score: homeScore,
    opponent_score: awayScore,
    opponent_name: awayTeam,
    match_date: new Date().toISOString(),
    duration_seconds: 0,
    scorers: scorers.map(s => ({ player_id: String(s.playerId), goals: s.goals })),
  })
}

// Increment goals for a player
export async function incrementGoals(playerId: string | number, goals: number): Promise<void> {
  await supabase.rpc("increment_player_goals", {
    player_id_param: String(playerId),
    goals_to_add: goals,
  })
  mutate("players")
}

// Helper to refresh players data
export function mutatePlayers() {
  mutate("players")
}

// Helper to refresh matches data
export function mutateMatches() {
  mutate("matches")
}
