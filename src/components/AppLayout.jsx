import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useStudyData } from '../contexts/StudyDataContext'

const NAV_ITEMS = [
  { to: '/', label: 'ダッシュボード', icon: DashboardIcon, end: true },
  { to: '/timer', label: '勉強タイマー', icon: TimerIcon },
  { to: '/stats', label: '統計', icon: StatsIcon },
  { to: '/chat', label: 'AIチャット', icon: ChatIcon },
  { to: '/music', label: '作業用BGM', icon: MusicIcon },
  { to: '/settings', label: '設定', icon: SettingsIcon },
]

export default function AppLayout() {
  const { user, signInWithGoogle, signOut, isFirebaseConfigured } = useAuth()
  const { isCloudSynced } = useStudyData()

  return (
    <div className="min-h-screen flex text-mist-100">
      <aside className="w-[240px] shrink-0 border-r border-ink-700 bg-ink-900/60 flex flex-col">
        <div className="px-5 py-6 flex items-center gap-2.5">
          <LogoMark />
          <div>
            <div className="font-display font-bold text-[15px] leading-none">StudyForge</div>
            <div className="text-[11px] text-mist-400 font-mono mt-1">v1.0</div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-signal-500/10 text-signal-300 border border-signal-500/30'
                    : 'text-mist-300 border border-transparent hover:bg-ink-800 hover:text-mist-100'
                }`
              }
            >
              <item.icon className="w-[18px] h-[18px] shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-ink-700">
          <div className="flex items-center gap-2 px-2 mb-3">
            <span
              className={`w-1.5 h-1.5 rounded-full ${isCloudSynced ? 'bg-signal-400' : 'bg-mist-500'}`}
            />
            <span className="text-[11px] font-mono text-mist-400">
              {isCloudSynced ? 'クラウド同期中' : 'ローカル保存のみ'}
            </span>
          </div>

          {isFirebaseConfigured && user ? (
            <div className="flex items-center gap-2.5 px-2">
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-ink-700 flex items-center justify-center text-xs font-bold">
                  {user.displayName?.[0] ?? 'U'}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium truncate">{user.displayName ?? 'ユーザー'}</div>
                <button onClick={signOut} className="text-[11px] text-mist-400 hover:text-signal-300">
                  ログアウト
                </button>
              </div>
            </div>
          ) : (
            <button onClick={signInWithGoogle} className="btn-secondary w-full text-xs">
              <GoogleIcon className="w-4 h-4" />
              Googleでログイン
            </button>
          )}
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  )
}

function LogoMark() {
  return (
    <div className="w-9 h-9 rounded-lg bg-ink-800 border border-signal-500/30 flex items-center justify-center shadow-glow">
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
        <path d="M6 17 L12 6 L18 17" stroke="#14b8cf" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="1.6" fill="#14b8cf" />
      </svg>
    </div>
  )
}

function DashboardIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <rect x="3" y="3" width="7" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}
function TimerIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx="12" cy="13" r="8" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 9v4l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M10 2h4M12 2v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
function StatsIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M4 20V10M12 20V4M20 20v-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}
function ChatIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4H6.5A2.5 2.5 0 0 1 4 13.5v-8Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}
function MusicIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M9 18V6l11-2v12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="6.5" cy="18" r="2.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17.5" cy="16" r="2.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}
function SettingsIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M19.4 13.5a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.04 1.56V19.5a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.04-1.56 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.5 13.5a1.7 1.7 0 0 0-1.56-1.04H2.85a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.5 7.42a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 8.86 3.06 1.7 1.7 0 0 0 9.9 1.5H10a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1.04 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.5 8.86c.13.62.6 1.13 1.56 1.04H21.15a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.56 1.04Z"
        stroke="currentColor"
        strokeWidth="1.3"
      />
    </svg>
  )
}
function GoogleIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.9 1.5l2.6-2.5C16.9 3.2 14.7 2.2 12 2.2 6.9 2.2 2.7 6.4 2.7 11.5S6.9 20.8 12 20.8c6.9 0 8.9-4.9 8.9-8.5 0-.6-.1-1-.1-1.4H12Z"
      />
    </svg>
  )
}
