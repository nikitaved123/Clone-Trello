defmodule TrelloCloneWeb.Presence do
  use Phoenix.Presence,
    otp_app: :trello_clone,
    pubsub_server: TrelloClone.PubSub
end
