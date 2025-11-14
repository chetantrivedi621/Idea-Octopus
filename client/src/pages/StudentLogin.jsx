import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";
import { login } from "../api/api.js";

export default function TeamLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    teamId: "",
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

    if (!formData.teamId || !formData.password) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const response = await login({
        teamId: formData.teamId.trim(),
        password: formData.password,
        role: "Student" // Student role is used for teams
      });

      if (response.success) {
        // Store token and user data in localStorage
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        
        // Store team information if available
        if (response.data.team) {
          localStorage.setItem("team", JSON.stringify(response.data.team));
          localStorage.setItem("teamId", response.data.team._id);
        }
        
        localStorage.setItem("role", "Participant"); // Map Student to Participant for dashboard

        // Redirect to dashboard
        navigate("/dashboard");
      }
    } catch (err) {
      alert("Invalid credentials. Please check your Team ID and password.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h1 className="login-title">👥 Team Login</h1>
        <p className="login-sub">Login with your Team ID and password to access your collaborative dashboard</p>

        <form onSubmit={handleSubmit}>
          <input
            className="login-input"
            name="teamId"
            type="text"
            placeholder="Team ID (e.g., codeblack-123)"
            value={formData.teamId}
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
            {loading ? "Logging in..." : "Login to Team Dashboard"}
          </button>
        </form>

        <p className="back-link">
          <span onClick={() => navigate("/login")}>← Back to Login Select</span>
        </p>
      </div>
    </div>
  );
}

