import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'

export function NotFoundPage() {
  const { t } = useLanguage()
  return <main className="flex min-h-screen items-center justify-center bg-cloud p-5 dark:bg-zinc-950"><div className="max-w-md text-center"><p className="text-sm font-bold uppercase tracking-[.2em] text-cobalt-600">404</p><h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 dark:text-white">{t('This page is off the map')}</h1><p className="mt-3 text-slate-500">{t('The page may have moved, or the address may be incorrect.')}</p><Link to="/app/dashboard" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-cobalt-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-cobalt-700"><ArrowLeft size={17}/>{t('Back to dashboard')}</Link></div></main>
}
