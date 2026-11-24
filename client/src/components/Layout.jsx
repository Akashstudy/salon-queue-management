import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useT } from '../i18n/index.jsx'
import {
  ScissorsIcon,
  TvIcon,
  LayoutDashboardIcon,
  UserIcon,
  ShieldIcon,
  KeyIcon,
  CheckIcon,
} from './Icons.jsx'

function LangToggle() {
  const { lang, setLang, t } = useT()
  return (
    <div
      className="inline-flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200/80"
      role="group"
      aria-label={t('language')}
    >
      <button
        type="button"
        onClick={() => setLang('en')}
        aria-pressed={lang === 'en'}
        className={`min-h-8 px-3 rounded-lg text-xs font-bold transition-all duration-150 flex items-center justify-center ${
          lang === 'en'
            ? 'bg-white text-indigo-600 shadow-xs border border-slate-200/60'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLang('gu')}
        aria-pressed={lang === 'gu'}
        className={`min-h-8 px-3 rounded-lg text-xs font-bold transition-all duration-150 flex items-center justify-center ${
          lang === 'gu'
            ? 'bg-white text-indigo-600 shadow-xs border border-slate-200/60'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        ગુ
      </button>
    </div>
  )
}

export default function Layout() {
  const { t } = useT()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [pinCopied, setPinCopied] = useState(false)

  // Clean presentation without top nav clutter on public lounge display
  const isTvDisplay = location.pathname === '/display'

  const navLinks = [
    { to: '/', label: t('nav.customer'), icon: UserIcon },
    { to: '/display', label: t('nav.tv'), icon: TvIcon },
    { to: '/reception', label: t('nav.reception'), icon: LayoutDashboardIcon },
    { to: '/barber/ravi', label: t('nav.barber'), icon: ScissorsIcon },
    { to: '/admin', label: t('nav.admin'), icon: ShieldIcon },
  ]

  function copyPin() {
    try {
      navigator.clipboard?.writeText('2468')
      setPinCopied(true)
      setTimeout(() => setPinCopied(false), 2000)
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top SaaS Header */}
      <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand Identity */}
          <Link
            to="/"
            className="flex items-center gap-3 group focus:outline-none"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="h-10 w-10 rounded-xl bg-blue-950 flex items-center justify-center text-white shadow-xs group-hover:bg-indigo-600 transition-colors duration-200">
              <ScissorsIcon className="w-5 h-5 text-indigo-300 group-hover:text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {t('salonName')}
                </span>
                <span className="hidden sm:inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-[11px] font-medium text-slate-500 tracking-wide">
                {t('nav.tagline')}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          {!isTvDisplay && (
            <nav className="hidden md:flex items-center gap-1 bg-slate-100/70 p-1 rounded-xl border border-slate-200/60">
              {navLinks.map((item) => {
                const Icon = item.icon
                const isActive =
                  item.to === '/'
                    ? location.pathname === '/' ||
                      location.pathname.startsWith('/join') ||
                      location.pathname.startsWith('/status')
                    : location.pathname.startsWith(item.to.replace('/ravi', ''))
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                      isActive
                        ? 'bg-white text-indigo-600 shadow-xs border border-slate-200/70'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{item.label}</span>
                  </NavLink>
                )
              })}
            </nav>
          )}

          {/* Right Header Items */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Clickable Demo PIN copy badge */}
            <button
              type="button"
              onClick={copyPin}
              title="Click to copy staff PIN"
              className="hidden lg:flex items-center gap-1.5 text-xs text-slate-600 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 px-3 py-1.5 rounded-xl border border-slate-200 transition-colors"
            >
              {pinCopied ? (
                <>
                  <CheckIcon className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">PIN Copied!</span>
                </>
              ) : (
                <>
                  <KeyIcon className="w-3.5 h-3.5 text-indigo-500" />
                  <span>PIN: <strong className="text-slate-900 font-mono font-bold">2468</strong></span>
                </>
              )}
            </button>

            <LangToggle />

            {!isTvDisplay && (
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden min-h-10 min-w-10 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 flex items-center justify-center transition-colors"
                aria-label="Toggle navigation"
                aria-expanded={mobileMenuOpen}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {!isTvDisplay && mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1 animate-fadeIn shadow-lg">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
              {t('nav.switchRole')}
            </div>
            {navLinks.map((item) => {
              const Icon = item.icon
              const isActive =
                item.to === '/'
                  ? location.pathname === '/' ||
                    location.pathname.startsWith('/join') ||
                    location.pathname.startsWith('/status')
                  : location.pathname.startsWith(item.to.replace('/ravi', ''))
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`min-h-11 flex items-center gap-3 px-3.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-600 font-bold border border-indigo-100'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4 text-indigo-500" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
            <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 px-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <KeyIcon className="w-3.5 h-3.5 text-indigo-500" />
                <span>Staff PIN: <strong className="text-slate-900 font-mono font-bold">2468</strong></span>
              </span>
              <button
                type="button"
                onClick={copyPin}
                className="text-xs font-bold text-indigo-600 hover:underline"
              >
                {pinCopied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Outlet />
      </main>

      {/* Modern Clean Footer */}
      {!isTvDisplay && (
        <footer className="w-full border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">{t('salonName')}</span>
              <span>•</span>
              <span className="text-slate-500">{t('nav.tagline')}</span>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>Live Sync Active</span>
              </span>
              <span>•</span>
              <span>Staff PIN: <strong className="text-slate-700 font-mono">2468</strong></span>
            </div>
          </div>
        </footer>
      )}
    </div>
  )
}
