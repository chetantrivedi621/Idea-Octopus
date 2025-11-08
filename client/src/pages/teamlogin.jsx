import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";

export default function TeamLogin() {
  const navigate = useNavigate();

  return (
    <div className="login-wrapper">
      <div className="login-card">

        <h1 className="login-title">🛠️ Organizing Team Login</h1>
        <p className="login-sub">Manage sessions, teams & event controls</p>

        <input className="login-input" placeholder="Team Email" />
        <input className="login-input" type="password" placeholder="Password" />

        <button className="login-btn">Login</button>

        <p className="back-link">
          <span onClick={() => navigate("/login")}>
            ⬅ Back to Login Select
          </span>
        </p>

      </div>
    </div>
  );
}
