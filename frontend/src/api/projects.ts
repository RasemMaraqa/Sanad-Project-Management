import { apiRequest } from './client'
import type { Project, ProjectInput } from '../types'

export const projectApi = {
  list: (workspaceId: number) => apiRequest<Project[]>(`/workspaces/${workspaceId}/projects`),
  create: (workspaceId: number, data: ProjectInput) => apiRequest<Project>(`/workspaces/${workspaceId}/projects`, { method: 'POST', body: JSON.stringify(data) }),
  update: (projectId: number, data: Partial<ProjectInput>) => apiRequest<Project>(`/projects/${projectId}`, { method: 'PATCH', body: JSON.stringify(data) }),
  remove: (projectId: number) => apiRequest<{ message: string }>(`/projects/${projectId}`, { method: 'DELETE' }),
}
