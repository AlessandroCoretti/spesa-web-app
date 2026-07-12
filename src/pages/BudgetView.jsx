import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { ChevronLeft, Plus } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { useStore } from '../store'
import { useListMembers } from '../hooks/useListMembers'
import { useBudgetBalances } from '../hooks/useBudgetBalances'
import { ExpenseFormSheet } from '../components/budget/ExpenseFormSheet'
import { ExpenseCard } from '../components/budget/ExpenseCard'
import { BalanceSummary } from '../components/budget/BalanceSummary'
import { EmptyState } from '../components/common/EmptyState'

export default function BudgetView() {
  const { listId } = useParams()
  const navigate = useNavigate()
  const [showForm, setShowForm] = useState(false)
  const list = useStore((state) => state.lists[listId])
  const isCloud = list?.mode === 'cloud'

  const expenses = useStore(
    useShallow((state) =>
      Object.values(state.expenses)
        .filter((e) => e.listId === listId)
        .sort((a, b) => b.date - a.date)
    )
  )
  const { members } = useListMembers(listId, { enabled: isCloud })
  const { settlements } = useBudgetBalances(listId)

  return (
    <div className="mx-auto flex h-dvh max-w-md flex-col overflow-hidden bg-blush-50/40">
      <header className="flex shrink-0 items-center gap-2 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <button
          type="button"
          onClick={() => navigate(`/list/${listId}/settings`)}
          className="grid h-9 w-9 place-items-center rounded-full bg-blush-50 text-blush-600"
          aria-label="Indietro"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="font-heading text-xl font-semibold text-blush-700">Budget condiviso 💶</h1>
      </header>

      {!isCloud ? (
        <main className="flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-4">
          <EmptyState
            title="Disponibile solo per liste sincronizzate"
            subtitle="Sincronizza questa lista dalle Impostazioni per iniziare a tracciare le spese condivise."
          />
        </main>
      ) : (
      <main className="flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-4 pb-24">
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-ink-soft">Chi deve a chi</h2>
        <BalanceSummary settlements={settlements} members={members} />

        <h2 className="mb-2 mt-6 text-sm font-bold uppercase tracking-wide text-ink-soft">Spese</h2>
        {expenses.length === 0 ? (
          <EmptyState title="Nessuna spesa ancora" subtitle="Tocca Aggiungi per registrare la prima spesa condivisa." />
        ) : (
          <div className="flex flex-col gap-2">
            {expenses.map((expense) => (
              <ExpenseCard key={expense.id} expense={expense} members={members} />
            ))}
          </div>
        )}
      </main>
      )}

      {isCloud && (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="fixed bottom-6 right-5 z-20 mx-auto flex max-w-md items-center gap-2 rounded-full bg-blush-500 px-5 py-3.5 font-heading font-semibold text-white shadow-(--shadow-soft-lg)"
        >
          <Plus className="h-5 w-5" />
          Aggiungi spesa
        </button>
      )}

      {isCloud && <ExpenseFormSheet open={showForm} onClose={() => setShowForm(false)} listId={listId} />}
    </div>
  )
}
