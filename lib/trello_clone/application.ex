defmodule TrelloClone.Application do
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      TrelloCloneWeb.Telemetry,
      TrelloClone.Repo,
      {Phoenix.PubSub, name: TrelloClone.PubSub},
      TrelloCloneWeb.Presence,
      TrelloCloneWeb.Endpoint
    ]

    opts = [strategy: :one_for_one, name: TrelloClone.Supervisor]
    Supervisor.start_link(children, opts)
  end

  @impl true
  def config_change(changed, _new, removed) do
    TrelloCloneWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
