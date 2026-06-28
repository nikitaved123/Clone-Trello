import { createSlice } from "@reduxjs/toolkit";

const STORAGE_KEY = "theme";

function readDarkMode() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "dark";
  } catch {
    return false;
  }
}

const themeSlice = createSlice({
  name: "theme",
  initialState: {
    darkMode: readDarkMode(),
  },
  reducers: {
    toggleDarkMode(state) {
      state.darkMode = !state.darkMode;
      localStorage.setItem(STORAGE_KEY, state.darkMode ? "dark" : "light");
    },
  },
});

export const { toggleDarkMode } = themeSlice.actions;
export default themeSlice.reducer;
