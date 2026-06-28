defmodule TrelloCloneWeb.BoardController do
  use TrelloCloneWeb, :controller

  alias TrelloClone.Boards
  alias TrelloClone.Boards.Board
  alias TrelloCloneWeb.BoardEvent

  def index(conn, _params) do
    user = conn.assigns.current_user

    owned_boards = Boards.list_owned_boards(user.id)
    member_boards = Boards.list_member_boards(user.id)

    render(conn, :index, owned_boards: owned_boards, member_boards: member_boards)
  end

  def show(conn, %{"id" => id}) do
    user = conn.assigns.current_user

    with {:ok, _} <- Boards.fetch_accessible_board(user, id) do
      board = Boards.get_board_with_lists_and_cards!(id)
      members = Boards.list_board_people(board)
      render(conn, :show, board: board, members: members)
    end
  end

  def create(conn, %{"board" => board_params}) do
    user = conn.assigns.current_user

    with {:ok, %Board{} = board} <-
           Boards.create_board(Map.put(board_params, "user_id", user.id)) do
      conn
      |> put_status(:created)
      |> render(:show, board: %{board | lists: []}, members: Boards.list_board_people(board))
    end
  end

  def update(conn, %{"id" => id, "board" => board_params}) do
    user = conn.assigns.current_user

    with {:ok, board} <- Boards.fetch_accessible_board(user, id),
         {:ok, %Board{} = board} <- Boards.update_board(board, board_params) do
      BoardEvent.board_updated(board)
      board = Boards.get_board_with_lists_and_cards!(board.id)
      members = Boards.list_board_people(board)
      render(conn, :show, board: board, members: members)
    end
  end

  def delete(conn, %{"id" => id}) do
    user = conn.assigns.current_user

    with {:ok, board} <- Boards.fetch_accessible_board(user, id),
         true <- Boards.board_owned_by?(user, board),
         {:ok, %Board{}} <- Boards.delete_board(board) do
      send_resp(conn, :no_content, "")
    else
      false -> {:error, :forbidden}
    end
  end

  def invite(conn, %{"board_id" => board_id, "username" => username}) do
    user = conn.assigns.current_user

    with {:ok, board} <- Boards.fetch_accessible_board(user, board_id),
         true <- Boards.board_owned_by?(user, board),
         {:ok, invited_user} <- Boards.invite_user_to_board(board, username) do
      BoardEvent.member_added(board.id, invited_user)

      conn
      |> put_view(json: TrelloCloneWeb.UserJSON)
      |> render(:show, user: invited_user)
    else
      false -> {:error, :forbidden}
    end
  end

  def remove_member(conn, %{"board_id" => board_id, "user_id" => user_id}) do
    user = conn.assigns.current_user

    with {:ok, board} <- Boards.fetch_accessible_board(user, board_id),
         true <- Boards.board_owned_by?(user, board),
         {:ok, removed_user_id} <- Boards.remove_user_from_board(board, String.to_integer(user_id)) do
      BoardEvent.member_removed(board.id, removed_user_id)
      send_resp(conn, :no_content, "")
    else
      false -> {:error, :forbidden}
    end
  end
end
