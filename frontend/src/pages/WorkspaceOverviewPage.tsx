import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { FolderKanban, Pencil, ShieldCheck, Trash2, Users } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { projectApi } from '../api/projects'
import { workspaceApi } from '../api/workspaces'
import { PageHeader } from '../components/PageHeader'
import { WorkspaceTabs } from '../components/WorkspaceTabs'
import { Button } from '../components/ui/Button'
import { ConfirmDialog, Modal } from '../components/ui/Modal'
import { ErrorState, PageSkeleton } from '../components/ui/States'
import { useToast } from '../context/ToastContext'
import { useLanguage } from '../context/LanguageContext'
import { useWorkspaceAccess } from '../hooks/useWorkspaceAccess'
import { errorMessage } from '../utils/format'

export function WorkspaceOverviewPage() {
  const workspaceId = Number(useParams().workspaceId)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const { t } = useLanguage()
  const access = useWorkspaceAccess(workspaceId)
  const workspace = useQuery({ queryKey: ['workspace', workspaceId], queryFn: () => workspaceApi.get(workspaceId) })
  const projects = useQuery({ queryKey: ['projects', workspaceId], queryFn: () => projectApi.list(workspaceId) })
  const members = useQuery({ queryKey: ['members', workspaceId], queryFn: () => workspaceApi.members(workspaceId) })
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [name, setName] = useState('')
  const update = useMutation({ mutationFn: () => workspaceApi.update(workspaceId, name.trim()), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId] }); queryClient.invalidateQueries({ queryKey: ['workspaces'] }); setEditOpen(false); showToast('Workspace updated.') }, onError: (e) => showToast(errorMessage(e), 'error') })
  const remove = useMutation({ mutationFn: () => workspaceApi.remove(workspaceId), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['workspaces'] }); localStorage.removeItem('last_workspace_id'); showToast('Workspace deleted.'); navigate('/app/workspaces') }, onError: (e) => showToast(errorMessage(e), 'error') })
  if (workspace.isLoading) return <PageSkeleton/>
  if (workspace.isError || !workspace.data) return <ErrorState message={errorMessage(workspace.error)} onRetry={() => workspace.refetch()}/>
  const openEdit = () => { setName(workspace.data.name); setEditOpen(true) }
  const submit = (event: FormEvent) => { event.preventDefault(); if (name.trim().length >= 2) update.mutate() }
  const cards = [
    { label: t('Projects'), value: projects.data?.length ?? '—', icon: FolderKanban, color: 'text-cobalt-600 bg-cobalt-50 dark:bg-cobalt-950' },
    { label: t('Members'), value: members.data?.length ?? '—', icon: Users, color: 'text-rose-600 bg-rose-50 dark:bg-rose-950' },
    { label: t('Your role'), value: access.member?.role ?? '—', icon: ShieldCheck, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950' },
  ]
  return <><PageHeader eyebrow={t('Workspace overview')} title={workspace.data.name} description={t('A high-level view of this workspace and your access.')} actions={<>{access.can('workspace:update') && <Button variant="secondary" onClick={openEdit}><Pencil size={17}/>{t('Edit')}</Button>}{access.can('workspace:delete') && <Button variant="danger" onClick={() => setDeleteOpen(true)}><Trash2 size={17}/>{t('Delete')}</Button>}</>}/><WorkspaceTabs/><div className="grid gap-4 sm:grid-cols-3">{cards.map(({ label, value, icon: Icon, color }) => <div key={label} className="surface p-5"><div className={`mb-5 inline-flex rounded-xl p-2.5 ${color}`}><Icon size={20}/></div><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{value}</p></div>)}</div><Modal open={editOpen} onClose={() => setEditOpen(false)} title={t('Rename workspace')} size="sm"><form onSubmit={submit}><label className="label" htmlFor="edit-workspace-name">{t('Workspace name')}</label><input id="edit-workspace-name" className="field" value={name} onChange={(e) => setName(e.target.value)} maxLength={100}/><div className="mt-6 flex justify-end gap-3"><Button type="button" variant="secondary" onClick={() => setEditOpen(false)}>{t('Cancel')}</Button><Button disabled={update.isPending || name.trim().length < 2}>{update.isPending ? t('Updating…') : t('Save changes')}</Button></div></form></Modal><ConfirmDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={() => remove.mutate()} busy={remove.isPending} title={t('Delete this workspace?')} description={t('This permanently removes the workspace, its roles, and associated data. This action cannot be undone.')}/></>
}
