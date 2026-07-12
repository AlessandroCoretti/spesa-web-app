import { TrendingDown } from 'lucide-react'

function formatDaysLabel(predictedNext) {
  const diffDays = Math.round((predictedNext - Date.now()) / (24 * 60 * 60 * 1000))
  if (diffDays < 0) return 'Dovrebbe già essere finito'
  if (diffDays === 0) return 'Potrebbe finire oggi'
  if (diffDays === 1) return 'Potrebbe finire domani'
  return `Potrebbe finire tra ~${diffDays} giorni`
}

export function PrevisioniCard({ prediction }) {
  const { item, predictedNext, avgCycleDays } = prediction

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-lilac-100 text-lilac-500">
        <TrendingDown className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-ink">{item.name}</p>
        <p className="text-xs text-ink-soft">{formatDaysLabel(predictedNext)}</p>
      </div>
      <span className="shrink-0 text-xs text-ink-soft">
        ogni ~{Math.max(1, Math.round(avgCycleDays))}gg
      </span>
    </div>
  )
}
