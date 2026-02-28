import { useState, useCallback } from 'react'
import SetupScreen from './components/SetupScreen'
import ChatScreen from './components/ChatScreen'

export default function App() {
  const [sessionId, setSessionId]       = useState(null)
  const [goal, setGoal]                 = useState('')
  const [messages, setMessages]         = useState([])
  const [sessionState, setSessionState] = useState(null)
  const [turnCount, setTurnCount]       = useState(0)
  const [isBusy, setIsBusy]             = useState(false)

  // ── Start session ──────────────────────────────────────────────────────────
  const startSession = useCallback(async ({ apiKey, goal: g, systemPrompt }) => {
    const res  = await fetch('/api/start', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ api_key: apiKey, goal: g, system_prompt: systemPrompt }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Failed to start session.')

    setSessionId(data.session_id)
    setGoal(g)
    setSessionState(data.state)
  }, [])

  // ── Send message + stream response ────────────────────────────────────────
  const sendMessage = useCallback(async (text) => {
    if (isBusy || !sessionId) return
    setIsBusy(true)

    const userId      = crypto.randomUUID()
    const assistantId = crypto.randomUUID()

    setMessages(prev => [
      ...prev,
      { id: userId,      role: 'user',      content: text },
      { id: assistantId, role: 'assistant', content: '', streaming: true, meta: null },
    ])

    try {
      const res    = await fetch('/api/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ session_id: sessionId, message: text }),
      })
      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      let   buffer  = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const parts = buffer.split('\n\n')
        buffer = parts.pop()

        for (const part of parts) {
          for (const line of part.split('\n')) {
            if (!line.startsWith('data: ')) continue
            let evt
            try { evt = JSON.parse(line.slice(6)) } catch { continue }

            if (evt.type === 'token') {
              setMessages(prev => prev.map(m =>
                m.id === assistantId ? { ...m, content: m.content + evt.text } : m
              ))
            } else if (evt.type === 'done') {
              setMessages(prev => prev.map(m =>
                m.id === assistantId
                  ? {
                      ...m,
                      // If correction ran, swap streamed text with the corrected version
                      content:   evt.meta.corrected ? evt.reply : m.content,
                      streaming: false,
                      meta:      evt.meta,
                    }
                  : m
              ))
              setSessionState(evt.state)
              setTurnCount(evt.meta.turn_count)
            } else if (evt.type === 'error') {
              setMessages(prev => prev.map(m =>
                m.id === assistantId
                  ? { ...m, content: 'Error: ' + evt.error, streaming: false, error: true }
                  : m
              ))
            }
          }
        }
      }
    } catch (err) {
      setMessages(prev => prev.map(m =>
        m.id === assistantId
          ? { ...m, content: 'Error: ' + err.message, streaming: false, error: true }
          : m
      ))
    } finally {
      setIsBusy(false)
    }
  }, [isBusy, sessionId])

  // ── Render ─────────────────────────────────────────────────────────────────
  if (!sessionId) {
    return <SetupScreen onStart={startSession} />
  }

  return (
    <ChatScreen
      goal={goal}
      messages={messages}
      sessionState={sessionState}
      turnCount={turnCount}
      isBusy={isBusy}
      onSend={sendMessage}
    />
  )
}
