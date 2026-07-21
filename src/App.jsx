import { HashRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { StudyDataProvider } from './contexts/StudyDataContext'
import AppLayout from './components/AppLayout'
import Dashboard from './pages/Dashboard'
import TimerPage from './pages/TimerPage'
import StatsPage from './pages/StatsPage'
import ChatPage from './pages/ChatPage'
import MusicPage from './pages/MusicPage'
import SettingsPage from './pages/SettingsPage'

// HashRouter を使用: GitHub Pages のような静的ホスティングでも
// リロード時に 404 にならないようにするため（サーバー側のルーティング設定が不要）。
export default function App() {
  return (
    <AuthProvider>
      <StudyDataProvider>
        <HashRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/timer" element={<TimerPage />} />
              <Route path="/stats" element={<StatsPage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/music" element={<MusicPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </HashRouter>
      </StudyDataProvider>
    </AuthProvider>
  )
}
