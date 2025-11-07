import { Link, NavLink } from "react-router-dom";
import "./Header.css";

export default function Header() {
  return (
    <header className="header">
      <div className="header-container">
        
        <div className="logo-container">
          {/* Logo / Title */}
        <Link to="/" className="logo">
          <img className="logo-img" src="./public/Logo.png" alt="Logo" />
        </Link>
        </div>
      
        <div className="btn-container">
          <button className="btn-1">SignUp</button>
        <button className="btn-2">Try Now</button>
        </div>

      </div>
    </header>
  );
}
