import { CheckCircle2, CircleAlert, X } from 'lucide-react'
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { useLanguage } from './LanguageContext'

type Toast = { id: number; message: string; tone: 'success' | 'error' }
type ToastContextValue = { showToast: (message: string, tone?: Toast['tone']) => void }
const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const { language, t } = useLanguage()
  const [toasts, setToasts] = useState<Toast[]>([])
  const remove = useCallback((id: number) => setToasts((items) => items.filter((item) => item.id !== id)), [])
  const showToast = useCallback((message: string, tone: Toast['tone'] = 'success') => {
    const id = Date.now() + Math.random()
    setToasts((items) => [...items, { id, message, tone }])
    window.setTimeout(() => remove(id), 4500)
  }, [remove])
  const value = useMemo(() => ({ showToast }), [showToast])
  return <ToastContext.Provider value={value}>{children}<div className={`fixed top-4 z-[70] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2 ${language === 'ar' ? 'left-4' : 'right-4'}`} aria-live="polite">{toasts.map((toast) => <div key={toast.id} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">{toast.tone === 'success' ? <CheckCircle2 className="shrink-0 text-emerald-500" size={20}/> : <CircleAlert className="shrink-0 text-rose-500" size={20}/>}<p className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-200">{t(toast.message)}</p><button onClick={() => remove(toast.id)} aria-label="Dismiss notification" className="text-slate-400 hover:text-slate-700"><X size={18}/></button></div>)}</div></ToastContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const value = useContext(ToastContext)
  if (!value) throw new Error('useToast must be used within ToastProvider')
  return value
}
