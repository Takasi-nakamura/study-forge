import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import PageHeader from '../components/PageHeader'
import { useStudyData } from '../contexts/StudyDataContext'
import { useAuth } from '../contexts/AuthContext'

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export default function Dashboard() {
  const { sessions, loading } = useStudyData()
  const { user } = useAuth()

  const stats = useMemo(() => {
    const today = todayStr()
    const todayMinutes = sessions
      .filter((s) => s.date === today)
      .reduce((sum, s) => sum + s.minutes, 0)

    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const weekMinutes = sessions
      .filter((s) => new Date(s.date) >= weekAgo)
      .reduce((sum, s) => sum + s.minutes, 0)

    const totalMinutes = sessions.reduce((sum, s) => sum + s.minutes, 0)

    const subjectSet = new Set(sessions.map((s) => s.subject))

    // 連続学習日数（簡易版）
    const dateSet = new Set(sessions.map((s) => s.date))
    let streak = 0
    const cursor = new Date()
    while (dateSet.has(cursor.toISOString().slice(0, 10))) {
      streak += 1
      cursor.setDate(cursor.getDate() - 1)
    }

    return { todayMinutes, weekMinutes, totalMinutes, subjectCount: subjectSet.size, streak }
  }, [sessions])

  const recent = sessions.slice(0, 6)

  return (
    <div>
      <PageHeader
        eyebrow="Overview"
        title={`おかえりなさい${user?.displayName ? `、${user.displayName}さん` : ''}`}
        description="今日の勉強を記録して、積み上げを可視化しましょう。"
        action={
          <Link to="/timer" className="btn-primary">
            <PlayIcon className="w-4 h-4" />
            タイマーを開始
          </Link>
        }
      />

      <div className="px-8 py-6">
        <div className="grid grid-cols-4 gap-4 mb-8">
          <StatCard label="今日の勉強時間" value={formatMinutes(stats.todayMinutes)} accent />
          <StatCard label="過去7日間" value={formatMinutes(stats.weekMinutes)} />
          <StatCard label="累計時間" value={formatMinutes(stats.totalMinutes)} />
          <StatCard label="連続学習日数" value={`${stats.streak}日`} />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-sm">直近の記録</h2>
              <Link to="/stats" className="text-xs text-signal-400 hover:text-signal-300">
                すべて見る →
              </Link>
            </div>

            {loading ? (
              <p className="text-sm text-mist-400 py-8 text-center">読み込み中...</p>
            ) : recent.length === 0 ? (
              <EmptyState />
            ) : (
              <ul className="space-y-2">
                {recent.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between px-3.5 py-3 rounded-lg bg-ink-850/60 border border-ink-700/60"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-signal-500" />
                      <div>
                        <div className="text-sm font-medium">{s.subject}</div>
                        <div className="text-[11px] text-mist-400 font-mono">{s.date}</div>
                      </div>
                    </div>
                    <div className="text-sm font-mono text-signal-300">
                      {Math.round(s.minutes)}分
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card p-6 flex flex-col gap-3">
            <h2 className="font-display font-bold text-sm mb-1">クイックアクション</h2>
            <QuickLink to="/timer" label="勉強を記録する" icon={<PlayIcon className="w-4 h-4" />} />
            <QuickLink to="/chat" label="AIに質問する" icon={<ChatDotIcon className="w-4 h-4" />} />
            <QuickLink to="/stats" label="統計を確認する" icon={<ChartDotIcon className="w-4 h-4" />} />
            <QuickLink to="/music" label="BGMを流す" icon={<NoteIcon className="w-4 h-4" />} />
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, accent }) {
  return (
    <div className={`card p-5 ${accent ? 'border-signal-500/40' : ''}`}>
      <p className="text-[11px] font-mono uppercase tracking-wide text-mist-400 mb-2">{label}</p>
      <p className={`text-2xl font-display font-bold ${accent ? 'text-signal-300' : 'text-mist-100'}`}>
        {value}
      </p>
    </div>
  )
}

function QuickLink({ to, label, icon }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-2.5 px-3.5 py-3 rounded-lg bg-ink-850/60 border border-ink-700/60 text-sm text-mist-200 hover:border-signal-500/50 hover:text-signal-300 transition-colors"
    >
      {icon}
      {label}
    </Link>
  )
}

function EmptyState() {
  return (
    <div className="py-10 text-center">
      <p className="text-sm text-mist-400 mb-3">まだ勉強記録がありません。</p>
      <Link to="/timer" className="text-sm text-signal-400 hover:text-signal-300">
        最初の記録をつける →
      </Link>
    </div>
  )
}

function formatMinutes(minutes) {
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  if (h === 0) return `${m}分`
  return `${h}時間${m}分`
}

function PlayIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M6 4.5v15l13-7.5-13-7.5Z" fill="currentColor" />
    </svg>
  )
}
function ChatDotIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4H6.5A2.5 2.5 0 0 1 4 13.5v-8Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}
function ChartDotIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M4 20V10M12 20V4M20 20v-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}
function NoteIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M9 18V6l11-2v12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="6.5" cy="18" r="2.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17.5" cy="16" r="2.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}
