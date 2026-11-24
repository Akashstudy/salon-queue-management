import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useT } from '../i18n/index.jsx'
import { postJson } from '../api.js'
import { usePolling } from '../usePolling.js'
import {
  ScissorsIcon,
  ClockIcon,
  PhoneIcon,
  UserIcon,
  CheckIcon,
  AlertCircleIcon,
  SparklesIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '../components/Icons.jsx'

const MAX_SERVICES = 3

export default function Join() {
  const { t, lang } = useT()
  const navigate = useNavigate()
  const { data, error } = usePolling('/api/public')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [selected, setSelected] = useState([])
  const [barber, setBarber] = useState('any')
  const [touched, setTouched] = useState({ name: false, phone: false })
  const [maxHit, setMaxHit] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

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

  if (!data.settings.joiningOpen) {
    return (
      <div className="max-w-md mx-auto saas-card p-8 text-center space-y-5 border border-slate-200 shadow-md">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
          <ClockIcon className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900">Online Queue Closed</h2>
          <p className="text-xs text-slate-500">{t('home.joinClosedMsg')}</p>
        </div>
        <Link
          to="/"
          className="min-h-11 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl btn-secondary text-xs font-semibold"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          <span>{t('common.backHome')}</span>
        </Link>
      </div>
    )
  }

  const services = data.services
  const barbers = data.barbers.filter((b) => b.status !== 'off')
  const chosen = services.filter((s) => selected.includes(s.id))
  const totalMin = chosen.reduce((sum, s) => sum + s.minutes, 0)
  const totalPrice = chosen.reduce((sum, s) => sum + s.price, 0)
  const wait = data.waits[barber]
  const chosenBarber = barbers.find((b) => b.id === barber)

  const nameOk = name.trim().length >= 2
  const phoneOk = /^\d{10}$/.test(phone)
  const canConfirm = nameOk && phoneOk && chosen.length >= 1 && !submitting

  function toggleService(id) {
    if (selected.includes(id)) {
      setSelected(selected.filter((x) => x !== id))
      setMaxHit(false)
    } else if (selected.length >= MAX_SERVICES) {
      setMaxHit(true)
      setTimeout(() => setMaxHit(false), 800)
    } else {
      setSelected([...selected, id])
    }
  }

  async function confirm() {
    if (!canConfirm) return
    setSubmitting(true)
    setSubmitError('')
    try {
      const { spot, existing } = await postJson('/api/join', {
        name: name.trim(),
        phone,
        serviceIds: selected,
        barberId: barber,
      })
      navigate(`/status/${spot.id}`, { state: { alreadyInQueue: existing } })
    } catch (err) {
      setSubmitError(err.code === 'closed' ? t('home.joinClosedMsg') : t('join.submitError'))
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-44">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link
            to="/"
            className="min-h-8 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors mb-1"
          >
            <ChevronLeftIcon className="w-3.5 h-3.5" />
            <span>{t('common.backHome')}</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>{t('screens.join')}</span>
          </h1>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">
            Step 1 of 1
          </span>
          <span className="text-xs text-slate-500 font-medium">Quick Registration</span>
        </div>
      </div>

      {/* Section 1: Customer Details */}
      <div className="saas-card p-5 sm:p-6 border border-slate-200 space-y-4 shadow-xs">
        <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
          <UserIcon className="w-4 h-4" />
          <span>Customer Information</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Name Field */}
          <div className="space-y-1.5">
            <label htmlFor="name" className="text-xs font-semibold text-slate-700">
              {t('join.name')} <span className="text-indigo-600">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <UserIcon className="w-4 h-4" />
              </span>
              <input
                id="name"
                autoComplete="name"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => setTouched((x) => ({ ...x, name: true }))}
                className="saas-input pl-10"
              />
            </div>
            {touched.name && !nameOk && (
              <p className="text-xs font-medium text-rose-600 flex items-center gap-1 animate-fadeIn">
                <AlertCircleIcon className="w-3 h-3" /> {t('join.nameError')}
              </p>
            )}
          </div>

          {/* Phone Field */}
          <div className="space-y-1.5">
            <label htmlFor="phone" className="text-xs font-semibold text-slate-700">
              {t('join.phone')} <span className="text-indigo-600">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <PhoneIcon className="w-4 h-4" />
              </span>
              <input
                id="phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="10-digit number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                onBlur={() => setTouched((x) => ({ ...x, phone: true }))}
                className="saas-input pl-10"
              />
            </div>
            {touched.phone && !phoneOk && (
              <p className="text-xs font-medium text-rose-600 flex items-center gap-1 animate-fadeIn">
                <AlertCircleIcon className="w-3 h-3" /> {t('join.phoneError')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Section 2: Choose Services */}
      <div className="saas-card p-5 sm:p-6 border border-slate-200 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
            <ScissorsIcon className="w-4 h-4" />
            <span>Select Services</span>
          </h2>
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full border transition-colors ${
              selected.length === MAX_SERVICES
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                : 'bg-slate-100 border-slate-200 text-slate-600'
            }`}
          >
            {selected.length} / {MAX_SERVICES} {t('join.services').split('(')[0].trim()}
          </span>
        </div>

        {maxHit && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-2 animate-shake">
            <AlertCircleIcon className="w-4 h-4 shrink-0 text-amber-600" />
            <span>{t('join.maxServices')}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {services.map((s) => {
            const isSelected = selected.includes(s.id)
            const isMaxedOut = selected.length >= MAX_SERVICES && !isSelected
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => toggleService(s.id)}
                aria-pressed={isSelected}
                className={`min-h-16 p-3.5 rounded-xl text-left border transition-all duration-150 flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'border-2 border-indigo-600 bg-indigo-50/50 shadow-xs'
                    : isMaxedOut
                      ? 'bg-slate-50 border-slate-200/70 opacity-60 cursor-not-allowed'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="font-bold text-sm text-slate-900">{s.name[lang]}</div>
                  <div className="text-xs text-slate-500 flex items-center gap-1">
                    <ClockIcon className="w-3 h-3 text-slate-400" />
                    <span>
                      {s.minutes} {t('common.min')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-extrabold text-indigo-600">₹{s.price}</span>
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'border border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <CheckIcon className="w-3.5 h-3.5" />}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Section 3: Select Stylist */}
      <div className="saas-card p-5 sm:p-6 border border-slate-200 space-y-4 shadow-xs">
        <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
          <SparklesIcon className="w-4 h-4" />
          <span>Preferred Stylist</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Any Barber (Fastest) */}
          <button
            type="button"
            onClick={() => setBarber('any')}
            className={`min-h-20 p-3.5 rounded-xl text-left border transition-all flex flex-col justify-between ${
              barber === 'any'
                ? 'border-2 border-indigo-600 bg-indigo-50/60 shadow-xs'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-black flex items-center justify-center text-xs shadow-2xs mb-1.5">
              ★
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900">{t('join.anyBarber')}</div>
              <div className="text-xs text-indigo-600 font-semibold">{t('join.fastest')}</div>
            </div>
          </button>

          {/* Individual Barbers */}
          {barbers.map((b) => {
            const isSelected = barber === b.id
            const isBreak = b.status === 'break'
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => setBarber(b.id)}
                className={`min-h-20 p-3.5 rounded-xl text-left border transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-2 border-indigo-600 bg-indigo-50/60 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs border border-slate-200 mb-1.5">
                  {b.name[0]}
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900 truncate">{b.name}</div>
                  <div
                    className={`text-xs font-semibold capitalize ${
                      isBreak ? 'text-amber-600' : 'text-slate-500'
                    }`}
                  >
                    {t(`barberStatus.${b.status}`)}
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {chosenBarber?.status === 'break' && (
          <p className="text-xs text-amber-800 flex items-center gap-1.5 p-3 rounded-xl bg-amber-50 border border-amber-200">
            <AlertCircleIcon className="w-4 h-4 shrink-0 text-amber-600" />
            <span>{t('join.onBreakNote', { barber: chosenBarber.name })}</span>
          </p>
        )}
      </div>

      {/* Floating Bottom Live Summary Bar */}
      <div className="fixed bottom-0 inset-x-0 z-30 p-4 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-md">
        <div className="max-w-xl mx-auto space-y-2.5">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            {chosen.length === 0 ? (
              <span className="text-slate-500 flex items-center gap-1.5">
                <AlertCircleIcon className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>{t('join.pickService')}</span>
              </span>
            ) : (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="text-slate-600">
                  {t('join.total')}: <strong className="text-slate-900 font-bold">{totalMin}</strong> {t('common.min')}
                </span>
                <span className="text-indigo-600 font-extrabold text-base sm:text-lg">
                  ₹{totalPrice}
                </span>
                <span className="text-slate-500 flex items-center gap-1">
                  <ClockIcon className="w-3.5 h-3.5 text-indigo-500" />
                  {wait == null ? (
                    <span className="text-amber-600 font-semibold">{t('join.noBarberWorking')}</span>
                  ) : (
                    <span>
                      {t('join.expectedWait')}: ~<strong className="text-slate-900 font-bold">{wait}</strong> {t('common.min')}
                    </span>
                  )}
                </span>
              </div>
            )}
          </div>

          {submitError && (
            <p className="text-xs font-semibold text-rose-600 text-center flex items-center justify-center gap-1 animate-shake">
              <AlertCircleIcon className="w-4 h-4" />
              <span>{submitError}</span>
            </p>
          )}

          <button
            type="button"
            onClick={confirm}
            disabled={!canConfirm}
            className="w-full min-h-12 py-3 rounded-xl btn-primary font-bold text-base tracking-wide shadow-md shadow-indigo-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{t('join.confirm')}</span>
                <ChevronRightIcon className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
