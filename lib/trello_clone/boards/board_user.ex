defmodule TrelloClone.Boards.BoardUser do
  use Ecto.Schema

  alias TrelloClone.Accounts.User
  alias TrelloClone.Boards.Board

  @primary_key false
  schema "board_users" do
    belongs_to :board, Board, primary_key: true
    belongs_to :user, User, primary_key: true
  end
end
