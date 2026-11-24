import { useEffect, useState } from 'react'
import { useT } from '../i18n/index.jsx'
import { clearStaffPin, postJson } from '../api.js'
import { usePolling } from '../usePolling.js'
import StaffGate from '../components/StaffGate.jsx'
import {
  ScissorsIcon,
  ClockIcon,
  UsersIcon,
  PlusIcon,
  AlertCircleIcon,
  CheckIcon,
  XMarkIcon,
} from '../components/Icons.jsx'

const MAX_SERVICES = 3

const STATUS_CHIP = {
  busy: 'bg-amber-50 border-amber-200 text-amber-700',
  free: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  break: 'bg-slate-100 border-slate-200 text-slate-600',
  off: 'bg-slate-100 border-slate-200 text-slate-400',
}

function BarberStationCard({ barber, onCallNext, busy }) {
  const { t, lang } = useT()
  const { current } = barber
  const unavailable = barber.status === 'break' || barber.status === 'off'

  const elapsedPct =
    current && current.status === 'in_chair' && current.totalMinutes > 0
      ? Math.max(
          0,
          Math.min(
            100,
            Math.round(((current.totalMinutes - current.minutesLeft) / current.totalMinutes) * 100),
          ),
        )
      : 0

  return (
    <div
      className={`rounded-2xl p-5 space-y-3.5 border transition-all duration-150 flex flex-col justify-between ${
        unavailable
          ? 'bg-slate-50 border-slate-200/80 opacity-75'
          : 'bg-white border-slate-200 shadow-xs'
      }`}
    >
      <div>
        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-xs border border-indigo-100">
              {barber.name[0]}
            </div>
            <span className="font-bold text-slate-900 text-sm">{barber.name}</span>
          </div>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold border ${STATUS_CHIP[barber.status]}`}>
            {t(`barberStatus.${barber.status}`)}
          </span>
        </div>

        {/* Current Customer details */}
        <div className="pt-2 min-h-20 text-xs">
          {current ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-indigo-600 text-sm">{current.id}</span>
                <span className="font-bold text-slate-900">{current.name}</span>
              </div>
              <div className="text-xs text-slate-500 truncate">
                {current.services.map((s) => s?.[lang]).join(', ')}
              </div>
              {current.status === 'in_chair' ? (
                <div className="pt-1.5 space-y-1">
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                      style={{ width: `${elapsedPct}%` }}
                    />
                  </div>
                  <div className="text-xs text-slate-500 flex items-center justify-between">
                    <span>{elapsedPct}% completed</span>
                    <span className="font-semibold text-slate-800">
                      {t('reception.timeLeft', { n: current.minutesLeft })}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-xs font-semibold text-amber-700 pt-1 flex items-center gap-1.5">
                  <ClockIcon className="w-3.5 h-3.5 animate-spin text-amber-600" />
                  <span>{t('reception.onTheWay')}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs italic py-4">
              {t('reception.noCustomer')}
            </div>
          )}
        </div>
      </div>

      {/* Action button */}
      {!unavailable && (
        <button
          type="button"
          onClick={() => onCallNext(barber.id)}
          disabled={!barber.canCallNext || busy}
          title={!barber.canCallNext ? t('reception.noEligible') : undefined}
          className="w-full min-h-10 py-2 rounded-xl btn-primary text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
        >
          <ScissorsIcon className="w-3.5 h-3.5" />
          <span>{t('reception.callNext')}</span>
        </button>
      )}
    </div>
  )
}

function QueueRow({ row, onNoShow, onCancel, busy }) {
  const { t, lang } = useT()
  const [sure, setSure] = useState(false)

  useEffect(() => {
    if (!sure) return
    const timer = setTimeout(() => setSure(false), 3000)
    return () => clearTimeout(timer)
  }, [sure])

  const called = row.status === 'called'
  const longWait = !called && row.waitedMinutes > 60

  return (
    <div
      className={`rounded-xl p-4 border transition-all duration-150 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        called
          ? 'bg-indigo-50/60 border-indigo-200 shadow-2xs'
          : longWait
            ? 'bg-amber-50/60 border-amber-200'
            : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-xl font-extrabold text-indigo-600 min-w-16">{row.id}</span>
        <div className="space-y-0.5">
          <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <span>{row.name}</span>
            {called && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                Called
              </span>
            )}
          </div>
          <div className="text-xs text-slate-500">
            {row.services.map((s) => s?.[lang]).join(', ')} • {row.totalMinutes} {t('common.min')}
          </div>
          <div className="text-xs text-slate-500">
            Stylist: <strong className="text-slate-800">{row.barberName ?? t('join.anyBarber')}</strong>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
        <div className="text-xs text-right">
          {called ? (
            <span className="font-bold text-indigo-700">
              {t('reception.calledTo', { barber: row.calledBarberName })}
            </span>
          ) : (
            <span className={longWait ? 'font-bold text-amber-700' : 'text-slate-500'}>
              {t('reception.waited', { n: row.waitedMinutes })}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {row.canNoShow && (
            <button
              type="button"
              onClick={() => onNoShow(row.id)}
              disabled={busy}
              className="min-h-9 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition-colors disabled:opacity-50"
            >
              {t('reception.noShow')}
            </button>
          )}
          <button
            type="button"
            onClick={() => (sure ? onCancel(row.id) : setSure(true))}
            disabled={busy}
            className={`min-h-9 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors disabled:opacity-50 ${
              sure
                ? 'bg-rose-600 border-rose-600 text-white'
                : 'border-rose-200 text-rose-700 hover:bg-rose-50'
            }`}
          >
            {sure ? t('reception.sure') : t('reception.cancel')}
          </button>
        </div>
      </div>
    </div>
  )
}

function WalkInModal({ services, barbers, onClose, onDone }) {
  const { t, lang } = useT()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [selected, setSelected] = useState([])
  const [barber, setBarber] = useState('any')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const canSubmit = name.trim().length >= 2 && /^\d{10}$/.test(phone) && selected.length >= 1

  function toggleService(id) {
    if (selected.includes(id)) {
      setSelected(selected.filter((x) => x !== id))
    } else if (selected.length < MAX_SERVICES) {
      setSelected([...selected, id])
    }
  }

  async function submit(e) {
    e.preventDefault()
    if (!canSubmit || busy) return
    setBusy(true)
    setError('')
    try {
      const res = await postJson(
        '/api/reception/walk-in',
        { name: name.trim(), phone, serviceIds: selected, barberId: barber },
        { staff: true },
      )
      onDone(res.spot)
    } catch (err) {
      setError(t('reception.err.generic'))
      setBusy(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fadeIn"
    >
      <form
        onSubmit={submit}
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 space-y-4 border border-slate-200 shadow-xl"
      >
        <div className="flex items-center justify-between pb-2 border-b border-slate-150">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <PlusIcon className="w-5 h-5 text-indigo-600" />
            <span>{t('reception.walkInTitle')}</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">{t('join.name')}</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Customer name"
              className="saas-input"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">{t('join.phone')}</label>
            <input
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="10-digit number"
              className="saas-input"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700">
            {t('join.services')} ({selected.length}/{MAX_SERVICES})
          </label>
          <div className="grid grid-cols-2 gap-2">
            {services.map((s) => {
              const on = selected.includes(s.id)
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleService(s.id)}
                  className={`p-2.5 rounded-xl text-left border text-xs transition-all flex justify-between items-center ${
                    on ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 font-semibold' : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span className="truncate">{s.name[lang]}</span>
                  <span className="font-bold text-indigo-600 text-xs">₹{s.price}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700">{t('join.barber')}</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => setBarber('any')}
              className={`p-2 rounded-xl text-center border text-xs font-semibold transition-all ${
                barber === 'any' ? 'border-indigo-600 bg-indigo-50 text-indigo-900' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              ★ Any
            </button>
            {barbers.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setBarber(b.id)}
                className={`p-2 rounded-xl text-center border text-xs font-semibold transition-all ${
                  barber === b.id ? 'border-indigo-600 bg-indigo-50 text-indigo-900' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {b.name}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-xs text-rose-600 text-center font-semibold animate-shake">{error}</p>}

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 min-h-11 py-2 rounded-xl btn-secondary text-xs"
          >
            {t('common.close')}
          </button>
          <button
            type="submit"
            disabled={!canSubmit || busy}
            className="flex-1 min-h-11 py-2 rounded-xl btn-primary text-xs disabled:opacity-40"
          >
            {busy ? 'Adding…' : t('reception.addToQueue')}
          </button>
        </div>
      </form>
    </div>
  )
}

function Panel() {
  const { t } = useT()
  const { data, error, reload } = usePolling('/api/reception', { staff: true })
  const [modalOpen, setModalOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    if (error?.status === 401) {
      clearStaffPin()
      window.location.reload()
    }
  }, [error])

  async function handleCallNext(barberId) {
    setBusy(true)
    setActionError('')
    try {
      await postJson(`/api/reception/call-next/${barberId}`, {}, { staff: true })
      reload()
    } catch (err) {
      setActionError(t(`reception.err.${err.code}`) || t('reception.err.generic'))
    }
    setBusy(false)
  }

  async function handleNoShow(id) {
    setBusy(true)
    setActionError('')
    try {
      await postJson(`/api/reception/no-show/${id}`, {}, { staff: true })
      reload()
    } catch (err) {
      setActionError(t(`reception.err.${err.code}`) || t('reception.err.generic'))
    }
    setBusy(false)
  }

  async function handleCancel(id) {
    setBusy(true)
    setActionError('')
    try {
      await postJson(`/api/reception/cancel/${id}`, {}, { staff: true })
      reload()
    } catch (err) {
      setActionError(t(`reception.err.${err.code}`) || t('reception.err.generic'))
    }
    setBusy(false)
  }

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

  const { barbers, queue, services, settings } = data
  const longWaitCount = queue.filter((c) => c.status === 'waiting' && c.waitedMinutes > 60).length

  return (
    <div className="space-y-6">
      {/* Top Receptionist Command Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>{t('screens.reception')}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Front Desk Operations & Queue Dispatcher
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
              settings.joiningOpen
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-rose-50 border-rose-200 text-rose-700'
            }`}
          >
            {settings.joiningOpen ? t('reception.onlineOpen') : t('reception.onlineClosed')}
          </span>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="min-h-10 px-4 py-2 rounded-xl btn-primary text-xs font-bold flex items-center gap-1.5 shadow-xs"
          >
            <PlusIcon className="w-4 h-4" />
            <span>{t('reception.addWalkIn')}</span>
          </button>
        </div>
      </div>

      {actionError && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 animate-shake">
          <AlertCircleIcon className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="saas-card p-4 border border-slate-200">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
            Total Waiting
          </span>
          <span className="text-2xl sm:text-3xl font-black text-slate-900">
            {queue.filter((q) => q.status === 'waiting').length}
          </span>
        </div>
        <div className="saas-card p-4 border border-slate-200">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
            Called / Arriving
          </span>
          <span className="text-2xl sm:text-3xl font-black text-indigo-600">
            {queue.filter((q) => q.status === 'called').length}
          </span>
        </div>
        <div className="saas-card p-4 border border-slate-200">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
            Active Stylists
          </span>
          <span className="text-2xl sm:text-3xl font-black text-emerald-600">
            {barbers.filter((b) => b.status !== 'off').length}
          </span>
        </div>
        <div className="saas-card p-4 border border-slate-200">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
            Wait &gt; 60m
          </span>
          <span
            className={`text-2xl sm:text-3xl font-black ${
              longWaitCount > 0 ? 'text-amber-600 animate-pulse' : 'text-slate-400'
            }`}
          >
            {longWaitCount}
          </span>
        </div>
      </div>

      {/* Main Split Layout: Barbers on Left / Queue on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Stylist Stations (5 cols) */}
        <div className="lg:col-span-5 space-y-3.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <ScissorsIcon className="w-4 h-4 text-indigo-600" />
            <span>Stylist Stations ({barbers.length})</span>
          </h2>
          <div className="grid grid-cols-1 gap-3">
            {barbers.map((b) => (
              <BarberStationCard
                key={b.id}
                barber={b}
                onCallNext={handleCallNext}
                busy={busy}
              />
            ))}
          </div>
        </div>

        {/* Right Column: Waiting Queue (7 cols) */}
        <div className="lg:col-span-7 space-y-3.5">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <UsersIcon className="w-4 h-4 text-indigo-600" />
              <span>Live Queue Order ({queue.length})</span>
            </h2>
            <span className="text-xs text-slate-400 font-medium">Arrival sequence</span>
          </div>

          {queue.length === 0 ? (
            <div className="saas-card p-10 text-center space-y-2 border border-slate-200">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <CheckIcon className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Queue is clear!</h3>
              <p className="text-xs text-slate-500">No customers are currently in line.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {queue.map((row) => (
                <QueueRow
                  key={row.id}
                  row={row}
                  onNoShow={handleNoShow}
                  onCancel={handleCancel}
                  busy={busy}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Walk-in Modal */}
      {modalOpen && (
        <WalkInModal
          services={services}
          barbers={barbers}
          onClose={() => setModalOpen(false)}
          onDone={() => {
            setModalOpen(false)
            reload()
          }}
        />
      )}
    </div>
  )
}

export default function Reception() {
  return (
    <StaffGate>
      <Panel />
    </StaffGate>
  )
}
