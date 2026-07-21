import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import { useStudyTimer } from '../hooks/useStudyTimer'
import { useStudyData } from '../contexts/StudyDataContext'

const SUBJECT_PRESETS = ['数学', '英語', '国語', '理科', '社会', 'プログラミング', 'その他']

export default function TimerPage() {
  const timer = useStudyTimer()
  const { addSession } = useStudyData()
  const [subject, setSubject] = useState(SUBJECT_PRESETS[0])
  const [customSubject, setCustomSubject] = useState('')
  const [note, setNote] = useState('')
  const [saveState, setSaveState] = useState('idle') // idle | saving | saved

  const effectiveSubject = subject === 'その他' ? customSubject.trim() || 'その他' : subject

  async function handleSave() {
    if (timer.minutes < 0.1) return
    setSaveState('saving')
    try {
      await addSession({
        subject: effectiveSubject,
        minutes: timer.minutes,
        date: new Date().toISOString().slice(0, 10),
        note,
      })
      timer.pause()
      timer.reset()
      setNote('')
      setSaveState('saved')
      setTimeout(() => setSaveState('idle'), 1800)
    } catch (e) {
      console.error(e)
      setSaveState('idle')
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Study Timer"
        title="勉強タイマー"
        description="開始・一時停止しても経過時間はズレません。記録は科目ごとに保存されます。"
      />

      <div className="px-8 py-8 grid grid-cols-5 gap-6">
        <div className="col-span-3 card p-10 flex flex-col items-center">
          <div className="relative flex items-center justify-center mb-8">
            {timer.isRunning && (
              <span className="absolute w-52 h-52 rounded-full border border-signal-500/40 animate-pulseRing" />
            )}
            <div className="w-52 h-52 rounded-full border-2 border-ink-700 flex items-center justify-center bg-ink-900/60">
              <span className="font-mono text-4xl tabular-nums text-signal-300 font-bold">
                {formatClock(timer.elapsedMs)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!timer.isRunning ? (
              <button onClick={timer.start} className="btn-primary px-6">
                <PlayIcon className="w-4 h-4" />
                {timer.elapsedMs === 0 ? '開始' : '再開'}
              </button>
            ) : (
              <button onClick={timer.pause} className="btn-secondary px-6">
                <PauseIcon className="w-4 h-4" />
                一時停止
              </button>
            )}
            <button
              onClick={timer.reset}
              disabled={timer.elapsedMs === 0}
              className="btn-ghost"
            >
              リセット
            </button>
          </div>
        </div>

        <div className="col-span-2 card p-6 flex flex-col gap-5">
          <div>
            <label className="label-eyebrow block mb-2">科目</label>
            <div className="grid grid-cols-2 gap-2">
              {SUBJECT_PRESETS.map((s) => (
                <button
                  key={s}
                  onClick={() => setSubject(s)}
                  className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                    subject === s
                      ? 'bg-signal-500/10 border-signal-500/50 text-signal-300'
                      : 'border-ink-600 text-mist-300 hover:border-ink-500'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            {subject === 'その他' && (
              <input
                type="text"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                placeholder="科目名を入力"
                className="input-field mt-2.5"
              />
            )}
          </div>

          <div>
            <label className="label-eyebrow block mb-2">メモ（任意）</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="今日やった内容など"
              className="input-field resize-none"
            />
          </div>

          <div className="mt-auto pt-2">
            <button
              onClick={handleSave}
              disabled={timer.minutes < 0.1 || saveState === 'saving'}
              className="btn-primary w-full"
            >
              {saveState === 'saved' ? '記録しました ✓' : saveState === 'saving' ? '保存中...' : '記録として保存'}
            </button>
            <p className="text-[11px] text-mist-400 mt-2 text-center">
              保存すると経過時間はリセットされます
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function formatClock(ms) {
  const totalSeconds = Math.floor(ms / 1000)
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  const pad = (n) => String(n).padStart(2, '0')
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}

function PlayIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M6 4.5v15l13-7.5-13-7.5Z" fill="currentColor" />
    </svg>
  )
}
function PauseIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" />
      <rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" />
    </svg>
  )
}
