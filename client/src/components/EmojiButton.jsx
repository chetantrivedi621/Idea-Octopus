import React from 'react'

/**
 * EmojiButton
 * Props:
 *  - emoji: string (e.g. '🔥')
 *  - count: number
 *  - onClick: function
 *  - ariaLabel: string
 *  - disabled: boolean
 *  - className: string
 */
export default function EmojiButton({ emoji = '🔥', count = 0, onClick, ariaLabel, disabled = false, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel || `React with ${emoji}`}
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-md transition transform hover:scale-105 disabled:opacity-60 ${className}`}
    >
      <span className="text-lg leading-none">{emoji}</span>
      <span className="text-sm font-medium">{count}</span>
    </button>
  )
}
