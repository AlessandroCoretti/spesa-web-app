import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router'
import { useShallow } from 'zustand/react/shallow'
import { useStore } from '../../store'
import { Sheet } from '../common/Sheet'
import { StatusPicker } from './StatusPicker'

const emptyForm = { name: '', categoryId: '', status: null, note: '', quantity: '' }

export function ItemFormSheet() {
  const { listId } = useParams()
  const activeSheet = useStore((state) => state.activeSheet)
  const editingItemId = useStore((state) => state.editingItemId)
  const closeSheet = useStore((state) => state.closeSheet)
  const addItem = useStore((state) => state.addItem)
  const updateItem = useStore((state) => state.updateItem)
  const showToast = useStore((state) => state.showToast)
  const existingItem = useStore((state) => (editingItemId ? state.items[editingItemId] : null))
  const categories = useStore(
    useShallow((state) =>
      Object.values(state.categories)
        .filter((c) => c.listId === listId)
        .sort((a, b) => a.order - b.order)
    )
  )

  const open = activeSheet === 'item-form'
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    if (!open) return
    if (existingItem) {
      setForm({
        name: existingItem.name,
        categoryId: existingItem.categoryId ?? '',
        status: existingItem.status,
        note: existingItem.note ?? '',
        quantity: existingItem.quantity ?? '',
      })
    } else {
      setForm(emptyForm)
    }
  }, [open, existingItem])

  const canSubmit = useMemo(() => form.name.trim().length > 0 && form.status, [form])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!canSubmit) return
    const payload = {
      name: form.name.trim(),
      categoryId: form.categoryId || null,
      status: form.status,
      note: form.note.trim(),
      quantity: form.quantity === '' ? null : Number(form.quantity),
    }
    if (existingItem) {
      updateItem(existingItem.id, payload)
      showToast('Prodotto aggiornato ✏️')
    } else {
      addItem(listId, payload)
      showToast('Prodotto aggiunto 🌸')
    }
    closeSheet()
  }

  return (
    <Sheet open={open} onClose={closeSheet} title={existingItem ? 'Modifica prodotto' : 'Nuovo prodotto'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm font-semibold text-ink-soft" htmlFor="item-name">
            Nome *
          </label>
          <input
            id="item-name"
            type="text"
            required
            autoFocus
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Es. Latte, Detersivo piatti…"
            className="w-full rounded-2xl border border-blush-100 bg-blush-50/60 px-4 py-3 text-ink outline-none focus:border-blush-300"
          />
        </div>

        <StatusPicker value={form.status} onChange={(status) => setForm((f) => ({ ...f, status }))} />

        {categories.length > 0 && (
          <div>
            <label className="mb-1 block text-sm font-semibold text-ink-soft" htmlFor="item-category">
              Categoria
            </label>
            <select
              id="item-category"
              value={form.categoryId}
              onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
              className="w-full rounded-2xl border border-blush-100 bg-blush-50/60 px-4 py-3 text-ink outline-none focus:border-blush-300"
            >
              <option value="">Senza categoria</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-semibold text-ink-soft" htmlFor="item-note">
            Nota
          </label>
          <textarea
            id="item-note"
            rows={2}
            value={form.note}
            onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
            placeholder="Es. prendi la marca X, taglia M…"
            className="w-full resize-none rounded-2xl border border-blush-100 bg-blush-50/60 px-4 py-3 text-ink outline-none focus:border-blush-300"
          />
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="mt-1 rounded-full bg-blush-500 py-3.5 font-heading font-semibold text-white shadow-(--shadow-soft) disabled:opacity-40"
        >
          {existingItem ? 'Salva modifiche' : 'Aggiungi alla lista'}
        </button>
      </form>
    </Sheet>
  )
}
