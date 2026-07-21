import { useState } from 'react'
import PageHeader from '../components/PageHeader'

const PRESET_TRACKS = [
  { label: 'Lo-fi 勉強用ミックス', url: 'https://www.youtube.com/embed/jfKfPfyJRdk' },
  { label: 'クラシック（集中用）', url: 'https://www.youtube.com/embed/mIYzp5rcTvU' },
  { label: '雨音 + カフェノイズ', url: 'https://www.youtube.com/embed/q76bMs-NwRk' },
]

function toEmbedUrl(input) {
  try {
    const url = new URL(input)
    if (url.hostname.includes('youtu.be')) {
      const id = url.pathname.slice(1)
      return `https://www.youtube.com/embed/${id}`
    }
    if (url.hostname.includes('youtube.com')) {
      const id = url.searchParams.get('v')
      if (id) return `https://www.youtube.com/embed/${id}`
      if (url.pathname.startsWith('/embed/')) return input
    }
  } catch {
    return null
  }
  return null
}

export default function MusicPage() {
  const [current, setCurrent] = useState(PRESET_TRACKS[0])
  const [customUrl, setCustomUrl] = useState('')
  const [urlError, setUrlError] = useState('')

  function handlePlayCustom() {
    const embed = toEmbedUrl(customUrl.trim())
    if (!embed) {
      setUrlError('YouTubeのURLを正しく入力してください')
      return
    }
    setUrlError('')
    setCurrent({ label: 'カスタムURL', url: embed })
  }

  return (
    <div>
      <PageHeader
        eyebrow="Focus Music"
        title="作業用BGM"
        description="YouTubeの動画を埋め込んで再生します。集中したいときのお供に。"
      />

      <div className="px-8 py-6 grid grid-cols-5 gap-6">
        <div className="col-span-3 card p-4">
          <div className="aspect-video rounded-lg overflow-hidden bg-ink-950">
            <iframe
              key={current.url}
              className="w-full h-full"
              src={`${current.url}?autoplay=0`}
              title={current.label}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <p className="text-sm text-mist-300 mt-3 px-1">{current.label}</p>
        </div>

        <div className="col-span-2 flex flex-col gap-4">
          <div className="card p-5">
            <h2 className="font-display font-bold text-sm mb-3">プリセット</h2>
            <div className="space-y-2">
              {PRESET_TRACKS.map((t) => (
                <button
                  key={t.url}
                  onClick={() => setCurrent(t)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm border transition-colors ${
                    current.url === t.url
                      ? 'bg-signal-500/10 border-signal-500/50 text-signal-300'
                      : 'border-ink-600 text-mist-300 hover:border-ink-500'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h2 className="font-display font-bold text-sm mb-3">URLを指定して再生</h2>
            <input
              type="text"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="input-field mb-2.5"
            />
            {urlError && <p className="text-xs text-danger mb-2.5">{urlError}</p>}
            <button onClick={handlePlayCustom} className="btn-secondary w-full">
              再生する
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
