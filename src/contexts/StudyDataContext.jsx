import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useAuth } from './AuthContext'
import {
  addStudySession,
  deleteStudySession,
  getUserSettings,
  saveUserSettings,
  subscribeStudySessions,
} from '../lib/firestore'

const StudyDataContext = createContext(null)

const LOCAL_SESSIONS_KEY = 'studyforge_local_sessions'
const LOCAL_SETTINGS_KEY = 'studyforge_local_settings'

export function StudyDataProvider({ children }) {
  const { user, isFirebaseConfigured } = useAuth()
  const [sessions, setSessions] = useState([])
  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(true)

  // ログイン中はFirestore、未ログイン/未設定時はlocalStorageにフォールバック
  useEffect(() => {
    if (user && isFirebaseConfigured) {
      setLoading(true)
      const unsubscribe = subscribeStudySessions(user.uid, (data) => {
        setSessions(data)
        setLoading(false)
      })
      getUserSettings(user.uid).then(setSettings)
      return unsubscribe
    } else {
      const raw = localStorage.getItem(LOCAL_SESSIONS_KEY)
      setSessions(raw ? JSON.parse(raw) : [])
      const rawSettings = localStorage.getItem(LOCAL_SETTINGS_KEY)
      setSettings(rawSettings ? JSON.parse(rawSettings) : {})
      setLoading(false)
    }
  }, [user, isFirebaseConfigured])

  const addSession = useCallback(
    async (sessionData) => {
      if (user && isFirebaseConfigured) {
        await addStudySession(user.uid, sessionData)
      } else {
        const newSession = { id: crypto.randomUUID(), ...sessionData }
        setSessions((prev) => {
          const updated = [newSession, ...prev]
          localStorage.setItem(LOCAL_SESSIONS_KEY, JSON.stringify(updated))
          return updated
        })
      }
    },
    [user, isFirebaseConfigured]
  )

  const removeSession = useCallback(
    async (sessionId) => {
      if (user && isFirebaseConfigured) {
        await deleteStudySession(user.uid, sessionId)
      } else {
        setSessions((prev) => {
          const updated = prev.filter((s) => s.id !== sessionId)
          localStorage.setItem(LOCAL_SESSIONS_KEY, JSON.stringify(updated))
          return updated
        })
      }
    },
    [user, isFirebaseConfigured]
  )

  const updateSettings = useCallback(
    async (partial) => {
      const merged = { ...settings, ...partial }
      setSettings(merged)
      if (user && isFirebaseConfigured) {
        await saveUserSettings(user.uid, partial)
      } else {
        localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(merged))
      }
    },
    [settings, user, isFirebaseConfigured]
  )

  const value = {
    sessions,
    settings,
    loading,
    addSession,
    removeSession,
    updateSettings,
    isCloudSynced: Boolean(user && isFirebaseConfigured),
  }

  return <StudyDataContext.Provider value={value}>{children}</StudyDataContext.Provider>
}

export function useStudyData() {
  const ctx = useContext(StudyDataContext)
  if (!ctx) throw new Error('useStudyData は StudyDataProvider の内側で使用してください')
  return ctx
}
