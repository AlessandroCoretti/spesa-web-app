import { generateId } from '../utils/id'
import { enqueuePush } from '../sync/pushQueue'
import { listToRow } from '../sync/mappers'

const DEFAULT_LIST_ID = generateId()

// If the user is already logged in, a brand-new list shouldn't stay
// local-only until someone remembers to tap "Sincronizza" — dynamic import
// avoids a module-load-time circular dependency with the store.
function autoSyncIfLoggedIn(get, listId) {
  if (get().session) {
    import('../sync/upgradeListToCloud').then(({ upgradeListToCloud }) => {
      upgradeListToCloud(listId).catch(() => {})
    })
  }
}

export const createListsSlice = (set, get) => ({
  lists: {
    [DEFAULT_LIST_ID]: {
      id: DEFAULT_LIST_ID,
      name: 'Casa',
      icon: 'home',
      color: 'blush',
      shareCode: null,
      mode: 'local',
      ownerId: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  },
  listOrder: [DEFAULT_LIST_ID],
  activeListId: DEFAULT_LIST_ID,

  addList: (name, { icon = 'home', color = 'blush' } = {}) => {
    const id = generateId()
    const now = Date.now()
    set((state) => ({
      lists: {
        ...state.lists,
        [id]: {
          id,
          name,
          icon,
          color,
          shareCode: null,
          mode: 'local',
          ownerId: null,
          createdAt: now,
          updatedAt: now,
        },
      },
      listOrder: [...state.listOrder, id],
      activeListId: id,
    }))
    autoSyncIfLoggedIn(get, id)
    return id
  },

  renameList: (id, name) => {
    let updated
    set((state) => {
      if (!state.lists[id]) return state
      updated = { ...state.lists[id], name, updatedAt: Date.now() }
      return { lists: { ...state.lists, [id]: updated } }
    })
    if (updated?.mode === 'cloud') {
      enqueuePush({ table: 'lists', op: 'upsert', payload: listToRow(updated) })
    }
  },

  deleteList: (id) => {
    const list = get().lists[id]
    set((state) => {
      const { [id]: _removed, ...remainingLists } = state.lists
      const listOrder = state.listOrder.filter((listId) => listId !== id)

      const categories = Object.fromEntries(
        Object.entries(state.categories).filter(([, c]) => c.listId !== id)
      )
      const items = Object.fromEntries(
        Object.entries(state.items).filter(([, item]) => item.listId !== id)
      )

      const activeListId = state.activeListId === id ? listOrder[0] ?? null : state.activeListId

      return { lists: remainingLists, listOrder, categories, items, activeListId }
    })
    if (list?.mode === 'cloud') {
      enqueuePush({ table: 'lists', op: 'delete', payload: { id } })
    }
  },

  setActiveList: (id) => {
    set((state) => (state.lists[id] ? { activeListId: id } : state))
  },

  importList: (listData) => {
    const id = generateId()
    const now = Date.now()
    const categoryIdMap = {}

    set((state) => {
      const newCategories = {}
      for (const cat of listData.categories ?? []) {
        const newCatId = generateId()
        categoryIdMap[cat.id] = newCatId
        newCategories[newCatId] = {
          ...cat,
          id: newCatId,
          listId: id,
          createdAt: now,
          updatedAt: now,
        }
      }

      const newItems = {}
      for (const item of listData.items ?? []) {
        const newItemId = generateId()
        newItems[newItemId] = {
          ...item,
          id: newItemId,
          listId: id,
          categoryId: item.categoryId ? categoryIdMap[item.categoryId] ?? null : null,
          createdAt: now,
          updatedAt: now,
        }
      }

      return {
        lists: {
          ...state.lists,
          [id]: {
            id,
            name: listData.name ? `${listData.name} (importata)` : 'Lista importata',
            icon: listData.icon ?? 'home',
            color: listData.color ?? 'blush',
            shareCode: null,
            mode: 'local',
            ownerId: null,
            createdAt: now,
            updatedAt: now,
          },
        },
        listOrder: [...state.listOrder, id],
        categories: { ...state.categories, ...newCategories },
        items: { ...state.items, ...newItems },
        activeListId: id,
      }
    })
    autoSyncIfLoggedIn(get, id)
    return id
  },

  // Replaces/inserts a fully-formed cloud list (with its categories/items)
  // into local state — used both when upgrading a local list to cloud and
  // when joining someone else's shared list via an invite link.
  mergeCloudList: ({ list, categories = [], items = [] }) => {
    set((state) => ({
      lists: { ...state.lists, [list.id]: list },
      listOrder: state.listOrder.includes(list.id) ? state.listOrder : [...state.listOrder, list.id],
      categories: {
        ...state.categories,
        ...Object.fromEntries(categories.map((c) => [c.id, c])),
      },
      items: {
        ...state.items,
        ...Object.fromEntries(items.map((i) => [i.id, i])),
      },
      activeListId: list.id,
    }))
  },
})
