import { Receipt } from 'lucide-react'

export function ExpenseCard({ expense, members }) {
  const payer = members.find((m) => m.userId === expense.paidBy)

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-mint-100 text-mint-500">
        <Receipt className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-ink">{expense.description}</p>
        <p className="text-xs text-ink-soft">Pagato da {payer?.email ?? '…'}</p>
      </div>
      <span className="shrink-0 font-heading font-semibold text-ink">€{expense.amount.toFixed(2)}</span>
    </div>
  )
}
