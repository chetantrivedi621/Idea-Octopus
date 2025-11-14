import React, { useState } from "react";
import "../styles/signup.css";
import { useNavigate } from "react-router-dom";
import { signup } from "../api/api.js";

export default function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    teamId: "",
    password: "",
    confirmPassword: "",
    role: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Check if selected role is for teams (Student role is used for teams)
  const isTeamRole = formData.role === "Student";

  // Map role to login route after successful signup
  const getLoginRoute = (role) => {
    const roleMap = {
      "Student": "/login/student",
      "Organizing Team": "/login/team",
      "Judge": "/login/judge",
      "Visitor": "/login/visitor"
    };
    return roleMap[role] || "/login";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleRoleSelect = (selectedRole) => {
    setFormData(prev => ({
      ...prev,
      role: selectedRole,
      // Clear email/teamId when switching roles
      email: "",
      teamId: ""
    }));
    // Clear error when user selects role
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.name || !formData.password || !formData.confirmPassword || !formData.role) {
      setError("All fields are required");
      return;
    }

    // For teams (Student role), require Team ID instead of email
    if (isTeamRole && !formData.teamId) {
      setError("Team ID is required for team signup");
      return;
    }

    // For other roles, require email
    if (!isTeamRole && !formData.email) {
      setError("Email is required");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      // Prepare signup data according to server API
      const signupData = {
        name: formData.name.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: formData.role
      };

      // Add email or teamId based on role
      if (isTeamRole) {
        signupData.teamId = formData.teamId.trim();
      } else {
        signupData.email = formData.email.trim();
      }

      // Call signup API
      const response = await signup(signupData);

      // Handle successful signup
      if (response && response.success) {
        // Store token if provided
        if (response.data && response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
        // Store user data if provided
        if (response.data && response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        // Store team data if provided (for Student role)
        if (response.data && response.data.team) {
          localStorage.setItem('team', JSON.stringify(response.data.team));
          localStorage.setItem('teamId', response.data.team._id);
        }
        
        // Redirect to the appropriate login page based on role
        const loginRoute = getLoginRoute(formData.role);
        navigate(loginRoute);
      } else if (response && response.message) {
        setError(response.message);
      } else {
        setError("Signup failed. Please try again.");
      }
    } catch (err) {
      console.error("Signup error:", err);
      
      // Handle different error types
      let errorMessage = "Signup failed. Please try again.";
      
      if (err && err.message) {
        // Error from API wrapper
        errorMessage = err.message;
        
        // Check if it's a network error
        if (err.status === 0 || err.code === 'ECONNREFUSED' || 
            err.message.includes('Network error') || 
            err.message.includes('Failed to fetch') || 
            err.message.includes('Network Error') ||
            err.message.includes('Cannot connect')) {
          errorMessage = err.message || "Network error: Unable to connect to server. Please check if the server is running at http://localhost:8080 and try again.";
        }
      } else if (err && err.response && err.response.data) {
        // Direct axios error
        const responseData = err.response.data;
        errorMessage = responseData.message || responseData.error || errorMessage;
      } else if (err && err.raw) {
        // Check raw error data
        if (err.raw.message) {
          errorMessage = err.raw.message;
        } else if (err.raw.error) {
          errorMessage = err.raw.error;
        } else if (typeof err.raw === 'string') {
          errorMessage = err.raw;
        }
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-wrapper">
      <div className="signup-card">
        <h1 className="signup-title">🐙 Create Your Account</h1>
        <p className="signup-sub">Join HackCapsule and begin your journey</p>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Name Input */}
          <input
            className="signup-input"
            name="name"
            type="text"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleInputChange}
            disabled={loading}
            required
          />

          {/* Email or Team ID Input (conditional based on role) */}
          {isTeamRole ? (
            <input
              className="signup-input"
              name="teamId"
              type="text"
              placeholder="Team ID (e.g., codeblack-123)"
              value={formData.teamId}
              onChange={handleInputChange}
              disabled={loading}
              required
            />
          ) : (
            <input
              className="signup-input"
              name="email"
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleInputChange}
              disabled={loading}
              required
            />
          )}

          {/* Password Input */}
          <div className="password-input-wrapper">
            <input
              className="signup-input"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password (min. 6 characters)"
              value={formData.password}
              onChange={handleInputChange}
              disabled={loading}
              required
              minLength={6}
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
              aria-label="Toggle password visibility"
            >
              {showPassword ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>

          {/* Confirm Password Input */}
          <div className="password-input-wrapper">
            <input
              className="signup-input"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              disabled={loading}
              required
              minLength={6}
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={loading}
              aria-label="Toggle confirm password visibility"
            >
              {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>

          {/* Role Selection */}
          <h3 className="role-label">Sign Up As</h3>
          <div className="role-options">
            {["Student", "Visitor", "Judge", "Organizing Team"].map((role) => (
              <button
                key={role}
                type="button"
                className={`role-btn ${formData.role === role ? "active" : ""}`}
                onClick={() => handleRoleSelect(role)}
                disabled={loading}
              >
                {role === "Student" ? "Team" : role}
              </button>
            ))}
          </div>

          {/* Signup Button */}
          <button
            type="submit"
            className="signup-btn"
            disabled={loading || !formData.role}
            style={{ 
              opacity: (loading || !formData.role) ? 0.7 : 1, 
              cursor: (loading || !formData.role) ? "not-allowed" : "pointer" 
            }}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {/* Back to Login */}
        <p className="signup-footer">
          Already have an account?{" "}
          <span onClick={() => navigate("/login")} style={{ cursor: 'pointer', color: '#5227FF', textDecoration: 'underline' }}>
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

