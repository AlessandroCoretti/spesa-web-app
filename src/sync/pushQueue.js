import { get as idbGet, set as idbSet } from 'idb-keyval'
import { supabase, isSupabaseConfigured } from './supabaseClient'
import { generateId } from '../utils/id'

const QUEUE_KEY = 'dispensa-sync-queue'

async function readQueue() {
  return (await idbGet(QUEUE_KEY)) ?? []
}

async function writeQueue(queue) {
  await idbSet(QUEUE_KEY, queue)
}

// job: { table: 'items'|'categories'|'lists', op: 'upsert'|'delete', payload }
export async function enqueuePush(job) {
  const queue = await readQueue()
  queue.push({ id: generateId(), createdAt: Date.now(), retries: 0, ...job })
  await writeQueue(queue)
  if (navigator.onLine) flushQueue()
}

async function runJob(job) {
  try {
    if (job.op === 'delete') {
      const { error } = await supabase.from(job.table).delete().eq('id', job.payload.id)
      if (error) throw error
    } else {
      const { error } = await supabase.from(job.table).upsert(job.payload)
      if (error) throw error
    }
    return true
  } catch {
    return false
  }
}

let flushing = false

export async function flushQueue() {
  if (!isSupabaseConfigured || flushing) return
  flushing = true
  try {
    let queue = await readQueue()
    while (queue.length > 0) {
      const ok = await runJob(queue[0])
      if (!ok) break
      queue = queue.slice(1)
      await writeQueue(queue)
    }
  } finally {
    flushing = false
  }
}

export function initPushQueue() {
  if (!isSupabaseConfigured) return
  window.addEventListener('online', flushQueue)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') flushQueue()
  })
  setInterval(flushQueue, 30000)
  flushQueue()
}
