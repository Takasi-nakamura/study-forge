import { useState, useEffect } from 'react'
import PageHeader from '../components/PageHeader'
import { useStudyData } from '../contexts/StudyDataContext'
import { useAuth } from '../contexts/AuthContext'
import { testApiKey } from '../lib/gemini'

export default function SettingsPage() {
  const { settings, updateSettings, isCloudSynced } = useStudyData()
  const { user, isFirebaseConfigured, signInWithGoogle } = useAuth()
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [testState, setTestState] = useState('idle') // idle | testing | ok | error
  const [testMessage, setTestMessage] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setApiKeyInput(settings?.geminiApiKey || '')
  }, [settings?.geminiApiKey])

  async function handleSaveKey() {
    await updateSettings({ geminiApiKey: apiKeyInput.trim() })
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }

  async function handleTestKey() {
    setTestState('testing')
    setTestMessage('')
    try {
      await testApiKey(apiKeyInput.trim())
      setTestState('ok')
      setTestMessage('接続に成功しました。')
    } catch (e) {
      setTestState('error')
      setTestMessage(e.message)
    }
  }

  return (
    <div>
      <PageHeader eyebrow="Settings" title="設定" description="APIキーやアカウント連携を管理します。" />

      <div className="px-8 py-6 max-w-2xl space-y-6">
        <section className="card p-6">
          <h2 className="font-display font-bold text-sm mb-1">アカウント連携</h2>
          <p className="text-xs text-mist-400 mb-4">
            ログインするとデータが複数端末で自動的に同期されます。
          </p>

          {!isFirebaseConfigured ? (
            <div className="text-sm text-warn bg-warn/10 border border-warn/30 rounded-lg px-4 py-3">
              Firebaseが未設定です。README.mdの手順に沿って .env.local を作成してください。
            </div>
          ) : user ? (
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-ink-850 border border-ink-700">
              {user.photoURL && <img src={user.photoURL} alt="" className="w-9 h-9 rounded-full" />}
              <div>
                <div className="text-sm font-medium">{user.displayName}</div>
                <div className="text-xs text-mist-400">{user.email}</div>
              </div>
              <span className="ml-auto text-[11px] font-mono text-signal-400">
                {isCloudSynced ? '同期中' : ''}
              </span>
            </div>
          ) : (
            <button onClick={signInWithGoogle} className="btn-primary">
              Googleでログイン
            </button>
          )}
        </section>

        <section className="card p-6">
          <h2 className="font-display font-bold text-sm mb-1">Gemini APIキー</h2>
          <p className="text-xs text-mist-400 mb-4">
            AIチャット機能を使うには、Google AI StudioでAPIキーを取得して登録してください。取得手順はREADME.mdを参照。使用モデル: <code className="text-signal-300">gemini-flash-lite-latest</code>
          </p>

          <label className="label-eyebrow block mb-2">APIキー</label>
          <input
            type="password"
            value={apiKeyInput}
            onChange={(e) => setApiKeyInput(e.target.value)}
            placeholder="AIzaSy..."
            className="input-field mb-3"
            autoComplete="off"
          />

          <div className="flex items-center gap-2.5">
            <button onClick={handleSaveKey} disabled={!apiKeyInput.trim()} className="btn-primary">
              {saved ? '保存しました ✓' : '保存'}
            </button>
            <button
              onClick={handleTestKey}
              disabled={!apiKeyInput.trim() || testState === 'testing'}
              className="btn-secondary"
            >
              {testState === 'testing' ? 'テスト中...' : '接続テスト'}
            </button>
          </div>

          {testMessage && (
            <p className={`text-xs mt-3 ${testState === 'ok' ? 'text-signal-400' : 'text-danger'}`}>
              {testMessage}
            </p>
          )}

          <p className="text-[11px] text-mist-500 mt-4 leading-relaxed">
            ※ APIキーは{isCloudSynced ? 'あなたのFirestoreアカウント内' : 'このブラウザのlocalStorage'}に保存され、他のユーザーとは共有されません。
            ただし、ブラウザの開発者ツールからは参照可能な形で保存されるため、共有端末では利用後にログアウトすることをおすすめします。
          </p>
        </section>
      </div>
    </div>
  )
}
