import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { LoadingState } from './components/ui/States'
import { useAuth } from './context/AuthContext'
import { useLanguage } from './context/LanguageContext'
import { AppShell } from './layouts/AppShell'
import { LoginPage, RegisterPage } from './pages/AuthPages'
import { DashboardPage } from './pages/DashboardPage'
import { MembersPage } from './pages/MembersPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ProjectDetailPage } from './pages/ProjectDetailPage'
import { ProjectsPage } from './pages/ProjectsPage'
import { RolesPage } from './pages/RolesPage'
import { SettingsPage } from './pages/SettingsPage'
import { TaskDetailPage } from './pages/TaskDetailPage'
import { TasksPage } from './pages/TasksPage'
import { WorkspaceOverviewPage } from './pages/WorkspaceOverviewPage'
import { WorkspacesPage } from './pages/WorkspacesPage'

function RequireAuth() {
  const { isAuthenticated, isLoading } = useAuth()
  const { t } = useLanguage()
  const location = useLocation()
  if (isLoading) return <div className="flex min-h-screen items-center justify-center bg-cloud p-5 dark:bg-zinc-950"><div className="w-full max-w-md"><LoadingState label={t('Restoring your session…')}/></div></div>
  return isAuthenticated ? <AppShell/> : <Navigate to="/login" state={{ from: location.pathname }} replace/>
}

export default function App() {
  return <Routes>
    <Route path="/" element={<Navigate to="/app/dashboard" replace/>}/>
    <Route path="/login" element={<LoginPage/>}/>
    <Route path="/register" element={<RegisterPage/>}/>
    <Route path="/app" element={<RequireAuth/>}>
      <Route index element={<Navigate to="dashboard" replace/>}/>
      <Route path="dashboard" element={<DashboardPage/>}/>
      <Route path="workspaces" element={<WorkspacesPage/>}/>
      <Route path="workspaces/:workspaceId" element={<WorkspaceOverviewPage/>}/>
      <Route path="workspaces/:workspaceId/projects" element={<ProjectsPage/>}/>
      <Route path="workspaces/:workspaceId/projects/:projectId" element={<ProjectDetailPage/>}/>
      <Route path="workspaces/:workspaceId/projects/:projectId/tasks" element={<TasksPage/>}/>
      <Route path="workspaces/:workspaceId/projects/:projectId/tasks/:taskId" element={<TaskDetailPage/>}/>
      <Route path="workspaces/:workspaceId/members" element={<MembersPage/>}/>
      <Route path="workspaces/:workspaceId/roles" element={<RolesPage/>}/>
      <Route path="settings" element={<SettingsPage/>}/>
    </Route>
    <Route path="*" element={<NotFoundPage/>}/>
  </Routes>
}
