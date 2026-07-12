import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Check, Plus } from 'lucide-react'
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
  const [name, setName] = useState('')

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

  return (
    <Sheet open={open} onClose={closeSheet} title="Le tue liste">
      <div className="mb-4 flex flex-col gap-2">
        {lists.map((list) => (
          <button
            key={list.id}
            type="button"
            onClick={() => handleSelect(list.id)}
            className="flex items-center justify-between rounded-2xl bg-blush-50/60 px-4 py-3 text-left"
          >
            <span className="font-semibold text-ink">{list.name}</span>
            {list.id === activeListId && <Check className="h-4 w-4 text-blush-600" />}
          </button>
        ))}
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
