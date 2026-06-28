defmodule TrelloCloneWeb.SessionController do
  use TrelloCloneWeb, :controller

  plug :put_view, json: TrelloCloneWeb.UserJSON

  alias TrelloClone.Accounts

  def create(conn, %{"session" => %{"username" => username, "password" => password}}) do
    case Accounts.authenticate(username, password) do
      {:ok, user} ->
        conn
        |> put_session(:user_id, user.id)
        |> render(:show, user: user)

      {:error, _} ->
        {:error, :invalid_credentials}
    end
  end

  def current(conn, _params) do
    case conn.assigns.current_user do
      %Accounts.User{} = user ->
        render(conn, :show, user: user)

      nil ->
        {:error, :unauthorized}
    end
  end

  def delete(conn, _params) do
    conn
    |> clear_session()
    |> send_resp(:no_content, "")
  end
end
