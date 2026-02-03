"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Play, Calendar, Trophy } from "lucide-react"
import type { SavedMatch } from "@/components/scoreboard/home-screen"

type Props = {
  matches: SavedMatch[]
  onStartNewMatch: () => void
}

export function MatchesScreen({ matches, onStartNewMatch }: Props) {
  return (
    <div className="flex flex-col gap-4 p-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">試合履歴</h1>
          <p className="text-sm text-muted-foreground">
            {matches.length}試合
          </p>
        </div>
        <Button
          size="lg"
          className="h-12 px-4 bg-primary hover:bg-primary/90 text-primary-foreground"
          onClick={onStartNewMatch}
        >
          <Play className="size-5 mr-2" />
          新規試合
        </Button>
      </div>

      {/* Stats Summary */}
      {matches.length > 0 && <MatchStats matches={matches} />}

      {/* Match List */}
      <div className="flex flex-col gap-3">
        {matches.length === 0 ? (
          <Card className="bg-card/50 border-border p-8">
            <div className="text-center">
              <Trophy className="size-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-foreground font-medium mb-1">まだ試合がありません</p>
              <p className="text-sm text-muted-foreground mb-4">
                最初の試合を始めて履歴を作りましょう
              </p>
              <Button
                size="lg"
                className="h-12 px-6 bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={onStartNewMatch}
              >
                <Play className="size-5 mr-2" />
                最初の試合を開始
              </Button>
            </div>
          </Card>
        ) : (
          matches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))
        )}
      </div>
    </div>
  )
}

function MatchStats({ matches }: { matches: SavedMatch[] }) {
  const wins = matches.filter((m) => m.homeScore > m.awayScore).length
  const draws = matches.filter((m) => m.homeScore === m.awayScore).length
  const losses = matches.filter((m) => m.homeScore < m.awayScore).length
  const totalGoalsScored = matches.reduce((sum, m) => sum + m.homeScore, 0)
  const totalGoalsConceded = matches.reduce((sum, m) => sum + m.awayScore, 0)

  return (
    <Card className="bg-card/50 border-border p-4">
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-2xl font-bold text-primary">{wins}</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            勝ち
          </p>
        </div>
        <div>
          <p className="text-2xl font-bold text-muted-foreground">{draws}</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            引分
          </p>
        </div>
        <div>
          <p className="text-2xl font-bold text-destructive">{losses}</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            負け
          </p>
        </div>
      </div>
      <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-border">
        <div className="text-center">
          <p className="text-lg font-semibold text-foreground">
            {totalGoalsScored}
          </p>
          <p className="text-xs text-muted-foreground">得点</p>
        </div>
        <div className="text-muted-foreground">|</div>
        <div className="text-center">
          <p className="text-lg font-semibold text-foreground">
            {totalGoalsConceded}
          </p>
          <p className="text-xs text-muted-foreground">失点</p>
        </div>
        <div className="text-muted-foreground">|</div>
        <div className="text-center">
          <p
            className={`text-lg font-semibold ${totalGoalsScored - totalGoalsConceded >= 0 ? "text-primary" : "text-destructive"}`}
          >
            {totalGoalsScored - totalGoalsConceded >= 0 ? "+" : ""}
            {totalGoalsScored - totalGoalsConceded}
          </p>
          <p className="text-xs text-muted-foreground">得失点差</p>
        </div>
      </div>
    </Card>
  )
}

function MatchCard({ match }: { match: SavedMatch }) {
  const isWin = match.homeScore > match.awayScore
  const isDraw = match.homeScore === match.awayScore
  const isLoss = match.homeScore < match.awayScore

  return (
    <Card className="bg-card/50 border-border p-4">
      <div className="flex items-center gap-4">
        {/* Result Badge */}
        <div
          className={`flex items-center justify-center size-12 rounded-lg font-bold text-lg ${
            isWin
              ? "bg-primary/20 text-primary"
              : isDraw
                ? "bg-muted text-muted-foreground"
                : "bg-destructive/20 text-destructive"
          }`}
        >
          {isWin ? "W" : isDraw ? "D" : "L"}
        </div>

        {/* Match Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Calendar className="size-3" />
            <span>{match.date}</span>
          </div>
          <p className="font-medium text-foreground">
            {match.homeTeam} vs {match.awayTeam}
          </p>
        </div>

        {/* Score */}
        <div className="flex items-center gap-2">
          <span
            className={`text-3xl font-bold ${isWin ? "text-primary" : "text-foreground"}`}
          >
            {match.homeScore}
          </span>
          <span className="text-xl text-muted-foreground">-</span>
          <span className="text-3xl font-bold text-foreground">
            {match.awayScore}
          </span>
        </div>
      </div>
    </Card>
  )
}
