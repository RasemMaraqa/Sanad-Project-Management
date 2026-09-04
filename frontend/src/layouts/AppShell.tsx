import { BarChart3, BriefcaseBusiness, ChevronRight, ChevronsLeft, ChevronsRight, CircleHelp, FolderKanban, ListTodo, LogOut, Menu, Moon, Settings, ShieldCheck, Sun, Users, X } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { projectApi } from '../api/projects'
import { workspaceApi } from '../api/workspaces'
import { LanguageToggle } from '../components/LanguageToggle'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { useToast } from '../context/ToastContext'
import { useWorkspaceAccess } from '../hooks/useWorkspaceAccess'
import { initials } from '../utils/format'

export function AppShell() {
  const { user, logout } = useAuth()
  const { language, t } = useLanguage()
  const { showToast } = useToast()
  const location = useLocation()
  const routeWorkspaceId = location.pathname.match(/\/workspaces\/(\d+)/)?.[1]
  const routeProjectId = location.pathname.match(/\/projects\/(\d+)/)?.[1]
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('sidebar_collapsed') === 'true')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')
  const workspaceId = routeWorkspaceId || localStorage.getItem('last_workspace_id') || undefined
  const projectId = routeProjectId || localStorage.getItem('last_project_id') || undefined
  const access = useWorkspaceAccess(workspaceId ? Number(workspaceId) : undefined)
  const workspace = useQuery({ queryKey: ['workspace', workspaceId], queryFn: () => workspaceApi.get(Number(workspaceId)), enabled: Boolean(workspaceId) })
  const projects = useQuery({ queryKey: ['projects', Number(workspaceId)], queryFn: () => projectApi.list(Number(workspaceId)), enabled: Boolean(workspaceId && projectId) })
  const project = projects.data?.find((item) => String(item.id) === projectId)
  useEffect(() => {
    if (!routeWorkspaceId) return
    if (!routeProjectId) localStorage.removeItem('last_project_id')
    localStorage.setItem('last_workspace_id', routeWorkspaceId)
  }, [routeProjectId, routeWorkspaceId])
  useEffect(() => { if (routeProjectId) localStorage.setItem('last_project_id', routeProjectId) }, [routeProjectId])
  useEffect(() => { document.documentElement.classList.toggle('dark', dark); localStorage.setItem('theme', dark ? 'dark' : 'light') }, [dark])
  useEffect(() => { const syncTheme = () => setDark(localStorage.getItem('theme') === 'dark'); window.addEventListener('theme:changed', syncTheme); return () => window.removeEventListener('theme:changed', syncTheme) }, [])
  useEffect(() => { setMobileOpen(false); setHelpOpen(false) }, [location.pathname])
  const scoped = (suffix: string) => workspaceId ? `/app/workspaces/${workspaceId}/${suffix}` : '/app/workspaces'
  const activeSection = location.pathname.includes('/tasks') ? 'tasks'
    : location.pathname.includes('/projects') ? 'projects'
      : location.pathname.includes('/members') ? 'members'
        : location.pathname.includes('/roles') ? 'roles'
          : location.pathname === '/app/dashboard' ? 'dashboard'
            : location.pathname === '/app/settings' ? 'settings'
              : 'workspaces'
  const nav = [
    { id: 'dashboard', label: t('Dashboard'), href: '/app/dashboard', icon: BarChart3 },
    { id: 'workspaces', label: t('Workspaces'), href: '/app/workspaces', icon: BriefcaseBusiness },
    { id: 'projects', label: t('Projects'), href: scoped('projects'), icon: FolderKanban, permission: 'project:view' },
    { id: 'tasks', label: t('Tasks'), href: workspaceId && projectId ? `/app/workspaces/${workspaceId}/projects/${projectId}/tasks` : scoped('projects'), icon: ListTodo, permission: 'task:view' },
    { id: 'members', label: t('Members'), href: scoped('members'), icon: Users, permission: 'member:view' },
    { id: 'roles', label: t('Roles'), href: scoped('roles'), icon: ShieldCheck, permission: 'role:view' },
  ].filter((item) => !workspaceId || access.isLoading || !item.permission || access.can(item.permission))
  const pageTitle = location.pathname.includes('/tasks') ? t('Tasks') : location.pathname.includes('/projects') ? t('Projects') : location.pathname.includes('/members') ? t('Members') : location.pathname.includes('/roles') ? t('Roles & permissions') : location.pathname.includes('/settings') ? t('Settings') : location.pathname.endsWith('/workspaces') ? t('Workspaces') : routeWorkspaceId ? workspace.data?.name ?? t('Workspace') : t('Dashboard')
  const notifyMissingScope = (section: string) => {
    if (!workspaceId && ['projects', 'tasks', 'members', 'roles'].includes(section)) showToast('Choose or create a workspace before opening this section.', 'error')
    else if (section === 'tasks' && !projectId) showToast('Choose a project before opening tasks.', 'error')
  }

  const sidebar = <div className="flex h-full flex-col bg-ink text-white">
    <div className={`flex h-20 items-center border-b border-white/10 ${collapsed ? 'justify-center px-3' : 'px-5'}`}><img src="/sanad-logo.png" alt="Sanad" className="h-11 w-11 shrink-0 rounded-xl bg-white object-contain p-1 shadow-lg shadow-black/20"/>{!collapsed && <div className={language === 'ar' ? 'mr-3' : 'ml-3'}><p lang="ar" dir="rtl" className="text-lg font-bold leading-tight">سَنَد</p><p className="text-xs text-slate-400">Sanad Projects</p></div>}<button onClick={() => setMobileOpen(false)} className={`${language === 'ar' ? 'mr-auto' : 'ml-auto'} rounded-lg p-2 text-slate-400 hover:bg-white/10 lg:hidden`} aria-label={t('Close navigation')}><X size={20}/></button></div>
    {workspaceId && !collapsed && <div className="mx-3 mt-4 rounded-2xl border border-white/10 bg-white/[.06] p-3">
      <p className="text-[10px] font-bold uppercase tracking-[.14em] text-cobalt-300">{t('Current context')}</p>
      <Link to={`/app/workspaces/${workspaceId}`} className="mt-2 block truncate text-sm font-bold text-white hover:text-cobalt-200">{workspace.data?.name ?? t('Workspace')}</Link>
      <Link to={project ? `/app/workspaces/${workspaceId}/projects/${project.id}` : scoped('projects')} className="mt-2 flex items-center gap-2 border-t border-white/10 pt-2 text-xs text-slate-300 hover:text-white"><FolderKanban size={14} className="shrink-0 text-sumac-400"/><span className="truncate">{project?.name ?? t('Choose a project')}</span></Link>
    </div>}
    <nav className="flex-1 space-y-1 px-3 py-5">{nav.map(({ id, label, href, icon: Icon }) => {
      const isActive = activeSection === id
      return <Link key={id} to={href} onClick={() => notifyMissingScope(id)} title={collapsed ? label : undefined} aria-current={isActive ? 'page' : undefined} className={`group flex min-h-11 items-center gap-3 rounded-xl border px-3 text-sm font-semibold transition ${isActive ? 'border-cobalt-400/30 bg-cobalt-500/20 text-white shadow-inner' : 'border-transparent bg-transparent text-slate-300 hover:bg-white/[.07] hover:text-white'} ${collapsed ? 'justify-center' : ''}`}><Icon size={19} className={isActive ? 'text-cobalt-300' : ''}/>{!collapsed && <span>{label}</span>}</Link>
    })}</nav>
    <div className="border-t border-white/10 p-3"><Link to="/app/settings" aria-current={activeSection === 'settings' ? 'page' : undefined} className={`mb-1 flex min-h-11 items-center gap-3 rounded-xl border px-3 text-sm font-semibold transition ${activeSection === 'settings' ? 'border-cobalt-400/30 bg-cobalt-500/20 text-white shadow-inner' : 'border-transparent text-slate-300 hover:bg-white/[.07] hover:text-white'} ${collapsed ? 'justify-center' : ''}`}><Settings size={19} className={activeSection === 'settings' ? 'text-cobalt-300' : ''}/>{!collapsed && t('Settings')}</Link><button onClick={() => { setCollapsed((value) => { localStorage.setItem('sidebar_collapsed', String(!value)); return !value }) }} className={`hidden w-full min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-slate-300 hover:bg-white/10 lg:flex ${collapsed ? 'justify-center' : ''}`} aria-label={collapsed ? 'Expand sidebar' : t('Collapse')}>{collapsed ? <ChevronsRight size={19}/> : <><ChevronsLeft size={19}/>{t('Collapse')}</>}</button></div>
  </div>

  return <div className="min-h-screen bg-cloud text-ink dark:bg-[#111116] dark:text-slate-100">
    <aside className={`fixed inset-y-0 z-40 hidden transition-[width] duration-200 lg:block ${language === 'ar' ? 'right-0' : 'left-0'} ${collapsed ? 'w-20' : 'w-64'}`}>{sidebar}</aside>
    {mobileOpen && <div className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)}><aside className="h-full w-[min(84vw,18rem)]" onClick={(e) => e.stopPropagation()}>{sidebar}</aside></div>}
    <div className={`min-h-screen transition-[padding] duration-200 ${language === 'ar' ? collapsed ? 'lg:pr-20' : 'lg:pr-64' : collapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
      <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-cobalt-100/80 bg-white/90 px-4 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/90 sm:px-6 lg:px-8">
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-cobalt-600 via-ink to-sumac-500"/>
        <button onClick={() => setMobileOpen(true)} className="rounded-xl p-2 text-slate-600 hover:bg-cobalt-50 dark:text-slate-300 lg:hidden" aria-label={t('Open navigation')}><Menu/></button>
        <div className="hidden min-w-0 sm:block">
          <div className="flex min-w-0 items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
            {workspaceId ? <><Link to={`/app/workspaces/${workspaceId}`} className="max-w-40 truncate text-cobalt-600 hover:text-cobalt-800 dark:text-cobalt-400 dark:hover:text-cobalt-300">{workspace.data?.name ?? t('Workspace')}</Link>{project && <><ChevronRight size={14} className={`shrink-0 ${language === 'ar' ? 'rotate-180' : ''}`}/><Link to={`/app/workspaces/${workspaceId}/projects/${project.id}`} className="max-w-40 truncate hover:text-slate-900 dark:hover:text-white">{project.name}</Link></>}</> : <span className="uppercase tracking-[.14em] text-cobalt-600">Sanad</span>}
          </div>
          <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-200">{pageTitle}</p>
        </div>
        <div className={`${language === 'ar' ? 'mr-auto' : 'ml-auto'} flex items-center gap-2 sm:gap-3`}><LanguageToggle compact/><button onClick={() => setDark((value) => !value)} className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-cobalt-50 dark:text-slate-300 dark:hover:bg-zinc-800" aria-label={dark ? t('Use light theme') : t('Use dark theme')}>{dark ? <Sun size={19}/> : <Moon size={19}/>}</button><button onClick={() => setHelpOpen((value) => !value)} className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${helpOpen ? 'bg-cobalt-100 text-cobalt-700 dark:bg-zinc-800 dark:text-cobalt-300' : 'text-slate-500 hover:bg-cobalt-50 dark:text-slate-300 dark:hover:bg-zinc-800'}`} aria-label={t('How to use Sanad')} aria-expanded={helpOpen}><CircleHelp size={20}/></button><div className={`hidden items-center gap-3 sm:flex ${language === 'ar' ? 'border-r border-cobalt-100 pr-4 dark:border-zinc-700' : 'border-l border-cobalt-100 pl-4 dark:border-zinc-700'}`}><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cobalt-100 text-xs font-bold text-cobalt-700 dark:bg-cobalt-700 dark:text-white">{initials(user?.username ?? 'User')}</div><div><p className="text-sm font-semibold leading-tight text-slate-800 dark:text-white">{user?.username}</p><p className="max-w-36 truncate text-xs text-slate-400">{user?.email}</p></div></div><button onClick={logout} className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-sumac-50 hover:text-sumac-600 dark:hover:bg-rose-950" aria-label={t('Log out')}><LogOut size={19}/></button></div>
      </header>
      {helpOpen && <aside className={`fixed top-[5.5rem] z-40 w-[calc(100%-2rem)] max-w-sm rounded-2xl border border-cobalt-100 bg-white p-5 shadow-2xl dark:border-zinc-700 dark:bg-zinc-900 ${language === 'ar' ? 'left-4 lg:left-8' : 'right-4 lg:right-8'}`} aria-label={t('How to use Sanad')}>
        <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-cobalt-600">{t('Quick guide')}</p><h2 className="mt-1 text-lg font-bold text-slate-950 dark:text-white">{t('How to use Sanad')}</h2></div><button onClick={() => setHelpOpen(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-zinc-800" aria-label={t('Close')}><X size={18}/></button></div>
        <ol className="mt-5 space-y-4">{[t('Create or choose a workspace.'), t('Open Projects and create a project.'), t('Open the project and add tasks.'), t('Change task status directly from the list or board.')].map((step, index) => <li key={step} className="flex gap-3 text-sm leading-6 text-slate-600 dark:text-slate-300"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cobalt-100 text-xs font-bold text-cobalt-700 dark:bg-zinc-800 dark:text-cobalt-300">{index + 1}</span><span>{step}</span></li>)}</ol>
        <Link to="/app/workspaces" className="mt-5 flex min-h-10 items-center justify-center rounded-xl bg-cobalt-600 px-4 text-sm font-bold text-white shadow-sm hover:bg-cobalt-700">{t('Open workspaces')}</Link>
      </aside>}
      <main className="mx-auto w-full max-w-[1500px] p-4 sm:p-6 lg:p-8"><Outlet/></main>
    </div>
  </div>
}
