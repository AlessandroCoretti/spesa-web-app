import { useState } from 'react'
import { motion } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import { useStore } from '../../store'
import { STATUS_META } from '../../store/statuses'
import { colorTokens } from '../../styles/colorTokens'
import { DeleteConfirmDialog } from './DeleteConfirmDialog'

const SWIPE_THRESHOLD = -80

export function ItemCard({ item }) {
  const openSheet = useStore((state) => state.openSheet)
  const deleteItem = useStore((state) => state.deleteItem)
  const showToast = useStore((state) => state.showToast)
  const [confirming, setConfirming] = useState(false)
  const meta = STATUS_META[item.status]
  const tokens = colorTokens(meta.color)

  const handleDragEnd = (_, info) => {
    if (info.offset.x < SWIPE_THRESHOLD) {
      setConfirming(true)
    }
  }

  const handleDelete = () => {
    deleteItem(item.id)
    showToast('Prodotto eliminato 🗑️')
    setConfirming(false)
  }

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl">
        <div className="absolute inset-0 flex items-center justify-end bg-coral-400 pr-5 text-white">
          <Trash2 className="h-5 w-5" />
        </div>
        <motion.button
          type="button"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={{ left: 0.6, right: 0 }}
          onDragEnd={handleDragEnd}
          onClick={() => openSheet('item-form', { editingItemId: item.id })}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          layout
          className="relative flex w-full items-center gap-3 rounded-2xl bg-white px-4 py-3 text-left shadow-sm"
        >
          <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${tokens.bg100} ${tokens.text}`}>
            •
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-semibold text-ink">{item.name}</span>
            {item.note && <span className="block truncate text-xs text-ink-soft">{item.note}</span>}
          </span>
          {item.quantity != null && (
            <span className="shrink-0 text-sm font-semibold text-ink-soft">×{item.quantity}</span>
          )}
        </motion.button>
      </div>
      <DeleteConfirmDialog
        open={confirming}
        itemName={item.name}
        onCancel={() => setConfirming(false)}
        onConfirm={handleDelete}
      />
    </>
  )
}
