import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearError, register } from "../store/authSlice";
import ThemeToggle from "../components/ThemeToggle";
export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const error = useSelector((state) => state.auth.error);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    dispatch(clearError());
    const result = await dispatch(register({ username, password }));
    setSubmitting(false);
    if (register.fulfilled.match(result)) {
      navigate("/");
    }
  }

  return (
    <div className="auth-page">
      <ThemeToggle className="theme-toggle--auth" />
      <form className="auth-card" onSubmit={handleSubmit}>        <h1>Регистрация</h1>
        <p className="auth-subtitle">Создайте аккаунт</p>

        {error && <div className="auth-error">{error}</div>}

        <label>
          Имя пользователя
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            minLength={3}
            required
          />
        </label>

        <label>
          Пароль
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
        </label>

        <button type="submit" disabled={submitting}>
          {submitting ? "Создание..." : "Зарегистрироваться"}
        </button>

        <p className="auth-footer">
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </form>
    </div>
  );
}
