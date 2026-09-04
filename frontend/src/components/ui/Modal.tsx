import { X } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'
import { Button } from './Button'
import { useLanguage } from '../../context/LanguageContext'

export function Modal({ open, onClose, title, description, children, size = 'md' }: { open: boolean; onClose: () => void; title: string; description?: string; children: ReactNode; size?: 'sm' | 'md' | 'lg' }) {
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [open, onClose])
  if (!open) return null
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-5" onMouseDown={(e) => { if (e.currentTarget === e.target) onClose() }}>
    <section role="dialog" aria-modal="true" aria-labelledby="modal-title" className={`max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl dark:bg-zinc-900 sm:rounded-2xl sm:p-6 ${size === 'sm' ? 'sm:max-w-md' : size === 'lg' ? 'sm:max-w-3xl' : 'sm:max-w-xl'}`}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div><h2 id="modal-title" className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>{description && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>}</div>
        <Button variant="ghost" className="h-10 w-10 shrink-0 !p-0" onClick={onClose} aria-label="Close dialog"><X size={19} /></Button>
      </div>
      {children}
    </section>
  </div>
}

export function ConfirmDialog({ open, onClose, onConfirm, title, description, busy }: { open: boolean; onClose: () => void; onConfirm: () => void; title: string; description: string; busy?: boolean }) {
  const { t } = useLanguage()
  return <Modal open={open} onClose={onClose} title={title} description={description} size="sm">
    <div className="flex justify-end gap-3"><Button variant="secondary" onClick={onClose} disabled={busy}>{t('Cancel')}</Button><Button variant="danger" onClick={onConfirm} disabled={busy}>{busy ? t('Deleting…') : t('Delete')}</Button></div>
  </Modal>
}
