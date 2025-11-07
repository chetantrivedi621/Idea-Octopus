// src/components/hackathon/HackathonSection.jsx
import React from 'react'
import { Link } from 'react-router-dom'

export default function HackathonSection() {
  return (
    <section className="mt-12 bg-gradient-to-br from-indigo-50 to-white rounded-xl p-6 shadow-sm">
      <div className="grid lg:grid-cols-2 gap-6 items-center">
        <div>
          <h3 className="text-2xl font-bold">Built for hackathons</h3>
          <p className="mt-3 text-slate-600">
            From submission to scoring — run a smoother event. Judges scan QR codes, score instantly, and results update live. Minimal setup, maximum impact.
          </p>

          <ul className="mt-4 grid grid-cols-2 gap-2 text-sm text-slate-600">
            <li>• Rapid judging flow</li>
            <li>• Public idea wall</li>
            <li>• Simple upload & privacy controls</li>
            <li>• Lightweight deploy (Vercel + Render)</li>
          </ul>

          <div className="mt-4">
            <Link to="/upload" className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md">Host your event</Link>
            <Link to="/add" className="ml-3 inline-flex items-center px-4 py-2 border rounded-md">Start posting</Link>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow flex items-center justify-center">
          {/* small mockup of judge QR + score */}
          <div className="w-64 h-40 flex flex-col items-center justify-center">
            <div className="bg-slate-100 p-2 rounded-md mb-2">
              <div className="text-xs text-slate-600">QR to judge</div>
              <div className="w-24 h-24 bg-black/90 rounded-sm mt-2" />
            </div>
            <div className="text-sm text-slate-500">Judge opens link → score → next</div>
          </div>
        </div>
      </div>
    </section>
  )
}
