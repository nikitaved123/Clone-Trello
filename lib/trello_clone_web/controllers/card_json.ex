defmodule TrelloCloneWeb.CardJSON do
  alias TrelloClone.Boards.Card

  def show(%{card: card}) do
    %{card: data(card)}
  end

  defp data(%Card{} = card) do
    %{
      id: card.id,
      name: card.name,
      description: card.description,
      position: card.position,
      list_id: card.list_id
    }
  end
end
