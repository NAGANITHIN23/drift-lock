import { useState } from 'react'

const FEATURES = [
  {
    icon: '🔒',
    title: 'Fact Grounding',
    desc: 'Every reply audited for unsupported claims. Drift triggers an automatic rewrite.',
  },
  {
    icon: '📋',
    title: 'State Tracking',
    desc: 'Facts, constraints, and thread extracted and updated after every turn.',
  },
  {
    icon: '🗜️',
    title: 'Context Compression',
    desc: 'Old history is summarised when it grows too large — not on a fixed schedule.',
  },
  {
    icon: '⚓',
    title: 'Anchor Injection',
    desc: 'The original goal and established facts are prepended to every prompt.',
  },
]

export default function SetupScreen({ onStart }) {
  const [apiKey, setApiKey]           = useState('')
  const [goal, setGoal]               = useState('')
  const [systemPrompt, setSystemPrompt] = useState('')
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')

  const handleStart = async () => {
    if (!apiKey.trim()) { setError('API key is required.');       return }
    if (!goal.trim())   { setError('Session goal is required.'); return }
    setError('')
    setLoading(true)
    try {
      await onStart({ apiKey: apiKey.trim(), goal: goal.trim(), systemPrompt: systemPrompt.trim() })
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  const onEnter = e => { if (e.key === 'Enter') handleStart() }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-lg space-y-6">

        {/* Logo */}
        <div className="flex items-center gap-3 justify-center">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg select-none">
            T
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white leading-none">TVASession</h1>
            <p className="text-sm text-slate-400 mt-0.5">Hallucination-Reduced AI Chat</p>
          </div>
        </div>

        {/* Form card */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8 shadow-2xl">
          <h2 className="text-base font-semibold text-white mb-1">Start a Session</h2>
          <p className="text-sm text-slate-400 mb-6">
            Enter your{' '}
            <a
              href="https://console.anthropic.com/settings/keys"
              target="_blank"
              rel="noreferrer"
              className="text-blue-400 hover:underline"
            >
              Anthropic API key
            </a>{' '}
            and a goal. Your key is held in memory only — never logged or stored.
          </p>

          <div className="space-y-4">
            <Field label="Anthropic API Key">
              <input
                type="password"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                onKeyDown={onEnter}
                placeholder="sk-ant-api03-…"
                className={input}
              />
            </Field>

            <Field label="Session Goal">
              <input
                type="text"
                value={goal}
                onChange={e => setGoal(e.target.value)}
                onKeyDown={onEnter}
                placeholder="e.g. Learn about the water cycle"
                className={input}
              />
            </Field>

            <Field label="Extra Instructions" optional>
              <input
                type="text"
                value={systemPrompt}
                onChange={e => setSystemPrompt(e.target.value)}
                onKeyDown={onEnter}
                placeholder="e.g. Keep answers to 2–3 sentences"
                className={input}
              />
            </Field>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              onClick={handleStart}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700
                         disabled:opacity-40 disabled:cursor-not-allowed
                         text-white font-medium py-2.5 rounded-xl text-sm transition-colors mt-1"
            >
              {loading ? 'Starting…' : 'Start Session'}
            </button>
          </div>
        </div>

        {/* Feature pills */}
        <div className="grid grid-cols-2 gap-3">
          {FEATURES.map(({ icon, title, desc }) => (
            <div key={title} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex gap-3">
              <span className="text-xl flex-shrink-0">{icon}</span>
              <div>
                <div className="text-sm font-medium text-slate-200 mb-0.5">{title}</div>
                <div className="text-xs text-slate-500 leading-relaxed">{desc}</div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}

const input = `
  w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5
  text-sm text-white placeholder-slate-500 focus:outline-none
  focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors
`

function Field({ label, optional, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
        {label}{' '}
        {optional && <span className="text-slate-600 normal-case font-normal">(optional)</span>}
      </label>
      {children}
    </div>
  )
}
