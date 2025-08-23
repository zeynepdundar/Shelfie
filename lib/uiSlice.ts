import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type ThemeMode = "light" | "dark" | "system";

interface UiState {
  theme: ThemeMode;
  isLoginOpen: boolean;
}

const initialState: UiState = {
  theme: "system",
  isLoginOpen: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<ThemeMode>) {
      state.theme = action.payload;
    },
    openLogin(state) {
      state.isLoginOpen = true;
    },
    closeLogin(state) {
      state.isLoginOpen = false;
    },
    toggleLogin(state) {
      state.isLoginOpen = !state.isLoginOpen;
    },
  },
});

export const { setTheme, openLogin, closeLogin, toggleLogin } = uiSlice.actions;
export default uiSlice.reducer;
