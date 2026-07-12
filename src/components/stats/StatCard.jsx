export function StatCard({ icon, label, value, sub }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blush-100 text-blush-500">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{label}</p>
        <p className="truncate font-heading text-lg font-bold text-ink">{value}</p>
        {sub && <p className="text-xs text-ink-soft">{sub}</p>}
      </div>
    </div>
  )
}
