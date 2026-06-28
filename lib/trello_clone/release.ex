defmodule TrelloClone.Release do
  @moduledoc false

  @app :trello_clone

  def migrate do
    load_app()

    for repo <- repos() do
      {:ok, _, _} = Ecto.Migrator.with_repo(repo, &Ecto.Migrator.run(&1, :up, all: true))
    end
  end

  def seed do
    load_app()

    for repo <- repos() do
      {:ok, _, _} = Ecto.Migrator.with_repo(repo, fn _ ->
        Code.eval_file(seeds_path())
      end)
    end
  end

  defp repos, do: Application.fetch_env!(@app, :ecto_repos)

  defp load_app do
    Application.load(@app)
    Application.ensure_all_started(:ssl)
  end

  defp seeds_path, do: Path.join([Application.app_dir(@app, "priv"), "repo", "seeds.exs"])
end
