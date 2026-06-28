import Config

config :trello_clone, TrelloClone.Repo,
  username: "postgres",
  password: "postgres",
  hostname: "localhost",
  database: "trello_clone_dev"

config :trello_clone, TrelloCloneWeb.Endpoint,
  http: [ip: {127, 0, 0, 1}, port: 4000],
  check_origin: false,
  code_reloader: true,
  debug_errors: true,
  secret_key_base: "j56IcN9Ubvmg2sOQIFtFJGZkPO9cOQE0iDOSyh8+OecLrJ9jkdST7EyRXSNRBFEX"

config :logger, level: :debug
config :phoenix, :stacktrace_depth, 20
