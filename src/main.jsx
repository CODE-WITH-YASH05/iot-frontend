import React from "react";
import ReactDOM from "react-dom/client";

import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import App from "./App";
import { store } from "./store";

import AuthBootstrap from "./features/auth/components/AuthBootstrap";

import "./index.css";
import "./api/interceptors";

// ==========================================================
// REACT QUERY CLIENT
// ==========================================================

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30 * 1000,
    },
  },
});

// ==========================================================
// APP ROOT
// ==========================================================

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthBootstrap>
            <App />
          </AuthBootstrap>
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>,
);
