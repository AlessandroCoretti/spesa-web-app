import { ArrowRight } from 'lucide-react'

export function BalanceSummary({ settlements, members }) {
  const emailFor = (userId) => members.find((m) => m.userId === userId)?.email ?? userId

  if (settlements.length === 0) {
    return (
      <div className="rounded-2xl bg-mint-50 p-4 text-center text-sm font-semibold text-mint-500">
        Tutto in pari! 🎉
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {settlements.map((s, i) => (
        <div key={i} className="flex items-center gap-2 rounded-2xl bg-white p-3 text-sm shadow-sm">
          <span className="min-w-0 flex-1 truncate font-semibold text-coral-500">{emailFor(s.from)}</span>
          <ArrowRight className="h-4 w-4 shrink-0 text-ink-soft" />
          <span className="min-w-0 flex-1 truncate font-semibold text-mint-500">{emailFor(s.to)}</span>
          <span className="shrink-0 font-heading font-semibold text-ink">€{s.amount.toFixed(2)}</span>
        </div>
      ))}
    </div>
  )
}
