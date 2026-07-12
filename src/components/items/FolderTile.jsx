import { Folder } from 'lucide-react'

export function FolderTile({ folder, items, onOpen }) {
  const preview = items.slice(0, 4)

  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full items-center gap-3 rounded-2xl bg-blush-50 px-4 py-3 text-left shadow-sm"
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blush-200 text-blush-600">
        <Folder className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-semibold text-ink">{folder.name}</span>
        <span className="block truncate text-xs text-ink-soft">
          {preview.map((i) => i.name).join(', ')}
          {items.length > preview.length ? ` +${items.length - preview.length}` : ''}
        </span>
      </span>
      <span className="shrink-0 rounded-full bg-blush-200 px-2 py-0.5 text-xs font-bold text-blush-700">
        {items.length}
      </span>
    </button>
  )
}
