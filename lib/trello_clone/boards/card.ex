defmodule TrelloClone.Boards.Card do
  use Ecto.Schema
  import Ecto.Changeset

  alias TrelloClone.Boards.List

  schema "cards" do
    field :name, :string
    field :description, :string
    field :position, :integer, default: 0

    belongs_to :list, List

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(card, attrs) do
    card
    |> cast(attrs, [:name, :description, :position, :list_id])
    |> validate_required([:name, :list_id])
    |> validate_length(:name, min: 1, max: 200)
    |> validate_number(:position, greater_than_or_equal_to: 0)
    |> foreign_key_constraint(:list_id)
  end
end
