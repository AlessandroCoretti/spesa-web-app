import { generateId } from '../utils/id'
import { enqueuePush } from '../sync/pushQueue'
import { folderToRow, itemToRow } from '../sync/mappers'

function pushFolderIfCloud(get, listId, op, payload) {
  const list = get().lists[listId]
  if (list?.mode === 'cloud') {
    enqueuePush({ table: 'folders', op, payload })
  }
}

export const createFoldersSlice = (set, get) => ({
  folders: {},

  // Creates a folder out of two (or more) loose items — the Android-style
  // "drag item onto another item" gesture. Items keep their own `order`;
  // the folder gets an order placed right where the target item was.
  createFolderFromItems: (listId, categoryId, itemIds, name = 'Nuova cartella') => {
    const id = generateId()
    const now = Date.now()
    const targetItem = get().items[itemIds[0]]
    const folder = { id, listId, categoryId, name, order: targetItem?.order ?? now, createdAt: now, updatedAt: now }

    set((state) => {
      const items = { ...state.items }
      for (const itemId of itemIds) {
        if (items[itemId]) items[itemId] = { ...items[itemId], folderId: id, updatedAt: now }
      }
      return { folders: { ...state.folders, [id]: folder }, items }
    })

    pushFolderIfCloud(get, listId, 'upsert', folderToRow(folder))
    if (get().lists[listId]?.mode === 'cloud') {
      for (const itemId of itemIds) {
        const item = get().items[itemId]
        if (item) enqueuePush({ table: 'items', op: 'upsert', payload: itemToRow(item) })
      }
    }
    return id
  },

  renameFolder: (id, name) => {
    get().updateFolder(id, { name })
  },

  updateFolder: (id, updates) => {
    let updated
    set((state) => {
      if (!state.folders[id]) return state
      updated = { ...state.folders[id], ...updates, updatedAt: Date.now() }
      return { folders: { ...state.folders, [id]: updated } }
    })
    if (updated) pushFolderIfCloud(get, updated.listId, 'upsert', folderToRow(updated))
  },

  addItemToFolder: (folderId, itemId) => {
    const folder = get().folders[folderId]
    if (!folder) return
    get().updateItem(itemId, { folderId, categoryId: folder.categoryId })
  },

  removeItemFromFolder: (itemId) => {
    get().updateItem(itemId, { folderId: null })
  },

  // Deletes the folder and ungroups its items back into loose items.
  deleteFolder: (id) => {
    const folder = get().folders[id]
    set((state) => {
      const { [id]: _removed, ...remainingFolders } = state.folders
      const items = Object.fromEntries(
        Object.entries(state.items).map(([itemId, item]) =>
          item.folderId === id ? [itemId, { ...item, folderId: null, updatedAt: Date.now() }] : [itemId, item]
        )
      )
      return { folders: remainingFolders, items }
    })
    if (folder) {
      pushFolderIfCloud(get, folder.listId, 'delete', { id })
      if (get().lists[folder.listId]?.mode === 'cloud') {
        Object.values(get().items)
          .filter((item) => item.listId === folder.listId)
          .forEach((item) => enqueuePush({ table: 'items', op: 'upsert', payload: itemToRow(item) }))
      }
    }
  },

  applyRemoteFolder: (remoteFolder) => {
    set((state) => {
      const local = state.folders[remoteFolder.id]
      if (local && local.updatedAt >= remoteFolder.updatedAt) return state
      return { folders: { ...state.folders, [remoteFolder.id]: remoteFolder } }
    })
  },

  removeRemoteFolder: (id) => {
    set((state) => {
      const { [id]: _removed, ...remainingFolders } = state.folders
      return { folders: remainingFolders }
    })
  },
})
