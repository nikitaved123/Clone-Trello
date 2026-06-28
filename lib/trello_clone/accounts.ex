defmodule TrelloClone.Accounts do
  @moduledoc """
  Context for user registration and authentication.
  """

  import Ecto.Query, warn: false
  alias TrelloClone.Repo
  alias TrelloClone.Accounts.User

  def register_user(attrs) do
    %User{}
    |> User.registration_changeset(attrs)
    |> Repo.insert()
  end

  def get_user!(id), do: Repo.get!(User, id)

  def get_user(id), do: Repo.get(User, id)

  def get_user_by_username(username) when is_binary(username) do
    Repo.get_by(User, username: username)
  end

  def authenticate(username, password) do
    user = get_user_by_username(username)

    cond do
      user && User.valid_password?(user, password) ->
        {:ok, user}

      user ->
        {:error, :invalid_password}

      true ->
        {:error, :not_found}
    end
  end
end
