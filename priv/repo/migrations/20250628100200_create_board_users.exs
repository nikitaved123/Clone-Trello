defmodule TrelloClone.Repo.Migrations.CreateBoardUsers do
  use Ecto.Migration

  def change do
    create table(:board_users, primary_key: false) do
      add :board_id, references(:boards, on_delete: :delete_all), null: false
      add :user_id, references(:users, on_delete: :delete_all), null: false
    end

    create unique_index(:board_users, [:board_id, :user_id])
    create index(:board_users, [:user_id])
  end
end
