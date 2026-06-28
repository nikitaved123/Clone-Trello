defmodule TrelloClone.Repo.Migrations.CreateLists do
  use Ecto.Migration

  def change do
    create table(:lists) do
      add :name, :string, null: false
      add :position, :integer, null: false, default: 0
      add :board_id, references(:boards, on_delete: :delete_all), null: false

      timestamps(type: :utc_datetime)
    end

    create index(:lists, [:board_id])
    create index(:lists, [:board_id, :position])
  end
end
