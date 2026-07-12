import { generateId } from '../utils/id'
import { enqueuePush } from '../sync/pushQueue'
import { categoryToRow, itemToRow } from '../sync/mappers'

function pushCategoryIfCloud(get, listId, op, payload) {
  const list = get().lists[listId]
  if (list?.mode === 'cloud') {
    enqueuePush({ table: 'categories', op, payload })
  }
}

export const createCategoriesSlice = (set, get) => ({
  categories: {},

  addCategory: (listId, name, { color = 'blush', icon = 'tag' } = {}) => {
    const id = generateId()
    const now = Date.now()
    let category
    set((state) => {
      const order = Object.values(state.categories).filter((c) => c.listId === listId).length
      category = { id, listId, name, color, icon, order, createdAt: now, updatedAt: now }
      return { categories: { ...state.categories, [id]: category } }
    })
    pushCategoryIfCloud(get, listId, 'upsert', categoryToRow(category))
    return id
  },

  updateCategory: (id, updates) => {
    let updated
    set((state) => {
      if (!state.categories[id]) return state
      updated = { ...state.categories[id], ...updates, updatedAt: Date.now() }
      return { categories: { ...state.categories, [id]: updated } }
    })
    if (updated) pushCategoryIfCloud(get, updated.listId, 'upsert', categoryToRow(updated))
  },

  deleteCategory: (id) => {
    const category = get().categories[id]
    let affectedItems = []
    set((state) => {
      const { [id]: _removed, ...remainingCategories } = state.categories
      const items = Object.fromEntries(
        Object.entries(state.items).map(([itemId, item]) => {
          if (item.categoryId !== id) return [itemId, item]
          const updated = { ...item, categoryId: null, updatedAt: Date.now() }
          affectedItems.push(updated)
          return [itemId, updated]
        })
      )
      return { categories: remainingCategories, items }
    })
    if (category?.listId) {
      pushCategoryIfCloud(get, category.listId, 'delete', { id })
      if (get().lists[category.listId]?.mode === 'cloud') {
        affectedItems.forEach((item) => enqueuePush({ table: 'items', op: 'upsert', payload: itemToRow(item) }))
      }
    }
  },

  reorderCategories: (listId, orderedIds) => {
    const changed = []
    set((state) => {
      const categories = { ...state.categories }
      orderedIds.forEach((id, index) => {
        if (categories[id] && categories[id].order !== index) {
          categories[id] = { ...categories[id], order: index, updatedAt: Date.now() }
          changed.push(categories[id])
        }
      })
      return { categories }
    })
    if (get().lists[listId]?.mode === 'cloud') {
      changed.forEach((category) => enqueuePush({ table: 'categories', op: 'upsert', payload: categoryToRow(category) }))
    }
  },

  applyRemoteCategory: (remoteCategory) => {
    set((state) => {
      const local = state.categories[remoteCategory.id]
      if (local && local.updatedAt >= remoteCategory.updatedAt) return state
      return { categories: { ...state.categories, [remoteCategory.id]: remoteCategory } }
    })
  },

  removeRemoteCategory: (id) => {
    set((state) => {
      const { [id]: _removed, ...remainingCategories } = state.categories
      return { categories: remainingCategories }
    })
  },
})
