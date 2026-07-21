import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebase'

// データ構造:
// users/{uid}                       -> プロフィール, 設定(APIキー等)
// users/{uid}/sessions/{sessionId}  -> 勉強記録（科目・分数・日付）

export function userDocRef(uid) {
  return doc(db, 'users', uid)
}

export function sessionsColRef(uid) {
  return collection(db, 'users', uid, 'sessions')
}

/** ユーザー設定（Geminiキー、テーマ設定等）を取得 */
export async function getUserSettings(uid) {
  const snap = await getDoc(userDocRef(uid))
  return snap.exists() ? snap.data() : {}
}

/** ユーザー設定を部分更新（マージ保存） */
export async function saveUserSettings(uid, partialSettings) {
  await setDoc(userDocRef(uid), partialSettings, { merge: true })
}

/** 勉強記録の新規追加 */
export async function addStudySession(uid, { subject, minutes, date, note = '' }) {
  await addDoc(sessionsColRef(uid), {
    subject,
    minutes,
    date, // 'YYYY-MM-DD' 形式
    note,
    createdAt: serverTimestamp(),
  })
}

/** 勉強記録の削除 */
export async function deleteStudySession(uid, sessionId) {
  await deleteDoc(doc(db, 'users', uid, 'sessions', sessionId))
}

/** 勉強記録をリアルタイム購読する */
export function subscribeStudySessions(uid, callback) {
  const q = query(sessionsColRef(uid), orderBy('date', 'desc'))
  return onSnapshot(q, (snap) => {
    const sessions = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    callback(sessions)
  })
}
