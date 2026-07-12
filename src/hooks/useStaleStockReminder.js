import { useEffect } from 'react'
import { useStore } from '../store'

const THRESHOLD_MS = 3 * 24 * 60 * 60 * 1000

export function useStaleStockReminder() {
  const activeListId = useStore((state) => state.activeListId)

  useEffect(() => {
    const check = () => {
      const {
        items,
        activeListId: currentListId,
        staleReminderShownDates,
        markStaleReminderShown,
        showToast,
        setItemStatus,
      } = useStore.getState()
      if (!currentListId) return

      const todayKey = new Date().toISOString().slice(0, 10)
      if (staleReminderShownDates[currentListId] === todayKey) return

      const staleItems = Object.values(items).filter(
        (item) =>
          item.listId === currentListId &&
          item.status === 'meta_scorta' &&
          Date.now() - item.updatedAt > THRESHOLD_MS
      )
      if (staleItems.length === 0) return

      markStaleReminderShown(currentListId, todayKey)
      showToast(
        `${staleItems.length} prodott${staleItems.length > 1 ? 'i' : 'o'} a metà scorta da un po\' 🛒`,
        {
          action: {
            label: 'Aggiungi alla lista',
            onClick: () => {
              staleItems.forEach((item) => setItemStatus(item.id, 'da_comprare'))
            },
          },
        }
      )
    }

    check()

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') check()
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [activeListId])
}
