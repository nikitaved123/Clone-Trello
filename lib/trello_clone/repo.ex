defmodule TrelloClone.Repo do
  use Ecto.Repo,
    otp_app: :trello_clone,
    adapter: Ecto.Adapters.Postgres
end
