import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { useStudyData } from '../contexts/StudyDataContext'
import { buildStudyContext, sendChatMessage } from '../lib/gemini'

export default function ChatPage() {
  const { settings, sessions } = useStudyData()
  const apiKey = settings?.geminiApiKey
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'こんにちは！勉強の質問や問題演習、記録を踏まえたアドバイスなど、何でも聞いてください。' },
  ])
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend() {
    const text = input.trim()
    if (!text || isSending) return
    setError('')
    const nextMessages = [...messages, { role: 'user', text }]
    setMessages(nextMessages)
    setInput('')
    setIsSending(true)
    try {
      const context = buildStudyContext(sessions)
      const reply = await sendChatMessage(apiKey, nextMessages, context)
      setMessages((prev) => [...prev, { role: 'assistant', text: reply }])
    } catch (e) {
      setError(e.message || '送信に失敗しました')
    } finally {
      setIsSending(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!apiKey) {
    return (
      <div>
        <PageHeader eyebrow="AI Chat" title="AIチャット" description="Gemini APIキーが必要です。" />
        <div className="px-8 py-10">
          <div className="card p-8 max-w-md mx-auto text-center">
            <p className="text-sm text-mist-300 mb-4">
              チャット機能を使うには、設定画面で Gemini APIキーを登録してください。
            </p>
            <Link to="/settings" className="btn-primary inline-flex">
              設定画面へ移動
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      <PageHeader
        eyebrow="AI Chat"
        title="AIチャット"
        description="あなたの勉強記録を踏まえて、Geminiが質問や相談に答えます。"
      />

      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4">
        {messages.map((m, i) => (
          <ChatBubble key={i} role={m.role} text={m.text} />
        ))}
        {isSending && <ChatBubble role="assistant" text="…" typing />}
        {error && (
          <div className="text-xs text-danger bg-danger/10 border border-danger/30 rounded-lg px-4 py-2.5 max-w-md">
            {error}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="px-8 py-5 border-t border-ink-700">
        <div className="flex items-end gap-3 max-w-3xl">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="質問を入力（Enterで送信、Shift+Enterで改行）"
            className="input-field resize-none flex-1"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isSending}
            className="btn-primary shrink-0"
          >
            送信
          </button>
        </div>
      </div>
    </div>
  )
}

function ChatBubble({ role, text, typing }) {
  const isUser = role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-xl px-4 py-3 rounded-xl2 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'bg-signal-500/15 border border-signal-500/30 text-mist-100'
            : 'bg-ink-850 border border-ink-700 text-mist-200'
        } ${typing ? 'animate-pulse' : 'animate-fadeUp'}`}
      >
        {text}
      </div>
    </div>
  )
}
