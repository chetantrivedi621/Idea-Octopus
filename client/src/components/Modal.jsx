import React, { useEffect } from 'react'

/**
 * Simple Modal component
 * Props:
 *  - isOpen: boolean
 *  - onClose: function
 *  - title: string (optional)
 *  - children: ReactNode
 */
export default function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', onKey)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden
      />

      {/* modal panel */}
      <div className="relative bg-white rounded-lg shadow-lg max-w-lg w-full mx-4 p-4 z-10">
        <div className="flex items-start justify-between">
          {title ? <h3 className="text-lg font-semibold">{title}</h3> : <div />}
          <button onClick={onClose} aria-label="Close" className="text-slate-500 hover:text-slate-700">
            ✕
          </button>
        </div>

        <div className="mt-3">{children}</div>
      </div>
    </div>
  )
}
