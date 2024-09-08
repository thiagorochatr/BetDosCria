import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import App from "./App.tsx";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import GamePage from "./pages/GamePage";
import "./index.css";
import WebApp from "@twa-dev/sdk";
import { AuthProvider } from "./contexts/AuthContext.tsx";

WebApp.ready();

const root = document.getElementById("root");
if (root) {
  root.className = "h-full max-w-[400px] mx-auto overflow-auto bg-slate-900 text-slate-200";
}

createRoot(root!).render(
  <StrictMode>
    <AuthProvider>
      <Router>
        <div className="min-h-full flex flex-col">
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/game-page/:contractAddress" element={<GamePage />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  </StrictMode>
);
