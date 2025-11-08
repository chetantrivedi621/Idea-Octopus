import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";

export default function VisitorLogin() {
  const navigate = useNavigate();

  return (
    <div className="login-wrapper">
      <div className="login-card">

        <h1 className="login-title">🕵️ Visitor Login</h1>
        <p className="login-sub">Explore event moments & team showcases</p>

        <input className="login-input" placeholder="Visitor Email" />
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
