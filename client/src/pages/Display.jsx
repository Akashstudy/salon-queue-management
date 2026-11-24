import { useEffect, useRef, useState } from 'react'
import { useT } from '../i18n/index.jsx'
import { usePolling } from '../usePolling.js'
import {
  ScissorsIcon,
  Volume2Icon,
  VolumeXIcon,
  ClockIcon,
  SparklesIcon,
} from '../components/Icons.jsx'

const FLASH_MS = 8000

// Short two-note chime using Web Audio API
function playChime(ctx) {
  if (!ctx) return
  const now = ctx.currentTime
  ;[660, 880].forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0.0001, now + i * 0.25)
    gain.gain.exponentialRampToValueAtTime(0.4, now + i * 0.25 + 0.03)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.25 + 0.5)
    osc.connect(gain).connect(ctx.destination)
    osc.start(now + i * 0.25)
    osc.stop(now + i * 0.25 + 0.55)
  })
}

export default function Display() {
  const { t } = useT()
  const { data, error } = usePolling('/api/display')
  const [clock, setClock] = useState(() => new Date())
  const [flashing, setFlashing] = useState({}) // barberId -> expiry timestamp
  const [soundOn, setSoundOn] = useState(false)
  const audioRef = useRef(null)
  const prevTokens = useRef(null)

  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Detect newly called tokens: flash indigo + chime
  useEffect(() => {
    if (!data) return
    const current = {}
    for (const b of data.barbers) current[b.id] = b.nowStatus === 'called' ? b.nowToken : null
    if (prevTokens.current) {
      const fresh = data.barbers.filter(
        (b) => current[b.id] && current[b.id] !== prevTokens.current[b.id],
      )
      if (fresh.length) {
        const until = Date.now() + FLASH_MS
        setFlashing((f) => ({ ...f, ...Object.fromEntries(fresh.map((b) => [b.id, until])) }))
        playChime(audioRef.current)
      }
    }
    prevTokens.current = current
  }, [data])

  function enableSound() {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext
      audioRef.current = audioRef.current || new Ctx()
      audioRef.current.resume?.()
      playChime(audioRef.current)
      setSoundOn(true)
    } catch {
      /* audio unavailable */
    }
  }

  if (!data) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="h-12 w-12 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-500">
          {error ? t('common.serverError') : t('common.loading')}
        </p>
      </div>
    )
  }

  const barbers = data.barbers.filter((b) => b.status !== 'off')
  const nowMs = clock.getTime()

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-2 sm:p-4">
      {/* Top Lounge Broadcast Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-950 text-white flex items-center justify-center shadow-xs">
            <ScissorsIcon className="w-7 h-7 text-indigo-300" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{t('salonName')}</h1>
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
              Waiting Area Display Board
            </p>
          </div>
        </div>

        {/* Digital Clock */}
        <div className="text-center sm:text-right">
          <div className="text-4xl sm:text-5xl font-mono font-black text-slate-900 tracking-tight tabular-nums">
            {clock.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <div className="flex items-center justify-center sm:justify-end gap-3 mt-1.5">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                data.settings.queueOpen
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'bg-rose-50 border-rose-200 text-rose-700'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${data.settings.queueOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              <span>{data.settings.queueOpen ? t('home.open') : t('home.closed')}</span>
            </span>

            {/* Audio Toggle */}
            <button
              type="button"
              onClick={enableSound}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                soundOn
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
            >
              {soundOn ? (
                <>
                  <Volume2Icon className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Chime Enabled</span>
                </>
              ) : (
                <>
                  <VolumeXIcon className="w-3.5 h-3.5 text-slate-500" />
                  <span>{t('display.enableSound')}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Stylist Stations Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <SparklesIcon className="w-4 h-4 text-indigo-600" />
            <span>Active Stylist Stations</span>
          </h2>
          <span className="text-xs text-slate-500 font-medium">Please proceed when your token is announced</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {barbers.map((b) => {
            const isFlashing = (flashing[b.id] ?? 0) > nowMs
            const isIdle = !b.nowToken
            return (
              <div
                key={b.id}
                className={`rounded-2xl p-6 border-2 transition-all duration-300 flex flex-col justify-between min-h-[220px] shadow-sm relative overflow-hidden ${
                  isFlashing
                    ? 'bg-indigo-600 text-white border-indigo-400 animate-pulse scale-[1.02] shadow-lg shadow-indigo-200'
                    : 'bg-white border-slate-200'
                }`}
              >
                {/* Station Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${
                        isFlashing
                          ? 'bg-white text-indigo-600 shadow-sm'
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                      }`}
                    >
                      {b.name[0]}
                    </div>
                    <div>
                      <span className={`text-xl font-bold ${isFlashing ? 'text-white' : 'text-slate-900'}`}>
                        {b.name}
                      </span>
                      <span className={`block text-xs font-medium ${isFlashing ? 'text-indigo-100' : 'text-slate-500'}`}>
                        Stylist Station
                      </span>
                    </div>
                  </div>

                  {isFlashing && (
                    <span className="px-3 py-1 rounded-full bg-white text-indigo-700 text-xs font-bold">
                      CALLED NOW!
                    </span>
                  )}
                </div>

                {/* Serving Token Area */}
                <div className="py-4 text-center">
                  {isIdle ? (
                    <div className="space-y-1">
                      <span className={`text-3xl font-extrabold ${isFlashing ? 'text-white' : 'text-slate-400'}`}>
                        {b.status === 'break' ? t('display.onBreak') : t('display.free')}
                      </span>
                      <p className={`text-xs ${isFlashing ? 'text-indigo-100' : 'text-slate-400'}`}>
                        {b.status === 'break' ? 'Temporary Break' : 'Ready for next customer'}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <span className={`text-xs font-bold uppercase tracking-wider ${isFlashing ? 'text-indigo-100' : 'text-indigo-600'}`}>
                        {t('display.now')} Serving
                      </span>
                      <div className={`text-6xl sm:text-7xl font-black tracking-tight tabular-nums ${isFlashing ? 'text-white' : 'text-slate-900'}`}>
                        {b.nowToken}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className={`pt-2 border-t text-center text-xs font-semibold ${isFlashing ? 'border-white/20 text-indigo-100' : 'border-slate-100 text-slate-500'}`}>
                  {b.nowStatus === 'in_chair' ? 'In Chair — Service In Progress' : b.nowStatus === 'called' ? 'Customer Summoned' : 'Station Free'}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Up Next in Queue Section */}
      <div className="saas-card p-6 space-y-4 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-2">
            <ClockIcon className="w-4 h-4" />
            <span>{t('display.upNext')} (Next in Line)</span>
          </h2>
          <span className="text-xs text-slate-500 font-semibold">
            {data.waiting} total waiting
          </span>
        </div>

        {data.upNext.length === 0 ? (
          <p className="text-center text-slate-400 text-sm py-6 font-semibold">
            {t('display.nobody')}
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {data.upNext.map((u, idx) => (
              <div
                key={u.id}
                className="rounded-xl p-4 text-center bg-slate-50 border border-slate-200/80 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-xs text-slate-400 font-bold mb-1">
                  <span>#{idx + 1}</span>
                  <span className="text-indigo-600">Queue</span>
                </div>
                <div className="text-3xl sm:text-4xl font-black text-slate-900 tabular-nums my-1">
                  {u.id}
                </div>
                <div className="text-xs font-semibold text-slate-500 pt-1 border-t border-slate-200">
                  {u.waitMinutes == null ? '—' : `~${u.waitMinutes} ${t('common.min')}`}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Lounge Ticker */}
      <div className="rounded-xl bg-white p-4 border border-slate-200 text-center text-xs text-slate-500 flex items-center justify-center gap-2 shadow-2xs">
        <SparklesIcon className="w-4 h-4 text-indigo-600 shrink-0" />
        <span>Welcome to <strong>Blade & Blend</strong> • Please proceed to your designated stylist station as soon as your token is announced.</span>
      </div>
    </div>
  )
}
