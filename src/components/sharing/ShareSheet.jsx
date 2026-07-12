import { Download, Share2 } from 'lucide-react'
import { useParams } from 'react-router'
import { useShallow } from 'zustand/react/shallow'
import { useStore } from '../../store'
import { Sheet } from '../common/Sheet'

export function ShareSheet({ open, onClose }) {
  const { listId } = useParams()
  const list = useStore((state) => state.lists[listId])
  const categories = useStore(
    useShallow((state) => Object.values(state.categories).filter((c) => c.listId === listId))
  )
  const items = useStore(
    useShallow((state) => Object.values(state.items).filter((i) => i.listId === listId))
  )
  const showToast = useStore((state) => state.showToast)

  const buildPayload = () => ({
    name: list?.name,
    icon: list?.icon,
    color: list?.color,
    categories: categories.map(({ id, name, color, icon, order }) => ({ id, name, color, icon, order })),
    items: items.map(({ id, categoryId, name, status, note, quantity }) => ({
      id,
      categoryId,
      name,
      status,
      note,
      quantity,
    })),
  })

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
    if (navigator.share) {
      try {
        await navigator.share({ title: `Lista: ${list?.name}`, url })
        return
      } catch {
        // user cancelled share sheet, fall through to clipboard copy
      }
    }
    await navigator.clipboard.writeText(url)
    showToast('Link copiato negli appunti 🔗')
  }

  return (
    <Sheet open={open} onClose={onClose} title="Condividi lista">
      <p className="mb-4 text-sm text-ink-soft">
        Chi apre il link o il file riceverà una copia di questa lista sul proprio dispositivo.
      </p>
      <div className="flex flex-col gap-2.5">
        <button
          type="button"
          onClick={handleShare}
          className="flex items-center justify-center gap-2 rounded-full bg-blush-500 py-3.5 font-heading font-semibold text-white shadow-(--shadow-soft)"
        >
          <Share2 className="h-4 w-4" />
          Condividi link
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
