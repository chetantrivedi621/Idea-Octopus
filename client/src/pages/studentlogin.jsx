import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";

export default function StudentLogin() {
  const navigate = useNavigate();

  return (
    <div className="login-wrapper">

      <div className="login-card">
        <h1 className="login-title">🎓 Student Login</h1>
        <p className="login-sub">Login to continue your hackathon journey</p>

        <input
          className="login-input"
          type="text"
          placeholder="Email or Username"
        />

        <input
          className="login-input"
          type="password"
          placeholder="Password"
        />

        <button className="login-btn">Login</button>

        <p className="back-link">
          <span onClick={() => navigate("/login")}>⬅ Back to Login Select</span>
        </p>
      </div>

    </div>
  );
}
