import React, { useEffect, useState } from 'react'
import { getIdeas } from '../api/api'
import IdeaCard from '../components/IdeaCard'
import { Link } from 'react-router-dom'

export default function IdeaBoard() {
  const [ideas, setIdeas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sortBy, setSortBy] = useState('popular')

  useEffect(() => {
    let mounted = true
    const loadIdeas = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await getIdeas({ sort: sortBy })
        if (mounted) setIdeas(data || [])
      } catch (err) {
        if (mounted) {
          setError(err?.message || 'Failed to load ideas')
          console.error('Failed to load ideas', err)
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }
    loadIdeas()
    // Refresh every 10 seconds to show live updates
    const interval = setInterval(loadIdeas, 10000)
    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [sortBy])

  const handleReact = () => {
    // Refresh ideas after a reaction
    const loadIdeas = async () => {
      try {
        const data = await getIdeas({ sort: sortBy })
        setIdeas(data || [])
      } catch (err) {
        console.error('Failed to refresh ideas', err)
      }
    }
    loadIdeas()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Idea Board</h1>
            <p className="text-gray-600 mt-1">Share and explore innovative ideas</p>
          </div>
          <Link
            to="/"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
          >
            Back to Home
          </Link>
        </div>

        <div className="mb-6 flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="popular">Most Popular</option>
            <option value="new">Newest First</option>
          </select>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="text-gray-500">Loading ideas...</div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {!loading && !error && ideas.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No ideas yet — be the first to post!</p>
            <Link
              to="/"
              className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
            >
              Go to Home
            </Link>
          </div>
        )}

        {!loading && !error && ideas.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {ideas.map((idea) => (
              <IdeaCard key={idea._id} idea={idea} onReact={handleReact} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
