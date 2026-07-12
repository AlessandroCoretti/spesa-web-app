import { useMemo } from 'react'
import { useStore } from '../store'

export function useFilteredItems(listId, status) {
  const items = useStore((state) => state.items)
  const categories = useStore((state) => state.categories)

  return useMemo(() => {
    const listItems = Object.values(items).filter(
      (item) => item.listId === listId && item.status === status
    )
    const listCategories = Object.values(categories)
      .filter((c) => c.listId === listId)
      .sort((a, b) => a.order - b.order)

    const grouped = listCategories
      .map((category) => ({
        category,
        items: listItems.filter((item) => item.categoryId === category.id),
      }))
      .filter((group) => group.items.length > 0)

    const uncategorized = listItems.filter((item) => !item.categoryId || !categories[item.categoryId])

    return { grouped, uncategorized, total: listItems.length }
  }, [items, categories, listId, status])
}
