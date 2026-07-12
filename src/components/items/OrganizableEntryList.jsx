import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { GripVertical } from 'lucide-react'
import { useStore } from '../../store'
import { ItemCard } from './ItemCard'
import { FolderTile } from './FolderTile'

const HOLD_TO_MERGE_MS = 600

function keyFor(entry) {
  return entry.type === 'item' ? `item:${entry.item.id}` : `folder:${entry.folder.id}`
}

export function OrganizableEntryList({ entries, listId, categoryId, onOpenFolder }) {
  const updateItem = useStore((state) => state.updateItem)
  const updateFolder = useStore((state) => state.updateFolder)
  const createFolderFromItems = useStore((state) => state.createFolderFromItems)
  const addItemToFolder = useStore((state) => state.addItemToFolder)
  const showToast = useStore((state) => state.showToast)

  const rowRefs = useRef({})
  const holdTimerRef = useRef(null)
  const [dragKey, setDragKey] = useState(null)
  const [hoverKey, setHoverKey] = useState(null)
  const [holdReady, setHoldReady] = useState(false)

  const findHoverTarget = (clientY, excludeKey) => {
    for (const entry of entries) {
      const key = keyFor(entry)
      if (key === excludeKey) continue
      const el = rowRefs.current[key]
      if (!el) continue
      const rect = el.getBoundingClientRect()
      if (clientY >= rect.top && clientY <= rect.bottom) return key
    }
    return null
  }

  const clearHold = () => {
    clearTimeout(holdTimerRef.current)
    holdTimerRef.current = null
  }

  const handleDragStart = (key) => {
    setDragKey(key)
    setHoverKey(null)
    setHoldReady(false)
  }

  const handleDrag = (key, info) => {
    const target = findHoverTarget(info.point.y, key)
    setHoverKey((prevHover) => {
      if (target === prevHover) return prevHover
      clearHold()
      setHoldReady(false)
      if (target) {
        holdTimerRef.current = setTimeout(() => setHoldReady(true), HOLD_TO_MERGE_MS)
      }
      return target
    })
  }

  const reorder = (draggedKey, targetKey, movedDown) => {
    const withoutDragged = entries.filter((e) => keyFor(e) !== draggedKey)
    const targetIndex = withoutDragged.findIndex((e) => keyFor(e) === targetKey)
    if (targetIndex === -1) return
    const insertIndex = movedDown ? targetIndex + 1 : targetIndex
    const draggedEntry = entries.find((e) => keyFor(e) === draggedKey)
    withoutDragged.splice(insertIndex, 0, draggedEntry)

    withoutDragged.forEach((entry, index) => {
      const order = index * 1000
      if (entry.order === order) return
      if (entry.type === 'item') updateItem(entry.item.id, { order })
      else updateFolder(entry.folder.id, { order })
    })
  }

  const handleDragEnd = (key, entry, info) => {
    clearHold()
    const wasHoldReady = holdReady
    const target = hoverKey
    setDragKey(null)
    setHoverKey(null)
    setHoldReady(false)

    if (!target) return
    const targetEntry = entries.find((e) => keyFor(e) === target)
    if (!targetEntry) return

    if (wasHoldReady && entry.type === 'item') {
      if (targetEntry.type === 'item') {
        createFolderFromItems(listId, categoryId, [entry.item.id, targetEntry.item.id])
        showToast('Cartella creata 📁')
      } else {
        addItemToFolder(targetEntry.folder.id, entry.item.id)
        showToast(`"${entry.item.name}" aggiunto alla cartella`)
      }
      return
    }

    reorder(key, target, info.offset.y > 0)
  }

  return (
    <div className="flex flex-col gap-2">
      <AnimatePresence initial={false}>
        {entries.map((entry) => {
          const key = keyFor(entry)
          const isDragging = dragKey === key
          const isHoverTarget = hoverKey === key && dragKey !== key

          return (
            <motion.div
              key={key}
              ref={(el) => {
                if (el) rowRefs.current[key] = el
                else delete rowRefs.current[key]
              }}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: isHoverTarget && holdReady ? 1.04 : 1,
              }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`flex items-center gap-1 rounded-2xl ${
                isHoverTarget ? (holdReady ? 'ring-2 ring-mint-400' : 'ring-2 ring-blush-300') : ''
              }`}
              style={{ zIndex: isDragging ? 10 : 0, position: 'relative' }}
            >
              <motion.div
                drag="y"
                dragElastic={0.2}
                dragMomentum={false}
                dragSnapToOrigin
                onDragStart={() => handleDragStart(key)}
                onDrag={(_, info) => handleDrag(key, info)}
                onDragEnd={(_, info) => handleDragEnd(key, entry, info)}
                whileDrag={{ scale: 1.05, zIndex: 20 }}
                className="grid h-9 w-6 shrink-0 cursor-grab place-items-center text-ink-soft/50 active:cursor-grabbing"
              >
                <GripVertical className="h-4 w-4" />
              </motion.div>
              <div className="min-w-0 flex-1">
                {entry.type === 'item' ? (
                  <ItemCard item={entry.item} />
                ) : (
                  <FolderTile folder={entry.folder} items={entry.items} onOpen={() => onOpenFolder(entry.folder.id)} />
                )}
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
