import Config

config :trello_clone, TrelloCloneWeb.Endpoint,
  server: true,
  force_ssl: [rewrite_on: [:x_forwarded_proto]]

config :logger, level: :info
