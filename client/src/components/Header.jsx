import { Link, NavLink } from "react-router-dom";
import "./Header.css";

export default function Header() {
  return (
    <header className="header">
      <div className="header-container">
        
        <div className="logo-container">
          <Link to="/" className="logo">
            <img className="logo-img" src="/images/logo.png" alt="HackCapsule" />
            <span className="logo-text">HackCapsule</span>
          </Link>
        </div>
      
        <div className="btn-container">
          <Link to="/signup" className="btn btn-1">Sign Up</Link>
          <Link to="/login" className="btn btn-2">Try Now</Link>
        </div>

      </div>
    </header>
  );
}
