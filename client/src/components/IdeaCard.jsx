import React, { useState } from 'react'
import { reactIdea } from '../api/api' // your api wrapper

/**
 * Props:
 *  - idea: { _id, teamName, title, description, emojiCounts }
 *  - onReact: optional callback to refresh parent list after a server update
 */
export default function IdeaCard({ idea, onReact }) {
  // local optimistic counts (start from server counts)
  const [counts, setCounts] = useState({
    fire: idea.emojiCounts?.fire || 0,
    heart: idea.emojiCounts?.heart || 0,
    star: idea.emojiCounts?.star || 0
  })
  const [loading, setLoading] = useState(false)   // disables buttons while request in flight
  const [lastClicked, setLastClicked] = useState(null) // simple anti-spam

  // small throttle to avoid spamming (ms)
  const SPAM_COOLDOWN = 800

  const handleReact = async (emoji) => {
    // anti-spam quick check
    const now = Date.now()
    if (lastClicked && now - lastClicked < SPAM_COOLDOWN) return
    setLastClicked(now)

    // optimistic update: increment UI immediately
    setCounts(prev => ({ ...prev, [emoji]: (prev[emoji] || 0) + 1 }))
    setLoading(true)

    try {
      // call API; reactIdea returns server response or throws on error
      await reactIdea(idea._id, emoji)

      // optionally let parent refresh (keeps canonical server view)
      if (typeof onReact === 'function') onReact()
    } catch (err) {
      // rollback optimistic change on error
      setCounts(prev => ({ ...prev, [emoji]: Math.max((prev[emoji] || 1) - 1, 0) }))
      console.error('React failed', err)
      alert(err?.message || 'Could not register reaction — try again')
    } finally {
      // brief delay for nicer UX before re-enable
      setTimeout(() => setLoading(false), 300)
    }
  }

  return (
    <article className="bg-yellow-100 p-4 rounded-lg shadow-md">
      <header className="flex items-baseline justify-between">
        <div className="text-xs text-slate-600">{idea.teamName}</div>
        <div className="text-xs text-slate-500">{new Date(idea.createdAt).toLocaleString()}</div>
      </header>

      <h3 className="font-semibold text-lg mt-2">{idea.title}</h3>
      <p className="text-sm mt-2 text-slate-700">{idea.description}</p>

      <div className="flex gap-3 mt-4 items-center">
        <button
          aria-label={`React fire to ${idea.title}`}
          onClick={() => handleReact('fire')}
          disabled={loading}
          className="px-3 py-1 rounded-md transform hover:scale-105 transition"
        >
          <span className="mr-2">🔥</span>
          <span>{counts.fire}</span>
        </button>

        <button
          aria-label={`React heart to ${idea.title}`}
          onClick={() => handleReact('heart')}
          disabled={loading}
          className="px-3 py-1 rounded-md transform hover:scale-105 transition"
        >
          <span className="mr-2">❤️</span>
          <span>{counts.heart}</span>
        </button>

        <button
          aria-label={`React star to ${idea.title}`}
          onClick={() => handleReact('star')}
          disabled={loading}
          className="px-3 py-1 rounded-md transform hover:scale-105 transition"
        >
          <span className="mr-2">⭐</span>
          <span>{counts.star}</span>
        </button>

        {/* optional quick CTA */}
        <div className="ml-auto text-sm text-slate-500">Votes</div>
      </div>
    </article>
  )
}
