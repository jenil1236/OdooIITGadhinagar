import React, { useState } from "react";

const App = () => {
  const [signupData, setSignupData] = useState({ username: "", email: "", password: "" });
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [response, setResponse] = useState(null);


  // Local Signup
  const signup = async () => {
    try {
      const res = await fetch(`/api/signup`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupData),
      });
      const data = await res.json();
      setResponse(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Local Login
  const login = async () => {
    try {
      const res = await fetch(`/api/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });
      const data = await res.json();
      setResponse(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Logout
  const logout = async () => {
    try {
      const res = await fetch(`/api/logout`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      setResponse(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Google Login
  const googleLogin = () => {
    window.location.href = `http://localhost:5000/api/auth/google`;
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Login / Signup Test</h1>

        {/* Signup Form */}
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-700 mb-3">Signup (Local)</h2>
          <input
            type="text"
            placeholder="Username"
            value={signupData.username}
            onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
            className="w-full mb-2 p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="email"
            placeholder="Email"
            value={signupData.email}
            onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
            className="w-full mb-2 p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={signupData.password}
            onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
            className="w-full mb-4 p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={signup}
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded hover:bg-blue-700 transition"
          >
            Signup
          </button>
        </div>

        {/* Login Form */}
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-700 mb-3">Login (Local)</h2>
          <input
            type="text"
            placeholder="Username"
            value={loginData.username}
            onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
            className="w-full mb-2 p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={loginData.password}
            onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
            className="w-full mb-4 p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={login}
            className="w-full bg-green-600 text-white font-semibold py-2 rounded hover:bg-green-700 transition"
          >
            Login
          </button>
        </div>

        {/* Google Login */}
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-700 mb-3 text-center">Or Login with Google</h2>
          <button
            onClick={googleLogin}
            className="w-full flex items-center justify-center border border-gray-300 py-2 rounded hover:shadow-md transition"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
              alt="Google"
              className="w-6 h-6 mr-2"
            />
            <span className="font-medium text-gray-700">Continue with Google</span>
          </button>
        </div>

        {/* Logout */}
        <div className="mb-4">
          <button
            onClick={logout}
            className="w-full bg-red-500 text-white font-semibold py-2 rounded hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>

        {/* Response */}
        {response && (
          <div className="response p-4 bg-gray-100 border border-gray-300 rounded">
            <pre className="text-sm">{JSON.stringify(response, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
