defmodule TrelloCloneWeb.BoardEvent do
  @moduledoc false

  alias TrelloClone.Boards.{Board, Card, List}
  alias TrelloCloneWeb.Endpoint

  def board_updated(%Board{} = board) do
    broadcast(board.id, "board_updated", %{
      board: %{id: board.id, name: board.name, user_id: board.user_id}
    })
  end

  def list_created(%List{} = list) do
    broadcast(list.board_id, "list_created", %{list: encode_list(list)})
  end

  def list_updated(%List{} = list) do
    broadcast(list.board_id, "list_updated", %{list: encode_list(list)})
  end

  def list_deleted(board_id, list_id) do
    broadcast(board_id, "list_deleted", %{id: list_id, board_id: board_id})
  end

  def card_created(%Card{} = card) do
    with %List{} = list <- TrelloClone.Boards.get_list(card.list_id) do
      broadcast(list.board_id, "card_created", %{card: encode_card(card)})
    end
  end

  def card_updated(%Card{} = card) do
    with %List{} = list <- TrelloClone.Boards.get_list(card.list_id) do
      broadcast(list.board_id, "card_updated", %{card: encode_card(card)})
    end
  end

  def card_deleted(list_id, card_id) do
    with %List{} = list <- TrelloClone.Boards.get_list(list_id) do
      broadcast(list.board_id, "card_deleted", %{id: card_id, list_id: list_id})
    end
  end

  def member_added(board_id, %TrelloClone.Accounts.User{} = user) do
    broadcast(board_id, "member_added", %{
      member: %{id: user.id, username: user.username, role: "member"}
    })
  end

  def member_removed(board_id, user_id) do
    broadcast(board_id, "member_removed", %{user_id: user_id, board_id: board_id})
  end

  defp broadcast(board_id, event, payload) do
    Endpoint.broadcast("board:#{board_id}", event, payload)
  end

  defp encode_list(%List{} = list) do
    %{
      id: list.id,
      name: list.name,
      position: list.position,
      board_id: list.board_id
    }
  end

  defp encode_card(%Card{} = card) do
    %{
      id: card.id,
      name: card.name,
      description: card.description,
      position: card.position,
      list_id: card.list_id
    }
  end
end
