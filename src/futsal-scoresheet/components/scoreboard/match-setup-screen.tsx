"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Play, History } from "lucide-react";

type Props = {
  myTeamName: string;
  initialOpponentName: string;
  recentOpponents: string[];
  onBack: () => void;
  onStart: (opponentName: string) => void;
};

export function MatchSetupScreen({
  myTeamName,
  initialOpponentName,
  recentOpponents,
  onBack,
  onStart,
}: Props) {
  const [opponentName, setOpponentName] = useState(initialOpponentName);

  const suggestions = useMemo(() => {
    const normalized = recentOpponents
      .map((s) => s.trim())
      .filter(Boolean)
      .filter((s) => s !== initialOpponentName.trim());
    return Array.from(new Set(normalized)).slice(0, 8);
  }, [recentOpponents, initialOpponentName]);

  const handleStart = () => {
    const name = opponentName.trim() || initialOpponentName;
    onStart(name);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border p-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="size-5 mr-1" />
            戻る
          </Button>
          <h1 className="text-lg font-bold text-foreground">試合の準備</h1>
          <div className="w-16" />
        </div>
      </div>

      <div className="flex-1 p-4 pb-24 space-y-4">
        {/* Teams */}
        <Card className="bg-card/50 border-border p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            対戦カード
          </p>
          <p className="text-lg font-bold text-foreground">
            {myTeamName} <span className="text-muted-foreground">vs</span>{" "}
            {opponentName.trim() || initialOpponentName}
          </p>
        </Card>

        {/* Opponent name input */}
        <Card className="bg-card/50 border-border p-4">
          <div className="flex items-center gap-2 mb-3">
            <History className="size-4 text-muted-foreground" />
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              相手チーム名
            </p>
          </div>

          <Input
            value={opponentName}
            onChange={(e) => setOpponentName(e.target.value)}
            placeholder="例: United FC"
            className="h-12 text-base"
          />

          {suggestions.length > 0 && (
            <div className="mt-4">
              <p className="text-xs text-muted-foreground mb-2">
                最近の対戦相手
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setOpponentName(name)}
                    className="px-3 py-2 rounded-full bg-muted/40 hover:bg-muted/70 border border-border text-sm text-foreground transition-colors"
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Action */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur border-t border-border p-4">
        <Button
          size="lg"
          className="w-full h-14 text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground"
          onClick={handleStart}
        >
          <Play className="size-5 mr-2" />
          試合を開始
        </Button>
      </div>
    </div>
  );
}
