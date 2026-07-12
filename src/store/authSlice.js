import { supabase, isSupabaseConfigured } from '../sync/supabaseClient'

// Tracked at module scope (not in the store) so it survives independently of
// re-renders and only fires once per "a session became available" moment,
// not on every token refresh while already signed in.
let hasAutoSyncedThisSession = false

export const createAuthSlice = (set) => {
  if (isSupabaseConfigured) {
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session })
      if (session && !hasAutoSyncedThisSession) {
        hasAutoSyncedThisSession = true
        // Being logged in is enough to keep everything backed up — no need
        // to remember to tap "Sincronizza" per list. Dynamic import avoids a
        // module-load-time circular dependency with the store.
        import('../sync/upgradeListToCloud').then(({ syncAllLocalListsToCloud }) => {
          syncAllLocalListsToCloud()
        })
      } else if (!session) {
        hasAutoSyncedThisSession = false
      }
    })
  }

  return {
    session: null,

    signInWithEmail: async (email) => {
      if (!isSupabaseConfigured) {
        throw new Error('supabase_not_configured')
      }
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.href },
      })
      if (error) throw error
    },

    signOut: async () => {
      if (!isSupabaseConfigured) return
      await supabase.auth.signOut()
      set({ session: null })
    },

    deleteAccount: async () => {
      if (!isSupabaseConfigured) return
      const { error } = await supabase.rpc('delete_own_account')
      if (error) throw error
      await supabase.auth.signOut()
      set({ session: null })
    },
  }
}
