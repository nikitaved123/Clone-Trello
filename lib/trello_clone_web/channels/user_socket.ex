defmodule TrelloCloneWeb.UserSocket do
  use Phoenix.Socket

  channel "board:*", TrelloCloneWeb.BoardChannel

  @impl true
  def connect(_params, socket, connect_info) do
    case session_user_id(connect_info) do
      user_id when is_integer(user_id) ->
        case TrelloClone.Accounts.get_user(user_id) do
          nil -> :error
          user -> {:ok, assign(socket, :current_user, user)}
        end

      _ ->
        :error
    end
  end

  @impl true
  def id(socket), do: "user_socket:#{socket.assigns.current_user.id}"

  defp session_user_id(%{session: %{"user_id" => user_id}}), do: user_id
  defp session_user_id(_), do: nil
end
