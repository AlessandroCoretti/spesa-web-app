import { useParams } from 'react-router'
import { useFilteredItems } from '../../hooks/useFilteredItems'
import { OrganizableEntryList } from './OrganizableEntryList'
import { EmptyState } from '../common/EmptyState'
import { STATUS_META } from '../../store/statuses'

export function ItemList({ status }) {
  const { listId } = useParams()
  const { grouped, uncategorized, total } = useFilteredItems(listId, status)
  const meta = STATUS_META[status]

  if (total === 0) {
    return (
      <EmptyState
        title={`Nessun prodotto in "${meta.label}"`}
        subtitle="Tocca il pulsante Aggiungi per iniziare a riempire questa lista."
      />
    )
  }

  return (
    <div className="flex flex-col gap-5 px-4 pb-32 pt-3">
      {grouped.map(({ category, items }) => (
        <section key={category.id}>
          <h3 className="mb-2 px-1 text-sm font-bold uppercase tracking-wide text-ink-soft">
            {category.name}
          </h3>
          <OrganizableEntryList items={items} listId={listId} categoryId={category.id} />
        </section>
      ))}

      {uncategorized.length > 0 && (
        <section>
          {grouped.length > 0 && (
            <h3 className="mb-2 px-1 text-sm font-bold uppercase tracking-wide text-ink-soft">
              Senza categoria
            </h3>
          )}
          <OrganizableEntryList items={uncategorized} listId={listId} categoryId={null} />
        </section>
      )}
    </div>
  )
}
