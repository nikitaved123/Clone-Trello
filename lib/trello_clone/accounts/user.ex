defmodule TrelloClone.Accounts.User do
  use Ecto.Schema
  import Ecto.Changeset

  alias TrelloClone.Boards.Board

  schema "users" do
    field :username, :string
    field :password, :string, virtual: true, redact: true
    field :encrypted_password, :string, redact: true

    has_many :owned_boards, Board, foreign_key: :user_id
    many_to_many :boards, Board, join_through: "board_users", on_replace: :delete

    timestamps(type: :utc_datetime)
  end

  @doc false
  def registration_changeset(user, attrs) do
    user
    |> cast(attrs, [:username, :password])
    |> validate_required([:username, :password])
    |> validate_length(:username, min: 3, max: 50)
    |> validate_length(:password, min: 6, max: 100)
    |> unique_constraint(:username)
    |> put_encrypted_password()
  end

  defp put_encrypted_password(%Ecto.Changeset{valid?: true, changes: %{password: password}} = changeset) do
    change(changeset, encrypted_password: Pbkdf2.hash_pwd_salt(password))
  end

  defp put_encrypted_password(changeset), do: changeset

  def valid_password?(%__MODULE__{encrypted_password: encrypted_password}, password)
      when is_binary(encrypted_password) and byte_size(password) > 0 do
    Pbkdf2.verify_pass(password, encrypted_password)
  end

  def valid_password?(_, _) do
    Pbkdf2.no_user_verify()
    false
  end
end
