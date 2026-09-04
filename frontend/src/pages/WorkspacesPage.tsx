import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowRight, BriefcaseBusiness, Plus } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { workspaceApi } from '../api/workspaces'
import { PageHeader } from '../components/PageHeader'
import { Button } from '../components/ui/Button'
import { EmptyState, ErrorState, LoadingState } from '../components/ui/States'
import { Modal } from '../components/ui/Modal'
import { useToast } from '../context/ToastContext'
import { useLanguage } from '../context/LanguageContext'
import { errorMessage } from '../utils/format'

export function WorkspacesPage() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [formError, setFormError] = useState('')
  const query = useQuery({ queryKey: ['workspaces'], queryFn: workspaceApi.list })
  const create = useMutation({ mutationFn: () => workspaceApi.create(name.trim()), onSuccess: (workspace) => { queryClient.invalidateQueries({ queryKey: ['workspaces'] }); setOpen(false); setName(''); localStorage.setItem('last_workspace_id', String(workspace.id)); showToast('Workspace created.') }, onError: (error) => setFormError(errorMessage(error)) })
  const submit = (event: FormEvent) => { event.preventDefault(); setFormError(''); if (name.trim().length < 2) { setFormError('Workspace name must be at least 2 characters.'); return } create.mutate() }
  if (query.isLoading) return <LoadingState label="Loading workspaces…"/>
  if (query.isError) return <ErrorState message={errorMessage(query.error)} onRetry={() => query.refetch()}/>
  const workspaces = query.data ?? []
  return <><PageHeader eyebrow={t('Your organization')} title={t('Workspaces')} description={t('Separate teams, projects, and access rules into focused spaces.')} actions={<Button onClick={() => setOpen(true)}><Plus size={18}/>{t('New workspace')}</Button>}/>{workspaces.length === 0 ? <EmptyState title="No workspaces yet" description="Create your first workspace to start organizing projects and inviting collaborators." action={<Button onClick={() => setOpen(true)}><Plus size={18}/>{t('Create workspace')}</Button>}/> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{workspaces.map((workspace, index) => <Link to={`/app/workspaces/${workspace.id}`} key={workspace.id} className="surface group p-5 transition hover:-translate-y-0.5 hover:border-cobalt-300 hover:shadow-lg dark:hover:border-cobalt-700" onClick={() => localStorage.setItem('last_workspace_id', String(workspace.id))}><div className="flex items-start justify-between"><div className={`flex h-11 w-11 items-center justify-center rounded-xl ${index % 3 === 0 ? 'bg-cobalt-50 text-cobalt-600 dark:bg-cobalt-950' : index % 3 === 1 ? 'bg-violet-50 text-violet-600 dark:bg-violet-950' : 'bg-rose-50 text-rose-600 dark:bg-rose-950'}`}><BriefcaseBusiness size={21}/></div><ArrowRight className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-cobalt-600" size={20}/></div><h2 className="mt-5 text-lg font-bold text-slate-900 dark:text-white">{workspace.name}</h2><p className="mt-1 text-sm text-slate-500">{t('Team workspace')}</p></Link>)}</div>}<Modal open={open} onClose={() => setOpen(false)} title={t('Create a workspace')} description={t('Workspaces keep people, projects, and roles together.')} size="sm"><form onSubmit={submit}><label htmlFor="workspace-name" className="label">{t('Workspace name')}</label><input id="workspace-name" className="field" autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder={t('Workspace name')} maxLength={100}/>{formError && <p className="mt-2 text-sm text-rose-600">{formError}</p>}<div className="mt-6 flex justify-end gap-3"><Button type="button" variant="secondary" onClick={() => setOpen(false)}>{t('Cancel')}</Button><Button disabled={create.isPending}>{create.isPending ? t('Creating…') : t('Create workspace')}</Button></div></form></Modal></>
}
