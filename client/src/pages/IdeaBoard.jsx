import React, { useState } from 'react'
import EmojiButton from './EmojiButton'
import Modal from './Modal'
import { reactIdea } from '../api/api'

/**
 * IdeaCard component
 * Props:
 *  - idea: { _id, teamName, title, description, emojiCounts, createdAt }
 *  - onReact: optional callback to refresh parent list
 */
export default function IdeaCard({ idea, onReact }) {
  const [counts, setCounts] = useState({
    fire: idea.emojiCounts?.fire || 0,
    heart: idea.emojiCounts?.heart || 0,
    star: idea.emojiCounts?.star || 0
  })
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [lastClicked, setLastClicked] = useState(null)
  const SPAM_COOLDOWN = 800

  const handleReact = async (emoji) => {
    const now = Date.now()
    if (lastClicked && now - lastClicked < SPAM_COOLDOWN) return
    setLastClicked(now)
    setCounts(prev => ({ ...prev, [emoji]: (prev[emoji] || 0) + 1 }))
    setLoading(true)

    try {
      await reactIdea(idea._id, emoji)
      if (onReact) onReact()
    } catch (err) {
      setCounts(prev => ({ ...prev, [emoji]: Math.max((prev[emoji] || 1) - 1, 0) }))
      setErrorMsg(err?.message || 'Failed to react')
      setModalOpen(true)
    } finally {
      setTimeout(() => setLoading(false), 300)
    }
  }

  return (
    <article className={`bg-yellow-100 p-4 rounded-lg shadow transition ${loading ? 'opacity-70' : ''}`}>
      <header className="flex items-baseline justify-between">
        <div className="text-xs text-slate-600">{idea.teamName}</div>
        <div className="text-xs text-slate-500">{new Date(idea.createdAt).toLocaleString()}</div>
      </header>

      <h3 className="font-semibold text-lg mt-2">{idea.title}</h3>
      <p className="text-sm mt-2 text-slate-700">{idea.description}</p>

      <div className="flex gap-3 mt-4 items-center">
        <EmojiButton emoji="🔥" count={counts.fire} onClick={() => handleReact('fire')} disabled={loading} />
        <EmojiButton emoji="❤️" count={counts.heart} onClick={() => handleReact('heart')} disabled={loading} />
        <EmojiButton emoji="⭐" count={counts.star} onClick={() => handleReact('star')} disabled={loading} />
      </div>

      {/* error modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Error">
        <p className="text-sm text-red-600">{errorMsg}</p>
        <div className="mt-3 text-right">
          <button onClick={() => setModalOpen(false)} className="px-3 py-1 bg-indigo-600 text-white rounded-md">OK</button>
        </div>
      </Modal>
    </article>
  )
}
