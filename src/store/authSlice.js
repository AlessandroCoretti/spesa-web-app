import { supabase, isSupabaseConfigured } from '../sync/supabaseClient'

export const createAuthSlice = (set) => {
  if (isSupabaseConfigured) {
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session })
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
  }
}
