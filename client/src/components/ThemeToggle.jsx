import { useDispatch, useSelector } from "react-redux";
import { toggleDarkMode } from "../store/themeSlice";

export default function ThemeToggle({ className = "" }) {
  const dispatch = useDispatch();
  const darkMode = useSelector((state) => state.theme.darkMode);

  return (
    <button
      type="button"
      className={`theme-toggle ${className}`.trim()}
      onClick={() => dispatch(toggleDarkMode())}
      title={darkMode ? "Светлый режим" : "Ночной режим"}
      aria-label={darkMode ? "Включить светлый режим" : "Включить ночной режим"}
    >
      {darkMode ? "☀️" : "🌙"}
    </button>
  );
}
