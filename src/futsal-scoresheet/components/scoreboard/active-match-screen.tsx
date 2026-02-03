"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Goal,
  AlertTriangle,
  ArrowRightLeft,
  Undo2,
  Play,
  Pause,
  RotateCcw,
  Check,
  X,
  Pencil,
} from "lucide-react";
import type { MatchData, MatchEvent } from "@/app/page";

type Props = {
  matchData: MatchData;
  updateMatchData: (updates: Partial<MatchData>) => void;
};

export function ActiveMatchScreen({ matchData, updateMatchData }: Props) {
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isEditingOpponent, setIsEditingOpponent] = useState(false);
  const [opponentDraft, setOpponentDraft] = useState(matchData.awayTeam);

  useEffect(() => {
    if (!isEditingOpponent) setOpponentDraft(matchData.awayTeam);
  }, [matchData.awayTeam, isEditingOpponent]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getCurrentTime = () => formatTime(timerSeconds);

  const addEvent = useCallback(
    (type: MatchEvent["type"], team: "home" | "away") => {
      const newEvent: MatchEvent = {
        id: Date.now(),
        type,
        team,
        time: getCurrentTime(),
      };

      const updates: Partial<MatchData> = {
        events: [newEvent, ...matchData.events],
      };

      if (type === "goal") {
        if (team === "home") {
          updates.homeScore = matchData.homeScore + 1;
        } else {
          updates.awayScore = matchData.awayScore + 1;
        }
      } else if (type === "foul") {
        if (team === "home") {
          updates.homeFouls = matchData.homeFouls + 1;
        } else {
          updates.awayFouls = matchData.awayFouls + 1;
        }
      }

      updateMatchData(updates);
    },
    [matchData, updateMatchData, timerSeconds],
  );

  const undoLastEvent = () => {
    if (matchData.events.length === 0) return;

    const lastEvent = matchData.events[0];
    const updates: Partial<MatchData> = {
      events: matchData.events.slice(1),
    };

    if (lastEvent.type === "goal") {
      if (lastEvent.team === "home") {
        updates.homeScore = Math.max(0, matchData.homeScore - 1);
      } else {
        updates.awayScore = Math.max(0, matchData.awayScore - 1);
      }
    } else if (lastEvent.type === "foul") {
      if (lastEvent.team === "home") {
        updates.homeFouls = Math.max(0, matchData.homeFouls - 1);
      } else {
        updates.awayFouls = Math.max(0, matchData.awayFouls - 1);
      }
    }

    updateMatchData(updates);
  };

  const resetTimer = () => {
    setTimerSeconds(0);
    setIsRunning(false);
  };

  const getEventIcon = (type: MatchEvent["type"]) => {
    switch (type) {
      case "goal":
        return <Goal className="size-4 text-primary" />;
      case "foul":
        return <AlertTriangle className="size-4 text-accent" />;
      case "sub":
        return <ArrowRightLeft className="size-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 pb-24">
      {/* Timer & Score Header */}
      <Card className="bg-card/50 border-border p-4">
        {/* Timer */}
        <div className="text-center mb-4">
          <div className="text-6xl font-mono font-bold text-foreground tracking-wider">
            {formatTime(timerSeconds)}
          </div>
          <div className="flex justify-center gap-2 mt-3">
            <Button
              size="icon"
              variant={isRunning ? "secondary" : "default"}
              onClick={() => setIsRunning(!isRunning)}
              className="size-12"
            >
              {isRunning ? (
                <Pause className="size-6" />
              ) : (
                <Play className="size-6" />
              )}
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={resetTimer}
              className="size-12 bg-transparent"
            >
              <RotateCcw className="size-5" />
            </Button>
          </div>
        </div>

        {/* Score Display */}
        <div className="flex items-center justify-between">
          <div className="flex-1 text-center">
            <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide">
              {matchData.homeTeam}
            </p>
            <p className="text-7xl font-bold text-foreground">
              {matchData.homeScore}
            </p>
            <p className="text-sm text-accent font-medium">
              ファウル: {matchData.homeFouls}/5
            </p>
          </div>
          <div className="text-3xl font-bold text-muted-foreground px-4">-</div>
          <div className="flex-1 text-center">
            {!isEditingOpponent ? (
              <button
                type="button"
                className="inline-flex items-center justify-center gap-1 text-sm text-muted-foreground font-medium uppercase tracking-wide hover:text-foreground transition-colors"
                onClick={() => setIsEditingOpponent(true)}
              >
                {matchData.awayTeam}
                <Pencil className="size-3 opacity-70" />
              </button>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Input
                  value={opponentDraft}
                  onChange={(e) => setOpponentDraft(e.target.value)}
                  className="h-8 w-36 text-sm bg-background/50"
                  autoFocus
                />
                <Button
                  size="icon"
                  variant="secondary"
                  className="size-8"
                  onClick={() => {
                    const next = opponentDraft.trim();
                    if (next) updateMatchData({ awayTeam: next });
                    setIsEditingOpponent(false);
                  }}
                  aria-label="Save opponent name"
                >
                  <Check className="size-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  className="size-8 bg-transparent"
                  onClick={() => {
                    setOpponentDraft(matchData.awayTeam);
                    setIsEditingOpponent(false);
                  }}
                  aria-label="Cancel opponent name edit"
                >
                  <X className="size-4" />
                </Button>
              </div>
            )}
            <p className="text-7xl font-bold text-foreground">
              {matchData.awayScore}
            </p>
            <p className="text-sm text-accent font-medium">
              ファウル: {matchData.awayFouls}/5
            </p>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        {/* Home Team Actions */}
        <div className="flex flex-col gap-3">
          <p className="text-center text-sm font-medium text-muted-foreground uppercase tracking-wider">
            {matchData.homeTeam}
          </p>
          <Button
            size="lg"
            className="h-20 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={() => addEvent("goal", "home")}
          >
            <Goal className="size-6 mr-2" />
            ゴール
          </Button>
          <Button
            size="lg"
            variant="secondary"
            className="h-16 text-base font-semibold bg-accent hover:bg-accent/90 text-accent-foreground"
            onClick={() => addEvent("foul", "home")}
          >
            <AlertTriangle className="size-5 mr-2" />
            ファウル
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-14 text-base bg-transparent"
            onClick={() => addEvent("sub", "home")}
          >
            <ArrowRightLeft className="size-5 mr-2" />
            交代
          </Button>
        </div>

        {/* Away Team Actions */}
        <div className="flex flex-col gap-3">
          <p className="text-center text-sm font-medium text-muted-foreground uppercase tracking-wider">
            {matchData.awayTeam}
          </p>
          <Button
            size="lg"
            className="h-20 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={() => addEvent("goal", "away")}
          >
            <Goal className="size-6 mr-2" />
            ゴール
          </Button>
          <Button
            size="lg"
            variant="secondary"
            className="h-16 text-base font-semibold bg-accent hover:bg-accent/90 text-accent-foreground"
            onClick={() => addEvent("foul", "away")}
          >
            <AlertTriangle className="size-5 mr-2" />
            ファウル
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-14 text-base bg-transparent"
            onClick={() => addEvent("sub", "away")}
          >
            <ArrowRightLeft className="size-5 mr-2" />
            交代
          </Button>
        </div>
      </div>

      {/* Event Log */}
      <Card className="bg-card/50 border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            イベント履歴
          </h3>
          <Button
            size="sm"
            variant="ghost"
            onClick={undoLastEvent}
            disabled={matchData.events.length === 0}
            className="text-accent hover:text-accent/80"
          >
            <Undo2 className="size-4 mr-1" />
            取消
          </Button>
        </div>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {matchData.events.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              まだイベントがありません
            </p>
          ) : (
            matchData.events.slice(0, 5).map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-3 p-2 rounded-lg bg-muted/30"
              >
                {getEventIcon(event.type)}
                <span className="text-sm font-medium text-foreground capitalize">
                  {event.type}
                </span>
                <span className="text-xs text-muted-foreground">
                  {event.team === "home"
                    ? matchData.homeTeam
                    : matchData.awayTeam}
                </span>
                <span className="ml-auto text-xs font-mono text-muted-foreground">
                  {event.time}
                </span>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
