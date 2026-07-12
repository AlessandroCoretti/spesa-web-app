import { generateId } from '../utils/id'
import { enqueuePush } from '../sync/pushQueue'
import { expenseToRow } from '../sync/mappers'

function pushIfCloud(get, listId, op, payload) {
  const list = get().lists[listId]
  if (list?.mode === 'cloud') {
    enqueuePush({ table: 'expenses', op, payload })
  }
}

export const createExpensesSlice = (set, get) => ({
  expenses: {},

  addExpense: (listId, { description, amount, paidBy, date = Date.now(), splits, note = '' }) => {
    const id = generateId()
    const now = Date.now()
    const expense = { id, listId, description, amount, paidBy, date, splits, note, createdAt: now, updatedAt: now }
    set((state) => ({ expenses: { ...state.expenses, [id]: expense } }))
    pushIfCloud(get, listId, 'upsert', expenseToRow(expense))
    return id
  },

  updateExpense: (id, updates) => {
    let updated
    set((state) => {
      if (!state.expenses[id]) return state
      updated = { ...state.expenses[id], ...updates, updatedAt: Date.now() }
      return { expenses: { ...state.expenses, [id]: updated } }
    })
    if (updated) pushIfCloud(get, updated.listId, 'upsert', expenseToRow(updated))
  },

  deleteExpense: (id) => {
    const expense = get().expenses[id]
    set((state) => {
      const { [id]: _removed, ...remaining } = state.expenses
      return { expenses: remaining }
    })
    if (expense) pushIfCloud(get, expense.listId, 'delete', { id })
  },

  applyRemoteExpense: (remoteExpense) => {
    set((state) => {
      const local = state.expenses[remoteExpense.id]
      if (local && local.updatedAt >= remoteExpense.updatedAt) return state
      return { expenses: { ...state.expenses, [remoteExpense.id]: remoteExpense } }
    })
  },

  removeRemoteExpense: (id) => {
    set((state) => {
      const { [id]: _removed, ...remaining } = state.expenses
      return { expenses: remaining }
    })
  },
})
