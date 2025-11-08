import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";

export default function JudgeLogin() {
  const navigate = useNavigate();

  return (
    <div className="login-wrapper">

      <div className="login-card">
        <h1 className="login-title">⚖️ Judge Login</h1>
        <p className="login-sub">Access your evaluation dashboard</p>

        <input
          className="login-input"
          type="email"
          placeholder="Judge Email"
        />

        <input
          className="login-input"
          type="password"
          placeholder="Password"
        />

        <button className="login-btn">Login</button>

        {/* ✅ Updated Back Button */}
        <p className="back-link">
          <span onClick={() => navigate("/login")}>⬅ Back to Login Select</span>
        </p>

      </div>

    </div>
  );
}
