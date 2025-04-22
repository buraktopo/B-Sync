import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute"; 
import SidebarLayout from "./components/SidebarLayout";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings.js";

function App() {
  return (
    <SidebarLayout>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
      </Routes>
    </SidebarLayout>
  );
}

const AppWrapper = () => (
  <Router>
    <App />
  </Router>
);

export default AppWrapper;