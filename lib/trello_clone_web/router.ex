defmodule TrelloCloneWeb.Router do
  use TrelloCloneWeb, :router

  pipeline :api do
    plug :accepts, ["json"]
    plug :fetch_session
    plug TrelloCloneWeb.Plugs.FetchCurrentUser
  end

  pipeline :authenticated do
    plug TrelloCloneWeb.Plugs.RequireAuth
  end

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug TrelloCloneWeb.Plugs.FetchCurrentUser
  end

  scope "/api", TrelloCloneWeb do
    pipe_through :api

    get "/health", HealthController, :index

    post "/registrations", RegistrationController, :create
    post "/sessions", SessionController, :create
    get "/sessions/current", SessionController, :current
    delete "/sessions", SessionController, :delete

    scope "/" do
      pipe_through :authenticated

      resources "/boards", BoardController, except: [:new, :edit] do
        post "/invite", BoardController, :invite
        delete "/members/:user_id", BoardController, :remove_member
        resources "/lists", ListController, only: [:create]
      end

      resources "/lists", ListController, only: [:update, :delete]
      resources "/cards", CardController, only: [:update, :delete]

      resources "/lists", ListController, only: [] do
        resources "/cards", CardController, only: [:create]
      end
    end
  end

  scope "/", TrelloCloneWeb do
    pipe_through :browser

    get "/", PageController, :index
    get "/*path", PageController, :index
  end
end
