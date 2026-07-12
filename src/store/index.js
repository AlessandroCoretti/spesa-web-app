import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { idbStorage } from './storage'
import { createListsSlice } from './listsSlice'
import { createCategoriesSlice } from './categoriesSlice'
import { createItemsSlice } from './itemsSlice'
import { createUiSlice } from './uiSlice'
import { createAuthSlice } from './authSlice'
import { createExpensesSlice } from './expensesSlice'

export const useStore = create(
  persist(
    (set, get, api) => ({
      ...createListsSlice(set, get, api),
      ...createCategoriesSlice(set, get, api),
      ...createItemsSlice(set, get, api),
      ...createUiSlice(set, get, api),
      ...createAuthSlice(set, get, api),
      ...createExpensesSlice(set, get, api),
    }),
    {
      name: 'dispensa-store',
      storage: idbStorage,
      partialize: (state) => ({
        lists: state.lists,
        listOrder: state.listOrder,
        activeListId: state.activeListId,
        categories: state.categories,
        items: state.items,
        staleReminderShownDates: state.staleReminderShownDates,
        expenses: state.expenses,
      }),
    }
  )
)
