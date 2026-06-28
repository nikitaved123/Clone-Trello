defmodule TrelloCloneWeb.HealthController do
  use TrelloCloneWeb, :controller

  def index(conn, _params) do
    json(conn, %{status: "ok"})
  end
end
