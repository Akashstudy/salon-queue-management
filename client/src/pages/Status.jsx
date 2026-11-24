import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { ordinal, useT } from '../i18n/index.jsx'
import { postJson } from '../api.js'
import { usePolling } from '../usePolling.js'
import {
  ScissorsIcon,
  ClockIcon,
  UserIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  SparklesIcon,
} from '../components/Icons.jsx'

const RADIUS = 62
const CIRC = 2 * Math.PI * RADIUS

function WaitRing({ minutes, start }) {
  const { t } = useT()
  const progress = start > 0 ? Math.max(0, Math.min(1, minutes / start)) : 0
  return (
    <div className="relative mx-auto h-48 w-48 my-2">
      <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90 drop-shadow-xs" aria-hidden="true">
        {/* Track */}
        <circle cx="70" cy="70" r={RADIUS} fill="none" stroke="#E2E8F0" strokeWidth="10" />
        {/* Animated Progress Indicator */}
        <circle
          cx="70"
          cy="70"
          r={RADIUS}
          fill="none"
          stroke="url(#indigoGradient)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={CIRC * (1 - progress)}
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
        <defs>
          <linearGradient id="indigoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818CF8" />
            <stop offset="50%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#4F46E5" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          {t('home.about')}
        </span>
        <span className="text-5xl font-black text-slate-900 tracking-tight">
          {minutes}
        </span>
        <span className="text-xs font-semibold text-indigo-600">
          {t('common.min')}
        </span>
      </div>
    </div>
  )
}

function ConfirmCancel({ onYes, onKeep, busy, error }) {
  const { t } = useT()
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fadeIn"
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 space-y-5 border border-slate-200 shadow-xl">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mx-auto">
          <AlertCircleIcon className="w-6 h-6" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-lg font-bold text-slate-900">{t('status.cancelTitle')}</h2>
          <p className="text-xs text-slate-500">
            If you leave, your spot will be given to the next waiting customer.
          </p>
        </div>
        {error && <p className="text-xs font-semibold text-rose-600 text-center animate-shake">{error}</p>}
        <div className="flex flex-col gap-2.5 pt-1">
          <button
            type="button"
            onClick={onYes}
            disabled={busy}
            className="w-full min-h-11 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 font-bold text-xs text-white transition-colors disabled:opacity-50"
          >
            {t('status.cancelYes')}
          </button>
          <button
            type="button"
            onClick={onKeep}
            className="w-full min-h-11 py-2.5 rounded-xl btn-secondary font-semibold text-xs"
          >
            {t('status.cancelKeep')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Status() {
  const { id } = useParams()
  const { state: navState } = useLocation()
  const { t, lang } = useT()
  const { data: spot, error, reload } = usePolling(`/api/spots/${id}`)
  const [askCancel, setAskCancel] = useState(false)
  const [cancelBusy, setCancelBusy] = useState(false)
  const [cancelError, setCancelError] = useState('')
  const startWait = useRef(0)

  if (spot?.status === 'waiting' && spot.waitMinutes != null) {
    startWait.current = Math.max(startWait.current, spot.waitMinutes)
  }

  const status = spot?.status
  useEffect(() => {
    if (status === 'called') {
      try {
        navigator.vibrate?.([300, 150, 300, 150, 300])
      } catch {
        /* not supported */
      }
    }
  }, [status])

  async function doCancel() {
    setCancelBusy(true)
    setCancelError('')
    try {
      await postJson(`/api/spots/${id}/cancel`)
      setAskCancel(false)
      reload()
    } catch {
      setCancelError(t('status.cancelError'))
    }
    setCancelBusy(false)
  }

  if (!spot) {
    if (error?.status === 404) {
      return (
        <div className="max-w-md mx-auto saas-card p-8 text-center space-y-4 border border-slate-200 shadow-sm">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <AlertCircleIcon className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">{t('status.notFound')}</h2>
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

  const cancelDialog = askCancel && (
    <ConfirmCancel
      onYes={doCancel}
      onKeep={() => setAskCancel(false)}
      busy={cancelBusy}
      error={cancelError}
    />
  )

  // Called State: High-impact Full-Screen SaaS Turn Notification
  if (spot.status === 'called') {
    return (
      <>
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-gradient-to-br from-indigo-600 via-indigo-700 to-blue-950 p-6 text-center text-white shadow-2xl animate-fadeIn">
          <div className="w-20 h-20 rounded-full bg-white text-indigo-600 flex items-center justify-center shadow-lg animate-pulse">
            <ScissorsIcon className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <div className="text-6xl sm:text-7xl font-black tracking-tight">{spot.id}</div>
            <h1 className="text-3xl sm:text-4xl font-extrabold">{t('status.yourTurn')}</h1>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl py-4 px-6 border border-white/20 max-w-sm w-full space-y-1">
            <p className="text-2xl sm:text-3xl font-bold text-white">
              {t('status.goTo', { barber: spot.calledBarberName })}
            </p>
            <p className="text-sm font-medium text-indigo-100 flex items-center justify-center gap-1.5">
              <ClockIcon className="w-4 h-4" />
              <span>{t('status.arriveWithin')}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={() => setAskCancel(true)}
            className="min-h-12 mt-4 px-6 py-3 rounded-xl border border-white/30 text-white font-semibold text-sm hover:bg-white/10 transition-colors"
          >
            {t('status.cancel')}
          </button>
        </div>
        {cancelDialog}
      </>
    )
  }

  // Final Terminal States (in_chair, done, cancelled, no_show)
  const FINAL = {
    in_chair: { key: 'status.inChair', tone: 'text-indigo-600', icon: ScissorsIcon, badge: 'bg-indigo-50 border-indigo-200' },
    done: { key: 'status.done', tone: 'text-emerald-700', icon: CheckCircleIcon, badge: 'bg-emerald-50 border-emerald-200' },
    cancelled: { key: 'status.cancelled', tone: 'text-slate-600', icon: AlertCircleIcon, badge: 'bg-slate-100 border-slate-200' },
    no_show: { key: 'status.noShow', tone: 'text-amber-700', icon: AlertCircleIcon, badge: 'bg-amber-50 border-amber-200' },
  }

  if (FINAL[spot.status]) {
    const { key, tone, icon: StateIcon, badge } = FINAL[spot.status]
    const again = spot.status === 'cancelled' || spot.status === 'no_show'
    return (
      <div className="max-w-md mx-auto saas-card p-8 text-center space-y-6 border border-slate-200 shadow-sm">
        <div className={`w-16 h-16 mx-auto rounded-2xl ${badge} border flex items-center justify-center text-indigo-600 shadow-xs`}>
          <StateIcon className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <div className="text-3xl font-extrabold text-slate-900">{spot.id}</div>
          <p className={`text-xl font-bold ${tone}`}>{t(key)}</p>
        </div>
        {spot.status !== 'in_chair' && (
          <Link
            to={again ? '/join' : '/'}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl btn-primary text-sm font-semibold shadow-xs"
          >
            <span>{again ? t('status.joinAgain') : t('common.backHome')}</span>
          </Link>
        )}
      </div>
    )
  }

  // Waiting State
  const barberLabel = spot.barberName ?? t('join.anyBarber')

  return (
    <div className="max-w-md mx-auto space-y-5">
      {/* Breadcrumb */}
      <div>
        <Link
          to="/"
          className="min-h-8 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ChevronLeftIcon className="w-3.5 h-3.5" />
          <span>{t('common.backHome')}</span>
        </Link>
      </div>

      {navState?.alreadyInQueue && (
        <div className="rounded-xl bg-indigo-50 border border-indigo-200 p-3.5 text-center text-xs font-semibold text-indigo-800 flex items-center justify-center gap-2">
          <SparklesIcon className="w-4 h-4 shrink-0 text-indigo-600" />
          <span>{t('status.alreadyInQueue')}</span>
        </div>
      )}

      {/* Proximity Alert: 1st or 2nd in line */}
      {spot.position > 0 && spot.position <= 2 && (
        <div className="rounded-2xl bg-indigo-600 text-white p-4 text-center font-bold text-sm shadow-md shadow-indigo-100 flex items-center justify-center gap-2">
          <SparklesIcon className="w-5 h-5 text-indigo-200" />
          <span>{t('status.startComing')}</span>
        </div>
      )}

      {/* Main Token SaaS Card */}
      <div className="saas-card p-6 text-center space-y-4 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
          {t('status.yourToken')}
        </div>
        <div className="text-6xl font-black text-slate-900 tracking-tight">
          {spot.id}
        </div>
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
          <span>{t('status.position', { ord: ordinal(spot.position), n: spot.position })}</span>
        </div>

        {/* Wait Ring Timer */}
        {spot.waitMinutes == null ? (
          !spot.barberOnBreak &&
          !spot.barberOffDuty && (
            <p className="rounded-xl bg-slate-50 p-4 text-xs font-semibold text-amber-700 border border-slate-200">
              {t('status.noBarber')}
            </p>
          )
        ) : (
          <WaitRing minutes={spot.waitMinutes} start={startWait.current} />
        )}

        {spot.barberOnBreak && (
          <p className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs font-semibold text-amber-800 flex items-center justify-center gap-1.5">
            <AlertCircleIcon className="w-4 h-4 shrink-0 text-amber-600" />
            <span>{t('status.onBreak', { barber: spot.barberName })}</span>
          </p>
        )}

        {spot.barberOffDuty && (
          <p className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs font-semibold text-amber-800 flex items-center justify-center gap-1.5">
            <AlertCircleIcon className="w-4 h-4 shrink-0 text-amber-600" />
            <span>{t('status.offDuty', { barber: spot.barberName })}</span>
          </p>
        )}
      </div>

      {/* Appointment Details Card */}
      <div className="saas-card p-5 space-y-3.5 border border-slate-200 text-xs shadow-xs">
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
          <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-indigo-600" />
            <span>{spot.name}</span>
          </div>
          <span className="text-slate-500 font-medium">
            Stylist: <strong className="text-slate-900">{barberLabel}</strong>
          </span>
        </div>

        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
            {t('status.services')}
          </span>
          <ul className="space-y-1.5">
            {spot.services.map((s) => (
              <li key={s.id} className="flex justify-between text-slate-600">
                <span>
                  {s.name[lang]} • {s.minutes} {t('common.min')}
                </span>
                <span className="font-semibold text-slate-900">₹{s.price}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex justify-between items-center border-t border-slate-100 pt-3 font-bold text-sm">
          <span className="text-slate-600">
            {t('status.total')} • {spot.totalMinutes} {t('common.min')}
          </span>
          <span className="text-base text-indigo-600 font-black">₹{spot.totalPrice}</span>
        </div>
      </div>

      {/* Cancel Spot Button */}
      <button
        type="button"
        onClick={() => setAskCancel(true)}
        className="w-full min-h-11 py-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 font-bold text-xs text-rose-700 transition-colors"
      >
        {t('status.cancel')}
      </button>

      {cancelDialog}
    </div>
  )
}
