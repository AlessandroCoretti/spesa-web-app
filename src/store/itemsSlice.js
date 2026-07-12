import { isValidStatus } from './statuses'
import { generateId } from '../utils/id'
import { enqueuePush } from '../sync/pushQueue'
import { itemToRow } from '../sync/mappers'

function pushIfCloud(get, listId, op, payload) {
  const list = get().lists[listId]
  if (list?.mode === 'cloud') {
    enqueuePush({ table: 'items', op, payload })
  }
}

export const createItemsSlice = (set, get) => ({
  items: {},

  addItem: (listId, { name, status, categoryId = null, note = '', quantity = null }) => {
    if (!isValidStatus(status)) {
      throw new Error('Item status is required and must be one of the 4 valid statuses')
    }
    const id = generateId()
    const now = Date.now()
    const item = { id, listId, categoryId, name, status, note, quantity, createdAt: now, updatedAt: now }
    set((state) => ({ items: { ...state.items, [id]: item } }))
    pushIfCloud(get, listId, 'upsert', itemToRow(item))
    return id
  },

  updateItem: (id, updates) => {
    if (updates.status !== undefined && !isValidStatus(updates.status)) {
      throw new Error('Invalid item status')
    }
    let updated
    set((state) => {
      if (!state.items[id]) return state
      updated = { ...state.items[id], ...updates, updatedAt: Date.now() }
      return { items: { ...state.items, [id]: updated } }
    })
    if (updated) pushIfCloud(get, updated.listId, 'upsert', itemToRow(updated))
  },

  setItemStatus: (id, status) => {
    get().updateItem(id, { status })
  },

  deleteItem: (id) => {
    const item = get().items[id]
    set((state) => {
      const { [id]: _removed, ...remainingItems } = state.items
      return { items: remainingItems }
    })
    if (item) pushIfCloud(get, item.listId, 'delete', { id })
  },

  // Applied from realtime events / reconciliation fetches — never re-enqueues
  // a push (that would echo the change straight back to Supabase).
  applyRemoteItem: (remoteItem) => {
    set((state) => {
      const local = state.items[remoteItem.id]
      if (local && local.updatedAt >= remoteItem.updatedAt) return state
      return { items: { ...state.items, [remoteItem.id]: remoteItem } }
    })
  },

  removeRemoteItem: (id) => {
    set((state) => {
      const { [id]: _removed, ...remainingItems } = state.items
      return { items: remainingItems }
    })
  },
})
