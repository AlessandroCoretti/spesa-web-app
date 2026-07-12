import { useMemo } from 'react'
import { useStore } from '../store'

// Builds an ordered list of "entries" for a group of items: loose items
// (no folderId) stay as-is, items with a folderId are collapsed into a
// single folder entry containing them. Entries are sorted by their own
// `order` (folder.order for folders, item.order for loose items) so
// drag-and-drop reordering and folder placement both just work.
function buildEntries(items, folders) {
  const looseItems = items.filter((item) => !item.folderId)
  const folderIds = new Set(items.filter((item) => item.folderId).map((item) => item.folderId))

  const entries = looseItems.map((item) => ({ type: 'item', order: item.order ?? 0, item }))

  for (const folderId of folderIds) {
    const folder = folders[folderId]
    if (!folder) continue
    const folderItems = items.filter((item) => item.folderId === folderId)
    entries.push({ type: 'folder', order: folder.order ?? 0, folder, items: folderItems })
  }

  return entries.sort((a, b) => a.order - b.order)
}

export function useFilteredItems(listId, status) {
  const items = useStore((state) => state.items)
  const categories = useStore((state) => state.categories)
  const folders = useStore((state) => state.folders)

  return useMemo(() => {
    const listItems = Object.values(items).filter(
      (item) => item.listId === listId && item.status === status
    )
    const listCategories = Object.values(categories)
      .filter((c) => c.listId === listId)
      .sort((a, b) => a.order - b.order)

    const grouped = listCategories
      .map((category) => {
        const categoryItems = listItems.filter((item) => item.categoryId === category.id)
        return { category, entries: buildEntries(categoryItems, folders) }
      })
      .filter((group) => group.entries.length > 0)

    const uncategorizedItems = listItems.filter((item) => !item.categoryId || !categories[item.categoryId])
    const uncategorized = buildEntries(uncategorizedItems, folders)

    return { grouped, uncategorized, total: listItems.length }
  }, [items, categories, folders, listId, status])
}
