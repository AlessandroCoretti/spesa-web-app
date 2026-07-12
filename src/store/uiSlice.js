import { generateId } from '../utils/id'

export const createUiSlice = (set, get) => ({
  toast: null,
  activeSheet: null,
  editingItemId: null,
  staleReminderShownDates: {},

  markStaleReminderShown: (listId, dateKey) =>
    set((state) => ({
      staleReminderShownDates: { ...state.staleReminderShownDates, [listId]: dateKey },
    })),

  showToast: (message, { action } = {}) => {
    set({ toast: { id: generateId(), message, action } })
  },
  clearToast: () => set({ toast: null }),

  openSheet: (sheet, payload = {}) => set({ activeSheet: sheet, ...payload }),
  closeSheet: () => set({ activeSheet: null, editingItemId: null }),
})
