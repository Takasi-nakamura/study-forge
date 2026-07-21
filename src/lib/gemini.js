// Gemini API (2.0/2.5 系列の Flash-Lite モデル) を利用した簡易クライアント。
// ユーザーが設定画面で入力した API キーを使い、ブラウザから直接 REST API を呼び出します。
// モデル名は Google 側の命名変更に対応できるよう定数化しています。
export const GEMINI_MODEL = 'gemini-flash-lite-latest'

const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'

/**
 * 勉強記録のサマリーを Gemini に渡すためのテキストブロックを作る。
 * @param {Array<{subject: string, minutes: number, date: string}>} sessions
 */
export function buildStudyContext(sessions) {
  if (!sessions || sessions.length === 0) {
    return 'ユーザーはまだ勉強記録がありません。'
  }
  const totalMinutes = sessions.reduce((sum, s) => sum + s.minutes, 0)
  const bySubject = {}
  for (const s of sessions) {
    bySubject[s.subject] = (bySubject[s.subject] || 0) + s.minutes
  }
  const subjectLines = Object.entries(bySubject)
    .sort((a, b) => b[1] - a[1])
    .map(([subject, minutes]) => `- ${subject}: ${Math.round(minutes)}分`)
    .join('\n')

  const recent = sessions
    .slice(-5)
    .map((s) => `${s.date} / ${s.subject} / ${Math.round(s.minutes)}分`)
    .join('\n')

  return [
    `【ユーザーの勉強記録サマリー】`,
    `合計勉強時間: ${Math.round(totalMinutes)}分（${(totalMinutes / 60).toFixed(1)}時間）`,
    `科目別内訳:`,
    subjectLines,
    `直近の記録:`,
    recent,
  ].join('\n')
}

/**
 * Gemini にチャットメッセージを送信する。
 * @param {string} apiKey ユーザーの Gemini API キー
 * @param {Array<{role: 'user'|'model', text: string}>} history 会話履歴
 * @param {string} studyContext buildStudyContext() で生成したコンテキスト
 */
export async function sendChatMessage(apiKey, history, studyContext) {
  if (!apiKey) {
    throw new Error('APIキーが設定されていません。設定画面から登録してください。')
  }

  const systemInstruction = {
    role: 'user',
    parts: [
      {
        text:
          'あなたは学習アプリ「StudyForge」に組み込まれた勉強サポートAIです。' +
          'ユーザーの勉強内容の質問に答えたり、問題を出したり、学習計画のアドバイスをします。' +
          '以下はユーザーの実際の勉強記録データです。会話の中で自然に参照し、' +
          '頑張りを認めたり、記録に基づいた具体的なアドバイスをしてください。\n\n' +
          studyContext,
      },
    ],
  }

  const contents = [
    systemInstruction,
    { role: 'model', parts: [{ text: '了解しました。勉強記録を踏まえてサポートしますね。' }] },
    ...history.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.text }],
    })),
  ]

  const url = `${API_BASE}/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 1024,
      },
    }),
  })

  if (!res.ok) {
    const errBody = await res.json().catch(() => null)
    const message = errBody?.error?.message || `APIエラー (status ${res.status})`
    throw new Error(message)
  }

  const data = await res.json()
  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') ?? ''
  if (!text) {
    throw new Error('Geminiからの応答が空でした。もう一度お試しください。')
  }
  return text
}

/**
 * APIキーの疎通確認用の軽量リクエスト。
 */
export async function testApiKey(apiKey) {
  const url = `${API_BASE}/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: 'こんにちは、と一言だけ返して。' }] }],
      generationConfig: { maxOutputTokens: 32 },
    }),
  })
  if (!res.ok) {
    const errBody = await res.json().catch(() => null)
    throw new Error(errBody?.error?.message || `接続に失敗しました (status ${res.status})`)
  }
  return true
}
