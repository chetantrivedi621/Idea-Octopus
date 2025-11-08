import React from "react";
import "../styles/loginSelect.css";
import { useNavigate } from "react-router-dom";

export default function LoginSelect() {
  const navigate = useNavigate();

const roles = [
  {
    title: "Student",
    icon: "/images/student.png",
    desc: "Submit ideas, check status & view hackathon updates.",
    link: "/login/student",
  },
  {
    title: "Judge",
    icon: "/images/judge.png",
    desc: "Evaluate submissions with your dedicated panel.",
    link: "/login/judge",
  },
  {
    title: "Visitor",
    icon: "/images/visitor.png",
    desc: "Explore projects, teams, tracks & event moments.",
    link: "/login/visitor",
  },
  {
    title: "Organizing Team",
    icon: "/images/team.png",
    desc: "Manage teams, sessions, scoring & event controls.",
    link: "/login/team",
  },
];

  return (
    <div className="role-wrapper">

      <div className="role-header">
        <h1>🔐 Select Login Role</h1>
        <p>Your experience will be personalized based on your role.</p>
      </div>

      <div className="role-grid">
        {roles.map((role, index) => (
          <div 
            key={index}
            className="role-card"
            onClick={() => navigate(role.link)}
          >
            <div className="icon-wrap">
              <img src={role.icon} alt={role.title} />
            </div>
            <h3>{role.title}</h3>
            <p>{role.desc}</p>
          </div>
        ))}
      </div>

    </div>
  );
}
