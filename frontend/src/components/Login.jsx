// src/components/Login.jsx
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom"; // Add useNavigate import

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate(); // Initialize navigate

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);

    try {
      // Simulate login API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // In real app, verify credentials with backend
      // For demo purposes, we'll determine role based on email
      const isAdmin =
        formData.email.includes("admin") ||
        formData.email.includes("@company.com");
      const isEmployee =
        formData.email.includes("employee") ||
        formData.email.includes("@employee.com");

      const userData = {
        id: "1",
        name: isAdmin ? "Admin User" : "Employee User",
        email: formData.email,
        role: isAdmin ? "ADMIN" : isEmployee ? "EMPLOYEE" : "EMPLOYEE", // Default to employee
        companyName: "Benerous Magpie",
        currency: "USD",
        country: "United States",
      };

      login(userData);

      // ADD NAVIGATION LOGIC HERE
      if (userData.role === "ADMIN") {
        navigate("/admin/dashboard");
      } else if (userData.role === "EMPLOYEE") {
        navigate("/employee/dashboard");
      } else {
        // Default fallback
        navigate("/employee/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrors({ submit: "Invalid email or password" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    alert("Password reset functionality to be implemented");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-center">
          <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
          <p className="text-blue-100 text-sm mt-1">Sign in to your account</p>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.email ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="your@email.com"
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.password ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="••••••"
              />
              {errors.password && (
                <p className="text-red-600 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {errors.submit && (
              <div className="rounded-md bg-red-50 p-3">
                <p className="text-sm text-red-800">{errors.submit}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-800 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 space-y-3 text-center">
            <button
              onClick={handleForgotPassword}
              className="block w-full text-sm text-blue-600 hover:text-blue-500"
            >
              Forgot password?
            </button>

            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign up
              </Link>
            </p>
          </div>

          {/* Demo Credentials Hint */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Demo Credentials:
            </p>
            <div className="text-xs text-gray-600 space-y-1">
              <p>
                <strong>Admin:</strong> admin@company.com / any password
              </p>
              <p>
                <strong>Employee:</strong> employee@company.com / any password
              </p>
              <p>
                <strong>Or:</strong> any email containing "admin" or "employee"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
