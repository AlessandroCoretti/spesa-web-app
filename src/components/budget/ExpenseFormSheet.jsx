import { useEffect, useMemo, useState } from 'react'
import { Sheet } from '../common/Sheet'
import { useStore } from '../../store'
import { useListMembers } from '../../hooks/useListMembers'

function equalSplits(members) {
  if (members.length === 0) return []
  const base = Math.floor(100 / members.length)
  const remainder = 100 - base * members.length
  return members.map((m, i) => ({ userId: m.userId, percentage: base + (i < remainder ? 1 : 0) }))
}

export function ExpenseFormSheet({ open, onClose, listId }) {
  const session = useStore((state) => state.session)
  const addExpense = useStore((state) => state.addExpense)
  const showToast = useStore((state) => state.showToast)
  const { members } = useListMembers(listId, { enabled: open })

  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [paidBy, setPaidBy] = useState('')
  const [splits, setSplits] = useState([])

  useEffect(() => {
    if (!open) return
    setDescription('')
    setAmount('')
    setPaidBy(session?.user?.id ?? '')
    setSplits(equalSplits(members))
  }, [open, members, session])

  const totalPercentage = useMemo(() => splits.reduce((sum, s) => sum + Number(s.percentage || 0), 0), [splits])
  const canSubmit = description.trim() && Number(amount) > 0 && paidBy && totalPercentage === 100

  const updateSplit = (userId, percentage) => {
    setSplits((prev) => prev.map((s) => (s.userId === userId ? { ...s, percentage: Number(percentage) } : s)))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!canSubmit) return
    addExpense(listId, {
      description: description.trim(),
      amount: Number(amount),
      paidBy,
      splits,
    })
    showToast('Spesa aggiunta 💶')
    onClose()
  }

  return (
    <Sheet open={open} onClose={onClose} title="Nuova spesa">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm font-semibold text-ink-soft" htmlFor="expense-description">
            Descrizione *
          </label>
          <input
            id="expense-description"
            type="text"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Es. Spesa al supermercato"
            className="w-full rounded-2xl border border-blush-100 bg-blush-50/60 px-4 py-3 text-ink outline-none focus:border-blush-300"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-ink-soft" htmlFor="expense-amount">
            Importo (€) *
          </label>
          <input
            id="expense-amount"
            type="number"
            step="0.01"
            min="0"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full rounded-2xl border border-blush-100 bg-blush-50/60 px-4 py-3 text-ink outline-none focus:border-blush-300"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-ink-soft" htmlFor="expense-paidby">
            Pagato da
          </label>
          <select
            id="expense-paidby"
            value={paidBy}
            onChange={(e) => setPaidBy(e.target.value)}
            className="w-full rounded-2xl border border-blush-100 bg-blush-50/60 px-4 py-3 text-ink outline-none focus:border-blush-300"
          >
            {members.map((m) => (
              <option key={m.userId} value={m.userId}>
                {m.email}
              </option>
            ))}
          </select>
        </div>

        <div>
          <p className="mb-1 text-sm font-semibold text-ink-soft">
            Divisione ({totalPercentage}% {totalPercentage === 100 ? '✓' : '— deve fare 100%'})
          </p>
          <div className="flex flex-col gap-2">
            {splits.map((split) => {
              const member = members.find((m) => m.userId === split.userId)
              return (
                <div key={split.userId} className="flex items-center gap-2">
                  <span className="flex-1 truncate text-sm text-ink">{member?.email ?? split.userId}</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={split.percentage}
                    onChange={(e) => updateSplit(split.userId, e.target.value)}
                    className="w-20 rounded-xl border border-blush-100 bg-blush-50/60 px-2 py-1.5 text-right text-ink outline-none focus:border-blush-300"
                  />
                  <span className="text-sm text-ink-soft">%</span>
                </div>
              )
            })}
          </div>
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="mt-1 rounded-full bg-blush-500 py-3.5 font-heading font-semibold text-white shadow-(--shadow-soft) disabled:opacity-40"
        >
          Aggiungi spesa
        </button>
      </form>
    </Sheet>
  )
}
