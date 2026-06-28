defmodule TrelloCloneWeb.Plugs.RequireAuth do
  @moduledoc false

  import Plug.Conn

  def init(opts), do: opts

  def call(%{assigns: %{current_user: %TrelloClone.Accounts.User{}}} = conn, _opts), do: conn

  def call(conn, _opts) do
    conn
    |> put_status(:unauthorized)
    |> Phoenix.Controller.json(%{error: "unauthorized"})
    |> halt()
  end
end
