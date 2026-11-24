import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useParams } from 'react-router-dom'
import { useT } from '../i18n/index.jsx'
import { clearStaffPin, postJson } from '../api.js'
import { usePolling } from '../usePolling.js'
import StaffGate from '../components/StaffGate.jsx'
import {
  ScissorsIcon,
  ClockIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  SparklesIcon,
  ChevronLeftIcon,
} from '../components/Icons.jsx'

function formatTimer(totalSeconds) {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function Panel() {
  const { name } = useParams()
  const barberId = name.toLowerCase()
  const { t, lang } = useT()
  const { data, error, reload } = usePolling(`/api/barber/${encodeURIComponent(barberId)}`, {
    staff: true,
  })
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  // Live Timer: server's elapsed seconds + local seconds since fetched
  const receivedAt = useRef(Date.now())
  const [, setTick] = useState(0)

  useEffect(() => {
    receivedAt.current = Date.now()
  }, [data])

  useEffect(() => {
    const timer = setInterval(() => setTick((n) => n + 1), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (error?.status === 401) {
      clearStaffPin()
      window.location.reload()
    }
  }, [error])

  async function act(action, body) {
    setBusy(true)
    setMessage('')
    try {
      await postJson(`/api/barber/${encodeURIComponent(barberId)}/${action}`, body, { staff: true })
    } catch (err) {
      const known = ['finish_first', 'nothing_to_start', 'nothing_to_finish', 'off_duty']
      setMessage(known.includes(err.code) ? t(`barber.err.${err.code}`) : t('barber.err.generic'))
    }
    setBusy(false)
    reload()
  }

  if (!data) {
    if (error?.status === 404) {
      return (
        <div className="max-w-md mx-auto saas-card p-8 text-center space-y-4 border border-slate-200 shadow-sm">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <AlertCircleIcon className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">{t('barber.notFound')}</h2>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl btn-primary text-xs font-semibold"
          >
            <ChevronLeftIcon className="w-4 h-4" />
            <span>{t('common.backHome')}</span>
          </Link>
        </div>
      )
    }
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <div className="h-9 w-9 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-xs font-medium text-slate-500">
          {error ? t('common.serverError') : t('common.loading')}
        </p>
      </div>
    )
  }

  const { current, next } = data
  const onBreak = data.onBreak
  const elapsed =
    current?.status === 'in_chair'
      ? current.elapsedSeconds + Math.floor((Date.now() - receivedAt.current) / 1000)
      : 0

  const allBarbers = [
    { id: 'ravi', label: 'Ravi' },
    { id: 'amit', label: 'Amit' },
    { id: 'imran', label: 'Imran' },
  ]

  return (
    <div className="max-w-lg mx-auto space-y-5">
      {/* Quick Stylist Switcher Tabs */}
      <div className="flex items-center justify-between pb-1 gap-2 flex-wrap sm:flex-nowrap">
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
          {allBarbers.map((b) => (
            <NavLink
              key={b.id}
              to={`/barber/${b.id}`}
              className={({ isActive }) =>
                `min-h-8 px-3.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`
              }
            >
              {b.label}
            </NavLink>
          ))}
        </div>

        {/* Break Toggle Switch */}
        <button
          type="button"
          role="switch"
          aria-checked={!onBreak}
          onClick={() => act('break', { onBreak: !onBreak })}
          disabled={busy || !data.onDuty}
          className={`min-h-10 px-3.5 py-1.5 rounded-xl font-semibold text-xs border transition-all duration-150 flex items-center gap-2 ${
            onBreak
              ? 'border-slate-200 bg-slate-100 text-slate-600'
              : 'border-emerald-200 bg-emerald-50 text-emerald-700'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${onBreak ? 'bg-slate-400' : 'bg-emerald-500 animate-pulse'}`}
          />
          <span>{onBreak ? t('barber.onBreak') : t('barber.available')}</span>
        </button>
      </div>

      {/* Off-duty Alert */}
      {!data.onDuty && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-3.5 text-xs text-amber-800 font-semibold flex items-center gap-2">
          <AlertCircleIcon className="w-4 h-4 shrink-0 text-amber-600" />
          <span>{t('barber.offDuty')}</span>
        </div>
      )}

      {message && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-700 font-semibold flex items-center gap-2 animate-shake">
          <AlertCircleIcon className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Active Service Station Card */}
      <div className="saas-card p-6 sm:p-7 space-y-5 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-sm border border-indigo-100">
              {data.name[0]}
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900">{data.name}&apos;s Station</h1>
              <p className="text-xs font-semibold text-slate-500 capitalize">
                Status: <strong className="text-slate-900">{t(`barberStatus.${data.status}`)}</strong>
              </p>
            </div>
          </div>

          <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-md">
            {t('barber.current')}
          </span>
        </div>

        {current ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-5xl font-black text-slate-900 tracking-tight">
                  {current.id}
                </div>
                <div className="text-xl font-bold text-slate-900 mt-1">{current.name}</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {current.services.map((s) => s?.[lang]).join(', ')} • {current.totalMinutes} {t('common.min')}
                </div>
              </div>

              {/* Service Stopwatch */}
              {current.status === 'in_chair' ? (
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    {t('barber.timer')}
                  </span>
                  <span className="text-4xl font-mono font-bold text-indigo-600 tracking-wider tabular-nums">
                    {formatTimer(elapsed)}
                  </span>
                </div>
              ) : (
                <div className="text-right">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-700">
                    <ClockIcon className="w-3.5 h-3.5 text-amber-600" />
                    <span>Called</span>
                  </span>
                </div>
              )}
            </div>

            {current.status === 'called' && (
              <p className="text-xs text-slate-600 font-medium bg-slate-50 p-3 rounded-xl border border-slate-200">
                {t('barber.calledWaiting')}
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-8 space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
              <ScissorsIcon className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-500">{t('barber.noCustomer')}</p>
          </div>
        )}
      </div>

      {/* Tactile Action Button */}
      {current?.status === 'called' && (
        <button
          type="button"
          onClick={() => act('start')}
          disabled={busy}
          className="w-full min-h-14 py-4 rounded-xl btn-primary text-xl font-bold shadow-md shadow-indigo-100 flex items-center justify-center gap-3 transition-transform active:scale-[0.99]"
        >
          <ScissorsIcon className="w-6 h-6 text-white" />
          <span>{t('barber.start')}</span>
        </button>
      )}

      {current?.status === 'in_chair' && (
        <button
          type="button"
          onClick={() => act('done')}
          disabled={busy}
          className="w-full min-h-14 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xl font-bold shadow-md shadow-emerald-100 flex items-center justify-center gap-3 transition-all active:scale-[0.99]"
        >
          <CheckCircleIcon className="w-6 h-6 text-white" />
          <span>{t('barber.done')}</span>
        </button>
      )}

      {/* Up Next for You Card */}
      <div className="saas-card p-5 space-y-2.5 border border-slate-200 shadow-2xs">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <SparklesIcon className="w-3.5 h-3.5 text-indigo-600" />
          <span>{t('barber.nextFor')}</span>
        </h2>

        {next ? (
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-indigo-600">{next.id}</span>
                <span className="font-bold text-slate-900 text-sm">{next.name}</span>
              </div>
              <div className="text-xs text-slate-500">
                {next.services.map((s) => s?.[lang]).join(', ')} • {next.totalMinutes} {t('common.min')}
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white text-slate-700 border border-slate-200">
              Next in line
            </span>
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic py-2">{t('barber.noNext')}</p>
        )}
      </div>
    </div>
  )
}

export default function Barber() {
  return (
    <StaffGate>
      <Panel />
    </StaffGate>
  )
}
