defmodule TrelloCloneWeb.BoardJSON do
  alias TrelloClone.Boards.{Board, Card, List}

  def index(%{owned_boards: owned, member_boards: member}) do
    %{
      owned_boards: for(board <- owned, do: summary(board)),
      member_boards: for(board <- member, do: summary(board))
    }
  end

  def show(%{board: board, members: members}) do
    %{board: detail(board, members)}
  end

  def show(%{board: board}) do
    %{board: detail(board, [])}
  end

  defp summary(%Board{} = board) do
    %{
      id: board.id,
      name: board.name,
      user_id: board.user_id
    }
  end

  defp detail(%Board{} = board, members) do
    %{
      id: board.id,
      name: board.name,
      user_id: board.user_id,
      members: members,
      lists: for(list <- board.lists, do: list_data(list))
    }
  end

  defp list_data(%List{} = list) do
    %{
      id: list.id,
      name: list.name,
      position: list.position,
      board_id: list.board_id,
      cards: for(card <- list.cards, do: card_data(card))
    }
  end

  defp card_data(%Card{} = card) do
    %{
      id: card.id,
      name: card.name,
      description: card.description,
      position: card.position,
      list_id: card.list_id
    }
  end
end
