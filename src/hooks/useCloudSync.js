import { useEffect } from 'react'
import { useStore } from '../store'
import { subscribeToList, unsubscribeFromList } from '../sync/realtime'

export function useCloudSync() {
  const activeListId = useStore((state) => state.activeListId)
  const mode = useStore((state) => (activeListId ? state.lists[activeListId]?.mode : null))

  useEffect(() => {
    if (mode === 'cloud' && activeListId) {
      subscribeToList(activeListId)
    } else {
      unsubscribeFromList()
    }
    return () => unsubscribeFromList()
  }, [activeListId, mode])
}
