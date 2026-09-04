import { NavLink, useParams } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'

const tabs = [
  ['Overview', ''], ['Projects', 'projects'], ['Members', 'members'], ['Roles', 'roles'],
]

export function WorkspaceTabs() {
  const { t } = useLanguage()
  const { workspaceId } = useParams()
  const base = `/app/workspaces/${workspaceId}`
  return <nav aria-label="Workspace sections" className="mb-6 flex gap-1 overflow-x-auto border-b border-slate-200 dark:border-zinc-800">{tabs.map(([label, path]) => <NavLink key={label} end={!path} to={path ? `${base}/${path}` : base} className={({ isActive }) => `whitespace-nowrap border-b-2 px-3 py-3 text-sm font-semibold transition ${isActive ? 'border-cobalt-600 text-cobalt-700 dark:text-cobalt-400' : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>{t(label === 'Overview' ? 'Workspace overview' : label)}</NavLink>)}</nav>
}
