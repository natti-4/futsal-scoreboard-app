"use client";

import React from "react";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Minus,
  Plus,
  Camera,
  ImageIcon,
  Check,
  AlertCircle,
} from "lucide-react";
import type { MatchData, Player } from "@/app/page";

type Props = {
  matchData: MatchData;
  updateMatchData: (updates: Partial<MatchData>) => void;
  onGenerateCard: () => void;
};

export function PostMatchScreen({
  matchData,
  updateMatchData,
  onGenerateCard,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalPlayerGoals = matchData.players.reduce(
    (sum, p) => sum + p.goals,
    0,
  );
  const goalsToAssign = matchData.homeScore - totalPlayerGoals;

  const updateScore = (team: "home" | "away", delta: number) => {
    if (team === "home") {
      updateMatchData({
        homeScore: Math.max(0, matchData.homeScore + delta),
      });
    } else {
      updateMatchData({
        awayScore: Math.max(0, matchData.awayScore + delta),
      });
    }
  };

  const updatePlayerGoals = (playerId: string, delta: number) => {
    const newPlayers = matchData.players.map((p) =>
      p.id === playerId ? { ...p, goals: Math.max(0, p.goals + delta) } : p,
    );
    updateMatchData({ players: newPlayers });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateMatchData({ matchPhoto: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 pb-24">
      {/* Score Input */}
      <Card className="bg-card/50 border-border p-6">
        <h2 className="text-center text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          最終スコア
        </h2>
        <div className="flex items-center justify-between">
          {/* Home Score */}
          <div className="flex-1 flex flex-col items-center gap-2">
            <p className="text-sm text-muted-foreground font-medium">
              {matchData.homeTeam}
            </p>
            <div className="flex items-center gap-3">
              <Button
                size="icon"
                variant="outline"
                className="size-12 rounded-full bg-transparent"
                onClick={() => updateScore("home", -1)}
              >
                <Minus className="size-5" />
              </Button>
              <span className="text-6xl font-bold text-primary w-20 text-center">
                {matchData.homeScore}
              </span>
              <Button
                size="icon"
                variant="outline"
                className="size-12 rounded-full bg-transparent"
                onClick={() => updateScore("home", 1)}
              >
                <Plus className="size-5" />
              </Button>
            </div>
          </div>

          <div className="text-3xl font-bold text-muted-foreground">-</div>

          {/* Away Score */}
          <div className="flex-1 flex flex-col items-center gap-2">
            <p className="text-sm text-muted-foreground font-medium">
              {matchData.awayTeam}
            </p>
            <div className="flex items-center gap-3">
              <Button
                size="icon"
                variant="outline"
                className="size-12 rounded-full bg-transparent"
                onClick={() => updateScore("away", -1)}
              >
                <Minus className="size-5" />
              </Button>
              <span className="text-6xl font-bold text-foreground w-20 text-center">
                {matchData.awayScore}
              </span>
              <Button
                size="icon"
                variant="outline"
                className="size-12 rounded-full bg-transparent"
                onClick={() => updateScore("away", 1)}
              >
                <Plus className="size-5" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Goal Assignment */}
      <Card className="bg-card/50 border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            ゴールを割り当て
          </h3>
          <Badge
            variant={goalsToAssign === 0 ? "default" : "secondary"}
            className={`${
              goalsToAssign === 0
                ? "bg-primary text-primary-foreground"
                : "bg-accent/20 text-accent"
            }`}
          >
            {goalsToAssign === 0 ? (
              <>
                <Check className="size-3 mr-1" />
                完了
              </>
            ) : (
              <>
                <AlertCircle className="size-3 mr-1" />
                残り{Math.abs(goalsToAssign)}ゴール
                {goalsToAssign < 0 ? "超過" : ""}
              </>
            )}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {matchData.players.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              onIncrement={() => updatePlayerGoals(player.id, 1)}
              onDecrement={() => updatePlayerGoals(player.id, -1)}
            />
          ))}
        </div>
      </Card>

      {/* Photo Upload */}
      <Card className="bg-card/50 border-border p-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          試合写真
        </h3>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhotoUpload}
        />
        {matchData.matchPhoto ? (
          <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
            <img
              src={matchData.matchPhoto || "/placeholder.svg"}
              alt="Match photo"
              className="w-full h-full object-cover"
            />
            <Button
              size="sm"
              variant="secondary"
              className="absolute bottom-2 right-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="size-4 mr-1" />
              変更
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            className="w-full h-32 flex flex-col gap-2 border-dashed bg-transparent"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon className="size-8 text-muted-foreground" />
            <span className="text-muted-foreground">写真をアップロード</span>
          </Button>
        )}
      </Card>

      {/* Generate Card Button */}
      <Button
        size="lg"
        className="h-16 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground"
        onClick={onGenerateCard}
      >
        結果カードを作成
      </Button>
    </div>
  );
}

function PlayerCard({
  player,
  onIncrement,
  onDecrement,
}: {
  player: Player;
  onIncrement: () => void;
  onDecrement: () => void;
}) {
  return (
    <div
      className={`flex items-center gap-2 p-3 rounded-lg border transition-all cursor-pointer ${
        player.goals > 0
          ? "bg-primary/10 border-primary/50"
          : "bg-muted/30 border-border hover:border-muted-foreground/30"
      }`}
      onClick={onIncrement}
    >
      <div className="flex items-center justify-center size-10 rounded-full bg-muted text-foreground font-bold text-sm">
        {player.number}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">{player.name}</p>
        {player.goals > 0 && (
          <p className="text-xs text-primary font-semibold">
            {player.goals}ゴール
          </p>
        )}
      </div>
      {player.goals > 0 && (
        <Button
          size="icon"
          variant="ghost"
          className="size-8 shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            onDecrement();
          }}
        >
          <Minus className="size-4" />
        </Button>
      )}
    </div>
  );
}
