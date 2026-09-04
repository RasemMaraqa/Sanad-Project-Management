import { AlertTriangle, Inbox, LoaderCircle } from 'lucide-react'
import type { ReactNode } from 'react'
import { useLanguage } from '../../context/LanguageContext'

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  const { t } = useLanguage()
  return <div className="surface flex min-h-52 flex-col items-center justify-center gap-3 p-8 text-slate-500"><LoaderCircle className="animate-spin text-cobalt-600" size={28} /><p className="text-sm font-medium">{t(label)}</p></div>
}

export function PageSkeleton() {
  return <div className="space-y-5 animate-pulse"><div className="h-9 w-52 rounded-lg bg-slate-200 dark:bg-slate-800"/><div className="grid gap-4 md:grid-cols-3"><div className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-800"/><div className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-800"/><div className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-800"/></div><div className="h-72 rounded-2xl bg-slate-200 dark:bg-slate-800"/></div>
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  const { t } = useLanguage()
  return <div className="surface flex min-h-56 flex-col items-center justify-center p-8 text-center"><div className="mb-4 rounded-2xl bg-slate-100 p-3 text-slate-500 dark:bg-zinc-800"><Inbox size={25}/></div><h3 className="font-bold text-slate-900 dark:text-white">{t(title)}</h3><p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">{t(description)}</p>{action && <div className="mt-5">{action}</div>}</div>
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const { t } = useLanguage()
  return <div className="surface flex min-h-48 flex-col items-center justify-center p-8 text-center"><AlertTriangle className="mb-3 text-rose-500"/><h3 className="font-bold text-slate-900 dark:text-white">{t('We couldn’t load this page')}</h3><p className="mt-1 text-sm text-slate-500">{message}</p>{onRetry && <button onClick={onRetry} className="mt-4 text-sm font-semibold text-cobalt-600 hover:underline">{t('Try again')}</button>}</div>
}
