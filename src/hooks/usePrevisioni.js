import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useStore } from '../store'

const SOON_WINDOW_MS = 3 * 24 * 60 * 60 * 1000

export function usePrevisioni(listId) {
  const items = useStore(
    useShallow((state) =>
      Object.values(state.items).filter(
        (item) =>
          item.listId === listId &&
          (item.status === 'in_casa' || item.status === 'meta_scorta') &&
          (item.stockoutHistory?.length ?? 0) >= 2
      )
    )
  )

  return useMemo(() => {
    const now = Date.now()
    return items
      .map((item) => {
        const history = item.stockoutHistory
        const deltas = []
        for (let i = 1; i < history.length; i++) {
          deltas.push(history[i] - history[i - 1])
        }
        const avgCycleMs = deltas.reduce((sum, d) => sum + d, 0) / deltas.length
        const lastStockout = history[history.length - 1]
        const predictedNext = lastStockout + avgCycleMs
        return { item, predictedNext, avgCycleDays: avgCycleMs / (24 * 60 * 60 * 1000) }
      })
      .filter((p) => p.predictedNext - now < SOON_WINDOW_MS)
      .sort((a, b) => a.predictedNext - b.predictedNext)
  }, [items])
}
