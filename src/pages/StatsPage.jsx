import { useMemo, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Bar, Line, Doughnut } from 'react-chartjs-2'
import PageHeader from '../components/PageHeader'
import { useStudyData } from '../contexts/StudyDataContext'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
)

const SUBJECT_COLORS = ['#14b8cf', '#7ee6f2', '#e0954a', '#e0596a', '#9aa2b1', '#4a80e0', '#c084e0']

const CHART_TEXT_COLOR = '#9aa2b1'
const CHART_GRID_COLOR = 'rgba(255,255,255,0.06)'

export default function StatsPage() {
  const { sessions, removeSession } = useStudyData()
  const [range, setRange] = useState(14) // 直近何日分を時系列表示するか

  const timeSeries = useMemo(() => buildTimeSeries(sessions, range), [sessions, range])
  const bySubject = useMemo(() => buildSubjectBreakdown(sessions), [sessions])

  const lineData = {
    labels: timeSeries.labels,
    datasets: [
      {
        label: '勉強時間（分）',
        data: timeSeries.values,
        borderColor: '#14b8cf',
        backgroundColor: 'rgba(20,184,207,0.15)',
        fill: true,
        tension: 0.35,
        pointRadius: 3,
        pointBackgroundColor: '#14b8cf',
      },
    ],
  }

  const barData = {
    labels: bySubject.labels,
    datasets: [
      {
        label: '合計時間（分）',
        data: bySubject.values,
        backgroundColor: bySubject.labels.map((_, i) => SUBJECT_COLORS[i % SUBJECT_COLORS.length]),
        borderRadius: 6,
      },
    ],
  }

  const doughnutData = {
    labels: bySubject.labels,
    datasets: [
      {
        data: bySubject.values,
        backgroundColor: bySubject.labels.map((_, i) => SUBJECT_COLORS[i % SUBJECT_COLORS.length]),
        borderWidth: 0,
      },
    ],
  }

  const commonScales = {
    x: { ticks: { color: CHART_TEXT_COLOR, font: { size: 11 } }, grid: { color: 'transparent' } },
    y: { ticks: { color: CHART_TEXT_COLOR, font: { size: 11 } }, grid: { color: CHART_GRID_COLOR } },
  }

  return (
    <div>
      <PageHeader
        eyebrow="Statistics"
        title="統計"
        description="時系列の推移と科目別の内訳で、勉強の傾向を振り返りましょう。"
        action={
          <div className="flex gap-1.5">
            {[7, 14, 30].map((d) => (
              <button
                key={d}
                onClick={() => setRange(d)}
                className={`px-3 py-1.5 rounded-md text-xs font-mono border transition-colors ${
                  range === d
                    ? 'bg-signal-500/10 border-signal-500/50 text-signal-300'
                    : 'border-ink-600 text-mist-400 hover:border-ink-500'
                }`}
              >
                {d}日間
              </button>
            ))}
          </div>
        }
      />

      <div className="px-8 py-6 space-y-6">
        <div className="card p-6">
          <h2 className="font-display font-bold text-sm mb-4">勉強時間の推移</h2>
          <div className="h-64">
            <Line
              data={lineData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: commonScales,
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-5 gap-6">
          <div className="col-span-3 card p-6">
            <h2 className="font-display font-bold text-sm mb-4">科目別 勉強時間</h2>
            <div className="h-60">
              {bySubject.labels.length > 0 ? (
                <Bar
                  data={barData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: commonScales,
                  }}
                />
              ) : (
                <EmptyChart />
              )}
            </div>
          </div>

          <div className="col-span-2 card p-6">
            <h2 className="font-display font-bold text-sm mb-4">科目の割合</h2>
            <div className="h-60 flex items-center justify-center">
              {bySubject.labels.length > 0 ? (
                <Doughnut
                  data={doughnutData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: { color: CHART_TEXT_COLOR, font: { size: 11 }, boxWidth: 10 },
                      },
                    },
                  }}
                />
              ) : (
                <EmptyChart />
              )}
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-display font-bold text-sm mb-4">全記録</h2>
          {sessions.length === 0 ? (
            <p className="text-sm text-mist-400 py-6 text-center">記録がありません</p>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-ink-900">
                  <tr className="text-left text-[11px] font-mono uppercase text-mist-400 border-b border-ink-700">
                    <th className="py-2 font-medium">日付</th>
                    <th className="py-2 font-medium">科目</th>
                    <th className="py-2 font-medium">時間</th>
                    <th className="py-2 font-medium">メモ</th>
                    <th className="py-2 font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s) => (
                    <tr key={s.id} className="border-b border-ink-800/60 hover:bg-ink-850/50">
                      <td className="py-2.5 font-mono text-mist-300">{s.date}</td>
                      <td className="py-2.5">{s.subject}</td>
                      <td className="py-2.5 font-mono text-signal-300">{Math.round(s.minutes)}分</td>
                      <td className="py-2.5 text-mist-400 truncate max-w-[200px]">{s.note}</td>
                      <td className="py-2.5 text-right">
                        <button
                          onClick={() => removeSession(s.id)}
                          className="text-mist-500 hover:text-danger text-xs"
                        >
                          削除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function buildTimeSeries(sessions, days) {
  const map = {}
  const today = new Date()
  const labels = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    map[key] = 0
    labels.push(`${d.getMonth() + 1}/${d.getDate()}`)
  }
  for (const s of sessions) {
    if (s.date in map) map[s.date] += s.minutes
  }
  return { labels, values: Object.values(map).map((v) => Math.round(v)) }
}

function buildSubjectBreakdown(sessions) {
  const map = {}
  for (const s of sessions) {
    map[s.subject] = (map[s.subject] || 0) + s.minutes
  }
  const entries = Object.entries(map).sort((a, b) => b[1] - a[1])
  return {
    labels: entries.map(([k]) => k),
    values: entries.map(([, v]) => Math.round(v)),
  }
}

function EmptyChart() {
  return <p className="text-sm text-mist-400 m-auto">データがありません</p>
}
