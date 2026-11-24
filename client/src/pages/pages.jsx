import { Link } from 'react-router-dom'
import { useT } from '../i18n/index.jsx'
import { AlertCircleIcon, ChevronLeftIcon } from '../components/Icons.jsx'

export const NotFound = () => {
  const { t } = useT()
  return (
    <div className="max-w-md mx-auto saas-card p-8 text-center space-y-4 border border-slate-200 shadow-sm my-10">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
        <AlertCircleIcon className="w-8 h-8" />
      </div>
      <div className="space-y-1">
        <div className="text-4xl font-black text-indigo-600">404</div>
        <h1 className="text-xl font-bold text-slate-900">{t('screens.notFound')}</h1>
        <p className="text-xs text-slate-500">The requested page does not exist or has moved.</p>
      </div>
      <div className="pt-2">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl btn-primary text-xs font-semibold shadow-xs"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          <span>{t('common.backHome')}</span>
        </Link>
      </div>
    </div>
  )
}
