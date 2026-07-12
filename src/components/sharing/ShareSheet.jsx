import { useState } from 'react'
import { Download, RefreshCw, Share2 } from 'lucide-react'
import { useParams } from 'react-router'
import { useShallow } from 'zustand/react/shallow'
import { useStore } from '../../store'
import { Sheet } from '../common/Sheet'
import { upgradeListToCloud, createInviteLink } from '../../sync/upgradeListToCloud'
import { isSupabaseConfigured } from '../../sync/supabaseClient'

export function ShareSheet({ open, onClose }) {
  const { listId } = useParams()
  const list = useStore((state) => state.lists[listId])
  const session = useStore((state) => state.session)
  const openSheet = useStore((state) => state.openSheet)
  const cats = useStore(
    useShallow((state) => Object.values(state.categories).filter((c) => c.listId === listId))
  )
  const items = useStore(
    useShallow((state) => Object.values(state.items).filter((i) => i.listId === listId))
  )
  const showToast = useStore((state) => state.showToast)
  const [syncing, setSyncing] = useState(false)

  const buildPayload = () => ({
    name: list?.name,
    icon: list?.icon,
    color: list?.color,
    categories: cats.map(({ id, name, color, icon, order }) => ({ id, name, color, icon, order })),
    items: items.map(({ id, categoryId, name, status, note, quantity }) => ({
      id,
      categoryId,
      name,
      status,
      note,
      quantity,
    })),
  })

  const shareUrl = async (url, title) => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url })
        return
      } catch {
        // user cancelled the native share sheet, fall through to clipboard copy
      }
    }
    await navigator.clipboard.writeText(url)
    showToast('Link copiato negli appunti 🔗')
  }

  const handleDownload = () => {
    const payload = buildPayload()
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(list?.name ?? 'lista').toLowerCase().replace(/\s+/g, '-')}.dispensa.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast('Lista esportata 📤')
  }

  const handleShare = async () => {
    const payload = buildPayload()
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(payload))))
    const url = `${window.location.origin}/import#data=${encoded}`
    await shareUrl(url, `Lista: ${list?.name}`)
  }

  const handleSyncAndShare = async () => {
    if (!isSupabaseConfigured) {
      showToast('La sincronizzazione non è configurata su questo deployment')
      return
    }
    if (!session) {
      openSheet('login')
      return
    }
    setSyncing(true)
    try {
      const cloudListId = list.mode === 'cloud' ? list.id : await upgradeListToCloud(listId)
      const inviteUrl = await createInviteLink(cloudListId)
      await shareUrl(inviteUrl, `Unisciti alla lista: ${list?.name}`)
      showToast('Lista sincronizzata e link generato 🔗')
    } catch {
      showToast('Qualcosa è andato storto, riprova')
    } finally {
      setSyncing(false)
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title="Condividi lista">
      <p className="mb-4 text-sm text-ink-soft">
        {list?.mode === 'cloud'
          ? 'Questa lista è già sincronizzata: chi ha il link vede le modifiche in tempo reale.'
          : 'Sincronizza per aggiornamenti in tempo reale, oppure condividi una copia statica.'}
      </p>
      <div className="flex flex-col gap-2.5">
        <button
          type="button"
          onClick={handleSyncAndShare}
          disabled={syncing}
          className="flex items-center justify-center gap-2 rounded-full bg-blush-500 py-3.5 font-heading font-semibold text-white shadow-(--shadow-soft) disabled:opacity-50"
        >
          <RefreshCw className="h-4 w-4" />
          {syncing ? 'Sincronizzazione…' : list?.mode === 'cloud' ? 'Invita altre persone' : 'Sincronizza e condividi'}
        </button>
        <button
          type="button"
          onClick={handleShare}
          className="flex items-center justify-center gap-2 rounded-full bg-blush-50 py-3.5 font-heading font-semibold text-blush-700"
        >
          <Share2 className="h-4 w-4" />
          Condividi link (copia statica)
        </button>
        <button
          type="button"
          onClick={handleDownload}
          className="flex items-center justify-center gap-2 rounded-full bg-blush-50 py-3.5 font-heading font-semibold text-blush-700"
        >
          <Download className="h-4 w-4" />
          Esporta come file
        </button>
      </div>
    </Sheet>
  )
}
