"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Share2 } from "lucide-react";
import type { MatchData } from "@/app/page";

type Props = {
  matchData: MatchData;
  teamColor?: string;
  onClose: () => void;
  onEndMatch?: () => void;
};

export function ResultPreview({
  matchData,
  teamColor = "#3b82f6",
  onClose,
  onEndMatch,
}: Props) {
  const cardRef = useRef<HTMLDivElement>(null);

  const scorers = matchData.players
    .filter((p) => p.goals > 0)
    .map((p) => `${p.name}${p.goals > 1 ? ` x${p.goals}` : ""}`)
    .join(", ");

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${matchData.homeTeam} vs ${matchData.awayTeam}`,
          text: `${matchData.homeTeam} ${matchData.homeScore} - ${matchData.awayScore} ${matchData.awayTeam}\n${scorers ? `Scorers: ${scorers}` : ""}`,
        });
      } catch {
        // User cancelled or share failed
      }
    }
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;

    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
      });

      const link = document.createElement("a");
      link.download = `match-result-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      // html2canvas not available or failed
      alert("Download feature requires html2canvas library");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border p-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ArrowLeft className="size-5 mr-1" />
            戻る
          </Button>
          <h1 className="text-lg font-bold text-foreground">結果カード</h1>
          <div className="w-16" />
        </div>
      </div>

      {/* Card Preview */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div
          ref={cardRef}
          className="w-full max-w-sm aspect-square relative rounded-2xl overflow-hidden shadow-2xl"
        >
          {/* Background */}
          {matchData.matchPhoto ? (
            <img
              src={matchData.matchPhoto || "/placeholder.svg"}
              alt="Match background"
              className="absolute inset-0 w-full h-full object-cover"
              crossOrigin="anonymous"
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to bottom right, ${teamColor}40, #1a1a2e, #16213e)`,
              }}
            />
          )}

          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/60" />

          {/* Content */}
          <div className="relative z-10 h-full flex flex-col items-center justify-center p-6 text-white">
            {/* Match Header */}
            <p className="text-base font-bold mb-2 text-center max-w-full truncate">
              {matchData.homeTeam} <span className="opacity-70">vs</span>{" "}
              {matchData.awayTeam}
            </p>
            {/* Date */}
            <p className="text-sm font-medium opacity-80 mb-2">
              {matchData.date}
            </p>

            {/* Team Names */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <p className="text-lg font-bold text-right flex-1 truncate">
                {matchData.homeTeam}
              </p>
              <span className="text-sm opacity-60">vs</span>
              <p className="text-lg font-bold text-left flex-1 truncate">
                {matchData.awayTeam}
              </p>
            </div>

            {/* Score */}
            <div className="flex items-center justify-center gap-6 mb-6">
              <span
                className="text-8xl font-black"
                style={{
                  color:
                    matchData.homeScore > matchData.awayScore
                      ? teamColor
                      : "white",
                }}
              >
                {matchData.homeScore}
              </span>
              <span className="text-4xl font-bold opacity-50">-</span>
              <span
                className="text-8xl font-black"
                style={{
                  color:
                    matchData.awayScore > matchData.homeScore
                      ? teamColor
                      : "white",
                }}
              >
                {matchData.awayScore}
              </span>
            </div>

            {/* Scorers */}
            {scorers && (
              <div className="bg-black/40 rounded-lg px-4 py-2 max-w-full">
                <p className="text-xs uppercase tracking-wider opacity-60 mb-1">
                  得点者
                </p>
                <p className="text-sm font-medium truncate">{scorers}</p>
              </div>
            )}

            {/* Branding */}
            <p className="absolute bottom-4 text-xs opacity-40 font-medium">
              フットサル スコアボード
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur border-t border-border p-4 space-y-3">
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 h-14 text-base bg-transparent"
            onClick={handleDownload}
          >
            <Download className="size-5 mr-2" />
            ダウンロード
          </Button>
          <Button
            className="flex-1 h-14 text-base text-white hover:opacity-90"
            style={{ backgroundColor: teamColor }}
            onClick={handleShare}
          >
            <Share2 className="size-5 mr-2" />
            シェア
          </Button>
        </div>
        {onEndMatch && (
          <Button
            variant="secondary"
            className="w-full h-12 text-base"
            onClick={onEndMatch}
          >
            試合終了してホームへ
          </Button>
        )}
      </div>
    </div>
  );
}
