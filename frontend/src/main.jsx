import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import LoginPage from "./pages/LoginPage";
import AdminPanel from "./pages/AdminPanel";
import { useStore } from "./store/store";

function RootApp() {
  const { initAuth, isAuthenticated, theme } = useStore();

  useEffect(() => {
    initAuth();
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route
          path="/"
          element={
            isAuthenticated ? <App /> : <Navigate to="/login" replace />
          }
        />
      </Routes>
    </Router>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RootApp />
  </StrictMode>
);
