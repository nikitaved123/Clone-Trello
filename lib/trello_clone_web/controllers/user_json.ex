defmodule TrelloCloneWeb.UserJSON do
  alias TrelloClone.Accounts.User

  def show(%{user: user}) do
    %{user: data(user)}
  end

  defp data(%User{} = user) do
    %{
      id: user.id,
      username: user.username
    }
  end
end
