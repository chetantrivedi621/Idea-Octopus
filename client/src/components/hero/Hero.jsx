// src/components/hero/Hero.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import './hero.css'

export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden">
      {/* Full-bleed background that covers entire viewport width */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-50 via-white to-rose-50"
        style={{ minHeight: '420px' }}
      />

      {/* Decorative blobs (light, positioned so they don't create dark edges) */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -bottom-8 w-96 h-96 rounded-full opacity-30 blur-3xl"
        style={{ background: 'radial-gradient(circle at 30% 30%, rgba(99,102,241,0.18), rgba(139,92,246,0.06) 30%, transparent 60%)' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-[-10%] top-[-6%] w-72 h-72 rounded-full opacity-20 blur-2xl"
        style={{ background: 'radial-gradient(circle at 70% 60%, rgba(236,72,153,0.06), rgba(99,102,241,0.04) 30%, transparent 60%)' }}
      />

      {/* Centered inner container (keeps text readable) */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight">
              Show your ideas. <span className="text-indigo-600">Get noticed</span>. Make impact.
            </h1>

            <p className="mt-4 text-lg text-slate-600 max-w-xl">
              Idea Octopus turns chaotic hackathon ideation into a live, social idea wall — with instant judging via QR and simple analytics.
            </p>

            <div className="mt-8 flex gap-3">
              <Link to="/add" className="inline-flex items-center px-5 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-500 text-white shadow-lg transform hover:scale-[1.02] transition">
                Post an idea
              </Link>
              <Link to="/judge" className="inline-flex items-center px-4 py-3 rounded-full border border-slate-200 text-slate-800 hover:bg-slate-50 transition">
                I'm a judge
              </Link>
            </div>

            <div className="mt-6 text-sm text-slate-500">
              <span className="font-medium text-slate-700">Hackathon-ready:</span> live reactions, judge QR flow, quick deploy.
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end">
            {/* visual mock: sticky note stack placed inside the centered column */}
            <div className="w-[320px] sm:w-[420px]">
              <div className="bg-yellow-100 rounded-lg p-4 shadow-lg transform -rotate-3 translate-x-6">
                <div className="text-xs text-slate-600">Team Nebula</div>
                <div className="font-semibold mt-1">Sustainable Packaging</div>
                <div className="text-xs mt-2 text-slate-700">Auto-sorted composting for dorms.</div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-md -translate-x-6 mt-4">
                <div className="text-xs text-slate-600">Team Bolt</div>
                <div className="font-semibold mt-1">Campus Buddy</div>
                <div className="text-xs mt-2 text-slate-700">Map labs, mentors & events quickly.</div>
              </div>

              <div className="bg-indigo-50 rounded-lg p-4 shadow mt-4">
                <div className="text-xs text-slate-600">🔥 Trending</div>
                <div className="font-semibold mt-1 text-indigo-700">Smart Dustbin</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
