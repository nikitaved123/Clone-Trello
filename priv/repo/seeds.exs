alias TrelloClone.Accounts
alias TrelloClone.Accounts.User
alias TrelloClone.Boards
alias TrelloClone.Boards.{Board, Card, List}

register_if_missing = fn username ->
  case Accounts.get_user_by_username(username) do
    %User{} = user ->
      user

    nil ->
      {:ok, user} = Accounts.register_user(%{username: username, password: "password123"})
      user
  end
end

alice = register_if_missing.("alice")
bob = register_if_missing.("bob")

board =
  case Boards.list_owned_boards(alice.id) |> Enum.find(&(&1.name == "Project Alpha")) do
    %Board{} = board ->
      board

    nil ->
      {:ok, board} = Boards.create_board(%{name: "Project Alpha", user_id: alice.id})
      board
  end

Boards.add_board_member(board.id, bob.id)

find_list = fn name ->
  board = Boards.get_board_with_lists_and_cards!(board.id)
  Enum.find(board.lists, &(&1.name == name))
end

create_list_if_missing = fn name, position ->
  case find_list.(name) do
    %List{} = list ->
      list

    nil ->
      {:ok, list} = Boards.create_list(%{name: name, board_id: board.id, position: position})
      list
  end
end

todo_list = create_list_if_missing.("To Do", 0)
done_list = create_list_if_missing.("Done", 1)

create_card_if_missing = fn list, name, position, description \\ nil ->
  board = Boards.get_board_with_lists_and_cards!(board.id)
  list = Enum.find(board.lists, &(&1.id == list.id))

  case Enum.find(list.cards || [], &(&1.name == name)) do
    %Card{} = card ->
      card

    nil ->
      {:ok, card} =
        Boards.create_card(%{
          name: name,
          description: description,
          list_id: list.id,
          position: position
        })

      card
  end
end

create_card_if_missing.(todo_list, "Set up Phoenix project", 0, "Install Elixir, create migrations, run seeds.")
create_card_if_missing.(todo_list, "Build React frontend", 1)
create_card_if_missing.(done_list, "Celebrate", 0)

IO.puts("Seeds ready: users alice/bob, board \"#{board.name}\".")
