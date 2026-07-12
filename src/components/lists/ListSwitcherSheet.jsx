import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Check, Pencil, Plus } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { useStore } from '../../store'
import { Sheet } from '../common/Sheet'

export function ListSwitcherSheet() {
  const navigate = useNavigate()
  const activeSheet = useStore((state) => state.activeSheet)
  const closeSheet = useStore((state) => state.closeSheet)
  const lists = useStore(
    useShallow((state) => state.listOrder.map((id) => state.lists[id]).filter(Boolean))
  )
  const activeListId = useStore((state) => state.activeListId)
  const addList = useStore((state) => state.addList)
  const setActiveList = useStore((state) => state.setActiveList)
  const renameList = useStore((state) => state.renameList)
  const [name, setName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')

  const open = activeSheet === 'list-switcher'

  const handleSelect = (id) => {
    setActiveList(id)
    navigate(`/list/${id}/da_comprare`)
    closeSheet()
  }

  const handleCreate = (e) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    const id = addList(trimmed)
    setName('')
    navigate(`/list/${id}/da_comprare`)
    closeSheet()
  }

  const startEditing = (list) => {
    setEditingId(list.id)
    setEditingName(list.name)
  }

  const commitEditing = () => {
    const trimmed = editingName.trim()
    if (trimmed) renameList(editingId, trimmed)
    setEditingId(null)
  }

  return (
    <Sheet open={open} onClose={closeSheet} title="Le tue liste">
      <div className="mb-4 flex flex-col gap-2">
        {lists.map((list) =>
          editingId === list.id ? (
            <form
              key={list.id}
              onSubmit={(e) => {
                e.preventDefault()
                commitEditing()
              }}
              className="flex items-center gap-2 rounded-2xl bg-blush-50/60 px-4 py-2"
            >
              <input
                autoFocus
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onBlur={commitEditing}
                className="min-w-0 flex-1 bg-transparent font-semibold text-ink outline-none"
              />
              <button type="submit" className="shrink-0 text-sm font-semibold text-blush-600">
                Fatto
              </button>
            </form>
          ) : (
            <div
              key={list.id}
              className="flex items-center gap-1 rounded-2xl bg-blush-50/60 px-2 py-1 text-left"
            >
              <button type="button" onClick={() => handleSelect(list.id)} className="flex flex-1 items-center gap-2 px-2 py-2">
                <span className="min-w-0 flex-1 truncate font-semibold text-ink">{list.name}</span>
                {list.id === activeListId && <Check className="h-4 w-4 shrink-0 text-blush-600" />}
              </button>
              <button
                type="button"
                onClick={() => startEditing(list)}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-soft"
                aria-label={`Rinomina ${list.name}`}
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </div>
          )
        )}
      </div>
      <form onSubmit={handleCreate} className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nuova lista (es. Lista mare)"
          className="flex-1 rounded-2xl border border-blush-100 bg-blush-50/60 px-4 py-2.5 text-ink outline-none focus:border-blush-300"
        />
        <button
          type="submit"
          disabled={!name.trim()}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-blush-500 text-white disabled:opacity-40"
          aria-label="Crea lista"
        >
          <Plus className="h-5 w-5" />
        </button>
      </form>
    </Sheet>
  )
}
