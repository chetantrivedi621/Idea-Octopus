import React, { useState } from "react";
import "../styles/signup.css";
import { useNavigate } from "react-router-dom";

export default function SignUp() {
  const navigate = useNavigate();
  const [role, setRole] = useState("");

  return (
    <div className="signup-wrapper">

      <div className="signup-card">
        <h1 className="signup-title">🐙 Create Your Account</h1>
        <p className="signup-sub">Join HackCapsule and begin your journey</p>

        {/* Input Fields */}
        <input className="signup-input" placeholder="Full Name" />
        <input className="signup-input" placeholder="Email Address" />
        <input className="signup-input" type="password" placeholder="Password" />
        <input className="signup-input" type="password" placeholder="Confirm Password" />

        {/* Role Selection */}
        <h3 className="role-label">Sign Up As</h3>
        <div className="role-options">
          {["Student", "Visitor", "Judge", "Organizing Team"].map((item) => (
            <button
              key={item}
              className={`role-btn ${role === item ? "active" : ""}`}
              onClick={() => setRole(item)}
            >
              {item}
            </button>
          ))}
        </div>

        {/* Signup Button */}
        <button className="signup-btn">Create Account</button>

        {/* Back to Login */}
        <p className="signup-footer">
          Already have an account?{" "}
          <span onClick={() => navigate("/login")}>Login</span>
        </p>
      </div>
    </div>
  );
}
