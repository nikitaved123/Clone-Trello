defmodule TrelloCloneWeb.RegistrationController do
  use TrelloCloneWeb, :controller

  plug :put_view, json: TrelloCloneWeb.UserJSON

  alias TrelloClone.Accounts

  def create(conn, %{"registration" => registration_params}) do
    with {:ok, user} <- Accounts.register_user(registration_params) do
      conn
      |> put_session(:user_id, user.id)
      |> put_status(:created)
      |> render(:show, user: user)
    end
  end
end
