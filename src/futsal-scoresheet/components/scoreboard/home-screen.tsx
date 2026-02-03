"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Trophy, ChevronRight, Calendar } from "lucide-react";
import type { Player, MatchData } from "@/app/page";

export type SavedMatch = {
  id: string | number;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  date: string;
};

type Props = {
  teamName: string;
  teamColor?: string;
  players: Player[];
  recentMatches: SavedMatch[];
  onStartNewMatch: () => void;
  onViewAllMatches: () => void;
};

export function HomeScreen({
  teamName,
  teamColor = "#3b82f6",
  players,
  recentMatches,
  onStartNewMatch,
  onViewAllMatches,
}: Props) {
  // Get top 3 scorers from all players
  const topScorers = [...players]
    .filter((p) => p.totalGoals > 0)
    .sort((a, b) => b.totalGoals - a.totalGoals)
    .slice(0, 3);

  return (
    <div className="flex flex-col gap-6 p-4 pb-24">
      {/* Hero Section with Start Match */}
      <div
        className="relative overflow-hidden rounded-2xl via-card to-card border p-6"
        style={{
          background: `linear-gradient(to bottom right, ${teamColor}20, var(--card), var(--card))`,
          borderColor: `${teamColor}50`,
        }}
      >
        <div
          className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl"
          style={{ backgroundColor: `${teamColor}20` }}
        />
        <div className="relative">
          <h1 className="text-2xl font-bold text-foreground mb-1">
            {teamName}
          </h1>
          <p className="text-muted-foreground mb-6">試合を始めよう</p>
          <Button
            size="lg"
            className="h-14 px-8 text-lg font-bold text-white hover:opacity-90"
            style={{ backgroundColor: teamColor }}
            onClick={onStartNewMatch}
          >
            <Play className="size-6 mr-2" />
            新しい試合を開始
          </Button>
        </div>
      </div>

      {/* Recent Matches Section */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            最近の試合
          </h2>
          {recentMatches.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-primary hover:text-primary/80"
              onClick={onViewAllMatches}
            >
              すべて見る
              <ChevronRight className="size-4 ml-1" />
            </Button>
          )}
        </div>

        {recentMatches.length === 0 ? (
          <Card className="bg-card/50 border-border p-6">
            <div className="text-center">
              <Calendar className="size-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">
                まだ試合がありません
              </p>
              <p className="text-muted-foreground/60 text-xs mt-1">
                最初の試合を始めて結果を記録しましょう
              </p>
            </div>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {recentMatches.slice(0, 3).map((match) => (
              <MatchMiniCard
                key={match.id}
                match={match}
                teamColor={teamColor}
              />
            ))}
          </div>
        )}
      </section>

      {/* Team Leaderboard Section */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="size-4 text-accent" />
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            得点ランキング
          </h2>
        </div>

        <Card className="bg-card/50 border-border overflow-hidden">
          {topScorers.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-muted-foreground text-sm">
                まだゴールがありません
              </p>
              <p className="text-muted-foreground/60 text-xs mt-1">
                試合をしてランキングを作りましょう
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {topScorers.map((player, index) => (
                <LeaderboardRow
                  key={player.id}
                  rank={index + 1}
                  player={player}
                />
              ))}
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}

function MatchMiniCard({
  match,
  teamColor = "#3b82f6",
}: {
  match: SavedMatch;
  teamColor?: string;
}) {
  const isWin = match.homeScore > match.awayScore;
  const isDraw = match.homeScore === match.awayScore;

  return (
    <Card className="bg-card/50 border-border p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded ${
                isWin
                  ? ""
                  : isDraw
                    ? "bg-muted text-muted-foreground"
                    : "bg-destructive/20 text-destructive"
              }`}
              style={
                isWin
                  ? { backgroundColor: `${teamColor}30`, color: teamColor }
                  : undefined
              }
            >
              {isWin ? "W" : isDraw ? "D" : "L"}
            </span>
            <span className="text-xs text-muted-foreground">{match.date}</span>
          </div>
          <p className="text-sm font-medium text-foreground">
            {match.homeTeam} vs {match.awayTeam}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <span
            className={`text-2xl font-bold ${isWin ? "" : "text-foreground"}`}
            style={isWin ? { color: teamColor } : undefined}
          >
            {match.homeScore}
          </span>
          <span className="text-lg text-muted-foreground">-</span>
          <span className="text-2xl font-bold text-foreground">
            {match.awayScore}
          </span>
        </div>
      </div>
    </Card>
  );
}

function LeaderboardRow({
  rank,
  player,
}: {
  rank: number;
  player: Player & { totalGoals: number };
}) {
  const getMedalColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "text-yellow-400";
      case 2:
        return "text-gray-400";
      case 3:
        return "text-amber-600";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="flex items-center gap-4 p-4">
      <div
        className={`text-xl font-bold w-6 text-center ${getMedalColor(rank)}`}
      >
        {rank}
      </div>
      <div className="flex items-center justify-center size-10 rounded-full bg-muted text-foreground font-bold text-sm">
        {player.number}
      </div>
      <div className="flex-1">
        <p className="font-medium text-foreground">{player.name}</p>
      </div>
      <div className="text-right">
        <p className="text-xl font-bold text-primary">{player.totalGoals}</p>
        <p className="text-xs text-muted-foreground">ゴール</p>
      </div>
    </div>
  );
}
