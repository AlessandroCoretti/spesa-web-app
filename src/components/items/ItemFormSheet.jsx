import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router'
import { useShallow } from 'zustand/react/shallow'
import { Heart, ScanBarcode } from 'lucide-react'
import { useStore } from '../../store'
import { Sheet } from '../common/Sheet'
import { StatusPicker } from './StatusPicker'
import { BarcodeScannerSheet } from './BarcodeScannerSheet'

const emptyForm = { name: '', categoryId: '', status: null, note: '', quantity: '', secretNote: '' }

export function ItemFormSheet() {
  const { listId } = useParams()
  const activeSheet = useStore((state) => state.activeSheet)
  const editingItemId = useStore((state) => state.editingItemId)
  const closeSheet = useStore((state) => state.closeSheet)
  const addItem = useStore((state) => state.addItem)
  const updateItem = useStore((state) => state.updateItem)
  const setSecretNote = useStore((state) => state.setSecretNote)
  const showToast = useStore((state) => state.showToast)
  const session = useStore((state) => state.session)
  const list = useStore((state) => state.lists[listId])
  const existingItem = useStore((state) => (editingItemId ? state.items[editingItemId] : null))
  const canHaveSecretNote = list?.mode === 'cloud' && Boolean(session)
  const secretNoteIsMine = !existingItem?.secretNote || existingItem?.secretNoteAuthorId === session?.user?.id
  const categories = useStore(
    useShallow((state) =>
      Object.values(state.categories)
        .filter((c) => c.listId === listId)
        .sort((a, b) => a.order - b.order)
    )
  )

  const open = activeSheet === 'item-form'
  const [form, setForm] = useState(emptyForm)
  const [showScanner, setShowScanner] = useState(false)

  useEffect(() => {
    if (!open) return
    if (existingItem) {
      setForm({
        name: existingItem.name,
        categoryId: existingItem.categoryId ?? '',
        status: existingItem.status,
        note: existingItem.note ?? '',
        quantity: existingItem.quantity ?? '',
        secretNote: existingItem.secretNoteAuthorId === session?.user?.id ? existingItem.secretNote ?? '' : '',
      })
    } else {
      setForm(emptyForm)
    }
  }, [open, existingItem, session])

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
    let itemId = existingItem?.id
    if (existingItem) {
      updateItem(existingItem.id, payload)
      showToast('Prodotto aggiornato ✏️')
    } else {
      itemId = addItem(listId, payload)
      showToast('Prodotto aggiunto 🌸')
    }
    if (canHaveSecretNote && secretNoteIsMine) {
      setSecretNote(itemId, form.secretNote.trim() || null)
    }
    closeSheet()
  }

  return (
    <Sheet open={open} onClose={closeSheet} title={existingItem ? 'Modifica prodotto' : 'Nuovo prodotto'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="block text-sm font-semibold text-ink-soft" htmlFor="item-name">
              Nome *
            </label>
            {!existingItem && (
              <button
                type="button"
                onClick={() => setShowScanner(true)}
                className="flex items-center gap-1 text-xs font-semibold text-blush-500"
              >
                <ScanBarcode className="h-4 w-4" />
                Scansiona
              </button>
            )}
          </div>
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

        {canHaveSecretNote && (
          <div>
            <label className="mb-1 flex items-center gap-1 text-sm font-semibold text-ink-soft" htmlFor="item-secret-note">
              <Heart className="h-3.5 w-3.5 text-coral-400" />
              Nota segreta
            </label>
            {secretNoteIsMine ? (
              <textarea
                id="item-secret-note"
                rows={2}
                value={form.secretNote}
                onChange={(e) => setForm((f) => ({ ...f, secretNote: e.target.value }))}
                placeholder="Un messaggio visibile solo all'altra persona…"
                className="w-full resize-none rounded-2xl border border-coral-100 bg-coral-50/40 px-4 py-3 text-ink outline-none focus:border-coral-300"
              />
            ) : (
              <p className="rounded-2xl bg-coral-50/60 px-4 py-3 text-sm text-ink-soft">
                C'è una nota segreta per te su questo prodotto — tocca il cuoricino nella lista per leggerla 💌
              </p>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="mt-1 rounded-full bg-blush-500 py-3.5 font-heading font-semibold text-white shadow-(--shadow-soft) disabled:opacity-40"
        >
          {existingItem ? 'Salva modifiche' : 'Aggiungi alla lista'}
        </button>
      </form>
      <BarcodeScannerSheet
        open={showScanner}
        onClose={() => setShowScanner(false)}
        onResult={({ name }) => {
          setShowScanner(false)
          if (name) setForm((f) => ({ ...f, name }))
        }}
      />
    </Sheet>
  )
}
