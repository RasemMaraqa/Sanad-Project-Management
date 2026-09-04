export interface User {
  id: number
  email: string
  username: string
}

export interface AuthToken {
  access_token: string
  token_type: 'bearer' | string
}

export interface Workspace {
  id: number
  name: string
  owner_id: number
}

export interface WorkspaceMember {
  user_id: number
  username: string
  email: string
  role: string
}

export interface Permission {
  id: number
  name: string
}

export interface Role {
  id: number
  name: string
  workspace_id: number
  permissions: Permission[]
}

export interface Project {
  id: number
  name: string
  desc: string | null
  workspace_id: number
}

export type TaskStatus = 'To Do' | 'In Progress' | 'Done'
export type TaskPriority = '1' | '2' | '3' | '4' | '5'

export interface Task {
  id: number
  title: string
  desc: string | null
  status: TaskStatus
  priority: TaskPriority
  due_date: string | null
  project_id: number
  assigned_to: number | null
}

export interface TaskListResponse {
  items: Task[]
  page: number
  limit: number
  total: number
}

export interface ProjectInput {
  name: string
  desc?: string | null
}

export interface TaskInput {
  title: string
  desc?: string | null
  priority?: TaskPriority
  due_date?: string | null
  assigned_to?: number | null
}

export interface TaskUpdate extends Partial<TaskInput> {
  status?: TaskStatus
}

export interface ApiValidationIssue {
  loc?: Array<string | number>
  msg?: string
}

export interface ApiErrorBody {
  detail?: string | ApiValidationIssue[]
}
