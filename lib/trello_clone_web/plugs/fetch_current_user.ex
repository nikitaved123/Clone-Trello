defmodule TrelloCloneWeb.Plugs.FetchCurrentUser do
  @moduledoc false

  import Plug.Conn

  alias TrelloClone.Accounts

  def init(opts), do: opts

  def call(conn, _opts) do
    user_id = get_session(conn, :user_id)

    case user_id && Accounts.get_user(user_id) do
      %Accounts.User{} = user -> assign(conn, :current_user, user)
      _ -> assign(conn, :current_user, nil)
    end
  end
end
