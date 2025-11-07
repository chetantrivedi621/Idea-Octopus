// src/components/features/Features.jsx
import React from 'react'

const features = [
  { title: 'Idea Wall', text: 'Post ideas, react, and discover trends in real time.' },
  { title: 'Judge Flow', text: 'QR-powered judging — instant access to submissions.' },
  { title: 'AI Summaries', text: 'Auto-generated one-line summaries (stubbed for demo).' },
  { title: 'Memory Capsules', text: 'Feature and archive the best ideas.' }
]

export default function Features() {
  return (
    <section className="mt-12">
      <h2 className="text-xl font-semibold text-slate-800 mb-4">What we provide</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map(f => (
          <div key={f.title} className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold mb-3">
              {f.title.split(' ').map(s => s[0]).slice(0,2).join('')}
            </div>
            <div className="font-medium text-slate-800">{f.title}</div>
            <div className="text-sm text-slate-500 mt-1">{f.text}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
