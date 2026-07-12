import { isValidStatus } from './statuses'
import { generateId } from '../utils/id'

export const createItemsSlice = (set, get) => ({
  items: {},

  addItem: (listId, { name, status, categoryId = null, note = '', quantity = null }) => {
    if (!isValidStatus(status)) {
      throw new Error('Item status is required and must be one of the 4 valid statuses')
    }
    const id = generateId()
    const now = Date.now()
    set((state) => ({
      items: {
        ...state.items,
        [id]: { id, listId, categoryId, name, status, note, quantity, createdAt: now, updatedAt: now },
      },
    }))
    return id
  },

  updateItem: (id, updates) => {
    if (updates.status !== undefined && !isValidStatus(updates.status)) {
      throw new Error('Invalid item status')
    }
    set((state) => {
      if (!state.items[id]) return state
      return {
        items: {
          ...state.items,
          [id]: { ...state.items[id], ...updates, updatedAt: Date.now() },
        },
      }
    })
  },

  setItemStatus: (id, status) => {
    get().updateItem(id, { status })
  },

  deleteItem: (id) => {
    set((state) => {
      const { [id]: _removed, ...remainingItems } = state.items
      return { items: remainingItems }
    })
  },
})
