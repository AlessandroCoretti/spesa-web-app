import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useStore } from '../store'

// Greedy debt simplification: repeatedly match the biggest creditor with the
// biggest debtor so the number of "who pays whom" transactions is minimized.
function simplifyBalances(netByUser) {
  const creditors = []
  const debtors = []
  for (const [userId, net] of Object.entries(netByUser)) {
    if (net > 0.01) creditors.push({ userId, amount: net })
    else if (net < -0.01) debtors.push({ userId, amount: -net })
  }
  creditors.sort((a, b) => b.amount - a.amount)
  debtors.sort((a, b) => b.amount - a.amount)

  const settlements = []
  let i = 0
  let j = 0
  while (i < creditors.length && j < debtors.length) {
    const creditor = creditors[i]
    const debtor = debtors[j]
    const amount = Math.min(creditor.amount, debtor.amount)
    settlements.push({ from: debtor.userId, to: creditor.userId, amount })
    creditor.amount -= amount
    debtor.amount -= amount
    if (creditor.amount < 0.01) i++
    if (debtor.amount < 0.01) j++
  }
  return settlements
}

export function useBudgetBalances(listId) {
  const expenses = useStore(
    useShallow((state) => Object.values(state.expenses).filter((e) => e.listId === listId))
  )

  return useMemo(() => {
    const netByUser = {}
    for (const expense of expenses) {
      netByUser[expense.paidBy] = (netByUser[expense.paidBy] ?? 0) + expense.amount
      for (const split of expense.splits ?? []) {
        const share = (expense.amount * split.percentage) / 100
        netByUser[split.userId] = (netByUser[split.userId] ?? 0) - share
      }
    }
    return { netByUser, settlements: simplifyBalances(netByUser) }
  }, [expenses])
}
