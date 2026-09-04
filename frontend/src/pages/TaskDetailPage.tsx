import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, CalendarDays, Pencil, UserRound } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { taskApi } from '../api/tasks'
import { workspaceApi } from '../api/workspaces'
import { PageHeader } from '../components/PageHeader'
import { PriorityBadge, StatusBadge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { ErrorState, PageSkeleton } from '../components/ui/States'
import { useWorkspaceAccess } from '../hooks/useWorkspaceAccess'
import { useLanguage } from '../context/LanguageContext'
import { errorMessage, formatDate, isOverdue } from '../utils/format'
import { TaskFormModal } from './TasksPage'

export function TaskDetailPage() {
  const { t } = useLanguage()
  const workspaceId = Number(useParams().workspaceId)
  const projectId = Number(useParams().projectId)
  const taskId = Number(useParams().taskId)
  const [editOpen, setEditOpen] = useState(false)
  const access = useWorkspaceAccess(workspaceId)
  const query = useQuery({ queryKey: ['task', projectId, taskId], queryFn: () => taskApi.get(projectId, taskId) })
  const members = useQuery({ queryKey: ['members', workspaceId], queryFn: () => workspaceApi.members(workspaceId) })
  if (query.isLoading) return <PageSkeleton/>
  if (query.isError || !query.data) return <ErrorState message={errorMessage(query.error)} onRetry={() => query.refetch()}/>
  const task = query.data
  const assignee = members.data?.find((member) => member.user_id === task.assigned_to)
  return <><Link to={`/app/workspaces/${workspaceId}/projects/${projectId}/tasks`} className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-cobalt-600"><ArrowLeft size={17}/>{t('Back to tasks')}</Link><PageHeader eyebrow={t('Task')} title={task.title} actions={access.can('task:update') ? <Button onClick={() => setEditOpen(true)}><Pencil size={17}/>{t('Edit task')}</Button> : undefined}/><div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]"><section className="surface p-5 sm:p-6"><h2 className="font-bold text-slate-900 dark:text-white">{t('Description')}</h2><p className="mt-3 whitespace-pre-wrap leading-7 text-slate-600 dark:text-slate-300">{task.desc || t('No description has been added for this task.')}</p></section><aside className="surface p-5"><h2 className="font-bold text-slate-900 dark:text-white">{t('Details')}</h2><dl className="mt-5 space-y-5"><div><dt className="text-sm text-slate-400">{t('Status')}</dt><dd className="mt-2"><StatusBadge status={task.status}/></dd></div><div><dt className="text-sm text-slate-400">{t('Priority')}</dt><dd className="mt-2"><PriorityBadge priority={task.priority}/></dd></div><div><dt className="text-sm text-slate-400">{t('Assignee')}</dt><dd className="mt-2 flex items-center gap-2 font-medium"><UserRound size={17} className="text-slate-400"/>{assignee?.username ?? t('Unassigned')}</dd></div><div><dt className="text-sm text-slate-400">{t('Due date')}</dt><dd className={`mt-2 flex items-center gap-2 font-medium ${isOverdue(task.due_date, task.status) ? 'text-rose-600' : ''}`}><CalendarDays size={17}/>{t(formatDate(task.due_date))}</dd></div></dl></aside></div><TaskFormModal open={editOpen} onClose={() => setEditOpen(false)} projectId={projectId} workspaceId={workspaceId} task={task}/></>
}
