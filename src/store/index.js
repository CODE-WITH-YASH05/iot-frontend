// src/store/index.js

import { configureStore } from "@reduxjs/toolkit";

import userReducer from "./userSlice";
import cartReducer from "./cartSlice";
import wishlistReducer from "./wishlistSlice";
import themeReducer from "./themeSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    theme: themeReducer,
  },

  devTools: import.meta.env.DEV,
});