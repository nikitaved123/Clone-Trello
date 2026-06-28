import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { boardTheme } from "../boardColors";
import ThemeToggle from "../components/ThemeToggle";
import { logout } from "../store/authSlice";import { createBoard, deleteBoard, fetchBoards } from "../store/boardsSlice";

function BoardTile({ board, owned, onDelete }) {
  const theme = boardTheme(board.id);

  return (
    <div className="board-tile-wrap">
      <Link
        to={`/boards/${board.id}`}
        className="board-tile"
        style={{
          "--tile-bg": theme.tile,
          "--tile-accent": theme.accent,
        }}
      >
        <span className="board-tile__name">{board.name}</span>
        {!owned && <span className="board-tile__badge">участник</span>}
      </Link>
      {owned && (
        <button
          type="button"
          className="board-tile__delete"
          title="Удалить доску"
          onClick={() => onDelete(board)}
        >
          ×
        </button>
      )}
    </div>
  );
}

export default function Home() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { owned, member, loading } = useSelector((state) => state.boards);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    dispatch(fetchBoards());
  }, [dispatch]);

  async function handleCreate(event) {
    event.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    await dispatch(createBoard(name.trim()));
    setName("");
    setCreating(false);
  }

  async function handleDelete(board) {
    if (!window.confirm(`Удалить доску «${board.name}»?`)) return;
    await dispatch(deleteBoard(board.id));
  }

  return (
    <div className="home-page">
      <header className="app-header">
        <div className="app-header__brand">Trello Clone</div>
        <div className="app-header__user">
          <ThemeToggle className="theme-toggle--header" />
          <span>{user?.username}</span>          <button onClick={() => dispatch(logout())}>Выйти</button>
        </div>
      </header>

      <main className="home-main">
        <section className="boards-section">
          <h2>Мои доски</h2>
          {loading ? (
            <p>Загрузка...</p>
          ) : (
            <div className="boards-grid">
              {owned.map((board) => (
                <BoardTile
                  key={board.id}
                  board={board}
                  owned
                  onDelete={handleDelete}
                />
              ))}
              <form className="board-create" onSubmit={handleCreate}>
                <input
                  placeholder="Название новой доски"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <button type="submit" disabled={creating}>
                  {creating ? "..." : "Создать"}
                </button>
              </form>
            </div>
          )}
        </section>

        {member.length > 0 && (
          <section className="boards-section">
            <h2>Доски, где я участник</h2>
            <div className="boards-grid">
              {member.map((board) => (
                <BoardTile key={board.id} board={board} owned={false} onDelete={handleDelete} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
