// src/App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import HomePage from "./components/HomePage";
import AdminDashboard from "./components/AdminDashboard";
import EmployeeDashboard from "./components/EmployeeDashboard"; // Add this import
import AdminSignup from "./components/AdminSignup";
import Login from "./components/Login";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ManagerDashboard from "./components/ManagerDashboard";

// Protected Route component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // Redirect to appropriate dashboard based on actual role
    if (user.role === "ADMIN") {
      return <Navigate to="/admin/dashboard" />;
    } else {
      return <Navigate to="/employee/dashboard" />;
    }
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/signup" element={<AdminSignup />} />
            <Route path="/login" element={<Login />} />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                // <ProtectedRoute requiredRole="ADMIN">
                <AdminDashboard />
                // </ProtectedRoute>
              }
            />

            {/* Employee Routes */}
            <Route
              path="/employee/dashboard"
              element={
                // <ProtectedRoute requiredRole="EMPLOYEE">
                <EmployeeDashboard />
                // </ProtectedRoute>
              }
            />
            {/* {Manager Routes} */}
            <Route
              path="/manager/dashboard"
              element={
                // <ProtectedRoute requiredRole="EMPLOYEE">
                <ManagerDashboard />
                // </ProtectedRoute>
              }
            />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/login" />} />

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
