# Trello Clone

[![Maintainability](https://qlty.sh/gh/nikitaved123/projects/Clone-Trello/maintainability.svg)](https://qlty.sh/gh/nikitaved123/projects/Clone-Trello)

Веб-приложение для управления задачами по модели Trello: доски, списки, карточки, совместная работа и синхронизация в реальном времени.

## Стек

- **Backend:** Elixir, Phoenix 1.7, Ecto, Phoenix Channels
- **Frontend:** React 18, Redux Toolkit, React Router, Vite, Sass
- **БД:** PostgreSQL

## Репозиторий

https://github.com/nikitaved123/Clone-Trello

## Деплой

https://clone-trello.onrender.com

### Первый запуск на Render

1. Войдите на [dashboard.render.com](https://dashboard.render.com).
2. **New → Blueprint** → подключите репозиторий `nikitaved123/Clone-Trello`.
3. Render создаст веб-сервис `clone-trello` и БД `trello-clone-db` по `render.yaml`.
4. Дождитесь статуса **Live** (первый деплой ~5–10 минут).
5. Откройте URL в инкогнито, войдите: `alice` / `password123`.

На free-плане сервис «засыпает» после 15 минут бездействия — первый запрос после паузы может занять до 1 минуты.

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

## Качество кода

Анализ кода: [Qlty — Clone-Trello](https://qlty.sh/gh/nikitaved123/projects/Clone-Trello)
