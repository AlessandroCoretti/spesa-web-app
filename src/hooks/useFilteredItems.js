import { useMemo } from 'react'
import { useStore } from '../store'

export function useFilteredItems(listId, status) {
  const items = useStore((state) => state.items)
  const categories = useStore((state) => state.categories)

  return useMemo(() => {
    const listItems = Object.values(items).filter(
      (item) => item.listId === listId && item.status === status
    )
    const byOrder = (a, b) => (a.order ?? 0) - (b.order ?? 0)

    const listCategories = Object.values(categories)
      .filter((c) => c.listId === listId)
      .sort((a, b) => a.order - b.order)

    const grouped = listCategories
      .map((category) => ({
        category,
        items: listItems.filter((item) => item.categoryId === category.id).sort(byOrder),
      }))
      .filter((group) => group.items.length > 0)

    const uncategorized = listItems
      .filter((item) => !item.categoryId || !categories[item.categoryId])
      .sort(byOrder)

    return { grouped, uncategorized, total: listItems.length }
  }, [items, categories, listId, status])
}
