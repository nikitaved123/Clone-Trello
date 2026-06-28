defmodule TrelloCloneWeb.ListController do
  use TrelloCloneWeb, :controller

  alias TrelloClone.Boards
  alias TrelloClone.Boards.List
  alias TrelloCloneWeb.BoardEvent

  def create(conn, %{"board_id" => board_id, "list" => list_params}) do
    user = conn.assigns.current_user

    with {:ok, _} <- Boards.fetch_accessible_board(user, board_id) do
      position = Map.get(list_params, "position", Boards.next_list_position(board_id))

      attrs =
        list_params
        |> Map.put("board_id", board_id)
        |> Map.put("position", position)

      with {:ok, %List{} = list} <- Boards.create_list(attrs) do
        BoardEvent.list_created(list)

        conn
        |> put_status(:created)
        |> render(:show, list: list)
      end
    end
  end

  def update(conn, %{"id" => id, "list" => list_params}) do
    user = conn.assigns.current_user

    with {:ok, list} <- Boards.fetch_accessible_list(user, id),
         {:ok, %List{} = list} <- Boards.update_list(list, list_params) do
      BoardEvent.list_updated(list)
      render(conn, :show, list: list)
    end
  end

  def delete(conn, %{"id" => id}) do
    user = conn.assigns.current_user

    with {:ok, %List{id: list_id, board_id: board_id} = list} <- Boards.fetch_accessible_list(user, id),
         {:ok, %List{}} <- Boards.delete_list(list) do
      BoardEvent.list_deleted(board_id, list_id)
      send_resp(conn, :no_content, "")
    end
  end
end
