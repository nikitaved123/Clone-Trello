import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import boardsReducer from "./boardsSlice";
import themeReducer from "./themeSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    boards: boardsReducer,
    theme: themeReducer,
  },
});
