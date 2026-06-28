defmodule TrelloCloneWeb do
  def controller do
    quote do
      use Phoenix.Controller, formats: [:json]

      import Plug.Conn

      action_fallback TrelloCloneWeb.FallbackController

      unquote(verified_routes())
    end
  end

  def router do
    quote do
      use Phoenix.Router, helpers: false

      import Plug.Conn
      import Phoenix.Controller
    end
  end

  def channel do
    quote do
      use Phoenix.Channel
    end
  end

  def verified_routes do
    quote do
      use Phoenix.VerifiedRoutes,
        endpoint: TrelloCloneWeb.Endpoint,
        router: TrelloCloneWeb.Router,
        statics: TrelloCloneWeb.static_paths()
    end
  end

  @doc """
  When used, dispatch to the appropriate controller/live_view/etc.
  """
  defmacro __using__(which) when is_atom(which) do
    apply(__MODULE__, which, [])
  end

  def static_paths, do: ~w(assets index.html vite.svg)
end
