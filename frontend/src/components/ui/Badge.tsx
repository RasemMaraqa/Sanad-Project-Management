import type { ReactNode } from 'react'
import type { TaskPriority, TaskStatus } from '../../types'
import { priorityLabel } from '../../utils/format'
import { useLanguage } from '../../context/LanguageContext'

export function Badge({ children, tone = 'slate' }: { children: ReactNode; tone?: 'slate' | 'amber' | 'green' | 'red' | 'violet' }) {
  const tones = {
    slate: 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-slate-200',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
    green: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    red: 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
    violet: 'bg-cobalt-50 text-cobalt-700 dark:bg-zinc-800 dark:text-cobalt-300',
  }
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}>{children}</span>
}

export function StatusBadge({ status }: { status: TaskStatus }) {
  const { t } = useLanguage()
  return <Badge tone={status === 'Done' ? 'green' : status === 'In Progress' ? 'amber' : 'slate'}>{t(status)}</Badge>
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const { t } = useLanguage()
  return <Badge tone={priority === '5' ? 'red' : priority === '4' ? 'amber' : priority === '1' ? 'slate' : 'violet'}>{t(priorityLabel[priority])}</Badge>
}
