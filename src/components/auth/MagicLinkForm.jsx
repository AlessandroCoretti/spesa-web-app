import { useState } from 'react'
import { Mail } from 'lucide-react'
import { useStore } from '../../store'
import { isSupabaseConfigured } from '../../sync/supabaseClient'

export function MagicLinkForm({ onSent }) {
  const signInWithEmail = useStore((state) => state.signInWithEmail)
  const showToast = useStore((state) => state.showToast)
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setSending(true)
    try {
      await signInWithEmail(email.trim())
      setSent(true)
      onSent?.()
    } catch {
      showToast('Non siamo riusciti a inviare il link, riprova')
    } finally {
      setSending(false)
    }
  }

  if (!isSupabaseConfigured) {
    return (
      <p className="rounded-2xl bg-coral-50 px-4 py-3 text-sm text-coral-600">
        La sincronizzazione non è ancora configurata su questo deployment.
      </p>
    )
  }

  if (sent) {
    return (
      <p className="rounded-2xl bg-mint-50 px-4 py-3 text-sm text-mint-500">
        Ti abbiamo mandato un link di accesso via email: apri quello per continuare.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label className="block text-sm font-semibold text-ink-soft" htmlFor="login-email">
        La tua email
      </label>
      <div className="flex items-center gap-2 rounded-2xl border border-blush-100 bg-blush-50/60 px-4 py-3">
        <Mail className="h-4 w-4 text-blush-400" />
        <input
          id="login-email"
          type="email"
          required
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nome@esempio.it"
          className="w-full bg-transparent text-ink outline-none"
        />
      </div>
      <button
        type="submit"
        disabled={sending || !email.trim()}
        className="rounded-full bg-blush-500 py-3.5 font-heading font-semibold text-white shadow-(--shadow-soft) disabled:opacity-40"
      >
        {sending ? 'Invio in corso…' : 'Invia link di accesso'}
      </button>
    </form>
  )
}
