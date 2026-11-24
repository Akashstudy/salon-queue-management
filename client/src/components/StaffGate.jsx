import { useEffect, useState } from 'react'
import { useT } from '../i18n/index.jsx'
import { clearStaffPin, getStaffPin, postJson, setStaffPin } from '../api.js'
import { KeyIcon, LockIcon, AlertCircleIcon } from './Icons.jsx'

export default function StaffGate({ children }) {
  const { t } = useT()
  const [state, setState] = useState('checking') // checking | locked | open
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const saved = getStaffPin()
    if (!saved) {
      setState('locked')
      return
    }
    postJson('/api/staff/check', { pin: saved })
      .then(() => setState('open'))
      .catch((err) => {
        if (err.status === 401) clearStaffPin()
        setState('locked')
      })
  }, [])

  async function handleUnlock(pinToTry) {
    const candidate = pinToTry || pin
    if (candidate.length !== 4 || busy) return
    setBusy(true)
    setError('')
    try {
      await postJson('/api/staff/check', { pin: candidate })
      setStaffPin(candidate)
      setState('open')
    } catch (err) {
      setError(err.status === 401 ? t('pin.wrong') : t('common.serverError'))
      setPin('')
    }
    setBusy(false)
  }

  function handleKeyPress(digit) {
    if (pin.length < 4) {
      const nextPin = pin + digit
      setPin(nextPin)
      setError('')
      if (nextPin.length === 4) {
        handleUnlock(nextPin)
      }
    }
  }

  function handleDelete() {
    setPin((prev) => prev.slice(0, -1))
    setError('')
  }

  function handleFillDemo() {
    setPin('2468')
    setError('')
    handleUnlock('2468')
  }

  if (state === 'open') return children

  if (state === 'checking') {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <div className="h-9 w-9 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-xs font-medium text-slate-500">{t('common.loading')}</p>
      </div>
    )
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 sm:p-8 space-y-6 border border-slate-200 shadow-md relative overflow-hidden">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
            <LockIcon className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{t('pin.title')}</h1>
          <p className="text-xs text-slate-500">{t('pin.label')}</p>
        </div>

        {/* PIN Dots Display */}
        <div className="flex justify-center gap-3 py-1">
          {[0, 1, 2, 3].map((index) => {
            const isFilled = pin.length > index
            return (
              <div
                key={index}
                className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                  isFilled
                    ? 'bg-indigo-600 scale-110 shadow-xs'
                    : 'bg-slate-200 border border-slate-300'
                }`}
              />
            )
          })}
        </div>

        {/* Keyboard Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleUnlock()
          }}
          className="space-y-4"
        >
          <input
            id="pin"
            type="password"
            inputMode="numeric"
            autoComplete="off"
            maxLength={4}
            value={pin}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 4)
              setPin(val)
              setError('')
              if (val.length === 4) handleUnlock(val)
            }}
            placeholder="••••"
            className="saas-input text-center tracking-[0.5em] text-2xl font-mono text-indigo-700 font-bold"
          />

          {error && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold text-center flex items-center justify-center gap-1.5 animate-shake">
              <AlertCircleIcon className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Touch Number Pad for tablet / phone */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleKeyPress(String(digit))}
                disabled={busy}
                className="h-12 rounded-xl bg-slate-50 hover:bg-slate-100 active:bg-indigo-50 active:text-indigo-600 font-bold text-lg text-slate-800 transition-colors border border-slate-200 flex items-center justify-center focus:outline-none"
              >
                {digit}
              </button>
            ))}
            <button
              type="button"
              onClick={handleDelete}
              disabled={busy}
              className="h-12 rounded-xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-sm font-semibold text-slate-500 transition-colors border border-slate-200 flex items-center justify-center"
              aria-label="Delete"
            >
              ⌫
            </button>
            <button
              type="button"
              onClick={() => handleKeyPress('0')}
              disabled={busy}
              className="h-12 rounded-xl bg-slate-50 hover:bg-slate-100 active:bg-indigo-50 active:text-indigo-600 font-bold text-lg text-slate-800 transition-colors border border-slate-200 flex items-center justify-center"
            >
              0
            </button>
            <button
              type="button"
              onClick={() => setPin('')}
              disabled={busy}
              className="h-12 rounded-xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-xs font-semibold text-slate-500 transition-colors border border-slate-200 flex items-center justify-center"
              aria-label="Clear"
            >
              C
            </button>
          </div>

          {/* Quick Demo Autofill Pill */}
          <div className="pt-1 text-center">
            <button
              type="button"
              onClick={handleFillDemo}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-xs font-semibold text-indigo-700 transition-colors"
            >
              <KeyIcon className="w-3.5 h-3.5 text-indigo-500" />
              <span>Fill Demo PIN (2468)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
