// src/store/themeSlice.js
import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  darkMode: localStorage.getItem('darkMode') === 'true' || false,
}

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.darkMode = !state.darkMode
      localStorage.setItem('darkMode', state.darkMode)
    },
    setTheme: (state, action) => {
      state.darkMode = action.payload
      localStorage.setItem('darkMode', state.darkMode)
    },
  },
})

export const { toggleTheme, setTheme } = themeSlice.actions
export default themeSlice.reducer