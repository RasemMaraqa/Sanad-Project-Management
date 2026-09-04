import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarDays, ChevronLeft, ChevronRight, Columns3, Filter, List, Pencil, Plus, Trash2, UserRound } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { projectApi } from '../api/projects'
import { taskApi } from '../api/tasks'
import { workspaceApi } from '../api/workspaces'
import { PageHeader } from '../components/PageHeader'
import { PriorityBadge, StatusBadge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { ConfirmDialog, Modal } from '../components/ui/Modal'
import { EmptyState, ErrorState, LoadingState } from '../components/ui/States'
import { useToast } from '../context/ToastContext'
import { useLanguage } from '../context/LanguageContext'
import { useWorkspaceAccess } from '../hooks/useWorkspaceAccess'
import type { Task, TaskInput, TaskListResponse, TaskPriority, TaskStatus, WorkspaceMember } from '../types'
import { dateTimeInput, errorMessage, formatDate, initials, isOverdue, priorityLabel } from '../utils/format'

const statuses: TaskStatus[] = ['To Do', 'In Progress', 'Done']
const priorities: TaskPriority[] = ['1', '2', '3', '4', '5']

export function TasksPage() {
  const { t } = useLanguage()
  const workspaceId = Number(useParams().workspaceId)
  const projectId = Number(useParams().projectId)
  const access = useWorkspaceAccess(workspaceId)
  const [createOpen, setCreateOpen] = useState(false)
  const workspace = useQuery({ queryKey: ['workspace', String(workspaceId)], queryFn: () => workspaceApi.get(workspaceId) })
  const projects = useQuery({ queryKey: ['projects', workspaceId], queryFn: () => projectApi.list(workspaceId) })
  const project = projects.data?.find((item) => item.id === projectId)
  if (projects.isLoading || workspace.isLoading) return <LoadingState label="Loading project…"/>
  if (projects.isError || workspace.isError) return <ErrorState message={errorMessage(projects.error ?? workspace.error)} onRetry={() => { projects.refetch(); workspace.refetch() }}/>
  if (!project) return <Navigate to={`/app/workspaces/${workspaceId}/projects`} replace/>
  return <><PageHeader eyebrow={`${t('Workspace')}: ${workspace.data?.name ?? '—'}  ·  ${t('Project')}: ${project.name}`} title={t('Tasks')} description={t('Track ownership, deadlines, status, and priority in one clear view.')} actions={access.can('task:create') ? <Button onClick={() => setCreateOpen(true)}><Plus size={18}/>{t('New task')}</Button> : undefined}/><TaskTable projectId={projectId} workspaceId={workspaceId} onCreate={() => setCreateOpen(true)}/><TaskFormModal open={createOpen} onClose={() => setCreateOpen(false)} projectId={projectId} workspaceId={workspaceId}/></>
}

export function TaskTable({ projectId, workspaceId, compact = false, onCreate }: { projectId: number; workspaceId: number; compact?: boolean; onCreate: () => void }) {
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const { t } = useLanguage()
  const access = useWorkspaceAccess(workspaceId)
  const [status, setStatus] = useState<TaskStatus | ''>('')
  const [priority, setPriority] = useState<TaskPriority | ''>('')
  const [page, setPage] = useState(1)
  const [view, setView] = useState<'list' | 'board'>(() => localStorage.getItem('task_view') === 'board' ? 'board' : 'list')
  const [editing, setEditing] = useState<Task | null>(null)
  const [deleting, setDeleting] = useState<Task | null>(null)
  const activeView = compact ? 'list' : view
  const limit = activeView === 'board' ? 100 : compact ? 8 : 10
  const query = useQuery({ queryKey: ['tasks', projectId, { status, priority, page, limit }], queryFn: () => taskApi.list(projectId, { status: status || undefined, priority: priority || undefined, page, limit }) })
  const members = useQuery({ queryKey: ['members', workspaceId], queryFn: () => workspaceApi.members(workspaceId) })
  const remove = useMutation({ mutationFn: (id: number) => taskApi.remove(projectId, id), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tasks', projectId] }); setDeleting(null); showToast('Task deleted.') }, onError: (e) => showToast(errorMessage(e), 'error') })
  useEffect(() => setPage(1), [status, priority])
  if (query.isLoading) return <LoadingState label="Loading tasks…"/>
  if (query.isError) return <ErrorState message={errorMessage(query.error)} onRetry={() => query.refetch()}/>
  const data = query.data!
  const pages = Math.max(1, Math.ceil(data.total / limit))
  const memberMap = new Map((members.data ?? []).map((member) => [member.user_id, member]))
  const switchView = (next: 'list' | 'board') => {
    setView(next)
    localStorage.setItem('task_view', next)
    if (next === 'board') setStatus('')
    setPage(1)
  }
  return <section className="surface overflow-hidden">
    <div className="flex flex-col gap-3 border-b border-slate-200 p-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200"><Filter size={17} className="text-cobalt-600"/>{t('Filters')}</div>
        {!compact && <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800" aria-label="Task view">
          <button type="button" onClick={() => switchView('list')} className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${activeView === 'list' ? 'bg-white text-ink shadow-sm dark:bg-zinc-700 dark:text-white' : 'text-slate-500'}`}><List size={15}/>{t('List')}</button>
          <button type="button" onClick={() => switchView('board')} className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${activeView === 'board' ? 'bg-white text-ink shadow-sm dark:bg-zinc-700 dark:text-white' : 'text-slate-500'}`}><Columns3 size={15}/>{t('Board')}</button>
        </div>}
      </div>
      <div className="grid grid-cols-2 gap-2 sm:flex">
        {activeView === 'list' && <select aria-label="Filter by status" className="field min-w-0 !py-2 sm:w-40" value={status} onChange={(e) => setStatus(e.target.value as TaskStatus | '')}><option value="">{t('All statuses')}</option>{statuses.map((value) => <option key={value} value={value}>{t(value)}</option>)}</select>}
        <select aria-label="Filter by priority" className="field min-w-0 !py-2 sm:w-40" value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority | '')}><option value="">{t('All priorities')}</option>{priorities.map((value) => <option key={value} value={value}>{t(priorityLabel[value])}</option>)}</select>
      </div>
    </div>
    {data.items.length === 0 ? <div className="p-4"><EmptyState title="No tasks found" description={status || priority ? 'Try changing your filters, or create a task that matches them.' : 'Create the first task for this project.'} action={access.can('task:create') ? <Button onClick={onCreate}><Plus size={18}/>{t('Create task')}</Button> : undefined}/></div> : activeView === 'board' ? <TaskBoard tasks={data.items} memberMap={memberMap} workspaceId={workspaceId} canEdit={access.can('task:update')} canDelete={access.can('task:delete')} onEdit={setEditing} onDelete={setDeleting}/> : <>
      <div className="hidden overflow-x-auto md:block"><table className="w-full text-start"><thead><tr className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:bg-zinc-900/80"><th className="px-5 py-3.5 font-semibold">{t('Task')}</th><th className="px-4 py-3.5 font-semibold">{t('Status')}</th><th className="px-4 py-3.5 font-semibold">{t('Priority')}</th><th className="px-4 py-3.5 font-semibold">{t('Assigned to')}</th><th className="px-4 py-3.5 font-semibold">{t('Due date')}</th><th className="px-5 py-3.5 text-end font-semibold">{t('Actions')}</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-zinc-800">{data.items.map((task) => <TaskRow key={task.id} task={task} member={task.assigned_to ? memberMap.get(task.assigned_to) : undefined} workspaceId={workspaceId} canEdit={access.can('task:update')} canDelete={access.can('task:delete')} onEdit={() => setEditing(task)} onDelete={() => setDeleting(task)}/>)}</tbody></table></div>
      <div className="divide-y divide-slate-100 dark:divide-slate-800 md:hidden">{data.items.map((task) => <TaskCard key={task.id} task={task} member={task.assigned_to ? memberMap.get(task.assigned_to) : undefined} workspaceId={workspaceId} canEdit={access.can('task:update')} canDelete={access.can('task:delete')} onEdit={() => setEditing(task)} onDelete={() => setDeleting(task)}/>)}</div>
    </>}
    {activeView === 'list' && data.total > limit && <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm dark:border-zinc-800"><p className="text-slate-500">{page} / {pages} · {data.total}</p><div className="flex gap-2"><Button variant="secondary" className="!min-h-9 !px-3" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft size={17}/>{t('Previous')}</Button><Button variant="secondary" className="!min-h-9 !px-3" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>{t('Next')}<ChevronRight size={17}/></Button></div></div>}
    {activeView === 'board' && data.total > limit && <p className="border-t border-slate-200 px-4 py-3 text-sm text-slate-500 dark:border-slate-800">Showing the first {limit} of {data.total} tasks. Use a priority filter to narrow the board.</p>}
    <TaskFormModal open={Boolean(editing)} onClose={() => setEditing(null)} projectId={projectId} workspaceId={workspaceId} task={editing}/><ConfirmDialog open={Boolean(deleting)} onClose={() => setDeleting(null)} onConfirm={() => deleting && remove.mutate(deleting.id)} busy={remove.isPending} title={`Delete ${deleting?.title ?? 'task'}?`} description="This task will be permanently removed. This action cannot be undone."/>
  </section>
}

function TaskBoard({ tasks, memberMap, workspaceId, canEdit, canDelete, onEdit, onDelete }: { tasks: Task[]; memberMap: Map<number, WorkspaceMember>; workspaceId: number; canEdit: boolean; canDelete: boolean; onEdit: (task: Task) => void; onDelete: (task: Task) => void }) {
  const { t } = useLanguage()
  const columnTone: Record<TaskStatus, string> = { 'To Do': 'bg-slate-400', 'In Progress': 'bg-amber-500', Done: 'bg-emerald-500' }
  return <div className="overflow-x-auto bg-cobalt-50/40 p-4 dark:bg-zinc-950/30">
    <div className="grid min-w-[58rem] grid-cols-3 gap-4">
      {statuses.map((status) => {
        const columnTasks = tasks.filter((task) => task.status === status)
        return <section key={status} className="rounded-2xl border border-slate-200/80 bg-white/80 p-3 dark:border-zinc-800 dark:bg-zinc-900/75">
          <header className="mb-3 flex items-center justify-between px-1"><div className="flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full ${columnTone[status]}`}/><h3 className="text-sm font-bold text-slate-800 dark:text-white">{t(status)}</h3></div><span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500 dark:bg-zinc-800">{columnTasks.length}</span></header>
          <div className="space-y-3">{columnTasks.length ? columnTasks.map((task) => <BoardTaskCard key={task.id} task={task} member={task.assigned_to ? memberMap.get(task.assigned_to) : undefined} workspaceId={workspaceId} canEdit={canEdit} canDelete={canDelete} onEdit={() => onEdit(task)} onDelete={() => onDelete(task)}/>) : <div className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-400 dark:border-zinc-700">{t('No tasks here')}</div>}</div>
        </section>
      })}
    </div>
  </div>
}

function BoardTaskCard({ task, member, workspaceId, canEdit, canDelete, onEdit, onDelete }: Parameters<typeof TaskRow>[0]) {
  return <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-cobalt-500/50 hover:shadow-panel dark:border-slate-800 dark:bg-slate-900">
    <div className="flex items-start justify-between gap-3"><Link to={`/app/workspaces/${workspaceId}/projects/${task.project_id}/tasks/${task.id}`} className="font-bold leading-snug text-slate-900 hover:text-cobalt-600 dark:text-white">{task.title}</Link><div className="flex shrink-0">{canEdit && <button onClick={onEdit} className="rounded-lg p-1.5 text-slate-400 hover:bg-cobalt-50 hover:text-cobalt-600 dark:hover:bg-slate-800" aria-label={`Edit ${task.title}`}><Pencil size={15}/></button>}{canDelete && <button onClick={onDelete} className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950" aria-label={`Delete ${task.title}`}><Trash2 size={15}/></button>}</div></div>
    {task.desc && <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-500">{task.desc}</p>}
    <div className="mt-4 flex flex-wrap items-center gap-2"><InlineStatus task={task} canEdit={canEdit}/><PriorityBadge priority={task.priority}/></div>
    <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-slate-800"><Assignee member={member}/><span className={`shrink-0 text-xs ${isOverdue(task.due_date, task.status) ? 'font-semibold text-rose-600' : 'text-slate-400'}`}><CalendarDays size={14} className="mr-1 inline"/>{formatDate(task.due_date)}</span></div>
  </article>
}

function TaskRow({ task, member, workspaceId, canEdit, canDelete, onEdit, onDelete }: { task: Task; member?: WorkspaceMember; workspaceId: number; canEdit: boolean; canDelete: boolean; onEdit: () => void; onDelete: () => void }) {
  const { t } = useLanguage()
  return <tr className="transition hover:bg-cobalt-50/50 dark:hover:bg-zinc-800/50"><td className="px-5 py-4"><Link to={`/app/workspaces/${workspaceId}/projects/${task.project_id}/tasks/${task.id}`} className="font-semibold text-slate-900 hover:text-cobalt-600 dark:text-white">{task.title}</Link><p className="mt-0.5 max-w-xs truncate text-sm text-slate-400">{task.desc || t('No description')}</p></td><td className="px-4 py-4"><InlineStatus task={task} canEdit={canEdit}/></td><td className="px-4 py-4"><PriorityBadge priority={task.priority}/></td><td className="px-4 py-4"><Assignee member={member}/></td><td className={`px-4 py-4 text-sm ${isOverdue(task.due_date, task.status) ? 'font-semibold text-rose-600' : 'text-slate-500'}`}>{t(formatDate(task.due_date))}{isOverdue(task.due_date, task.status) && <span className="block text-xs">{t('Overdue')}</span>}</td><td className="px-5 py-4"><div className="flex justify-end gap-1">{canEdit && <button onClick={onEdit} className="rounded-lg p-2 text-slate-400 hover:bg-cobalt-50 hover:text-cobalt-600 dark:hover:bg-zinc-800" aria-label={`${t('Edit')} ${task.title}`}><Pencil size={17}/></button>}{canDelete && <button onClick={onDelete} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950" aria-label={`${t('Delete')} ${task.title}`}><Trash2 size={17}/></button>}</div></td></tr>
}

function TaskCard({ task, member, workspaceId, canEdit, canDelete, onEdit, onDelete }: Parameters<typeof TaskRow>[0]) {
  const { t } = useLanguage()
  return <article className="p-4"><div className="flex items-start justify-between gap-3"><div><Link to={`/app/workspaces/${workspaceId}/projects/${task.project_id}/tasks/${task.id}`} className="font-bold text-slate-900 dark:text-white">{task.title}</Link><p className="mt-1 line-clamp-2 text-sm text-slate-500">{task.desc || t('No description')}</p></div><div className="flex">{canEdit && <button onClick={onEdit} className="p-2 text-slate-400"><Pencil size={17}/></button>}{canDelete && <button onClick={onDelete} className="p-2 text-slate-400"><Trash2 size={17}/></button>}</div></div><div className="mt-4 flex flex-wrap items-center gap-2"><InlineStatus task={task} canEdit={canEdit}/><PriorityBadge priority={task.priority}/></div><div className="mt-4 flex flex-wrap justify-between gap-3 text-sm"><Assignee member={member}/><span className={isOverdue(task.due_date, task.status) ? 'font-semibold text-rose-600' : 'text-slate-500'}><CalendarDays size={15} className="mr-1.5 inline"/>{t(formatDate(task.due_date))}</span></div></article>
}

function Assignee({ member }: { member?: WorkspaceMember }) {
  const { t } = useLanguage()
  return member ? <div className="flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-[10px] font-bold text-slate-600 dark:bg-zinc-800 dark:text-slate-300">{initials(member.username)}</span><span className="text-sm text-slate-600 dark:text-slate-300">{member.username}</span></div> : <span className="flex items-center gap-1.5 text-sm text-slate-400"><UserRound size={15}/>{t('Unassigned')}</span>
}

export function InlineStatus({ task, canEdit }: { task: Task; canEdit: boolean }) {
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const { t } = useLanguage()
  const update = useMutation({
    mutationFn: (status: TaskStatus) => taskApi.update(task.project_id, task.id, { status }),
    onMutate: async (status) => {
      await queryClient.cancelQueries({ queryKey: ['tasks', task.project_id] })
      const previousLists = queryClient.getQueriesData<TaskListResponse>({ queryKey: ['tasks', task.project_id] })
      const previousTask = queryClient.getQueryData<Task>(['task', task.project_id, task.id])
      queryClient.setQueriesData<TaskListResponse>({ queryKey: ['tasks', task.project_id] }, (data) => data ? { ...data, items: data.items.map((item) => item.id === task.id ? { ...item, status } : item) } : data)
      queryClient.setQueryData<Task>(['task', task.project_id, task.id], (data) => data ? { ...data, status } : data)
      return { previousLists, previousTask }
    },
    onError: (error, _status, context) => {
      context?.previousLists.forEach(([key, data]) => queryClient.setQueryData(key, data))
      if (context?.previousTask) queryClient.setQueryData(['task', task.project_id, task.id], context.previousTask)
      showToast(errorMessage(error), 'error')
    },
    onSuccess: (_task, status) => showToast(`Status changed to ${status}.`),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', task.project_id] })
      queryClient.invalidateQueries({ queryKey: ['task', task.project_id, task.id] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-tasks', task.project_id] })
    },
  })
  if (!canEdit) return <StatusBadge status={task.status}/>
  const tone = task.status === 'Done' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : task.status === 'In Progress' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
  return <select aria-label={`${t('Status')}: ${task.title}`} value={task.status} disabled={update.isPending} onChange={(event) => update.mutate(event.target.value as TaskStatus)} className={`cursor-pointer rounded-full border-0 py-1 px-2.5 text-xs font-semibold outline-none ring-cobalt-500/20 transition hover:ring-4 disabled:cursor-wait ${tone}`}>{statuses.map((status) => <option key={status} value={status}>{t(status)}</option>)}</select>
}

export function TaskFormModal({ open, onClose, projectId, workspaceId, task = null }: { open: boolean; onClose: () => void; projectId: number; workspaceId: number; task?: Task | null }) {
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const { t } = useLanguage()
  const members = useQuery({ queryKey: ['members', workspaceId], queryFn: () => workspaceApi.members(workspaceId), enabled: open })
  const [values, setValues] = useState({ title: '', desc: '', status: 'To Do' as TaskStatus, priority: '3' as TaskPriority, due_date: '', assigned_to: '' })
  const [formError, setFormError] = useState('')
  useEffect(() => { if (open) setValues({ title: task?.title ?? '', desc: task?.desc ?? '', status: task?.status ?? 'To Do', priority: task?.priority ?? '3', due_date: dateTimeInput(task?.due_date ?? null), assigned_to: task?.assigned_to ? String(task.assigned_to) : '' }) }, [open, task])
  const save = useMutation({ mutationFn: () => { const input: TaskInput = { title: values.title.trim(), desc: values.desc.trim(), priority: values.priority, due_date: values.due_date ? new Date(values.due_date).toISOString() : null, assigned_to: values.assigned_to ? Number(values.assigned_to) : null }; return task ? taskApi.update(projectId, task.id, { ...input, status: values.status }) : taskApi.create(projectId, input) }, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tasks', projectId] }); queryClient.invalidateQueries({ queryKey: ['task', projectId] }); onClose(); showToast(task ? 'Task updated.' : 'Task created.') }, onError: (e) => setFormError(errorMessage(e)) })
  const submit = (event: FormEvent) => { event.preventDefault(); setFormError(''); if (values.title.trim().length < 2) { setFormError('Task title must be at least 2 characters.'); return } save.mutate() }
  return <Modal open={open} onClose={onClose} title={t(task ? 'Edit task' : 'Create a task')} description={t('Capture the outcome, owner, and timing clearly.')} size="lg"><form onSubmit={submit} className="space-y-4"><div><label htmlFor="task-title" className="label">{t('Task title')}</label><input id="task-title" className="field" autoFocus maxLength={150} value={values.title} onChange={(e) => setValues({ ...values, title: e.target.value })}/></div><div><label htmlFor="task-desc" className="label">{t('Description')} <span className="font-normal text-slate-400">{t('(optional)')}</span></label><textarea id="task-desc" className="field resize-none" rows={3} maxLength={1000} value={values.desc} onChange={(e) => setValues({ ...values, desc: e.target.value })}/></div><div className="grid gap-4 sm:grid-cols-2">{task && <div><label htmlFor="task-status" className="label">{t('Status')}</label><select id="task-status" className="field" value={values.status} onChange={(e) => setValues({ ...values, status: e.target.value as TaskStatus })}>{statuses.map((value) => <option key={value} value={value}>{t(value)}</option>)}</select></div>}<div><label htmlFor="task-priority" className="label">{t('Priority')}</label><select id="task-priority" className="field" value={values.priority} onChange={(e) => setValues({ ...values, priority: e.target.value as TaskPriority })}>{priorities.map((value) => <option key={value} value={value}>{t(priorityLabel[value])}</option>)}</select></div><div><label htmlFor="task-assignee" className="label">{t('Assignee')}</label><select id="task-assignee" className="field" value={values.assigned_to} onChange={(e) => setValues({ ...values, assigned_to: e.target.value })}><option value="">{t('Unassigned')}</option>{members.data?.map((member) => <option key={member.user_id} value={member.user_id}>{member.username} ({member.email})</option>)}</select></div><div><label htmlFor="task-due" className="label">{t('Due date')}</label><input id="task-due" type="datetime-local" className="field" value={values.due_date} onChange={(e) => setValues({ ...values, due_date: e.target.value })}/></div></div>{formError && <p className="text-sm text-rose-600">{formError}</p>}<div className="flex justify-end gap-3 pt-2"><Button type="button" variant="secondary" onClick={onClose}>{t('Cancel')}</Button><Button disabled={save.isPending}>{save.isPending ? t('Saving…') : task ? t('Save changes') : t('Create task')}</Button></div></form></Modal>
}
