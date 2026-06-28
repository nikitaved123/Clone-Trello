const API = "/api";

async function request(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const apiErrors = {
      not_found: "Пользователь не найден",
      forbidden: "Недостаточно прав для этого действия",
      unauthorized: "Необходимо войти в аккаунт",
      invalid_credentials: "Неверный логин или пароль",
    };
    const message =
      data.errors?.username?.[0] ||
      data.errors?.password?.[0] ||
      apiErrors[data.error] ||
      data.error ||
      "Не удалось выполнить запрос";
    throw new Error(message);
  }

  return data;
}

export const api = {
  getCurrentUser: () => request("/sessions/current"),
  login: (username, password) =>
    request("/sessions", {
      method: "POST",
      body: JSON.stringify({ session: { username, password } }),
    }),
  register: (username, password) =>
    request("/registrations", {
      method: "POST",
      body: JSON.stringify({ registration: { username, password } }),
    }),
  logout: () => request("/sessions", { method: "DELETE" }),
  getBoards: () => request("/boards"),
  getBoard: (id) => request(`/boards/${id}`),
  createBoard: (name) =>
    request("/boards", {
      method: "POST",
      body: JSON.stringify({ board: { name } }),
    }),
  updateBoard: (id, attrs) =>
    request(`/boards/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ board: attrs }),
    }),
  deleteBoard: (id) => request(`/boards/${id}`, { method: "DELETE" }),
  createList: (boardId, name) =>
    request(`/boards/${boardId}/lists`, {
      method: "POST",
      body: JSON.stringify({ list: { name } }),
    }),
  createCard: (listId, name, description = "") =>
    request(`/lists/${listId}/cards`, {
      method: "POST",
      body: JSON.stringify({ card: { name, description } }),
    }),
  updateList: (id, attrs) =>
    request(`/lists/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ list: attrs }),
    }),
  deleteList: (id) => request(`/lists/${id}`, { method: "DELETE" }),
  updateCard: (id, attrs) =>
    request(`/cards/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ card: attrs }),
    }),
  deleteCard: (id) => request(`/cards/${id}`, { method: "DELETE" }),
  inviteMember: (boardId, username) =>
    request(`/boards/${boardId}/invite`, {
      method: "POST",
      body: JSON.stringify({ username }),
    }),
  removeMember: (boardId, userId) =>
    request(`/boards/${boardId}/members/${userId}`, {
      method: "DELETE",
    }),
};
