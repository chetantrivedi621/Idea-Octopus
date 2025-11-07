// src/App.jsx
import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

// global styles (use index.css if that's your Tailwind file)
import './index.css' // <-- swap to index.css if App.css doesn't exist

// Components & Pages (ensure exact filenames/casing)
import Header from './components/Header'
import LandingPage from './pages/landingPage'    // exact casing
import IdeaCard from './components/IdeaCard' // optional single-card import

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen w-full flex flex-col bg-gradient-to-b from-white via-slate-50 to-slate-100">
        {/* Global header */}
        <Header />

        {/* Routing */}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />

            {/* Idea Wall & core */}
            <Route path="/ideas" element={<LandingPage />} />
            <Route path="/add" element={<LandingPage />} />
            <Route path="/upload" element={<LandingPage />} />

            {/* Judge panel */}
            <Route path="/judge/:teamName" element={<LandingPage />} />

            {/* 404 */}
            <Route
              path="*"
              element={
                <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                  <h1 className="text-3xl font-bold text-slate-800 mb-2">404 — Page Not Found</h1>
                  <p className="text-slate-600 mb-4">Oops! The page you’re looking for doesn’t exist.</p>
                  <a href="/" className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700 transition">Go Home</a>
                </div>
              }
            />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="py-4 text-center text-sm text-slate-500">
          Made with 💜 during Hackathon 2025 — Idea Octopus
        </footer>
      </div>
    </BrowserRouter>
  )
}
