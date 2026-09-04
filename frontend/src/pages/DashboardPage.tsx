import { useQueries, useQuery } from '@tanstack/react-query'
import { CheckCircle2, CircleDotDashed, FolderKanban, LayoutDashboard, ListTodo, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { projectApi } from '../api/projects'
import { taskApi } from '../api/tasks'
import { workspaceApi } from '../api/workspaces'
import { PageHeader } from '../components/PageHeader'
import { Button } from '../components/ui/Button'
import { EmptyState, ErrorState, PageSkeleton } from '../components/ui/States'
import { errorMessage } from '../utils/format'
import { useLanguage } from '../context/LanguageContext'

export function DashboardPage() {
  const { t } = useLanguage()
  const workspaces = useQuery({ queryKey: ['workspaces'], queryFn: workspaceApi.list })
  const projectQueries = useQueries({ queries: (workspaces.data ?? []).map((workspace) => ({ queryKey: ['projects', workspace.id], queryFn: () => projectApi.list(workspace.id) })) })
  const projects = projectQueries.flatMap((query) => query.data ?? [])
  const taskQueries = useQueries({ queries: projects.flatMap((project) => [
    { queryKey: ['dashboard-tasks', project.id, 'total'], queryFn: () => taskApi.list(project.id, { page: 1, limit: 1 }) },
    { queryKey: ['dashboard-tasks', project.id, 'done'], queryFn: () => taskApi.list(project.id, { status: 'Done', page: 1, limit: 1 }) },
  ]) })
  const loading = workspaces.isLoading || projectQueries.some((query) => query.isLoading) || taskQueries.some((query) => query.isLoading)
  const failed = workspaces.error || projectQueries.find((query) => query.error)?.error || taskQueries.find((query) => query.error)?.error
  if (loading) return <PageSkeleton/>
  if (failed) return <ErrorState message={errorMessage(failed)} onRetry={() => workspaces.refetch()}/>
  const taskTotals = projects.map((project, index) => ({ project, total: taskQueries[index * 2]?.data?.total ?? 0, done: taskQueries[index * 2 + 1]?.data?.total ?? 0 }))
  const totalTasks = taskTotals.reduce((sum, item) => sum + item.total, 0)
  const completed = taskTotals.reduce((sum, item) => sum + item.done, 0)
  const stats = [
    { label: t('Workspaces'), value: workspaces.data?.length ?? 0, icon: LayoutDashboard, tone: 'bg-cobalt-50 text-cobalt-600 dark:bg-cobalt-950' },
    { label: t('Projects'), value: projects.length, icon: FolderKanban, tone: 'bg-violet-50 text-violet-600 dark:bg-violet-950' },
    { label: t('Open tasks'), value: totalTasks - completed, icon: CircleDotDashed, tone: 'bg-amber-50 text-amber-600 dark:bg-amber-950' },
    { label: t('Completed'), value: completed, icon: CheckCircle2, tone: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950' },
  ]
  return <><PageHeader eyebrow={t('Good to see you')} title={t('Dashboard')} description={t('A live summary of the work you can access.')} actions={<Link to="/app/workspaces"><Button><Plus size={18}/>{t('New workspace')}</Button></Link>}/>{(workspaces.data?.length ?? 0) === 0 ? <EmptyState title="Your dashboard is ready" description="Create a workspace to begin tracking projects, tasks, and team progress." action={<Link to="/app/workspaces"><Button>{t('Create workspace')}</Button></Link>}/> : <><div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{stats.map(({ label, value, icon: Icon, tone }) => <div className="surface p-4 sm:p-5" key={label}><div className={`mb-4 inline-flex rounded-xl p-2.5 ${tone}`}><Icon size={20}/></div><p className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">{value}</p><p className="mt-1 text-sm font-medium text-slate-500">{label}</p></div>)}</div><section className="surface mt-5 overflow-hidden"><div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-zinc-800"><div><h2 className="font-bold text-slate-900 dark:text-white">{t('Project workload')}</h2><p className="text-sm text-slate-500">{t('Task progress across accessible projects')}</p></div><ListTodo className="text-slate-300"/></div>{taskTotals.length === 0 ? <div className="p-5"><EmptyState title="No projects yet" description="Open a workspace and create a project to see workload here."/></div> : <div className="divide-y divide-slate-100 dark:divide-zinc-800">{taskTotals.slice(0, 8).map(({ project, total, done }) => { const percent = total ? Math.round(done / total * 100) : 0; return <Link key={project.id} to={`/app/workspaces/${project.workspace_id}/projects/${project.id}`} className="grid gap-3 px-5 py-4 transition hover:bg-cobalt-50/50 dark:hover:bg-zinc-800/60 sm:grid-cols-[minmax(0,1fr)_8rem_3rem] sm:items-center"><div><p className="font-semibold text-slate-900 dark:text-white">{project.name}</p><p className="truncate text-sm text-slate-500">{project.desc || t('No description')}</p></div><div><div className="mb-1 flex justify-between text-xs text-slate-400"><span>{done}/{total} {t('done')}</span><span>{percent}%</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800"><div className="h-full rounded-full bg-cobalt-500" style={{ width: `${percent}%` }}/></div></div><span className="text-end text-sm font-semibold text-slate-500">{total}</span></Link>})}</div>}</section></>}</>
}
