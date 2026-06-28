defmodule TrelloClone.Boards.Board do
  use Ecto.Schema
  import Ecto.Changeset

  alias TrelloClone.Accounts.User
  alias TrelloClone.Boards.{BoardUser, List}

  schema "boards" do
    field :name, :string

    belongs_to :owner, User, foreign_key: :user_id
    has_many :lists, List
    has_many :board_users, BoardUser, on_replace: :delete
    many_to_many :users, User, join_through: "board_users", on_replace: :delete

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(board, attrs) do
    board
    |> cast(attrs, [:name, :user_id])
    |> validate_required([:name, :user_id])
    |> validate_length(:name, min: 1, max: 100)
    |> foreign_key_constraint(:user_id)
  end
end
