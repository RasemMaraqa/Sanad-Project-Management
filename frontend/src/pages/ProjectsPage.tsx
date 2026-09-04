import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowRight, FolderKanban, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { projectApi } from '../api/projects'
import { workspaceApi } from '../api/workspaces'
import { PageHeader } from '../components/PageHeader'
import { WorkspaceTabs } from '../components/WorkspaceTabs'
import { Button } from '../components/ui/Button'
import { ConfirmDialog, Modal } from '../components/ui/Modal'
import { EmptyState, ErrorState, LoadingState } from '../components/ui/States'
import { useToast } from '../context/ToastContext'
import { useLanguage } from '../context/LanguageContext'
import { useWorkspaceAccess } from '../hooks/useWorkspaceAccess'
import type { Project } from '../types'
import { errorMessage } from '../utils/format'

export function ProjectsPage() {
  const workspaceId = Number(useParams().workspaceId)
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const { t } = useLanguage()
  const access = useWorkspaceAccess(workspaceId)
  const workspace = useQuery({ queryKey: ['workspace', workspaceId], queryFn: () => workspaceApi.get(workspaceId) })
  const query = useQuery({ queryKey: ['projects', workspaceId], queryFn: () => projectApi.list(workspaceId) })
  const [editing, setEditing] = useState<Project | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [deleting, setDeleting] = useState<Project | null>(null)
  const [values, setValues] = useState({ name: '', desc: '' })
  const [formError, setFormError] = useState('')
  const closeForm = () => { setFormOpen(false); setEditing(null); setValues({ name: '', desc: '' }); setFormError('') }
  const openCreate = () => { setEditing(null); setValues({ name: '', desc: '' }); setFormOpen(true) }
  const openEdit = (project: Project) => { setEditing(project); setValues({ name: project.name, desc: project.desc ?? '' }); setFormOpen(true) }
  const save = useMutation({ mutationFn: () => editing ? projectApi.update(editing.id, { name: values.name.trim(), desc: values.desc.trim() || null }) : projectApi.create(workspaceId, { name: values.name.trim(), desc: values.desc.trim() || null }), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] }); closeForm(); showToast(editing ? 'Project updated.' : 'Project created.') }, onError: (e) => setFormError(errorMessage(e)) })
  const remove = useMutation({ mutationFn: (id: number) => projectApi.remove(id), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] }); setDeleting(null); showToast('Project deleted.') }, onError: (e) => showToast(errorMessage(e), 'error') })
  const submit = (event: FormEvent) => { event.preventDefault(); setFormError(''); if (values.name.trim().length < 2) { setFormError('Project name must be at least 2 characters.'); return } save.mutate() }
  if (query.isLoading || workspace.isLoading) return <LoadingState label="Loading projects…"/>
  if (query.isError) return <ErrorState message={errorMessage(query.error)} onRetry={() => query.refetch()}/>
  const projects = query.data ?? []
  return <><PageHeader eyebrow={workspace.data?.name} title={t('Projects')} description={t('Keep outcomes, ownership, and tasks organized by initiative.')} actions={access.can('project:create') ? <Button onClick={openCreate}><Plus size={18}/>{t('New project')}</Button> : undefined}/><WorkspaceTabs/>{projects.length === 0 ? <EmptyState title="No projects in this workspace" description="Create a project to turn your team’s next objective into actionable work." action={access.can('project:create') ? <Button onClick={openCreate}><Plus size={18}/>{t('Create project')}</Button> : undefined}/> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{projects.map((project) => <article key={project.id} className="surface group flex min-h-56 flex-col p-5"><div className="flex items-start justify-between"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cobalt-50 text-cobalt-600 dark:bg-cobalt-950"><FolderKanban size={21}/></div><div className="flex gap-1">{access.can('project:update') && <button onClick={() => openEdit(project)} className="rounded-lg p-2 text-slate-400 hover:bg-cobalt-50 hover:text-cobalt-700 dark:hover:bg-zinc-800" aria-label={`${t('Edit')} ${project.name}`}><Pencil size={17}/></button>}{access.can('project:delete') && <button onClick={() => setDeleting(project)} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950" aria-label={`${t('Delete')} ${project.name}`}><Trash2 size={17}/></button>}{!access.can('project:update') && !access.can('project:delete') && <MoreHorizontal className="text-slate-300"/>}</div></div><h2 className="mt-5 text-lg font-bold text-slate-900 dark:text-white">{project.name}</h2><p className="mt-1 line-clamp-2 flex-1 text-sm leading-6 text-slate-500">{project.desc || t('No description added.')}</p><Link to={`/app/workspaces/${workspaceId}/projects/${project.id}`} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-cobalt-600 hover:text-cobalt-700">{t('Open project')} <ArrowRight size={16}/></Link></article>)}</div>}<Modal open={formOpen} onClose={closeForm} title={t(editing ? 'Edit project' : 'Create a project')} description={t('Give your team a clear place to track the work.')} size="sm"><form onSubmit={submit} className="space-y-4"><div><label htmlFor="project-name" className="label">{t('Project name')}</label><input id="project-name" autoFocus className="field" maxLength={100} value={values.name} onChange={(e) => setValues({ ...values, name: e.target.value })}/></div><div><label htmlFor="project-description" className="label">{t('Description')} <span className="font-normal text-slate-400">{t('(optional)')}</span></label><textarea id="project-description" rows={4} maxLength={1000} className="field resize-none" value={values.desc} onChange={(e) => setValues({ ...values, desc: e.target.value })}/></div>{formError && <p className="text-sm text-rose-600">{formError}</p>}<div className="flex justify-end gap-3"><Button type="button" variant="secondary" onClick={closeForm}>{t('Cancel')}</Button><Button disabled={save.isPending}>{save.isPending ? t('Saving…') : editing ? t('Save changes') : t('Create project')}</Button></div></form></Modal><ConfirmDialog open={Boolean(deleting)} onClose={() => setDeleting(null)} onConfirm={() => deleting && remove.mutate(deleting.id)} busy={remove.isPending} title={`${t('Delete')} ${deleting?.name ?? t('Project')}?`} description="This permanently removes the project. Any tasks in it may also be removed by the database."/></>
}
