export function sortLists(lists) {
  return [...lists].sort((a, b) => a.position - b.position);
}

export function sortCardsInLists(lists) {
  return lists.map((list) => ({
    ...list,
    cards: [...(list.cards || [])].sort((a, b) => a.position - b.position),
  }));
}

export function reorderLists(lists, draggedId, targetId) {
  const sorted = sortLists(lists);
  const fromIndex = sorted.findIndex((list) => list.id === draggedId);
  const toIndex = sorted.findIndex((list) => list.id === targetId);

  if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
    return sorted;
  }

  const next = [...sorted];
  const [item] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, item);

  return next.map((list, index) => ({ ...list, position: index }));
}

export function cardDropPosition(list, cardId, targetCardId) {
  const cards = [...(list.cards || [])].sort((a, b) => a.position - b.position);
  if (!targetCardId) return cards.length;

  const targetIndex = cards.findIndex((card) => card.id === targetCardId);
  if (targetIndex === -1) return cards.length;

  const draggedIndex = cards.findIndex((card) => card.id === cardId);
  if (draggedIndex !== -1 && draggedIndex < targetIndex) {
    return targetIndex;
  }

  return targetIndex;
}
