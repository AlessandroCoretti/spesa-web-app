import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Plus, Trash2 } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { useStore } from '../../store'
import { Sheet } from '../common/Sheet'
import { ItemCard } from './ItemCard'
import { DeleteConfirmDialog } from './DeleteConfirmDialog'

export function FolderView({ folderId, onClose }) {
  const folder = useStore((state) => (folderId ? state.folders[folderId] : null))
  const renameFolder = useStore((state) => state.renameFolder)
  const deleteFolder = useStore((state) => state.deleteFolder)
  const addItemToFolder = useStore((state) => state.addItemToFolder)
  const removeItemFromFolder = useStore((state) => state.removeItemFromFolder)
  const showToast = useStore((state) => state.showToast)

  const folderItems = useStore(
    useShallow((state) => (folderId ? Object.values(state.items).filter((i) => i.folderId === folderId) : []))
  )
  const availableItems = useStore(
    useShallow((state) =>
      folder
        ? Object.values(state.items).filter(
            (i) =>
              i.listId === folder.listId &&
              i.status === folderItems[0]?.status &&
              i.categoryId === folder.categoryId &&
              !i.folderId
          )
        : []
    )
  )

  const [showAddPicker, setShowAddPicker] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  if (!folder) return null

  const handleDeleteFolder = () => {
    deleteFolder(folder.id)
    showToast('Cartella eliminata, prodotti rimessi in lista')
    setConfirmingDelete(false)
    onClose()
  }

  return (
    <Sheet open={Boolean(folderId)} onClose={onClose} title="Cartella">
      <div className="flex flex-col gap-4">
        <input
          type="text"
          value={folder.name}
          onChange={(e) => renameFolder(folder.id, e.target.value)}
          className="w-full rounded-2xl border border-blush-100 bg-blush-50/60 px-4 py-3 font-heading text-lg font-semibold text-ink outline-none focus:border-blush-300"
        />

        <div className="flex flex-col gap-2">
          <AnimatePresence initial={false}>
            {folderItems.map((item) => (
              <div key={item.id} className="flex items-center gap-2">
                <div className="flex-1">
                  <ItemCard item={item} />
                </div>
                <button
                  type="button"
                  onClick={() => removeItemFromFolder(item.id)}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blush-50 text-ink-soft"
                  aria-label="Rimuovi dalla cartella"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </AnimatePresence>
        </div>

        <button
          type="button"
          onClick={() => setShowAddPicker((v) => !v)}
          className="flex items-center justify-center gap-2 rounded-full bg-blush-50 py-3 font-semibold text-blush-600"
        >
          <Plus className="h-4 w-4" />
          Aggiungi prodotti alla cartella
        </button>

        {showAddPicker && (
          <div className="flex flex-col gap-2">
            {availableItems.length === 0 ? (
              <p className="text-center text-sm text-ink-soft">Nessun altro prodotto disponibile da aggiungere.</p>
            ) : (
              availableItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    addItemToFolder(folder.id, item.id)
                    showToast(`"${item.name}" aggiunto alla cartella`)
                  }}
                  className="flex items-center justify-between rounded-2xl bg-white px-4 py-2.5 text-left shadow-sm"
                >
                  <span className="font-semibold text-ink">{item.name}</span>
                  <Plus className="h-4 w-4 text-blush-500" />
                </button>
              ))
            )}
          </div>
        )}

        <button
          type="button"
          onClick={() => setConfirmingDelete(true)}
          className="flex items-center justify-center gap-2 rounded-full bg-coral-50 py-3 font-semibold text-coral-600"
        >
          <Trash2 className="h-4 w-4" />
          Elimina cartella
        </button>
      </div>

      <DeleteConfirmDialog
        open={confirmingDelete}
        title="Eliminare la cartella?"
        description="I prodotti torneranno nella lista normale, non verranno eliminati."
        onCancel={() => setConfirmingDelete(false)}
        onConfirm={handleDeleteFolder}
      />
    </Sheet>
  )
}
