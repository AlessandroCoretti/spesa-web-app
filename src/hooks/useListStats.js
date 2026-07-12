import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useStore } from '../store'

function startOfCurrentMonth() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1).getTime()
}

function topEntry(counts) {
  let best = null
  for (const [key, count] of Object.entries(counts)) {
    if (!best || count > best.count) best = { key, count }
  }
  return best
}

export function useListStats(listId, period = 'month') {
  const items = useStore(
    useShallow((state) => Object.values(state.items).filter((i) => i.listId === listId))
  )
  const expenses = useStore(
    useShallow((state) => Object.values(state.expenses).filter((e) => e.listId === listId))
  )
  const categories = useStore(
    useShallow((state) => Object.values(state.categories).filter((c) => c.listId === listId))
  )

  return useMemo(() => {
    const since = period === 'month' ? startOfCurrentMonth() : 0
    const periodItems = items.filter((i) => i.createdAt >= since)
    const periodExpenses = expenses.filter((e) => e.date >= since)

    const nameCounts = {}
    const categoryCounts = {}
    const creatorCounts = {}
    for (const item of periodItems) {
      const key = item.name.trim().toLowerCase()
      nameCounts[key] = (nameCounts[key] ?? 0) + 1
      if (item.categoryId) categoryCounts[item.categoryId] = (categoryCounts[item.categoryId] ?? 0) + 1
      if (item.createdBy) creatorCounts[item.createdBy] = (creatorCounts[item.createdBy] ?? 0) + 1
    }

    const dayTotals = {}
    for (const expense of periodExpenses) {
      const dayKey = new Date(expense.date).toISOString().slice(0, 10)
      dayTotals[dayKey] = (dayTotals[dayKey] ?? 0) + expense.amount
    }

    const topName = topEntry(nameCounts)
    const topCategoryEntry = topEntry(categoryCounts)
    const topCategory = topCategoryEntry
      ? { ...topCategoryEntry, name: categories.find((c) => c.id === topCategoryEntry.key)?.name ?? '—' }
      : null
    const topCreator = topEntry(creatorCounts)
    const topDayEntry = topEntry(dayTotals)
    const topDay = topDayEntry ? { date: topDayEntry.key, amount: topDayEntry.count } : null

    return {
      itemCount: periodItems.length,
      expenseTotal: periodExpenses.reduce((sum, e) => sum + e.amount, 0),
      topName,
      topCategory,
      topCreator,
      topDay,
    }
  }, [items, expenses, categories, period])
}
