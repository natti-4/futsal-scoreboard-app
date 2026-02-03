"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Timer, ClipboardList, Loader2 } from "lucide-react";
import { ActiveMatchScreen } from "@/components/scoreboard/active-match-screen";
import { PostMatchScreen } from "@/components/scoreboard/post-match-screen";
import { ResultPreview } from "@/components/scoreboard/result-preview";
import { MatchSetupScreen } from "@/components/scoreboard/match-setup-screen";
import {
  HomeScreen,
  type SavedMatch,
} from "@/components/scoreboard/home-screen";
import {
  PlayerManagementScreen,
  type ManagedPlayer,
} from "@/components/scoreboard/player-management-screen";
import { MatchesScreen } from "@/components/scoreboard/matches-screen";
import { BottomNav, type NavScreen } from "@/components/scoreboard/bottom-nav";
import { Card } from "@/components/ui/card";
import {
  Settings,
  Bell,
  Moon,
  Info,
  ChevronRight,
  Palette,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTeam, updateTeam, mutateTeam } from "@/hooks/use-team";
import {
  usePlayers,
  useMatches,
  createPlayer,
  updatePlayer as updatePlayerApi,
  deletePlayer as deletePlayerApi,
  createMatch,
  saveMatch,
  incrementGoals,
  mutatePlayers,
  mutateMatches,
  type Player as DbPlayer,
  type Match as DbMatch,
} from "@/hooks/use-futsal-data";

export type Player = {
  totalGoals: number;
  id: string;
  name: string;
  number: number;
  goals: number;
};

export type MatchEvent = {
  id: number;
  type: "goal" | "foul" | "sub";
  team: "home" | "away";
  time: string;
  player?: string;
};

export type MatchData = {
  homeScore: number;
  awayScore: number;
  homeTeam: string;
  awayTeam: string;
  homeFouls: number;
  awayFouls: number;
  date: string;
  players: Player[];
  events: MatchEvent[];
  matchPhoto: string | null;
};

// Convert DB player to ManagedPlayer format
function toManagedPlayer(p: DbPlayer): ManagedPlayer {
  return {
    id: p.id,
    name: p.name,
    number: p.number,
    goals: 0,
    isActive: p.is_active,
    totalGoals: p.total_goals,
  };
}

// Convert DB match to SavedMatch format
function toSavedMatch(m: DbMatch, teamName: string): SavedMatch {
  return {
    id: m.id,
    homeTeam: teamName,
    awayTeam: m.opponent_name,
    homeScore: m.self_score,
    awayScore: m.opponent_score,
    date: new Date(m.match_date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
  };
}

export default function FutsalScoreboard() {
  const [activeScreen, setActiveScreen] = useState<NavScreen>("home");
  const [isInMatch, setIsInMatch] = useState(false);
  const [isSettingUpMatch, setIsSettingUpMatch] = useState(false);
  const [showResultPreview, setShowResultPreview] = useState(false);

  // Use Supabase data hooks
  const { team } = useTeam();
  const { players: dbPlayers, isLoading: playersLoading } = usePlayers();
  const { matches: dbMatches, isLoading: matchesLoading } = useMatches();

  // Convert to local format
  const managedPlayers = dbPlayers.map(toManagedPlayer);
  const savedMatches = dbMatches.map((m) => toSavedMatch(m, team.name));

  const recentOpponents = (() => {
    const seen = new Set<string>();
    const list: string[] = [];
    for (const m of dbMatches) {
      const name = (m.opponent_name ?? "").trim();
      if (!name || seen.has(name)) continue;
      seen.add(name);
      list.push(name);
    }
    return list;
  })();

  const [matchData, setMatchData] = useState<MatchData>({
    homeScore: 0,
    awayScore: 0,
    homeTeam: "マイチーム",
    awayTeam: "United FC",
    homeFouls: 0,
    awayFouls: 0,
    date: new Date().toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    players: [],
    events: [],
    matchPhoto: null,
  });

  // Update match players when db players change
  useEffect(() => {
    if (!isInMatch && dbPlayers.length > 0) {
      setMatchData((prev) => ({
        ...prev,
        players: dbPlayers
          .filter((p) => p.is_active)
          .map((p) => ({
            id: p.id,
            name: p.name,
            number: p.number,
            goals: 0,
            totalGoals: p.total_goals,
          })),
      }));
    }
  }, [dbPlayers, isInMatch]);

  // Update homeTeam when team name changes
  useEffect(() => {
    if (!isInMatch) {
      setMatchData((prev) => ({ ...prev, homeTeam: team.name }));
    }
  }, [team.name, isInMatch]);

  const updateMatchData = (updates: Partial<MatchData>) => {
    setMatchData((prev) => ({ ...prev, ...updates }));
  };

  const beginMatchSetup = () => {
    // reset match state (except selected players which are taken from dbPlayers)
    setMatchData((prev) => ({
      ...prev,
      homeScore: 0,
      awayScore: 0,
      homeTeam: team.name,
      awayTeam: prev.awayTeam || "United FC",
      homeFouls: 0,
      awayFouls: 0,
      date: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      players: dbPlayers
        .filter((p) => p.is_active)
        .map((p) => ({
          id: p.id,
          name: p.name,
          number: p.number,
          goals: 0,
          totalGoals: p.total_goals,
        })),
      events: [],
      matchPhoto: null,
    }));
    setShowResultPreview(false);
    setIsInMatch(false);
    setIsSettingUpMatch(true);
  };

  const startMatch = (opponentName: string) => {
    setMatchData({
      homeScore: 0,
      awayScore: 0,
      homeTeam: team.name,
      awayTeam: opponentName,
      homeFouls: 0,
      awayFouls: 0,
      date: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      players: dbPlayers
        .filter((p) => p.is_active)
        .map((p) => ({
          id: p.id,
          name: p.name,
          number: p.number,
          goals: 0,
          totalGoals: p.total_goals,
        })),
      events: [],
      matchPhoto: null,
    });
    setIsSettingUpMatch(false);
    setIsInMatch(true);
  };

  const endMatch = async () => {
    // Save the match to Supabase
    const scorers = matchData.players
      .filter((p) => p.goals > 0)
      .map((p) => ({ playerId: p.id, goals: p.goals }));

    await saveMatch(
      matchData.homeTeam,
      matchData.awayTeam,
      matchData.homeScore,
      matchData.awayScore,
      scorers,
    );

    // Update player total goals in Supabase
    for (const player of matchData.players) {
      if (player.goals > 0) {
        await incrementGoals(player.id, player.goals);
      }
    }

    // Refresh data
    mutatePlayers();
    mutateMatches();

    setShowResultPreview(false);
    setIsInMatch(false);
    setActiveScreen("home");
  };

  // Player management handlers
  const handleAddPlayer = async (name: string, number: number) => {
    await createPlayer(name, number);
  };

  const handleEditPlayer = async (
    id: string | number,
    name: string,
    number: number,
  ) => {
    await updatePlayerApi(String(id), { name, number });
  };

  const handleDeletePlayer = async (id: string | number) => {
    await deletePlayerApi(String(id));
  };

  const handleToggleActive = async (id: string | number) => {
    const player = dbPlayers.find((p) => p.id === id);
    if (player) {
      await updatePlayerApi(String(id), { is_active: !player.is_active });
    }
  };

  // Loading state
  if (playersLoading || matchesLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="size-10 text-primary animate-spin" />
          <p className="text-muted-foreground">読み込み中...</p>
        </div>
      </main>
    );
  }

  // Match setup screen
  if (isSettingUpMatch) {
    return (
      <MatchSetupScreen
        myTeamName={team.name}
        initialOpponentName={matchData.awayTeam || "United FC"}
        recentOpponents={recentOpponents}
        onBack={() => setIsSettingUpMatch(false)}
        onStart={(opponentName) => startMatch(opponentName)}
      />
    );
  }

  // Show result preview
  if (showResultPreview) {
    return (
      <ResultPreview
        matchData={matchData}
        teamColor={team.color}
        onClose={() => setShowResultPreview(false)}
        onEndMatch={endMatch}
      />
    );
  }

  // Show match screens
  if (isInMatch) {
    return (
      <main className="min-h-screen bg-background">
        <Tabs defaultValue="realtime" className="h-full">
          <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
            <TabsList className="w-full h-14 rounded-none bg-muted/50 p-1">
              <TabsTrigger
                value="realtime"
                className="flex-1 h-full gap-2 text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all"
              >
                <Timer className="size-5" />
                <span>ライブ</span>
              </TabsTrigger>
              <TabsTrigger
                value="postmatch"
                className="flex-1 h-full gap-2 text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all"
              >
                <ClipboardList className="size-5" />
                <span>試合後</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="realtime" className="mt-0">
            <ActiveMatchScreen
              matchData={matchData}
              updateMatchData={updateMatchData}
            />
          </TabsContent>

          <TabsContent value="postmatch" className="mt-0">
            <PostMatchScreen
              matchData={matchData}
              updateMatchData={updateMatchData}
              onGenerateCard={() => setShowResultPreview(true)}
            />
          </TabsContent>
        </Tabs>
      </main>
    );
  }

  // Main app with bottom navigation
  return (
    <main className="min-h-screen bg-background">
      {activeScreen === "home" && (
        <HomeScreen
          teamName={team.name}
          teamColor={team.color}
          players={managedPlayers}
          recentMatches={savedMatches}
          onStartNewMatch={beginMatchSetup}
          onViewAllMatches={() => setActiveScreen("matches")}
        />
      )}

      {activeScreen === "matches" && (
        <MatchesScreen
          matches={savedMatches}
          onStartNewMatch={beginMatchSetup}
        />
      )}

      {activeScreen === "players" && (
        <PlayerManagementScreen
          players={managedPlayers}
          onAddPlayer={handleAddPlayer}
          onEditPlayer={handleEditPlayer}
          onDeletePlayer={handleDeletePlayer}
          onToggleActive={handleToggleActive}
        />
      )}

      {activeScreen === "settings" && (
        <SettingsScreen
          teamName={team.name}
          teamColor={team.color}
          onTeamUpdate={() => mutateTeam()}
        />
      )}

      <BottomNav activeScreen={activeScreen} onNavigate={setActiveScreen} />
    </main>
  );
}

const TEAM_COLORS = [
  "#3b82f6",
  "#ef4444",
  "#22c55e",
  "#eab308",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#f97316",
];

function SettingsScreen({
  teamName: initialTeamName,
  teamColor: initialTeamColor,
  onTeamUpdate,
}: {
  teamName: string;
  teamColor: string;
  onTeamUpdate: () => void;
}) {
  const [teamName, setTeamName] = useState(initialTeamName);
  const [teamColor, setTeamColor] = useState(initialTeamColor);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setTeamName(initialTeamName);
    setTeamColor(initialTeamColor);
  }, [initialTeamName, initialTeamColor]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateTeam({ name: teamName, color: teamColor });
      onTeamUpdate();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 pb-24">
      <h1 className="text-xl font-bold text-foreground">設定</h1>

      {/* Team Settings */}
      <Card className="bg-card/50 border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <Palette className="size-5" />
            チーム設定
          </h2>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <Label htmlFor="team-name">チーム名</Label>
            <Input
              id="team-name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="マイチーム"
              className="mt-2"
            />
          </div>
          <div>
            <Label>チームカラー</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {TEAM_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setTeamColor(c)}
                  className={`size-10 rounded-full border-2 transition-all shrink-0 ${
                    teamColor === c
                      ? "border-foreground scale-110"
                      : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="color"
                value={teamColor}
                onChange={(e) => setTeamColor(e.target.value)}
                className="w-12 h-10 rounded border border-border cursor-pointer bg-transparent"
              />
              <span className="text-sm text-muted-foreground">{teamColor}</span>
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full h-12"
          >
            {isSaving ? <Loader2 className="size-5 animate-spin mr-2" /> : null}
            保存
          </Button>
        </div>
      </Card>

      <Card className="bg-card/50 border-border overflow-hidden">
        <SettingsItem icon={Bell} label="通知" hasChevron />
        <SettingsItem icon={Moon} label="ダークモード" isToggle defaultOn />
        <SettingsItem icon={Info} label="アプリについて" hasChevron />
      </Card>

      <p className="text-center text-sm text-muted-foreground mt-4">
        フットサル スコアボード v1.0.0
      </p>
    </div>
  );
}

function SettingsItem({
  icon: Icon,
  label,
  hasChevron,
  isToggle,
  defaultOn,
}: {
  icon: typeof Settings;
  label: string;
  hasChevron?: boolean;
  isToggle?: boolean;
  defaultOn?: boolean;
}) {
  const [isOn, setIsOn] = useState(defaultOn ?? false);

  return (
    <button
      className="flex items-center gap-4 w-full p-4 border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors text-left"
      onClick={() => isToggle && setIsOn(!isOn)}
    >
      <Icon className="size-5 text-muted-foreground" />
      <span className="flex-1 font-medium text-foreground">{label}</span>
      {hasChevron && <ChevronRight className="size-5 text-muted-foreground" />}
      {isToggle && (
        <div
          className={`w-11 h-6 rounded-full transition-colors ${isOn ? "bg-primary" : "bg-muted"}`}
        >
          <div
            className={`size-5 rounded-full bg-foreground mt-0.5 transition-transform ${isOn ? "translate-x-5.5 ml-0.5" : "translate-x-0.5"}`}
          />
        </div>
      )}
    </button>
  );
}
