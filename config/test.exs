import Config

config :trello_clone, TrelloClone.Repo,
  username: "postgres",
  password: "postgres",
  hostname: "localhost",
  database: "trello_clone_test",
  pool: Ecto.Adapters.SQL.Sandbox

config :trello_clone, TrelloCloneWeb.Endpoint,
  http: [ip: {127, 0, 0, 1}, port: 4002],
  secret_key_base: "j56IcN9Ubvmg2sOQIFtFJGZkPO9cOQE0iDOSyh8+OecLrJ9jkdST7EyRXSNRBFEX",
  server: false

config :logger, level: :warning
