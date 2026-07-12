import { useState } from 'react'
import { useParams } from 'react-router'
import { Trash2 } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { useStore } from '../../store'
import { Sheet } from '../common/Sheet'

const PALETTE = ['blush', 'lilac', 'mint', 'peach', 'coral']

export function CategoryManagerSheet({ open, onClose }) {
  const { listId } = useParams()
  const categories = useStore(
    useShallow((state) =>
      Object.values(state.categories)
        .filter((c) => c.listId === listId)
        .sort((a, b) => a.order - b.order)
    )
  )
  const addCategory = useStore((state) => state.addCategory)
  const deleteCategory = useStore((state) => state.deleteCategory)
  const [name, setName] = useState('')

  const handleAdd = (e) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    const color = PALETTE[categories.length % PALETTE.length]
    addCategory(listId, trimmed, { color })
    setName('')
  }

  return (
    <Sheet open={open} onClose={onClose} title="Categorie">
      <form onSubmit={handleAdd} className="mb-4 flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nuova categoria (es. Bagno)"
          className="flex-1 rounded-2xl border border-blush-100 bg-blush-50/60 px-4 py-2.5 text-ink outline-none focus:border-blush-300"
        />
        <button
          type="submit"
          disabled={!name.trim()}
          className="rounded-2xl bg-blush-500 px-4 py-2.5 font-semibold text-white disabled:opacity-40"
        >
          Aggiungi
        </button>
      </form>

      <div className="flex flex-col gap-2">
        {categories.length === 0 && (
          <p className="py-4 text-center text-sm text-ink-soft">Nessuna categoria ancora creata.</p>
        )}
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="flex items-center justify-between rounded-2xl bg-blush-50/60 px-4 py-2.5"
          >
            <span className="font-semibold text-ink">{cat.name}</span>
            <button
              type="button"
              onClick={() => deleteCategory(cat.id)}
              className="grid h-8 w-8 place-items-center rounded-full text-coral-500"
              aria-label={`Elimina categoria ${cat.name}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </Sheet>
  )
}
