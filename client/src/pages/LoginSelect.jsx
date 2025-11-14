import React from "react";
import "../styles/loginSelect.css";
import { useNavigate, Link } from "react-router-dom";
import { HiLockClosed } from "react-icons/hi2";
import { HiUserGroup } from "react-icons/hi2";
import { HiScale } from "react-icons/hi2";
import { HiEye } from "react-icons/hi2";
import { HiCog6Tooth } from "react-icons/hi2";

export default function LoginSelect() {
  const navigate = useNavigate();

  const roles = [
    {
      title: "Team",
      icon: HiUserGroup,
      desc: "Collaborate with your team, submit ideas & view hackathon updates in real-time.",
      link: "/login/student",
    },
    {
      title: "Judge",
      icon: HiScale,
      desc: "Evaluate submissions with your dedicated panel.",
      link: "/login/judge",
    },
    {
      title: "Visitor",
      icon: HiEye,
      desc: "Explore projects, teams, tracks & event moments.",
      link: "/login/visitor",
    },
    {
      title: "Organizing Team",
      icon: HiCog6Tooth,
      desc: "Manage teams, sessions, scoring & event controls.",
      link: "/login/team",
    },
  ];

  return (
    <div className="role-wrapper">

      <div className="role-header">
        <h1>
          <HiLockClosed className="header-icon" />
          Select Login Role
        </h1>
        <p>Your experience will be personalized based on your role.</p>
        <p style={{ marginTop: '10px' }}>
          Don't have an account? <Link to="/signup" style={{ color: '#5227FF', textDecoration: 'underline' }}>Sign Up</Link>
        </p>
      </div>

      <div className="role-grid">
        {roles.map((role, index) => {
          const IconComponent = role.icon;
          return (
            <div 
              key={index}
              className="role-card"
              onClick={() => navigate(role.link)}
            >
              <div className="icon-wrap">
                <IconComponent className="role-icon" />
              </div>
              <h3>{role.title}</h3>
              <p>{role.desc}</p>
            </div>
          );
        })}
      </div>

    </div>
  );
}

