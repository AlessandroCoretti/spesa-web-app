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
    created_by: item.createdBy ?? null,
    stockout_history: item.stockoutHistory ?? [],
    secret_note: item.secretNote ?? null,
    secret_note_author_id: item.secretNoteAuthorId ?? null,
    sub_list_id: item.subListId ?? null,
    order: item.order ?? 0,
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
    createdBy: row.created_by ?? null,
    stockoutHistory: row.stockout_history ?? [],
    secretNote: row.secret_note ?? null,
    secretNoteAuthorId: row.secret_note_author_id ?? null,
    subListId: row.sub_list_id ?? null,
    order: row.order ?? 0,
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at).getTime(),
  }
}

export function subListToRow(subList) {
  return {
    id: subList.id,
    list_id: subList.listId,
    category_id: subList.categoryId,
    name: subList.name,
    color: subList.color,
    order: subList.order ?? 0,
  }
}

export function rowToSubList(row) {
  return {
    id: row.id,
    listId: row.list_id,
    categoryId: row.category_id,
    name: row.name,
    color: row.color,
    order: row.order ?? 0,
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

export function expenseToRow(expense) {
  return {
    id: expense.id,
    list_id: expense.listId,
    description: expense.description,
    amount: expense.amount,
    paid_by: expense.paidBy,
    expense_date: new Date(expense.date).toISOString(),
    splits: expense.splits ?? [],
    note: expense.note ?? '',
  }
}

export function rowToExpense(row) {
  return {
    id: row.id,
    listId: row.list_id,
    description: row.description,
    amount: row.amount,
    paidBy: row.paid_by,
    date: new Date(row.expense_date).getTime(),
    splits: row.splits ?? [],
    note: row.note ?? '',
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at).getTime(),
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
