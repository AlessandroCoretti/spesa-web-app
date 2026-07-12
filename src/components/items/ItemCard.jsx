import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, Trash2 } from 'lucide-react'
import { useStore } from '../../store'
import { STATUS_META } from '../../store/statuses'
import { colorTokens } from '../../styles/colorTokens'
import { DeleteConfirmDialog } from './DeleteConfirmDialog'
import { SecretNoteBadge } from './SecretNoteBadge'

const SWIPE_LEFT_THRESHOLD = -80
const SWIPE_RIGHT_THRESHOLD = 80
const TAP_SUPPRESS_DISTANCE = 8
const AXIS_LOCK_DISTANCE = 6

export function ItemCard({ item, onReorderDragStart, onReorderDrag, onReorderDragEnd }) {
  const openSheet = useStore((state) => state.openSheet)
  const deleteItem = useStore((state) => state.deleteItem)
  const setItemStatus = useStore((state) => state.setItemStatus)
  const showToast = useStore((state) => state.showToast)
  const [confirming, setConfirming] = useState(false)
  const [isReordering, setIsReordering] = useState(false)
  const draggedRef = useRef(false)
  const axisRef = useRef(null)
  const meta = STATUS_META[item.status]
  const tokens = colorTokens(meta.color)
  const canSwipeToBuy = item.status !== 'da_comprare'

  const handleDragStart = () => {
    axisRef.current = null
    onReorderDragStart?.()
  }

  const handleDrag = (_, info) => {
    if (!axisRef.current) {
      if (Math.abs(info.offset.x) > AXIS_LOCK_DISTANCE || Math.abs(info.offset.y) > AXIS_LOCK_DISTANCE) {
        axisRef.current = Math.abs(info.offset.x) > Math.abs(info.offset.y) ? 'x' : 'y'
        if (axisRef.current === 'y') setIsReordering(true)
      }
    }
    if (axisRef.current === 'y') {
      onReorderDrag?.(info)
    }
  }

  const handleDragEnd = (_, info) => {
    if (Math.abs(info.offset.x) > TAP_SUPPRESS_DISTANCE || Math.abs(info.offset.y) > TAP_SUPPRESS_DISTANCE) {
      draggedRef.current = true
    }
    if (axisRef.current === 'x') {
      if (info.offset.x < SWIPE_LEFT_THRESHOLD) {
        setConfirming(true)
      } else if (canSwipeToBuy && info.offset.x > SWIPE_RIGHT_THRESHOLD) {
        const previousStatus = item.status
        setItemStatus(item.id, 'da_comprare')
        showToast(`"${item.name}" spostato in Da comprare`, {
          action: { label: 'Annulla', onClick: () => setItemStatus(item.id, previousStatus) },
        })
      }
    }
    onReorderDragEnd?.(info)
    axisRef.current = null
    setIsReordering(false)
  }

  const handleTap = () => {
    if (draggedRef.current) {
      draggedRef.current = false
      return
    }
    openSheet('item-form', { editingItemId: item.id })
  }

  const handleDelete = () => {
    deleteItem(item.id)
    showToast('Prodotto eliminato 🗑️')
    setConfirming(false)
  }

  return (
    <>
      <div className="relative rounded-2xl">
        {isReordering ? (
          <div className="absolute inset-0 rounded-2xl border-2 border-dashed border-blush-200 bg-blush-50/60" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-between overflow-hidden rounded-2xl text-white">
            <div className={`flex h-full flex-1 items-center pl-5 ${canSwipeToBuy ? 'bg-mint-400' : 'bg-transparent'}`}>
              {canSwipeToBuy && <ShoppingCart className="h-5 w-5" />}
            </div>
            <div className="flex h-full items-center bg-coral-400 pr-5">
              <Trash2 className="h-5 w-5" />
            </div>
          </div>
        )}
        <motion.button
          type="button"
          drag
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          dragElastic={{ left: 0.6, right: canSwipeToBuy ? 0.6 : 0, top: 1, bottom: 1 }}
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          onTap={handleTap}
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
            <span className="flex items-center gap-1.5">
              <span className="truncate font-semibold text-ink">{item.name}</span>
              <SecretNoteBadge item={item} />
            </span>
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
