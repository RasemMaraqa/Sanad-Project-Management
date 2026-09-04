import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, ShieldCheck, UserRound } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import { workspaceApi } from '../api/workspaces'
import { PageHeader } from '../components/PageHeader'
import { WorkspaceTabs } from '../components/WorkspaceTabs'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { EmptyState, ErrorState, LoadingState } from '../components/ui/States'
import { useToast } from '../context/ToastContext'
import { useLanguage } from '../context/LanguageContext'
import { useWorkspaceAccess } from '../hooks/useWorkspaceAccess'
import { errorMessage, initials } from '../utils/format'

export function MembersPage() {
  const workspaceId = Number(useParams().workspaceId)
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const { t } = useLanguage()
  const access = useWorkspaceAccess(workspaceId)
  const workspace = useQuery({ queryKey: ['workspace', workspaceId], queryFn: () => workspaceApi.get(workspaceId) })
  const query = useQuery({ queryKey: ['members', workspaceId], queryFn: () => workspaceApi.members(workspaceId) })
  const [open, setOpen] = useState(false)
  const [values, setValues] = useState({ email: '', roleId: '' })
  const [formError, setFormError] = useState('')
  const add = useMutation({ mutationFn: () => workspaceApi.addMember(workspaceId, values.email.trim(), Number(values.roleId)), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['members', workspaceId] }); setOpen(false); setValues({ email: '', roleId: '' }); showToast('Member added.') }, onError: (e) => setFormError(errorMessage(e)) })
  const changeRole = useMutation({ mutationFn: ({ userId, roleId }: { userId: number; roleId: number }) => workspaceApi.updateMemberRole(workspaceId, userId, roleId), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['members', workspaceId] }); showToast('Member role updated.') }, onError: (e) => showToast(errorMessage(e), 'error') })
  const submit = (event: FormEvent) => { event.preventDefault(); setFormError(''); if (!values.email.trim() || !values.roleId) { setFormError('Enter the member’s email and choose a role.'); return } add.mutate() }
  if (query.isLoading) return <LoadingState label="Loading members…"/>
  if (query.isError) return <ErrorState message={errorMessage(query.error)} onRetry={() => query.refetch()}/>
  const members = query.data ?? []
  return <><PageHeader eyebrow={workspace.data?.name} title={t('Members')} description={t('See who belongs to this workspace and keep responsibilities current.')} actions={access.can('member:invite') ? <Button onClick={() => setOpen(true)}><Plus size={18}/>{t('Add member')}</Button> : undefined}/><WorkspaceTabs/>{members.length === 0 ? <EmptyState title="No members found" description="There are no visible members in this workspace."/> : <div className="surface overflow-hidden"><div className="hidden overflow-x-auto sm:block"><table className="w-full text-start"><thead><tr className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:bg-zinc-900/80"><th className="px-5 py-3.5">{t('Member')}</th><th className="px-5 py-3.5">{t('Role')}</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-zinc-800">{members.map((member) => <tr key={member.user_id}><td className="px-5 py-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cobalt-50 text-xs font-bold text-cobalt-700 dark:bg-cobalt-950 dark:text-cobalt-300">{initials(member.username)}</div><div><p className="font-semibold text-slate-900 dark:text-white">{member.username}</p><p className="text-sm text-slate-500">{member.email}</p></div></div></td><td className="px-5 py-4">{access.can('member:update') ? <select aria-label={`${t('Role')} ${member.username}`} className="field max-w-48 !py-2" value={access.roles.find((role) => role.name === member.role)?.id ?? ''} onChange={(e) => changeRole.mutate({ userId: member.user_id, roleId: Number(e.target.value) })} disabled={changeRole.isPending}>{access.roles.map((role) => <option value={role.id} key={role.id}>{t(role.name)}</option>)}</select> : <Badge tone="violet">{t(member.role)}</Badge>}</td></tr>)}</tbody></table></div><div className="divide-y divide-slate-100 dark:divide-zinc-800 sm:hidden">{members.map((member) => <div key={member.user_id} className="p-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cobalt-50 text-xs font-bold text-cobalt-700"><UserRound size={18}/></div><div><p className="font-semibold">{member.username}</p><p className="text-sm text-slate-500">{member.email}</p></div></div><div className="mt-4"><Badge tone="violet">{t(member.role)}</Badge></div></div>)}</div></div>}<Modal open={open} onClose={() => setOpen(false)} title={t('Add a workspace member')} description={t('Invite someone using the email address on their Sanad account.')} size="sm"><form onSubmit={submit} className="space-y-4"><div><label htmlFor="member-email" className="label">{t('Email address')}</label><input id="member-email" className="field" type="email" autoComplete="email" value={values.email} onChange={(e) => setValues({ ...values, email: e.target.value })} placeholder="member@example.com" required/></div><div><label htmlFor="member-role" className="label">{t('Role')}</label><select id="member-role" className="field" value={values.roleId} onChange={(e) => setValues({ ...values, roleId: e.target.value })}><option value="">{t('Choose a role')}</option>{access.roles.map((role) => <option key={role.id} value={role.id}>{t(role.name)}</option>)}</select></div>{formError && <p className="text-sm text-rose-600">{formError}</p>}<div className="flex justify-end gap-3"><Button type="button" variant="secondary" onClick={() => setOpen(false)}>{t('Cancel')}</Button><Button disabled={add.isPending}>{add.isPending ? t('Adding…') : <><ShieldCheck size={17}/>{t('Add member')}</>}</Button></div></form></Modal></>
}
