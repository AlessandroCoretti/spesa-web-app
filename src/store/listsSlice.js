import { generateId } from '../utils/id'

const DEFAULT_LIST_ID = generateId()

export const createListsSlice = (set, get) => ({
  lists: {
    [DEFAULT_LIST_ID]: {
      id: DEFAULT_LIST_ID,
      name: 'Casa',
      icon: 'home',
      color: 'blush',
      shareCode: null,
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
        [id]: { id, name, icon, color, shareCode: null, createdAt: now, updatedAt: now },
      },
      listOrder: [...state.listOrder, id],
      activeListId: id,
    }))
    return id
  },

  renameList: (id, name) => {
    set((state) => {
      if (!state.lists[id]) return state
      return {
        lists: {
          ...state.lists,
          [id]: { ...state.lists[id], name, updatedAt: Date.now() },
        },
      }
    })
  },

  deleteList: (id) => {
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
    return id
  },
})
