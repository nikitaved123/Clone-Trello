defmodule TrelloClone.Boards.List do
  use Ecto.Schema
  import Ecto.Changeset

  alias TrelloClone.Boards.{Board, Card}

  schema "lists" do
    field :name, :string
    field :position, :integer, default: 0

    belongs_to :board, Board
    has_many :cards, Card

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(list, attrs) do
    list
    |> cast(attrs, [:name, :position, :board_id])
    |> validate_required([:name, :board_id])
    |> validate_length(:name, min: 1, max: 100)
    |> validate_number(:position, greater_than_or_equal_to: 0)
    |> foreign_key_constraint(:board_id)
  end
end
