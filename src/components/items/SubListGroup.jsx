import { useState } from 'react'
import { motion } from 'framer-motion'
import { GripVertical, Trash2 } from 'lucide-react'
import { useStore } from '../../store'
import { OrganizableEntryList } from './OrganizableEntryList'
import { colorTokens } from '../../styles/colorTokens'
import { DeleteConfirmDialog } from './DeleteConfirmDialog'

export function SubListGroup({ subList, items, listId, onHeaderDragStart, onHeaderDrag, onHeaderDragEnd }) {
  const renameSubList = useStore((state) => state.renameSubList)
  const deleteSubList = useStore((state) => state.deleteSubList)
  const showToast = useStore((state) => state.showToast)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const tokens = colorTokens(subList.color)

  const handleDelete = () => {
    deleteSubList(subList.id)
    showToast('Sottolista eliminata, prodotti tornati in lista')
    setConfirmingDelete(false)
  }

  return (
    <div className={`rounded-2xl border ${tokens.border} ${tokens.bg50} p-2.5`}>
      <div className="mb-2 flex items-center gap-1">
        <motion.div
          drag="y"
          dragElastic={0.2}
          dragMomentum={false}
          dragSnapToOrigin
          onDragStart={onHeaderDragStart}
          onDrag={(_, info) => onHeaderDrag(info)}
          onDragEnd={() => onHeaderDragEnd()}
          whileDrag={{ scale: 1.03, zIndex: 20 }}
          className="grid h-8 w-6 shrink-0 cursor-grab place-items-center text-ink-soft/50 active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" />
        </motion.div>
        <input
          type="text"
          value={subList.name}
          onChange={(e) => renameSubList(subList.id, e.target.value)}
          className={`min-w-0 flex-1 truncate bg-transparent px-1 font-heading font-semibold ${tokens.text} outline-none`}
        />
        <button
          type="button"
          onClick={() => setConfirmingDelete(true)}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-soft"
          aria-label="Elimina sottolista"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <OrganizableEntryList items={items} listId={listId} nested />

      <DeleteConfirmDialog
        open={confirmingDelete}
        title={`Eliminare "${subList.name}"?`}
        description="I prodotti torneranno nella lista normale, non verranno eliminati."
        onCancel={() => setConfirmingDelete(false)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
