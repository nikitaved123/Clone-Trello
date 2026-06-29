import Config

if config_env() == :prod do
  database_url =
    System.get_env("DATABASE_URL") ||
      raise """
      environment variable DATABASE_URL is missing.
      For example: ecto://USER:PASS@HOST/DATABASE
      """

  repo_opts = [
    url: database_url,
    pool_size: String.to_integer(System.get_env("POOL_SIZE") || "10")
  ]

  repo_opts =
    if String.contains?(database_url, "render.com") do
      Keyword.put(repo_opts, :ssl, true)
    else
      repo_opts
    end

  config :trello_clone, TrelloClone.Repo, repo_opts

  secret_key_base =
    System.get_env("SECRET_KEY_BASE") ||
      raise "environment variable SECRET_KEY_BASE is missing."

  phx_host =
    System.get_env("RENDER_EXTERNAL_HOSTNAME") ||
      System.get_env("PHX_HOST") ||
      "example.com"

  config :trello_clone, TrelloCloneWeb.Endpoint,
    url: [host: phx_host, port: 443, scheme: "https"],
    check_origin: [
      "https://#{phx_host}",
      "https://www.#{phx_host}"
    ],
    http: [
      ip: {0, 0, 0, 0, 0, 0, 0, 0},
      port: String.to_integer(System.get_env("PORT") || "4000")
    ],
    secret_key_base: secret_key_base

  config :logger, level: :info
end
