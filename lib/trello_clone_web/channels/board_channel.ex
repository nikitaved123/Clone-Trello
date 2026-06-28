defmodule TrelloCloneWeb.BoardChannel do
  use TrelloCloneWeb, :channel

  alias TrelloClone.Boards
  alias TrelloCloneWeb.Presence

  @impl true
  def join("board:" <> board_id, _payload, socket) do
    user = socket.assigns.current_user

    with {board_id, ""} <- Integer.parse(board_id),
         true <- Boards.user_can_access_board?(user, board_id) do
      socket = assign(socket, :board_id, board_id)
      send(self(), :after_join)
      {:ok, socket}
    else
      _ -> {:error, %{reason: "unauthorized"}}
    end
  end

  @impl true
  def handle_info(:after_join, socket) do
    user = socket.assigns.current_user

    {:ok, _} =
      Presence.track(socket, Integer.to_string(user.id), %{
        username: user.username,
        online_at: System.system_time(:second)
      })

    push(socket, "presence_state", Presence.list(socket))

    {:noreply, socket}
  end
end
