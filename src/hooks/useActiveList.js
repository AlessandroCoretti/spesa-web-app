import { useStore } from '../store'

export function useActiveList() {
  const activeListId = useStore((state) => state.activeListId)
  const list = useStore((state) => (activeListId ? state.lists[activeListId] : null))
  return { activeListId, list }
}
