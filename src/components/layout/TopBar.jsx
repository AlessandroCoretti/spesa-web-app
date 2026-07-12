import { Link, useParams } from 'react-router'
import { ChefHat, ChevronDown, Settings, TrendingDown } from 'lucide-react'
import { useStore } from '../../store'

export function TopBar() {
  const { listId } = useParams()
  const list = useStore((state) => state.lists[listId])
  const openSheet = useStore((state) => state.openSheet)

  return (
    <header className="z-20 flex shrink-0 items-center justify-between gap-2 bg-blush-50/90 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-sm">
      <button
        type="button"
        onClick={() => openSheet('list-switcher')}
        className="flex items-center gap-1 rounded-full px-3 py-1.5 font-heading text-lg font-semibold text-blush-700 active:scale-95 transition-transform"
      >
        <span>{list?.name ?? 'Your Lists'}</span>
        <ChevronDown className="h-4 w-4" />
      </button>
      <div className="flex items-center gap-2">
        <Link
          to={`/list/${listId}/previsioni`}
          className="grid h-9 w-9 place-items-center rounded-full bg-white/70 text-lilac-500 shadow-sm active:scale-95 transition-transform"
          aria-label="Previsioni"
        >
          <TrendingDown className="h-5 w-5" />
        </Link>
        <Link
          to={`/list/${listId}/ricette`}
          className="grid h-9 w-9 place-items-center rounded-full bg-white/70 text-peach-500 shadow-sm active:scale-95 transition-transform"
          aria-label="Salva Cena"
        >
          <ChefHat className="h-5 w-5" />
        </Link>
        <Link
          to={`/list/${listId}/settings`}
          className="grid h-9 w-9 place-items-center rounded-full bg-white/70 text-blush-600 shadow-sm active:scale-95 transition-transform"
          aria-label="Impostazioni lista"
        >
          <Settings className="h-5 w-5" />
        </Link>
      </div>
    </header>
  )
}
