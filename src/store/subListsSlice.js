import { generateId } from '../utils/id'
import { enqueuePush } from '../sync/pushQueue'
import { subListToRow, itemToRow } from '../sync/mappers'

// Cycled through as new sub-lists are created in a list, so each one gets a
// visually distinct (but palette-coordinated) background color.
const COLOR_CYCLE = ['lilac', 'mint', 'peach', 'coral', 'blush']

function pushIfCloud(get, listId, op, payload) {
  const list = get().lists[listId]
  if (list?.mode === 'cloud') {
    enqueuePush({ table: 'sub_lists', op, payload })
  }
}

export const createSubListsSlice = (set, get) => ({
  subLists: {},

  // The Android-style "drag item onto another item, hold" gesture: groups
  // the dragged items into a named, colored sub-list within the same
  // category — not a separate top-level list, not a closed folder tile.
  createSubListFromItems: (listId, categoryId, itemIds, name = 'Nuova lista') => {
    const id = generateId()
    const now = Date.now()
    const existingCount = Object.values(get().subLists).filter((s) => s.listId === listId).length
    const color = COLOR_CYCLE[existingCount % COLOR_CYCLE.length]
    const targetItem = get().items[itemIds[0]]
    const subList = {
      id,
      listId,
      categoryId,
      name,
      color,
      order: targetItem?.order ?? now,
      createdAt: now,
      updatedAt: now,
    }

    set((state) => {
      const items = { ...state.items }
      itemIds.forEach((itemId) => {
        if (items[itemId]) items[itemId] = { ...items[itemId], subListId: id, updatedAt: now }
      })
      return { subLists: { ...state.subLists, [id]: subList }, items }
    })

    pushIfCloud(get, listId, 'upsert', subListToRow(subList))
    if (get().lists[listId]?.mode === 'cloud') {
      itemIds.forEach((itemId) => {
        const item = get().items[itemId]
        if (item) enqueuePush({ table: 'items', op: 'upsert', payload: itemToRow(item) })
      })
    }
    return id
  },

  renameSubList: (id, name) => {
    get().updateSubList(id, { name })
  },

  updateSubList: (id, updates) => {
    let updated
    set((state) => {
      if (!state.subLists[id]) return state
      updated = { ...state.subLists[id], ...updates, updatedAt: Date.now() }
      return { subLists: { ...state.subLists, [id]: updated } }
    })
    if (updated) pushIfCloud(get, updated.listId, 'upsert', subListToRow(updated))
  },

  addItemToSubList: (subListId, itemId) => {
    const subList = get().subLists[subListId]
    if (!subList) return
    get().updateItem(itemId, { subListId, categoryId: subList.categoryId })
  },

  removeItemFromSubList: (itemId) => {
    get().updateItem(itemId, { subListId: null })
  },

  // Deletes the sub-list and ungroups its items back to loose items.
  deleteSubList: (id) => {
    const subList = get().subLists[id]
    set((state) => {
      const { [id]: _removed, ...remainingSubLists } = state.subLists
      const items = Object.fromEntries(
        Object.entries(state.items).map(([itemId, item]) =>
          item.subListId === id ? [itemId, { ...item, subListId: null, updatedAt: Date.now() }] : [itemId, item]
        )
      )
      return { subLists: remainingSubLists, items }
    })
    if (subList) {
      pushIfCloud(get, subList.listId, 'delete', { id })
      if (get().lists[subList.listId]?.mode === 'cloud') {
        Object.values(get().items)
          .filter((item) => item.listId === subList.listId)
          .forEach((item) => enqueuePush({ table: 'items', op: 'upsert', payload: itemToRow(item) }))
      }
    }
  },

  applyRemoteSubList: (remoteSubList) => {
    set((state) => {
      const local = state.subLists[remoteSubList.id]
      if (local && local.updatedAt >= remoteSubList.updatedAt) return state
      return { subLists: { ...state.subLists, [remoteSubList.id]: remoteSubList } }
    })
  },

  removeRemoteSubList: (id) => {
    set((state) => {
      const { [id]: _removed, ...remainingSubLists } = state.subLists
      return { subLists: remainingSubLists }
    })
  },
})
