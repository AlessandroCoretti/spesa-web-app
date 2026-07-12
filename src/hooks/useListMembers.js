import { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../sync/supabaseClient'

// Reads list_members + profiles for a cloud list. Membership isn't part of
// the offline-first persisted store (it's not something a device needs to
// read while offline), so this is a plain one-shot Supabase query.
export function useListMembers(listId, { enabled = true } = {}) {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!enabled || !isSupabaseConfigured || !listId) return
    let cancelled = false
    setLoading(true)

    supabase
      .from('list_members')
      .select('user_id, role, profiles(id, email)')
      .eq('list_id', listId)
      .then(({ data }) => {
        if (cancelled) return
        setMembers(
          (data ?? []).map((row) => ({
            userId: row.user_id,
            role: row.role,
            email: row.profiles?.email ?? row.user_id,
          }))
        )
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [listId, enabled])

  return { members, loading }
}
