// src/components/trending/TrendingIdeas.jsx
import React, { useEffect, useState } from 'react'
import { getTopIdeas } from '../../api/api' // uses your api wrapper
import { Link } from 'react-router-dom'

export default function TrendingIdeas() {
  const [ideas, setIdeas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      try {
        const data = await getTopIdeas()
        if (mounted) setIdeas(data || [])
      } catch (e) {
        console.error('Failed to load trending ideas', e)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    // optional: refresh every 6s to show live changes
    const id = setInterval(load, 6000)
    return () => { mounted = false; clearInterval(id) }
  }, [])

  return (
    <section className="mt-12">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Trending ideas</h3>
        <Link to="/ideas" className="text-sm text-indigo-600 hover:underline">View all</Link>
      </div>

      <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading && <div className="col-span-full text-sm text-slate-500">Loading trending ideas…</div>}

        {!loading && ideas.length === 0 && (
          <div className="col-span-full text-sm text-slate-500">No ideas yet — be the first to post!</div>
        )}

        {ideas.map(i => (
          <article key={i._id} className="bg-white p-4 rounded-lg shadow hover:shadow-md transition">
            <div className="text-xs text-slate-500">{i.teamName}</div>
            <div className="font-semibold mt-1">{i.title}</div>
            <div className="text-sm mt-2 text-slate-600">{i.description?.slice(0,100) || 'Short summary...'}</div>

            <div className="flex items-center gap-3 mt-3">
              <div className="text-sm">🔥 {i.emojiCounts?.fire || 0}</div>
              <div className="text-sm">❤️ {i.emojiCounts?.heart || 0}</div>
              <div className="ml-auto text-xs text-slate-400">{new Date(i.createdAt).toLocaleDateString()}</div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
