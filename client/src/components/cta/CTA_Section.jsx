// src/components/cta/JoinCTA.jsx
import React from 'react'
import { Link } from 'react-router-dom'

export default function JoinCTA() {
  return (
    <section className="mt-12 py-8 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl text-white">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-2xl font-bold">Your idea deserves the spotlight</h4>
          <p className="mt-1 text-indigo-100">Join a community of creators and make your hackathon idea count.</p>
        </div>

        <div className="flex gap-3">
          <Link to="/ideas" className="px-4 py-2 bg-white text-indigo-700 rounded-full font-medium">View Ideas</Link>
          <Link to="/dashboard" className="px-4 py-2 border border-white/30 rounded-full">Go to Dashboard</Link>
        </div>
      </div>
    </section>
  )
}
