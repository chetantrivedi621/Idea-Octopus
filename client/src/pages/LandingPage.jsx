// src/pages/LandingPage.jsx
import React from 'react'
import Hero from '../components/hero/Hero'
import Features from '../components/features/Features'
import Trending_Ideas from '../components/trending/Trending_Ideas'
import HackathonSection from '../components/hackathon/HackathonSection'
import CTA_Section from '../components/cta/CTA_Section'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <Hero />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <Features />
        <Trending_Ideas />
        <HackathonSection />
        <CTA_Section />
      </main>
    </div>
  )
}
