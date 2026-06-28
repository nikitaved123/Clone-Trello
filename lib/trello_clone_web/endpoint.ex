defmodule TrelloCloneWeb.Endpoint do
  use Phoenix.Endpoint, otp_app: :trello_clone

  @session_options [
    store: :cookie,
    key: "_trello_clone_key",
    signing_salt: "trello_clone_signing",
    same_site: "Lax"
  ]

  socket "/socket", TrelloCloneWeb.UserSocket,
    websocket: [connect_info: [session: @session_options]],
    longpoll: false

  plug Plug.RequestId
  plug Plug.Telemetry, event_prefix: [:phoenix, :endpoint]

  plug Plug.Parsers,
    parsers: [:urlencoded, :multipart, :json],
    pass: ["*/*"],
    json_decoder: Phoenix.json_library()

  plug Plug.MethodOverride
  plug Plug.Head
  plug Plug.Session, @session_options

  plug Plug.Static,
    at: "/",
    from: :trello_clone,
    gzip: false,
    only: TrelloCloneWeb.static_paths()

  plug CORSPlug,
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:5173",
      "http://127.0.0.1:5173"
    ],
    credentials: true
  plug TrelloCloneWeb.Router
end
