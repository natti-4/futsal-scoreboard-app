"use client"

import React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Pencil, Trash2, Users, UserCheck, UserX } from "lucide-react"
import type { Player } from "@/app/page"

export type ManagedPlayer = Player & {
  isActive: boolean
  totalGoals: number
}

type Props = {
  players: ManagedPlayer[]
  onAddPlayer: (name: string, number: number) => void
  onEditPlayer: (id: string | number, name: string, number: number) => void
  onDeletePlayer: (id: string | number) => void
  onToggleActive: (id: string | number) => void
}

export function PlayerManagementScreen({
  players,
  onAddPlayer,
  onEditPlayer,
  onDeletePlayer,
  onToggleActive,
}: Props) {
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingPlayer, setEditingPlayer] = useState<ManagedPlayer | null>(null)
  const [showInactive, setShowInactive] = useState(false)

  const activePlayers = players.filter((p) => p.isActive)
  const inactivePlayers = players.filter((p) => !p.isActive)
  const displayedPlayers = showInactive ? players : activePlayers

  return (
    <div className="flex flex-col gap-4 p-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">選手管理</h1>
          <p className="text-sm text-muted-foreground">
            アクティブ {activePlayers.length}人、非アクティブ {inactivePlayers.length}人
          </p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button
              size="lg"
              className="h-12 px-4 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="size-5 mr-2" />
              選手追加
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">新しい選手を追加</DialogTitle>
            </DialogHeader>
            <AddPlayerForm
              onSubmit={(name, number) => {
                onAddPlayer(name, number)
                setIsAddOpen(false)
              }}
              onCancel={() => setIsAddOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter Toggle */}
      <Card className="bg-card/50 border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="size-5 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              非アクティブ選手を表示
            </span>
          </div>
          <Switch checked={showInactive} onCheckedChange={setShowInactive} />
        </div>
      </Card>

      {/* Player List */}
      <div className="flex flex-col gap-3">
        {displayedPlayers.length === 0 ? (
          <Card className="bg-card/50 border-border p-8">
            <div className="text-center">
              <Users className="size-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-foreground font-medium mb-1">まだ選手がいません</p>
              <p className="text-sm text-muted-foreground">
                最初の選手を追加して始めましょう
              </p>
            </div>
          </Card>
        ) : (
          displayedPlayers.map((player) => (
            <PlayerRow
              key={player.id}
              player={player}
              onEdit={() => setEditingPlayer(player)}
              onDelete={() => onDeletePlayer(player.id)}
              onToggleActive={() => onToggleActive(player.id)}
            />
          ))
        )}
      </div>

      {/* Edit Player Dialog */}
      <Dialog
        open={editingPlayer !== null}
        onOpenChange={(open) => !open && setEditingPlayer(null)}
      >
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">選手を編集</DialogTitle>
          </DialogHeader>
          {editingPlayer && (
            <EditPlayerForm
              player={editingPlayer}
              onSubmit={(name, number) => {
                onEditPlayer(editingPlayer.id, name, number)
                setEditingPlayer(null)
              }}
              onCancel={() => setEditingPlayer(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function PlayerRow({
  player,
  onEdit,
  onDelete,
  onToggleActive,
}: {
  player: ManagedPlayer
  onEdit: () => void
  onDelete: () => void
  onToggleActive: () => void
}) {
  return (
    <Card
      className={`bg-card/50 border-border p-4 ${!player.isActive ? "opacity-60" : ""}`}
    >
      <div className="flex items-center gap-4">
        {/* Player Number */}
        <div
          className={`flex items-center justify-center size-14 rounded-full font-bold text-lg ${
            player.isActive
              ? "bg-primary/20 text-primary"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {player.number}
        </div>

        {/* Player Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-foreground truncate">
              {player.name}
            </p>
            {player.isActive ? (
              <UserCheck className="size-4 text-primary shrink-0" />
            ) : (
              <UserX className="size-4 text-muted-foreground shrink-0" />
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            #{player.number} · 通算{player.totalGoals}ゴール
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="size-10"
            onClick={onToggleActive}
          >
            {player.isActive ? (
              <UserX className="size-5 text-muted-foreground" />
            ) : (
              <UserCheck className="size-5 text-primary" />
            )}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="size-10"
            onClick={onEdit}
          >
            <Pencil className="size-5 text-muted-foreground" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="size-10 text-destructive hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="size-5" />
          </Button>
        </div>
      </div>
    </Card>
  )
}

function AddPlayerForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (name: string, number: number) => void
  onCancel: () => void
}) {
  const [name, setName] = useState("")
  const [number, setNumber] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim() && number) {
      onSubmit(name.trim(), parseInt(number, 10))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-foreground">
          名前
        </Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="選手の名前"
          className="h-12 text-base bg-muted border-border text-foreground placeholder:text-muted-foreground"
          autoFocus
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="number" className="text-foreground">
          背番号
        </Label>
        <Input
          id="number"
          type="number"
          min="1"
          max="99"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          placeholder="背番号"
          className="h-12 text-base bg-muted border-border text-foreground placeholder:text-muted-foreground"
        />
      </div>
      <div className="flex gap-3 mt-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1 h-12 bg-transparent"
          onClick={onCancel}
        >
          キャンセル
        </Button>
        <Button
          type="submit"
          className="flex-1 h-12 bg-primary hover:bg-primary/90 text-primary-foreground"
          disabled={!name.trim() || !number}
        >
          選手を追加
        </Button>
      </div>
    </form>
  )
}

function EditPlayerForm({
  player,
  onSubmit,
  onCancel,
}: {
  player: ManagedPlayer
  onSubmit: (name: string, number: number) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(player.name)
  const [number, setNumber] = useState(player.number.toString())

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim() && number) {
      onSubmit(name.trim(), parseInt(number, 10))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="space-y-2">
        <Label htmlFor="edit-name" className="text-foreground">
          名前
        </Label>
        <Input
          id="edit-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="選手の名前"
          className="h-12 text-base bg-muted border-border text-foreground placeholder:text-muted-foreground"
          autoFocus
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-number" className="text-foreground">
          背番号
        </Label>
        <Input
          id="edit-number"
          type="number"
          min="1"
          max="99"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          placeholder="背番号"
          className="h-12 text-base bg-muted border-border text-foreground placeholder:text-muted-foreground"
        />
      </div>
      <div className="flex gap-3 mt-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1 h-12 bg-transparent"
          onClick={onCancel}
        >
          キャンセル
        </Button>
        <Button
          type="submit"
          className="flex-1 h-12 bg-primary hover:bg-primary/90 text-primary-foreground"
          disabled={!name.trim() || !number}
        >
          変更を保存
        </Button>
      </div>
    </form>
  )
}
