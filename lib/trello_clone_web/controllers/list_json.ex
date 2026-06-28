defmodule TrelloCloneWeb.ListJSON do
  alias TrelloClone.Boards.List

  def show(%{list: list}) do
    %{list: data(list)}
  end

  defp data(%List{} = list) do
    %{
      id: list.id,
      name: list.name,
      position: list.position,
      board_id: list.board_id
    }
  end
end
