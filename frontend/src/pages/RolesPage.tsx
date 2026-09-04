import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { KeyRound, Pencil, Plus, ShieldCheck, Trash2 } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import { workspaceApi } from '../api/workspaces'
import { PageHeader } from '../components/PageHeader'
import { WorkspaceTabs } from '../components/WorkspaceTabs'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { ConfirmDialog, Modal } from '../components/ui/Modal'
import { EmptyState, ErrorState, LoadingState } from '../components/ui/States'
import { useToast } from '../context/ToastContext'
import { useLanguage } from '../context/LanguageContext'
import { useWorkspaceAccess } from '../hooks/useWorkspaceAccess'
import type { Role } from '../types'
import { errorMessage } from '../utils/format'

export function RolesPage() {
  const workspaceId = Number(useParams().workspaceId)
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const { t } = useLanguage()
  const access = useWorkspaceAccess(workspaceId)
  const workspace = useQuery({ queryKey: ['workspace', workspaceId], queryFn: () => workspaceApi.get(workspaceId) })
  const permissions = useQuery({ queryKey: ['permissions'], queryFn: workspaceApi.permissions })
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Role | null>(null)
  const [deleting, setDeleting] = useState<Role | null>(null)
  const [name, setName] = useState('')
  const [selected, setSelected] = useState<number[]>([])
  const [formError, setFormError] = useState('')
  const grouped: Record<string, typeof permissions.data> = {}
  for (const permission of permissions.data ?? []) {
    const group = permission.name.split(':')[0]
    ;(grouped[group] ??= []).push(permission)
  }
  const closeForm = () => { setFormOpen(false); setEditing(null); setName(''); setSelected([]); setFormError('') }
  const openCreate = () => { setEditing(null); setName(''); setSelected([]); setFormOpen(true) }
  const openEdit = (role: Role) => { setEditing(role); setName(role.name); setSelected(role.permissions.map((p) => p.id)); setFormOpen(true) }
  useEffect(() => { if (!formOpen) setFormError('') }, [formOpen])
  const save = useMutation({ mutationFn: () => editing ? workspaceApi.updateRole(workspaceId, editing.id, { name: name.trim(), permission_ids: selected }) : workspaceApi.createRole(workspaceId, { name: name.trim(), permission_ids: selected }), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['roles', workspaceId] }); closeForm(); showToast(editing ? 'Role updated.' : 'Role created.') }, onError: (e) => setFormError(errorMessage(e)) })
  const remove = useMutation({ mutationFn: (roleId: number) => workspaceApi.removeRole(workspaceId, roleId), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['roles', workspaceId] }); setDeleting(null); showToast('Role deleted.') }, onError: (e) => showToast(errorMessage(e), 'error') })
  const submit = (event: FormEvent) => { event.preventDefault(); if (name.trim().length < 2) { setFormError('Role name must be at least 2 characters.'); return } save.mutate() }
  if (access.isLoading || permissions.isLoading) return <LoadingState label="Loading roles and permissions…"/>
  if (permissions.isError) return <ErrorState message={errorMessage(permissions.error)} onRetry={() => permissions.refetch()}/>
  return <><PageHeader eyebrow={workspace.data?.name} title={t('Roles & permissions')} description={t('Control what each workspace role can view and change.')} actions={access.can('role:create') ? <Button onClick={openCreate}><Plus size={18}/>{t('New role')}</Button> : undefined}/><WorkspaceTabs/>{access.roles.length === 0 ? <EmptyState title="No roles found" description="This workspace has no visible roles." action={access.can('role:create') ? <Button onClick={openCreate}>{t('Create role')}</Button> : undefined}/> : <div className="grid gap-4 lg:grid-cols-2">{access.roles.map((role) => <article key={role.id} className="surface p-5"><div className="flex items-start justify-between"><div className="flex items-center gap-3"><div className="rounded-xl bg-cobalt-50 p-2.5 text-cobalt-600 dark:bg-cobalt-950"><ShieldCheck size={20}/></div><div><h2 className="font-bold text-slate-900 dark:text-white">{t(role.name)}</h2><p className="text-sm text-slate-400">{role.permissions.length} {t('permissions')}</p></div></div><div className="flex gap-1">{access.can('role:update') && <button className="rounded-lg p-2 text-slate-400 hover:bg-cobalt-50 hover:text-cobalt-600 dark:hover:bg-zinc-800" onClick={() => openEdit(role)} aria-label={`${t('Edit')} ${role.name}`}><Pencil size={17}/></button>}{access.can('role:delete') && <button className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950" onClick={() => setDeleting(role)} aria-label={`${t('Delete')} ${role.name}`}><Trash2 size={17}/></button>}</div></div><div className="mt-5 flex flex-wrap gap-2">{role.permissions.length ? role.permissions.map((permission) => <Badge key={permission.id}>{permission.name}</Badge>) : <span className="text-sm text-slate-400">{t('No permissions assigned')}</span>}</div></article>)}</div>}<Modal open={formOpen} onClose={closeForm} title={t(editing ? 'Edit role' : 'Create a role')} description={t('Choose only the access this role needs.')} size="lg"><form onSubmit={submit} className="space-y-5"><div><label htmlFor="role-name" className="label">{t('Role name')}</label><input id="role-name" className="field" autoFocus maxLength={50} value={name} onChange={(e) => setName(e.target.value)}/></div><fieldset><legend className="label">{t('Permissions')}</legend><div className="grid max-h-80 gap-3 overflow-y-auto rounded-xl border border-slate-200 p-3 dark:border-zinc-700 sm:grid-cols-2">{Object.entries(grouped).map(([group, items]) => <div key={group} className="rounded-xl bg-slate-50 p-3 dark:bg-zinc-800/60"><p className="mb-2 flex items-center gap-2 text-sm font-bold capitalize text-slate-800 dark:text-white"><KeyRound size={15} className="text-slate-400"/>{group}</p><div className="space-y-2">{items?.map((permission) => <label key={permission.id} className="flex cursor-pointer items-center gap-2 rounded-lg p-1 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-300"><input type="checkbox" className="h-4 w-4 rounded border-slate-300 accent-cobalt-600" checked={selected.includes(permission.id)} onChange={() => setSelected((list) => list.includes(permission.id) ? list.filter((id) => id !== permission.id) : [...list, permission.id])}/>{permission.name}</label>)}</div></div>)}</div></fieldset>{formError && <p className="text-sm text-rose-600">{formError}</p>}<div className="flex justify-end gap-3"><Button type="button" variant="secondary" onClick={closeForm}>{t('Cancel')}</Button><Button disabled={save.isPending}>{save.isPending ? t('Saving…') : editing ? t('Save changes') : t('Create role')}</Button></div></form></Modal><ConfirmDialog open={Boolean(deleting)} onClose={() => setDeleting(null)} onConfirm={() => deleting && remove.mutate(deleting.id)} busy={remove.isPending} title={`${t('Delete')} ${deleting?.name ?? t('Role')}?`} description="A role assigned to members cannot be deleted. Unassign it first, then try again."/></>
}
