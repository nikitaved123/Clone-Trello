import Config

config :trello_clone,
  ecto_repos: [TrelloClone.Repo],
  generators: [timestamp_type: :utc_datetime]

config :trello_clone, TrelloClone.Repo,
  username: "postgres",
  password: "postgres",
  hostname: "localhost",
  database: "trello_clone_dev",
  stacktrace: true,
  show_sensitive_data_on_connection_error: true,
  pool_size: 10

config :trello_clone, TrelloCloneWeb.Endpoint,
  url: [host: "localhost"],
  adapter: Bandit.PhoenixAdapter,
  render_errors: [
    formats: [json: TrelloCloneWeb.ErrorJSON],
    layout: false
  ],
  pubsub_server: TrelloClone.PubSub,
  live_view: [signing_salt: "trello_clone_salt"]

config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

config :phoenix, :json_library, Jason

import_config "#{config_env()}.exs"
