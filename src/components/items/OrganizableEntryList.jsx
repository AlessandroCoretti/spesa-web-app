import { useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useShallow } from 'zustand/react/shallow'
import { useStore } from '../../store'
import { ItemCard } from './ItemCard'
import { SubListGroup } from './SubListGroup'

const HOLD_TO_GROUP_MS = 600

// Renders a group of items (one category section, or the "uncategorized"
// bucket) with drag-to-reorder (live preview — the target slides out of the
// way while you drag, like reordering apps on a phone home screen), and the
// "drag one item onto another, hold for a bit" gesture that groups them into
// a named, colored sub-list within the same category.
//
// `nested` is used when rendering the items *inside* a sub-list: grouping is
// disabled there (no sub-lists within sub-lists), only reordering applies.
export function OrganizableEntryList({ items, listId, categoryId, nested = false }) {
  const updateItem = useStore((state) => state.updateItem)
  const updateSubList = useStore((state) => state.updateSubList)
  const createSubListFromItems = useStore((state) => state.createSubListFromItems)
  const addItemToSubList = useStore((state) => state.addItemToSubList)
  const showToast = useStore((state) => state.showToast)
  const subLists = useStore(useShallow((state) => state.subLists))

  const rowRefs = useRef({})
  const holdTimerRef = useRef(null)
  // Snapshot of every row's position taken once at drag-start. Hover
  // detection always tests against this frozen snapshot rather than the
  // live DOM, otherwise the live-reorder preview (which visually moves the
  // hovered row out of the way) would make the pointer fall off its target
  // mid-hover, resetting the hold timer and making "hold to group" work
  // only by luck.
  const startRectsRef = useRef({})
  const [dragKey, setDragKey] = useState(null)
  const [hoverKey, setHoverKey] = useState(null)
  const [holdReady, setHoldReady] = useState(false)
  const [dragDirection, setDragDirection] = useState(null)

  const entries = useMemo(() => {
    if (nested) {
      return [...items]
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((item) => ({ type: 'item', key: `item:${item.id}`, order: item.order ?? 0, item }))
    }

    const seen = new Set()
    const result = []
    for (const item of items) {
      if (item.subListId) {
        if (seen.has(item.subListId)) continue
        const subList = subLists[item.subListId]
        if (!subList) continue
        seen.add(item.subListId)
        const members = items.filter((i) => i.subListId === item.subListId)
        result.push({ type: 'sublist', key: `sublist:${subList.id}`, order: subList.order ?? 0, subList, items: members })
      } else {
        result.push({ type: 'item', key: `item:${item.id}`, order: item.order ?? 0, item })
      }
    }
    return result.sort((a, b) => a.order - b.order)
  }, [items, subLists, nested])

  const findHoverTarget = (clientY, excludeKey) => {
    for (const entry of entries) {
      if (entry.key === excludeKey) continue
      const rect = startRectsRef.current[entry.key]
      if (!rect) continue
      if (clientY >= rect.top && clientY <= rect.bottom) return entry.key
    }
    return null
  }

  const clearHold = () => {
    clearTimeout(holdTimerRef.current)
    holdTimerRef.current = null
  }

  const handleDragStart = (key) => {
    startRectsRef.current = Object.fromEntries(
      entries
        .map((entry) => [entry.key, rowRefs.current[entry.key]?.getBoundingClientRect()])
        .filter(([, rect]) => rect)
    )
    setDragKey(key)
    setHoverKey(null)
    setHoldReady(false)
    setDragDirection(null)
  }

  const handleDrag = (key, info) => {
    setDragDirection(info.offset.y > 0 ? 'down' : 'up')
    const target = findHoverTarget(info.point.y, key)
    const draggedType = entries.find((e) => e.key === key)?.type
    setHoverKey((prevHover) => {
      if (target === prevHover) return prevHover
      clearHold()
      setHoldReady(false)
      if (target && !nested && draggedType === 'item') {
        holdTimerRef.current = setTimeout(() => setHoldReady(true), HOLD_TO_GROUP_MS)
      }
      return target
    })
  }

  // While actively dragging, show a live preview: the target slides aside so
  // you can see where the dragged row would land, same as reordering icons
  // on a phone home screen. This is skipped for loose-item drags at the top
  // level, where hovering over another item can also mean "hold to group" —
  // shuffling the list live would move the very target you're trying to
  // hold over, fighting the hold gesture. There it's reorder-at-drop instead
  // (matching how Android itself doesn't shuffle icons while you're hovering
  // to create a folder). Sub-list header drags and nested reordering inside
  // a sub-list have no such conflict, so they always get the live preview.
  const draggedType = dragKey ? entries.find((e) => e.key === dragKey)?.type : null
  const canPreviewLive = nested || draggedType !== 'item'

  const displayEntries = useMemo(() => {
    if (!dragKey || !hoverKey || dragKey === hoverKey || holdReady || !canPreviewLive) return entries
    const without = entries.filter((e) => e.key !== dragKey)
    const targetIndex = without.findIndex((e) => e.key === hoverKey)
    if (targetIndex === -1) return entries
    const insertIndex = dragDirection === 'down' ? targetIndex + 1 : targetIndex
    const dragged = entries.find((e) => e.key === dragKey)
    without.splice(insertIndex, 0, dragged)
    return without
  }, [entries, dragKey, hoverKey, dragDirection, holdReady, canPreviewLive])

  const commitOrder = (finalEntries) => {
    finalEntries.forEach((entry, index) => {
      const order = index * 1000
      if (entry.order === order) return
      if (entry.type === 'item') updateItem(entry.item.id, { order })
      else updateSubList(entry.subList.id, { order })
    })
  }

  const reorderAtDrop = (draggedKey, targetKey, movedDown) => {
    const without = entries.filter((e) => e.key !== draggedKey)
    const targetIndex = without.findIndex((e) => e.key === targetKey)
    if (targetIndex === -1) return entries
    const insertIndex = movedDown ? targetIndex + 1 : targetIndex
    const dragged = entries.find((e) => e.key === draggedKey)
    without.splice(insertIndex, 0, dragged)
    return without
  }

  const handleDragEnd = (key, entry) => {
    clearHold()
    const wasHoldReady = holdReady
    const target = hoverKey
    const wasLivePreview = canPreviewLive
    const direction = dragDirection
    setDragKey(null)
    setHoverKey(null)
    setHoldReady(false)
    setDragDirection(null)

    if (!target) return
    const targetEntry = entries.find((e) => e.key === target)
    if (!targetEntry) return

    if (wasHoldReady && !nested && entry.type === 'item') {
      if (targetEntry.type === 'item') {
        createSubListFromItems(listId, categoryId, [entry.item.id, targetEntry.item.id])
        showToast('Nuova sottolista creata 🌸')
      } else {
        addItemToSubList(targetEntry.subList.id, entry.item.id)
        showToast(`"${entry.item.name}" aggiunto a "${targetEntry.subList.name}"`)
      }
      return
    }

    const finalEntries = wasLivePreview ? displayEntries : reorderAtDrop(key, target, direction === 'down')
    commitOrder(finalEntries)
  }

  return (
    <div className="flex flex-col gap-2">
      <AnimatePresence initial={false}>
        {displayEntries.map((entry) => {
          const isDragging = dragKey === entry.key
          const isHoverTarget = hoverKey === entry.key && dragKey !== entry.key

          return (
            <motion.div
              key={entry.key}
              ref={(el) => {
                if (el) rowRefs.current[entry.key] = el
                else delete rowRefs.current[entry.key]
              }}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0, scale: isHoverTarget && holdReady ? 1.03 : 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ layout: { type: 'spring', stiffness: 500, damping: 40 } }}
              className={`rounded-2xl ${
                isHoverTarget ? (holdReady ? 'ring-2 ring-mint-400' : 'ring-2 ring-blush-300') : ''
              }`}
              style={{ zIndex: isDragging ? 10 : 0, position: 'relative' }}
            >
              {entry.type === 'item' ? (
                <ItemCard
                  item={entry.item}
                  onReorderDragStart={() => handleDragStart(entry.key)}
                  onReorderDrag={(info) => handleDrag(entry.key, info)}
                  onReorderDragEnd={() => handleDragEnd(entry.key, entry)}
                />
              ) : (
                <SubListGroup
                  subList={entry.subList}
                  items={entry.items}
                  listId={listId}
                  onHeaderDragStart={() => handleDragStart(entry.key)}
                  onHeaderDrag={(info) => handleDrag(entry.key, info)}
                  onHeaderDragEnd={() => handleDragEnd(entry.key, entry)}
                />
              )}
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
