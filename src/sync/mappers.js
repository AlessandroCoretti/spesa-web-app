// Local store objects are camelCase; Supabase/Postgres columns are snake_case.
// These converters keep that translation in one place.

export function itemToRow(item) {
  return {
    id: item.id,
    list_id: item.listId,
    category_id: item.categoryId,
    name: item.name,
    status: item.status,
    note: item.note,
    quantity: item.quantity,
  }
}

export function rowToItem(row) {
  return {
    id: row.id,
    listId: row.list_id,
    categoryId: row.category_id,
    name: row.name,
    status: row.status,
    note: row.note,
    quantity: row.quantity,
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at).getTime(),
  }
}

export function categoryToRow(category) {
  return {
    id: category.id,
    list_id: category.listId,
    name: category.name,
    color: category.color,
    icon: category.icon,
    order: category.order,
  }
}

export function rowToCategory(row) {
  return {
    id: row.id,
    listId: row.list_id,
    name: row.name,
    color: row.color,
    icon: row.icon,
    order: row.order,
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at).getTime(),
  }
}

export function listToRow(list) {
  return {
    id: list.id,
    owner_id: list.ownerId,
    name: list.name,
    icon: list.icon,
    color: list.color,
  }
}

export function rowToList(row, extra = {}) {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    color: row.color,
    shareCode: null,
    mode: 'cloud',
    ownerId: row.owner_id,
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at).getTime(),
    ...extra,
  }
}
