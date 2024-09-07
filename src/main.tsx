import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "./App.tsx";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import GamePage from "./pages/GamePage";
import "./index.css";
import WebApp from "@twa-dev/sdk";
import { AuthProvider } from "./contexts/AuthContext.tsx";

WebApp.ready();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/game-page/:contractAddress" element={<GamePage />} />
        </Routes>
      </Router>
    </AuthProvider>
  </StrictMode>
);
