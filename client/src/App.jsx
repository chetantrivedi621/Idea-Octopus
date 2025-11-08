import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";


import "./index.css";

// ✅ Common Components
import Header from "./components/Header";

// ✅ Pages
import LandingPage from "./pages/LandingPage";
import SignUp from "./pages/signup";

// ✅ Login Role Selection Page
import LoginSelect from "./pages/LoginSelect";

// ✅ Different Login UIs
import StudentLogin from "./pages/studentLogin";
import VisitorLogin from "./pages/visitorLogin";
import JudgeLogin from "./pages/judgeLogin";
import TeamLogin from "./pages/teamLogin";

export default function App() {
  const location = useLocation();

  // ✅ Hide header on signup or login pages
  const hideHeader =
    location.pathname.includes("/signup") ||
    location.pathname.includes("/login");

  return (
    <div className="min-h-screen w-full flex flex-col">

      {/* ✅ Conditionally hide header */}
      {!hideHeader && <Header />}

      <main className="flex-1">
        <Routes>

          {/* ✅ Homepage */}
          <Route path="/" element={<LandingPage />} />

          {/* ✅ Signup Page */}
          <Route path="/signup" element={<SignUp />} />

          {/* ✅ Login Role Selection */}
          <Route path="/login" element={<LoginSelect />} />

          {/* ✅ Different Login Pages */}
          <Route path="/login/student" element={<StudentLogin />} />
          <Route path="/login/visitor" element={<VisitorLogin />} />
          <Route path="/login/judge" element={<JudgeLogin />} />
          <Route path="/login/team" element={<TeamLogin />} />
          

          {/* ✅ 404 Page */}
          <Route
            path="*"
            element={
              <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <h1 className="text-3xl font-bold text-slate-800 mb-2">
                  404 — Page Not Found
                </h1>
                <p className="text-slate-600 mb-4">
                  The page you're looking for doesn’t exist.
                </p>
                <a
                  href="/"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700 transition"
                >
                  Go Home
                </a>
              </div>
            }
          />

        </Routes>
      </main>
    </div>
  );
}
