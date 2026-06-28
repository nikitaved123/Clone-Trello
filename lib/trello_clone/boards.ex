defmodule TrelloClone.Boards do
  @moduledoc """
  Context for boards, lists, cards, and board membership.
  """

  import Ecto.Query, warn: false
  alias TrelloClone.Repo
  alias TrelloClone.Accounts.User
  alias TrelloClone.Boards.{Board, BoardUser, Card, List}

  # Boards

  def list_owned_boards(user_id) do
    Board
    |> where([b], b.user_id == ^user_id)
    |> order_by([b], asc: b.name)
    |> Repo.all()
  end

  def list_member_boards(user_id) do
    Board
    |> join(:inner, [b], bu in BoardUser, on: bu.board_id == b.id)
    |> where([b, bu], bu.user_id == ^user_id and b.user_id != ^user_id)
    |> order_by([b], asc: b.name)
    |> Repo.all()
  end

  def get_board!(id), do: Repo.get!(Board, id)

  def get_board(id), do: Repo.get(Board, id)

  def fetch_accessible_board(%User{} = user, board_id) do
    case get_board(board_id) do
      nil ->
        {:error, :not_found}

      board ->
        if user_can_access_board?(user, board.id),
          do: {:ok, board},
          else: {:error, :forbidden}
    end
  end

  def board_owned_by?(%User{id: user_id}, %Board{user_id: user_id}), do: true
  def board_owned_by?(_, _), do: false

  def get_list!(id), do: Repo.get!(List, id)

  def get_list(id), do: Repo.get(List, id)

  def fetch_accessible_list(%User{} = user, list_id) do
    with %List{} = list <- get_list(list_id),
         {:ok, _} <- fetch_accessible_board(user, list.board_id) do
      {:ok, list}
    else
      nil -> {:error, :not_found}
      error -> error
    end
  end

  def invite_user_to_board(%Board{} = board, username) do
    case TrelloClone.Accounts.get_user_by_username(username) do
      nil ->
        {:error, :not_found}

      %User{id: user_id} = user ->
        if user_id == board.user_id do
          {:error, :forbidden}
        else
          add_board_member(board.id, user_id)
          {:ok, user}
        end
    end
  end

  def list_board_people(%Board{} = board) do
    owner = TrelloClone.Accounts.get_user!(board.user_id)

    owner_entry = %{
      id: owner.id,
      username: owner.username,
      role: "owner"
    }

    member_entries =
      board.id
      |> list_board_members()
      |> Enum.map(fn %User{id: id, username: username} ->
        %{id: id, username: username, role: "member"}
      end)

    [owner_entry | member_entries]
  end

  def remove_user_from_board(%Board{} = board, user_id) when is_integer(user_id) do
    cond do
      user_id == board.user_id ->
        {:error, :forbidden}

      true ->
        case remove_board_member(board.id, user_id) do
          {1, _} -> {:ok, user_id}
          {0, _} -> {:error, :not_found}
        end
    end
  end

  def get_board_with_lists_and_cards!(id) do
    id
    |> get_board!()
    |> Repo.preload(lists: :cards)
    |> sort_board_lists_and_cards()
  end

  defp sort_board_lists_and_cards(%Board{lists: lists} = board) do
    sorted_lists =
      lists
      |> Enum.sort_by(& &1.position)
      |> Enum.map(fn list ->
        %{list | cards: Enum.sort_by(list.cards, & &1.position)}
      end)

    %{board | lists: sorted_lists}
  end

  def create_board(attrs) do
    %Board{}
    |> Board.changeset(attrs)
    |> Repo.insert()
  end

  def update_board(%Board{} = board, attrs) do
    board
    |> Board.changeset(attrs)
    |> Repo.update()
  end

  def delete_board(%Board{} = board) do
    Repo.delete(board)
  end

  def user_can_access_board?(%User{id: user_id}, board_id) do
    query =
      from b in Board,
        where: b.id == ^board_id,
        where: b.user_id == ^user_id or exists(member_query(board_id, user_id))

    Repo.exists?(query)
  end

  defp member_query(board_id, user_id) do
    from bu in BoardUser,
      where: bu.board_id == ^board_id and bu.user_id == ^user_id
  end

  def add_board_member(board_id, user_id) do
    %BoardUser{}
    |> Ecto.Changeset.change(%{board_id: board_id, user_id: user_id})
    |> Repo.insert(on_conflict: :nothing)
  end

  def remove_board_member(board_id, user_id) do
    from(bu in BoardUser, where: bu.board_id == ^board_id and bu.user_id == ^user_id)
    |> Repo.delete_all()
  end

  def list_board_members(board_id) do
    User
    |> join(:inner, [u], bu in BoardUser, on: bu.user_id == u.id)
    |> where([u, bu], bu.board_id == ^board_id)
    |> select([u, _bu], u)
    |> Repo.all()
  end

  # Lists

  def create_list(attrs) do
    %List{}
    |> List.changeset(attrs)
    |> Repo.insert()
  end

  def update_list(%List{} = list, attrs) do
    list
    |> List.changeset(attrs)
    |> Repo.update()
  end

  def delete_list(%List{} = list) do
    Repo.delete(list)
  end

  def next_list_position(board_id) do
    query =
      from l in List,
        where: l.board_id == ^board_id,
        select: max(l.position)

    case Repo.one(query) do
      nil -> 0
      max_position -> max_position + 1
    end
  end

  # Cards

  def create_card(attrs) do
    %Card{}
    |> Card.changeset(attrs)
    |> Repo.insert()
  end

  def update_card(%Card{} = card, attrs) do
    card
    |> Card.changeset(attrs)
    |> Repo.update()
  end

  def delete_card(%Card{} = card) do
    Repo.delete(card)
  end

  def get_card!(id), do: Repo.get!(Card, id)

  def get_card(id), do: Repo.get(Card, id)

  def fetch_accessible_card(%User{} = user, card_id) do
    with %Card{} = card <- get_card(card_id),
         %List{} = list <- get_list(card.list_id),
         {:ok, _} <- fetch_accessible_board(user, list.board_id) do
      {:ok, card}
    else
      nil -> {:error, :not_found}
      error -> error
    end
  end

  def next_card_position(list_id) do
    query =
      from c in Card,
        where: c.list_id == ^list_id,
        select: max(c.position)

    case Repo.one(query) do
      nil -> 0
      max_position -> max_position + 1
    end
  end
end
