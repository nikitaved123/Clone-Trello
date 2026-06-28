defmodule TrelloCloneWeb.CardController do
  use TrelloCloneWeb, :controller

  alias TrelloClone.Boards
  alias TrelloClone.Boards.Card
  alias TrelloCloneWeb.BoardEvent

  def create(conn, %{"list_id" => list_id, "card" => card_params}) do
    user = conn.assigns.current_user

    with {:ok, list} <- Boards.fetch_accessible_list(user, list_id) do
      position = Map.get(card_params, "position", Boards.next_card_position(list.id))

      attrs =
        card_params
        |> Map.put("list_id", list.id)
        |> Map.put("position", position)

      with {:ok, %Card{} = card} <- Boards.create_card(attrs) do
        BoardEvent.card_created(card)

        conn
        |> put_status(:created)
        |> render(:show, card: card)
      end
    end
  end

  def update(conn, %{"id" => id, "card" => card_params}) do
    user = conn.assigns.current_user

    with {:ok, card} <- Boards.fetch_accessible_card(user, id),
         {:ok, %Card{} = card} <- Boards.update_card(card, card_params) do
      BoardEvent.card_updated(card)
      render(conn, :show, card: card)
    end
  end

  def delete(conn, %{"id" => id}) do
    user = conn.assigns.current_user

    with {:ok, %Card{id: card_id, list_id: list_id} = card} <- Boards.fetch_accessible_card(user, id),
         {:ok, %Card{}} <- Boards.delete_card(card) do
      BoardEvent.card_deleted(list_id, card_id)
      send_resp(conn, :no_content, "")
    end
  end
end
