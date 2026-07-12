import { generateId } from '../utils/id'

export const createCategoriesSlice = (set, get) => ({
  categories: {},

  addCategory: (listId, name, { color = 'blush', icon = 'tag' } = {}) => {
    const id = generateId()
    const now = Date.now()
    set((state) => {
      const order = Object.values(state.categories).filter((c) => c.listId === listId).length
      return {
        categories: {
          ...state.categories,
          [id]: { id, listId, name, color, icon, order, createdAt: now, updatedAt: now },
        },
      }
    })
    return id
  },

  updateCategory: (id, updates) => {
    set((state) => {
      if (!state.categories[id]) return state
      return {
        categories: {
          ...state.categories,
          [id]: { ...state.categories[id], ...updates, updatedAt: Date.now() },
        },
      }
    })
  },

  deleteCategory: (id) => {
    set((state) => {
      const { [id]: _removed, ...remainingCategories } = state.categories
      const items = Object.fromEntries(
        Object.entries(state.items).map(([itemId, item]) =>
          item.categoryId === id ? [itemId, { ...item, categoryId: null }] : [itemId, item]
        )
      )
      return { categories: remainingCategories, items }
    })
  },

  reorderCategories: (listId, orderedIds) => {
    set((state) => {
      const categories = { ...state.categories }
      orderedIds.forEach((id, index) => {
        if (categories[id]) categories[id] = { ...categories[id], order: index }
      })
      return { categories }
    })
  },
})
