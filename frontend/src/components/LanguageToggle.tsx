import { Languages } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'

export function LanguageToggle({ compact = false }: { compact?: boolean }) {
  const { language, setLanguage } = useLanguage()
  const next = language === 'en' ? 'ar' : 'en'
  return <button type="button" onClick={() => setLanguage(next)} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl px-3 text-sm font-bold text-slate-500 transition hover:bg-cobalt-50 hover:text-cobalt-700 dark:text-slate-300 dark:hover:bg-zinc-800" aria-label={language === 'en' ? 'العربية' : 'English'}><Languages size={18}/>{!compact && <span>{language === 'en' ? 'العربية' : 'EN'}</span>}</button>
}
