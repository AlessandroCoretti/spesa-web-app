import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { ChevronLeft, Package, PieChart, User, Wallet } from 'lucide-react'
import { useStore } from '../store'
import { useListStats } from '../hooks/useListStats'
import { useListMembers } from '../hooks/useListMembers'
import { StatCard } from '../components/stats/StatCard'

export default function StatsView() {
  const { listId } = useParams()
  const navigate = useNavigate()
  const list = useStore((state) => state.lists[listId])
  const [period, setPeriod] = useState('month')
  const stats = useListStats(listId, period)
  const { members } = useListMembers(listId, { enabled: list?.mode === 'cloud' })

  const creatorEmail = stats.topCreator
    ? members.find((m) => m.userId === stats.topCreator.key)?.email ?? '—'
    : null

  return (
    <div className="mx-auto flex h-dvh max-w-md flex-col overflow-hidden bg-blush-50/40">
      <header className="flex shrink-0 items-center gap-2 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <button
          type="button"
          onClick={() => navigate(`/list/${listId}/settings`)}
          className="grid h-9 w-9 place-items-center rounded-full bg-blush-50 text-blush-600"
          aria-label="Indietro"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="font-heading text-xl font-semibold text-blush-700">Statistiche 📊</h1>
      </header>

      <div className="flex shrink-0 gap-2 px-4 pb-2">
        <button
          type="button"
          onClick={() => setPeriod('month')}
          className={`flex-1 rounded-full py-2 text-sm font-semibold ${period === 'month' ? 'bg-blush-500 text-white' : 'bg-white text-ink-soft'}`}
        >
          Questo mese
        </button>
        <button
          type="button"
          onClick={() => setPeriod('all')}
          className={`flex-1 rounded-full py-2 text-sm font-semibold ${period === 'all' ? 'bg-blush-500 text-white' : 'bg-white text-ink-soft'}`}
        >
          Da sempre
        </button>
      </div>

      <main className="flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-4 pb-6">
        <div className="flex flex-col gap-2.5">
          <StatCard
            icon={<Package className="h-5 w-5" />}
            label="Prodotto più aggiunto"
            value={stats.topName ? stats.topName.key : '—'}
            sub={stats.topName ? `${stats.topName.count} volte` : 'Nessun dato ancora'}
          />
          <StatCard
            icon={<PieChart className="h-5 w-5" />}
            label="Categoria più usata"
            value={stats.topCategory ? stats.topCategory.name : '—'}
            sub={stats.topCategory ? `${stats.topCategory.count} prodotti` : 'Nessun dato ancora'}
          />
          {list?.mode === 'cloud' && (
            <StatCard
              icon={<User className="h-5 w-5" />}
              label="Chi ha aggiunto di più"
              value={creatorEmail ?? '—'}
              sub={stats.topCreator ? `${stats.topCreator.count} prodotti` : 'Nessun dato ancora'}
            />
          )}
          {list?.mode === 'cloud' && (
            <StatCard
              icon={<Wallet className="h-5 w-5" />}
              label="Giorno di spesa più alto"
              value={stats.topDay ? `€${stats.topDay.amount.toFixed(2)}` : '—'}
              sub={stats.topDay ? stats.topDay.date : 'Nessuna spesa ancora'}
            />
          )}
        </div>
      </main>
    </div>
  )
}
