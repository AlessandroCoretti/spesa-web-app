import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useStore } from '../store'
import { supabase, isSupabaseConfigured } from '../sync/supabaseClient'
import { rowToList, rowToCategory, rowToItem } from '../sync/mappers'
import { MagicLinkForm } from '../components/auth/MagicLinkForm'

export default function JoinView() {
  const { code } = useParams()
  const navigate = useNavigate()
  const session = useStore((state) => state.session)
  const mergeCloudList = useStore((state) => state.mergeCloudList)
  const showToast = useStore((state) => state.showToast)
  const [status, setStatus] = useState('idle') // idle | joining | error

  useEffect(() => {
    if (!session || !isSupabaseConfigured) return

    let cancelled = false
    setStatus('joining')

    const join = async () => {
      const { data: listId, error: rpcError } = await supabase.rpc('accept_invite', {
        invite_code: code,
      })
      if (rpcError) {
        if (cancelled) return
        setStatus('error')
        return
      }

      const [{ data: listRow }, { data: categoryRows }, { data: itemRows }] = await Promise.all([
        supabase.from('lists').select('*').eq('id', listId).single(),
        supabase.from('categories').select('*').eq('list_id', listId),
        supabase.from('items').select('*').eq('list_id', listId),
      ])
      if (cancelled) return

      mergeCloudList({
        list: rowToList(listRow),
        categories: (categoryRows ?? []).map(rowToCategory),
        items: (itemRows ?? []).map(rowToItem),
      })
      showToast('Ti sei unito alla lista 🎉')
      navigate(`/list/${listId}/da_comprare`)
    }

    join()
    return () => {
      cancelled = true
    }
  }, [session, code, mergeCloudList, navigate, showToast])

  return (
    <div className="mx-auto flex h-dvh max-w-md flex-col overflow-hidden bg-blush-50/40">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto flex max-w-xs flex-col items-center gap-4 pt-16 text-center">
          <h1 className="font-heading text-2xl font-bold text-blush-700">Sei stato invitato 🌸</h1>

          {!isSupabaseConfigured && (
            <p className="rounded-2xl bg-coral-50 px-4 py-3 text-sm text-coral-600">
              La sincronizzazione non è configurata su questo deployment.
            </p>
          )}

          {isSupabaseConfigured && status === 'error' && (
            <p className="rounded-2xl bg-coral-50 px-4 py-3 text-sm text-coral-600">
              Questo link non è più valido: potrebbe essere scaduto o già stato usato troppe volte.
            </p>
          )}

          {isSupabaseConfigured && status === 'joining' && (
            <p className="text-sm text-ink-soft">Ti stiamo aggiungendo alla lista…</p>
          )}

          {isSupabaseConfigured && status === 'idle' && !session && (
            <>
              <p className="text-sm text-ink-soft">
                Accedi con la tua email per unirti alla lista condivisa.
              </p>
              <div className="w-full">
                <MagicLinkForm />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
