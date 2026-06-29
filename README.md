# Trello Clone

[![Maintainability](https://api.codeclimate.com/v1/badges/REPLACE/maintainability)](https://codeclimate.com/github/nikitaved123/Clone-Trello/maintainability)

Веб-приложение для управления задачами по модели Trello: доски, списки, карточки, совместная работа и синхронизация в реальном времени.

## Стек

- **Backend:** Elixir, Phoenix 1.7, Ecto, Phoenix Channels
- **Frontend:** React 18, Redux Toolkit, React Router, Vite, Sass
- **БД:** PostgreSQL

## Репозиторий

https://github.com/nikitaved123/Clone-Trello

## Деплой

https://clone-trello.onrender.com

Деплой через [Render Blueprint](https://dashboard.render.com/blueprints): подключите репозиторий `Clone-Trello`, Render прочитает `render.yaml` и создаст сервис с PostgreSQL.

## Тестовые данные

| Login | Password |
|-------|----------|
| alice | password123 |
| bob | password123 |

## Запуск локально

```bash
cd client && npm install && npm run build && cd ..
mix deps.get
mix ecto.setup
mix phx.server
```

http://localhost:4000
