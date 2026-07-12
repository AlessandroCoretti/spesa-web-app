import { supabase, isSupabaseConfigured } from './supabaseClient'
import { useStore } from '../store'
import { listToRow, categoryToRow, itemToRow, subListToRow } from './mappers'
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
  let subLists = Object.values(state.subLists).filter((s) => s.listId === listId)
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
    const subListIdMap = {}
    subLists = subLists.map((s) => {
      const newId = generateId()
      subListIdMap[s.id] = newId
      return {
        ...s,
        id: newId,
        listId: finalListId,
        categoryId: s.categoryId ? categoryIdMap[s.categoryId] ?? null : null,
      }
    })
    items = items.map((i) => ({
      ...i,
      id: generateId(),
      listId: finalListId,
      categoryId: i.categoryId ? categoryIdMap[i.categoryId] ?? null : null,
      subListId: i.subListId ? subListIdMap[i.subListId] ?? null : null,
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
  if (subLists.length > 0) {
    const { error } = await supabase.from('sub_lists').insert(subLists.map(subListToRow))
    if (error) throw error
  }
  // sub_lists must exist before items (items.sub_list_id references them).
  if (items.length > 0) {
    const { error } = await supabase.from('items').insert(items.map(itemToRow))
    if (error) throw error
  }

  if (finalListId !== listId) {
    useStore.getState().deleteList(listId)
  }
  useStore.getState().mergeCloudList({ list: cloudList, categories, items })
  subLists.forEach((subList) => useStore.getState().applyRemoteSubList(subList))

  return finalListId
}

// Auto-sync: called once a session becomes available (fresh login, or an
// already-logged-in session restored on app start), so people don't have to
// remember to tap "Sincronizza" per list — being logged in is enough to keep
// everything backed up to the cloud from then on.
export async function syncAllLocalListsToCloud() {
  const state = useStore.getState()
  const localListIds = state.listOrder.filter((id) => state.lists[id]?.mode === 'local')
  let syncedCount = 0
  for (const id of localListIds) {
    try {
      await upgradeListToCloud(id)
      syncedCount += 1
    } catch {
      // best-effort — leave it local if something goes wrong (e.g. offline);
      // it'll be retried next time a session becomes available.
    }
  }
  if (syncedCount > 0) {
    useStore.getState().showToast('Le tue liste sono ora salvate nel cloud ☁️')
  }
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
