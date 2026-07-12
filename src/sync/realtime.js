import { supabase, isSupabaseConfigured } from './supabaseClient'
import { useStore } from '../store'
import { rowToItem, rowToCategory, rowToExpense, rowToFolder } from './mappers'

let channel = null
let currentListId = null

export function subscribeToList(listId) {
  if (currentListId === listId) return
  unsubscribeFromList()
  if (!isSupabaseConfigured || !listId) return

  currentListId = listId
  channel = supabase
    .channel(`list-${listId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'items', filter: `list_id=eq.${listId}` },
      handleItemChange
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'categories', filter: `list_id=eq.${listId}` },
      handleCategoryChange
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'expenses', filter: `list_id=eq.${listId}` },
      handleExpenseChange
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'folders', filter: `list_id=eq.${listId}` },
      handleFolderChange
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') reconcile(listId)
    })
}

export function unsubscribeFromList() {
  if (channel) {
    supabase?.removeChannel(channel)
    channel = null
  }
  currentListId = null
}

function handleItemChange(payload) {
  const { applyRemoteItem, removeRemoteItem } = useStore.getState()
  if (payload.eventType === 'DELETE') {
    removeRemoteItem(payload.old.id)
  } else {
    applyRemoteItem(rowToItem(payload.new))
  }
}

function handleCategoryChange(payload) {
  const { applyRemoteCategory, removeRemoteCategory } = useStore.getState()
  if (payload.eventType === 'DELETE') {
    removeRemoteCategory(payload.old.id)
  } else {
    applyRemoteCategory(rowToCategory(payload.new))
  }
}

function handleExpenseChange(payload) {
  const { applyRemoteExpense, removeRemoteExpense } = useStore.getState()
  if (payload.eventType === 'DELETE') {
    removeRemoteExpense(payload.old.id)
  } else {
    applyRemoteExpense(rowToExpense(payload.new))
  }
}

function handleFolderChange(payload) {
  const { applyRemoteFolder, removeRemoteFolder } = useStore.getState()
  if (payload.eventType === 'DELETE') {
    removeRemoteFolder(payload.old.id)
  } else {
    applyRemoteFolder(rowToFolder(payload.new))
  }
}

// Supabase Realtime doesn't replay events missed while disconnected, so on
// every (re)connect we fetch anything newer than what we already have and
// merge it through the same last-write-wins path as live events.
async function reconcile(listId) {
  const state = useStore.getState()
  const localItems = Object.values(state.items).filter((i) => i.listId === listId)
  const maxUpdated = localItems.reduce((max, i) => Math.max(max, i.updatedAt), 0)
  const sinceIso = new Date(maxUpdated || 0).toISOString()

  const { data: items } = await supabase
    .from('items')
    .select('*')
    .eq('list_id', listId)
    .gt('updated_at', sinceIso)
  items?.forEach((row) => state.applyRemoteItem(rowToItem(row)))

  const { data: categories } = await supabase.from('categories').select('*').eq('list_id', listId)
  categories?.forEach((row) => state.applyRemoteCategory(rowToCategory(row)))

  const { data: expenses } = await supabase.from('expenses').select('*').eq('list_id', listId)
  expenses?.forEach((row) => state.applyRemoteExpense(rowToExpense(row)))

  const { data: folders } = await supabase.from('folders').select('*').eq('list_id', listId)
  folders?.forEach((row) => state.applyRemoteFolder(rowToFolder(row)))
}
