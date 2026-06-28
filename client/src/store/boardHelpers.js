import { sortLists } from "../boardUtils";

export { sortLists, sortCardsInLists } from "../boardUtils";

export function applyCardUpdate(lists, card) {
  const cleaned = lists.map((list) => ({
    ...list,
    cards: (list.cards || []).filter((item) => item.id !== card.id),
  }));

  return cleaned.map((list) => {
    if (list.id !== card.list_id) return list;
    return { ...list, cards: [...(list.cards || []), card] };
  });
}
