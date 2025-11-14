import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";
import { login } from "../api/api.js";

export default function VisitorLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const response = await login({
        email: formData.email,
        password: formData.password,
        role: "Visitor"
      });

      if (response.success) {
        // Store token and user data in localStorage
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        localStorage.setItem("role", "Guest"); // Map Visitor to Guest for dashboard

        // Redirect to dashboard
        navigate("/dashboard");
      }
    } catch (err) {
      alert("Invalid credentials. Please check your email and password.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h1 className="login-title">👤 Visitor Login</h1>
        <p className="login-sub">Explore event moments & team showcases</p>

        <form onSubmit={handleSubmit}>
          <input
            className="login-input"
            name="email"
            type="email"
            placeholder="Visitor Email"
            value={formData.email}
            onChange={handleInputChange}
            disabled={loading}
          />
          <div className="password-input-wrapper">
            <input
              className="login-input"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              disabled={loading}
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
            >
              {showPassword ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>

          <button
            type="submit"
            className="login-btn"
            disabled={loading}
            style={{ opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="back-link">
          <span onClick={() => navigate("/login")}>
            ← Back to Login Select
          </span>
        </p>
      </div>
    </div>
  );
}

