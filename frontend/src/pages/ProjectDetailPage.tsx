import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, CircleDotDashed, ListTodo, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { projectApi } from '../api/projects'
import { taskApi } from '../api/tasks'
import { PageHeader } from '../components/PageHeader'
import { Button } from '../components/ui/Button'
import { ErrorState, PageSkeleton } from '../components/ui/States'
import { useWorkspaceAccess } from '../hooks/useWorkspaceAccess'
import { TaskFormModal, TaskTable } from './TasksPage'
import { errorMessage } from '../utils/format'
import { useLanguage } from '../context/LanguageContext'

export function ProjectDetailPage() {
  const { t } = useLanguage()
  const workspaceId = Number(useParams().workspaceId)
  const projectId = Number(useParams().projectId)
  const access = useWorkspaceAccess(workspaceId)
  const [createOpen, setCreateOpen] = useState(false)
  const projects = useQuery({ queryKey: ['projects', workspaceId], queryFn: () => projectApi.list(workspaceId) })
  const tasks = useQuery({ queryKey: ['tasks', projectId, {}], queryFn: () => taskApi.list(projectId, { page: 1, limit: 100 }) })
  const project = projects.data?.find((item) => item.id === projectId)
  const stats = useMemo(() => { const items = tasks.data?.items ?? []; return { total: tasks.data?.total ?? 0, active: items.filter((t) => t.status === 'In Progress').length, done: items.filter((t) => t.status === 'Done').length } }, [tasks.data])
  if (projects.isLoading || tasks.isLoading) return <PageSkeleton/>
  if (projects.isError || tasks.isError) return <ErrorState message={errorMessage(projects.error || tasks.error)} onRetry={() => { projects.refetch(); tasks.refetch() }}/>
  if (!project) return <Navigate to={`/app/workspaces/${workspaceId}/projects`} replace/>
  return <><PageHeader eyebrow={t('Project')} title={project.name} description={project.desc || t('No project description has been added.')} actions={access.can('task:create') ? <Button onClick={() => setCreateOpen(true)}><Plus size={18}/>{t('New task')}</Button> : undefined}/><div className="mb-6 grid gap-4 sm:grid-cols-3"><Stat label={t('All tasks')} value={stats.total} icon={ListTodo} tone="violet"/><Stat label={t('In progress')} value={stats.active} icon={CircleDotDashed} tone="amber"/><Stat label={t('Completed')} value={stats.done} icon={CheckCircle2} tone="green"/></div><TaskTable projectId={projectId} workspaceId={workspaceId} compact onCreate={() => setCreateOpen(true)}/><TaskFormModal open={createOpen} onClose={() => setCreateOpen(false)} projectId={projectId} workspaceId={workspaceId}/></>
}

function Stat({ label, value, icon: Icon, tone }: { label: string; value: number; icon: typeof ListTodo; tone: 'violet' | 'amber' | 'green' }) {
  const colors = { violet: 'bg-cobalt-50 text-cobalt-600 dark:bg-cobalt-950', amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950', green: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950' }
  return <div className="surface flex items-center gap-4 p-5"><div className={`rounded-xl p-3 ${colors[tone]}`}><Icon size={21}/></div><div><p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p><p className="text-sm text-slate-500">{label}</p></div></div>
}
