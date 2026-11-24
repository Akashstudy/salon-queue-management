import { useEffect, useState } from 'react'
import { useT } from '../i18n/index.jsx'
import { api, clearStaffPin, postJson } from '../api.js'
import { usePolling } from '../usePolling.js'
import StaffGate from '../components/StaffGate.jsx'
import {
  ScissorsIcon,
  ClockIcon,
  UserIcon,
  PlusIcon,
  EditIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  XMarkIcon,
  SparklesIcon,
} from '../components/Icons.jsx'

const KNOWN_ERRORS = ['finish_first', 'invalid_name', 'invalid_minutes', 'invalid_price', 'not_found']

function SwitchToggle({ on, onClick, disabled, label, onText, offText }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={`min-h-8 px-3.5 py-1 rounded-full text-xs font-semibold border transition-all duration-150 flex items-center gap-1.5 disabled:opacity-40 ${
        on
          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
          : 'bg-slate-100 border-slate-200 text-slate-600'
      }`}
    >
      <span className={`w-2 h-2 rounded-full ${on ? 'bg-emerald-500' : 'bg-slate-400'}`} />
      <span>{on ? onText : offText}</span>
    </button>
  )
}

function StatCard({ label, value, icon: Icon, note }) {
  return (
    <div className="saas-card p-5 border border-slate-200 space-y-2 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {label}
        </span>
        <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div>
        <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {value}
        </div>
        {note && <p className="text-xs text-slate-400 mt-0.5">{note}</p>}
      </div>
    </div>
  )
}

function ServiceFormModal({ service, onClose, onSaved }) {
  const { t } = useT()
  const editing = Boolean(service)
  const [en, setEn] = useState(service?.name.en ?? '')
  const [gu, setGu] = useState(service?.name.gu ?? '')
  const [minutes, setMinutes] = useState(service ? String(service.minutes) : '')
  const [price, setPrice] = useState(service ? String(service.price) : '')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const m = Number(minutes)
  const p = Number(price)
  const problem =
    !en.trim() || !gu.trim()
      ? 'invalid_name'
      : !Number.isInteger(m) || minutes === '' || m < 5 || m > 180
        ? 'invalid_minutes'
        : !Number.isInteger(p) || price === '' || p < 0 || p > 5000
          ? 'invalid_price'
          : null

  async function submit(e) {
    e.preventDefault()
    if (problem) {
      setError(t(`admin.err.${problem}`))
      return
    }
    setBusy(true)
    setError('')
    const body = { name: { en: en.trim(), gu: gu.trim() }, minutes: m, price: p }
    try {
      if (editing) {
        await api(`/api/admin/services/${service.id}`, {
          method: 'PUT',
          body: JSON.stringify(body),
          staff: true,
        })
      } else {
        await postJson('/api/admin/services', body, { staff: true })
      }
      onSaved()
    } catch (err) {
      setError(KNOWN_ERRORS.includes(err.code) ? t(`admin.err.${err.code}`) : t('admin.err.generic'))
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
        className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 space-y-4 border border-slate-200 shadow-xl"
      >
        <div className="flex items-center justify-between pb-2 border-b border-slate-150">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ScissorsIcon className="w-5 h-5 text-indigo-600" />
            <span>{editing ? t('admin.editService') : t('admin.addService')}</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="sv-en" className="text-xs font-semibold text-slate-700">
            {t('admin.nameEn')}
          </label>
          <input
            id="sv-en"
            value={en}
            maxLength={40}
            onChange={(e) => setEn(e.target.value)}
            placeholder="e.g. Premium Haircut"
            className="saas-input"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="sv-gu" className="text-xs font-semibold text-slate-700">
            {t('admin.nameGu')}
          </label>
          <input
            id="sv-gu"
            value={gu}
            maxLength={40}
            onChange={(e) => setGu(e.target.value)}
            placeholder="દા.ત. પ્રીમિયમ હેરકટ"
            className="saas-input"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label htmlFor="sv-min" className="text-xs font-semibold text-slate-700">
              {t('admin.minutes')} (5–180)
            </label>
            <input
              id="sv-min"
              type="number"
              inputMode="numeric"
              min="5"
              max="180"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              className="saas-input"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="sv-price" className="text-xs font-semibold text-slate-700">
              {t('admin.price')} ₹ (0–5000)
            </label>
            <input
              id="sv-price"
              type="number"
              inputMode="numeric"
              min="0"
              max="5000"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="saas-input"
            />
          </div>
        </div>

        {error && <p className="text-xs font-semibold text-rose-600 text-center animate-shake">{error}</p>}

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
            disabled={busy}
            className="flex-1 min-h-11 py-2 rounded-xl btn-primary text-xs disabled:opacity-40"
          >
            {busy ? 'Saving…' : t('admin.save')}
          </button>
        </div>
      </form>
    </div>
  )
}

function Panel() {
  const { t, lang } = useT()
  const { data, error, reload } = usePolling('/api/admin', { staff: true })
  const [modalService, setModalService] = useState(null)
  const [actionError, setActionError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (error?.status === 401) {
      clearStaffPin()
      window.location.reload()
    }
  }, [error])

  async function handleQueueToggle(open) {
    setBusy(true)
    setActionError('')
    try {
      await postJson('/api/admin/queue', { open }, { staff: true })
      reload()
    } catch {
      setActionError(t('admin.err.generic'))
    }
    setBusy(false)
  }

  async function handleDutyToggle(barberId, onDuty) {
    setBusy(true)
    setActionError('')
    try {
      await postJson(`/api/admin/barbers/${barberId}/duty`, { onDuty }, { staff: true })
      reload()
    } catch (err) {
      setActionError(t(`admin.err.${err.code}`) || t('admin.err.generic'))
    }
    setBusy(false)
  }

  async function handleServiceToggle(service, on) {
    setBusy(true)
    setActionError('')
    try {
      await api(`/api/admin/services/${service.id}`, {
        method: 'PUT',
        body: JSON.stringify({ on }),
        staff: true,
      })
      reload()
    } catch {
      setActionError(t('admin.err.generic'))
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

  const { settings, services, barbers, stats } = data

  return (
    <div className="space-y-6">
      {/* Top Header & Queue Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>{t('screens.admin')}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Salon Configuration & Live Analytics
          </p>
        </div>

        {/* Master Queue Switch */}
        <div className="flex items-center gap-3 p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-right">
            <span className="text-xs font-bold text-slate-900 block">{t('admin.queueSwitch')}</span>
            <span className="text-[11px] text-slate-400 block">{t('admin.queueHint')}</span>
          </div>
          <SwitchToggle
            on={settings.queueOpen}
            onClick={() => handleQueueToggle(!settings.queueOpen)}
            disabled={busy}
            label={t('admin.queueSwitch')}
            onText={t('admin.open')}
            offText={t('admin.closed')}
          />
        </div>
      </div>

      {actionError && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 animate-shake">
          <AlertCircleIcon className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <SparklesIcon className="w-3.5 h-3.5 text-indigo-600" />
          <span>{t('admin.stats')} (Today - IST)</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatCard
            label={t('admin.served')}
            value={stats.served}
            icon={CheckCircleIcon}
            note="Completed visits today"
          />
          <StatCard
            label={t('admin.avgWait')}
            value={stats.averageWait == null ? '—' : `${stats.averageWait} ${t('common.min')}`}
            icon={ClockIcon}
            note="Average wait time"
          />
          <StatCard
            label={t('admin.noShows')}
            value={stats.noShows}
            icon={AlertCircleIcon}
            note="No-shows registered"
          />
        </div>
      </div>

      {/* Stylists On Duty Today */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <UserIcon className="w-3.5 h-3.5 text-indigo-600" />
          <span>{t('admin.barbersOnDuty')}</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {barbers.map((b) => (
            <div
              key={b.id}
              className="saas-card p-4 flex items-center justify-between border border-slate-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-sm border border-indigo-100">
                  {b.name[0]}
                </div>
                <div>
                  <span className="font-bold text-slate-900 text-sm block">{b.name}</span>
                  <span className="text-xs text-slate-500 capitalize">
                    {t(`barberStatus.${b.status}`)}
                  </span>
                </div>
              </div>

              <SwitchToggle
                on={b.onDuty}
                onClick={() => handleDutyToggle(b.id, !b.onDuty)}
                disabled={busy}
                label={`${b.name} duty`}
                onText={t('admin.onDuty')}
                offText={t('admin.offDuty')}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Services Catalog Management */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <ScissorsIcon className="w-3.5 h-3.5 text-indigo-600" />
            <span>{t('admin.services')} ({services.length})</span>
          </h2>
          <button
            type="button"
            onClick={() => setModalService('new')}
            className="min-h-10 px-3.5 py-1.5 rounded-xl btn-primary text-xs font-semibold flex items-center gap-1.5 shadow-xs"
          >
            <PlusIcon className="w-3.5 h-3.5" />
            <span>{t('admin.addService')}</span>
          </button>
        </div>

        <div className="saas-card border border-slate-200 overflow-hidden shadow-xs">
          <div className="divide-y divide-slate-100">
            {services.map((s) => (
              <div
                key={s.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{s.name[lang]}</span>
                    <span className="text-xs text-slate-400">
                      ({s.name.en} / {s.name.gu})
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-3">
                    <span>
                      {s.minutes} {t('common.min')}
                    </span>
                    <span>•</span>
                    <span className="text-indigo-600 font-bold">₹{s.price}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <SwitchToggle
                    on={s.on}
                    onClick={() => handleServiceToggle(s, !s.on)}
                    disabled={busy}
                    label={`${s.name.en} active`}
                    onText={t('admin.on')}
                    offText={t('admin.off')}
                  />
                  <button
                    type="button"
                    onClick={() => setModalService(s)}
                    className="min-h-8 px-3 py-1.5 rounded-lg btn-secondary text-xs font-semibold flex items-center gap-1.5"
                  >
                    <EditIcon className="w-3.5 h-3.5 text-slate-500" />
                    <span>{t('admin.edit')}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add / Edit Service Modal */}
      {modalService && (
        <ServiceFormModal
          service={modalService === 'new' ? null : modalService}
          onClose={() => setModalService(null)}
          onSaved={() => {
            setModalService(null)
            reload()
          }}
        />
      )}
    </div>
  )
}

export default function Admin() {
  return (
    <StaffGate>
      <Panel />
    </StaffGate>
  )
}
