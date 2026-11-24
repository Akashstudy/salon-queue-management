import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useT } from '../i18n/index.jsx'
import { api } from '../api.js'
import { usePolling } from '../usePolling.js'
import {
  ScissorsIcon,
  ClockIcon,
  UsersIcon,
  PhoneIcon,
  ChevronRightIcon,
  SparklesIcon,
  AlertCircleIcon,
} from '../components/Icons.jsx'

const STATUS_THEME = {
  free: {
    badge: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    dot: 'bg-emerald-500',
  },
  busy: {
    badge: 'bg-amber-50 border-amber-200 text-amber-700',
    dot: 'bg-amber-500',
  },
  break: {
    badge: 'bg-slate-100 border-slate-200 text-slate-600',
    dot: 'bg-slate-400',
  },
  off: {
    badge: 'bg-slate-100 border-slate-200 text-slate-400',
    dot: 'bg-slate-400',
  },
}

function AlreadyJoined() {
  const { t } = useT()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { id } = await api(`/api/lookup?phone=${phone}`)
      navigate(`/status/${id}`)
    } catch (err) {
      setError(err.status === 404 ? t('home.notFound') : t('common.serverError'))
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <div className="text-center pt-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="min-h-11 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors py-2 px-3.5 rounded-xl hover:bg-slate-100 border border-slate-200/80 bg-white shadow-2xs"
        >
          <PhoneIcon className="w-3.5 h-3.5 text-indigo-500" />
          <span>{t('home.alreadyJoined')}</span>
          <ChevronRightIcon className="w-3.5 h-3.5" />
        </button>
      </div>
    )
  }

  return (
    <div className="saas-card p-5 space-y-3.5 border border-slate-200 shadow-sm animate-fadeIn">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5" htmlFor="lookup-phone">
          <PhoneIcon className="w-3.5 h-3.5 text-indigo-600" />
          <span>{t('home.enterPhone')}</span>
        </label>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1 rounded-lg"
        >
          {t('common.close')}
        </button>
      </div>
      <form onSubmit={submit} className="space-y-3">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <PhoneIcon className="w-4 h-4" />
          </span>
          <input
            id="lookup-phone"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="10-digit mobile number"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))
              setError('')
            }}
            className="saas-input pl-10"
          />
        </div>
        {error && (
          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-1.5 animate-shake">
            <AlertCircleIcon className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <button
          type="submit"
          disabled={phone.length !== 10 || loading}
          className="w-full min-h-11 py-2.5 btn-primary text-xs uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <span>{t('home.findSpot')}</span>
          )}
        </button>
      </form>
    </div>
  )
}

export default function Home() {
  const { t } = useT()
  const { data, error } = usePolling('/api/public')

  if (!data) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <div className="h-9 w-9 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-xs font-medium text-slate-500">
          {error ? t('common.serverError') : t('common.loading')}
        </p>
      </div>
    )
  }

  const { settings, barbers, queue } = data
  const closed = !settings.queueOpen

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Hero Header */}
      <div className="text-center space-y-2.5 pt-2">
        <div className="inline-flex items-center justify-center p-3.5 rounded-2xl bg-blue-950 text-white shadow-xs">
          <ScissorsIcon className="w-7 h-7 text-indigo-300" />
        </div>
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            {t('salonName')}
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">
            Smart Queue & Appointment Management
          </p>
        </div>

        {/* Salon Status Badge */}
        <div className="pt-0.5">
          <span
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide border ${
              closed
                ? 'bg-rose-50 border-rose-200 text-rose-700'
                : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                closed ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'
              }`}
            />
            {closed
              ? t('home.closed')
              : `${t('home.open')} • ${t('home.closes')} ${settings.closesLabel}`}
          </span>
        </div>

        {error && (
          <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 py-1 px-3 rounded-lg inline-block">
            {t('common.serverError')}
          </p>
        )}
      </div>

      {/* Real-time Queue Status Hero Card */}
      <div className="saas-card p-6 sm:p-7 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center justify-center sm:justify-start gap-1.5">
              <UsersIcon className="w-3.5 h-3.5" />
              <span>Live Queue Status</span>
            </span>

            {queue.waiting === 0 ? (
              <div>
                <div className="text-2xl font-extrabold text-slate-900">{t('home.nobody')}</div>
                <p className="text-xs text-emerald-600 font-medium pt-0.5">
                  Stylists are currently available for immediate service
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-baseline justify-center sm:justify-start gap-2">
                  <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                    {queue.waiting}
                  </span>
                  <span className="text-base text-slate-600 font-semibold">
                    {t('home.peopleWaiting')}
                  </span>
                </div>
                {queue.waitMinutes != null && (
                  <p className="text-xs text-indigo-700 font-semibold flex items-center justify-center sm:justify-start gap-1.5 pt-1">
                    <ClockIcon className="w-3.5 h-3.5 text-indigo-500" />
                    <span>
                      {t('home.about')} <strong className="font-bold text-slate-900">{queue.waitMinutes}</strong> {t('common.min')} estimated wait
                    </span>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Join CTA */}
          <div>
            {settings.joiningOpen ? (
              <Link
                to="/join"
                className="min-h-12 inline-flex items-center gap-2 px-6 py-3.5 btn-primary text-sm sm:text-base font-bold shadow-md shadow-indigo-100 whitespace-nowrap"
              >
                <span>{t('home.joinQueue')}</span>
                <ChevronRightIcon className="w-4 h-4" />
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className="min-h-12 px-6 py-3.5 rounded-xl bg-slate-100 text-slate-400 font-bold text-sm border border-slate-200 opacity-60 cursor-not-allowed whitespace-nowrap"
              >
                {t('home.joinQueue')}
              </button>
            )}
          </div>
        </div>

        {!settings.joiningOpen && (
          <div className="mt-4 pt-3 border-t border-slate-100 text-center sm:text-left">
            <p className="text-xs text-amber-700 flex items-center justify-center sm:justify-start gap-1.5">
              <AlertCircleIcon className="w-3.5 h-3.5 shrink-0 text-amber-600" />
              <span>{t('home.joinClosedMsg')}</span>
            </p>
          </div>
        )}
      </div>

      {/* Barbers Roster */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <SparklesIcon className="w-3.5 h-3.5 text-indigo-600" />
            <span>Stylists On Duty</span>
          </h2>
          <span className="text-xs text-slate-400 font-medium">{barbers.length} specialists</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {barbers.map((b) => {
            const theme = STATUS_THEME[b.status] || STATUS_THEME.off
            return (
              <div
                key={b.id}
                className="saas-card p-4 flex items-center gap-3 border border-slate-200/90 shadow-2xs"
              >
                <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-sm border border-indigo-100">
                  {b.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-slate-900 truncate">{b.name}</div>
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <span className={`h-1.5 w-1.5 rounded-full ${theme.dot}`} />
                    <span className="text-xs font-semibold text-slate-500 capitalize">
                      {t(`barberStatus.${b.status}`)}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Already Joined Form */}
      <AlreadyJoined />

      {/* 3-Step How It Works Infographic */}
      <div className="saas-card p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          How It Works
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
              1
            </span>
            <div className="text-xs">
              <span className="font-bold text-slate-900 block">Join Remotely</span>
              <span className="text-slate-500 text-[11px]">Select services & preferred stylist</span>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
              2
            </span>
            <div className="text-xs">
              <span className="font-bold text-slate-900 block">Track Wait Time</span>
              <span className="text-slate-500 text-[11px]">Watch live position & countdown</span>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
              3
            </span>
            <div className="text-xs">
              <span className="font-bold text-slate-900 block">Walk In When Called</span>
              <span className="text-slate-500 text-[11px]">Head over when your chair is ready</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
