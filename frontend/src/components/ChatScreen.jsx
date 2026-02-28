import { useState, useRef, useEffect } from 'react'
import MessageBubble from './MessageBubble'
import StatePanel from './StatePanel'

export default function ChatScreen({ goal, messages, sessionState, turnCount, isBusy, onSend }) {
  const [input, setInput] = useState('')
  const bottomRef         = useRef(null)

  // Scroll to bottom whenever messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    const text = input.trim()
    if (!text || isBusy) return
    setInput('')
    onSend(text)
  }

  return (
    <div className="h-screen bg-slate-950 flex flex-col">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="flex-shrink-0 bg-slate-900 border-b border-slate-800 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-xs font-bold text-white select-none">
            T
          </div>
          <span className="font-semibold text-white text-sm">TVASession</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 font-mono text-slate-300">
            claude-haiku-4-5
          </span>
          <span>
            Turn <strong className="text-slate-200 font-mono">{turnCount}</strong>
          </span>
          <span className="hidden sm:block max-w-xs truncate text-slate-500">{goal}</span>
        </div>
      </header>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">

        {/* Chat column */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Message list */}
          <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
            {messages.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <p className="text-slate-600 text-sm">Start the conversation below.</p>
              </div>
            )}
            {messages.map(msg => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input bar */}
          <div className="flex-shrink-0 border-t border-slate-800 bg-slate-900 px-4 py-3">
            <div className="flex gap-2 max-w-3xl mx-auto">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
                }}
                disabled={isBusy}
                placeholder="Message TVASession…"
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5
                           text-sm text-white placeholder-slate-500 focus:outline-none
                           focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors
                           disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                onClick={handleSend}
                disabled={isBusy || !input.trim()}
                className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white
                           px-5 py-2.5 rounded-xl text-sm font-medium transition-colors
                           disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </div>
          </div>

        </div>

        {/* State panel */}
        <StatePanel state={sessionState} turnCount={turnCount} />

      </div>
    </div>
  )
}
