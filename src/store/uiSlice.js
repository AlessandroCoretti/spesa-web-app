import { generateId } from '../utils/id'

export const createUiSlice = (set, get) => ({
  toast: null,
  activeSheet: null,
  editingItemId: null,

  showToast: (message) => {
    set({ toast: { id: generateId(), message } })
  },
  clearToast: () => set({ toast: null }),

  openSheet: (sheet, payload = {}) => set({ activeSheet: sheet, ...payload }),
  closeSheet: () => set({ activeSheet: null, editingItemId: null }),
})
