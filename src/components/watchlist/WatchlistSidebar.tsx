"use client"

import { Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface WatchlistData {
  _id: string
  name: string
  stocks: { instrumentKey: string; symbol: string }[]
}

interface Props {
  watchlists: WatchlistData[]
  activeWatchlistId: string
  isCreating: boolean
  newWatchlistName: string
  onSelect: (id: string) => void
  onToggleCreate: () => void
  onNameChange: (name: string) => void
  onCreateSubmit: (e: React.FormEvent) => void
}

export default function WatchlistSidebar({
  watchlists,
  activeWatchlistId,
  isCreating,
  newWatchlistName,
  onSelect,
  onToggleCreate,
  onNameChange,
  onCreateSubmit,
}: Props) {
  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center pb-2">
        <CardTitle className="text-base">My Lists</CardTitle>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onToggleCreate}>
          <Plus size={16} />
        </Button>
      </CardHeader>
      <CardContent>
        {isCreating && (
          <form onSubmit={onCreateSubmit} className="mb-4 flex gap-2">
            <Input
              placeholder="List name"
              value={newWatchlistName}
              onChange={e => onNameChange(e.target.value)}
              className="h-8 text-sm"
              autoFocus
            />
            <Button type="submit" size="sm" className="h-8">Save</Button>
          </form>
        )}

        <div className="space-y-1">
          {watchlists.map(w => (
            <button
              key={w._id}
              onClick={() => onSelect(w._id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
                activeWatchlistId === w._id
                  ? "bg-primary/10 text-primary font-medium"
                  : "hover:bg-muted text-muted-foreground"
              }`}
            >
              <span className="truncate pr-2">{w.name}</span>
              <span className="shrink-0 opacity-50 text-xs">{w.stocks.length}/50</span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
