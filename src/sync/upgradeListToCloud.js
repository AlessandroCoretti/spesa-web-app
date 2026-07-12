import { supabase, isSupabaseConfigured } from './supabaseClient'
import { useStore } from '../store'
import { listToRow, categoryToRow, itemToRow } from './mappers'
import { generateId } from '../utils/id'

const isUuid = (id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

// Turns a purely local list into a Supabase-backed one: creates the rows
// server-side, marks the list `mode: 'cloud'` locally, and from then on the
// normal store actions push their changes via the sync queue.
export async function upgradeListToCloud(listId) {
  if (!isSupabaseConfigured) throw new Error('supabase_not_configured')
  const state = useStore.getState()
  if (!state.session) throw new Error('not_authenticated')

  const localList = state.lists[listId]
  if (!localList) throw new Error('list_not_found')
  if (localList.mode === 'cloud') return localList.id

  const ownerId = state.session.user.id
  let finalListId = listId
  let categories = Object.values(state.categories).filter((c) => c.listId === listId)
  let items = Object.values(state.items).filter((i) => i.listId === listId)

  if (!isUuid(listId)) {
    finalListId = generateId()
    if (!isUuid(finalListId)) throw new Error('secure_context_required')
    const categoryIdMap = {}
    categories = categories.map((c) => {
      const newId = generateId()
      categoryIdMap[c.id] = newId
      return { ...c, id: newId, listId: finalListId }
    })
    items = items.map((i) => ({
      ...i,
      id: generateId(),
      listId: finalListId,
      categoryId: i.categoryId ? categoryIdMap[i.categoryId] ?? null : null,
    }))
  }

  const cloudList = { ...localList, id: finalListId, mode: 'cloud', ownerId }

  const { error: listError } = await supabase.from('lists').insert(listToRow(cloudList))
  if (listError) throw listError

  const { error: memberError } = await supabase
    .from('list_members')
    .insert({ list_id: finalListId, user_id: ownerId, role: 'owner' })
  if (memberError) throw memberError

  if (categories.length > 0) {
    const { error } = await supabase.from('categories').insert(categories.map(categoryToRow))
    if (error) throw error
  }
  if (items.length > 0) {
    const { error } = await supabase.from('items').insert(items.map(itemToRow))
    if (error) throw error
  }

  if (finalListId !== listId) {
    useStore.getState().deleteList(listId)
  }
  useStore.getState().mergeCloudList({ list: cloudList, categories, items })

  return finalListId
}

export async function createInviteLink(listId) {
  if (!isSupabaseConfigured) throw new Error('supabase_not_configured')
  const { session } = useStore.getState()
  if (!session) throw new Error('not_authenticated')

  const { data, error } = await supabase
    .from('invites')
    .insert({ list_id: listId, created_by: session.user.id })
    .select()
    .single()
  if (error) throw error

  return `${window.location.origin}/join/${data.code}`
}
