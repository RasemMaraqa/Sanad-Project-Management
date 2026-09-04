import { apiRequest } from './client'
import type { Permission, Role, Workspace, WorkspaceMember } from '../types'

export const workspaceApi = {
  list: () => apiRequest<Workspace[]>('/workspaces/'),
  get: (workspaceId: number) => apiRequest<Workspace>(`/workspaces/${workspaceId}`),
  create: (name: string) => apiRequest<Workspace>('/workspaces/', { method: 'POST', body: JSON.stringify({ name }) }),
  update: (workspaceId: number, name: string) => apiRequest<{ name: string }>(`/workspaces/${workspaceId}`, { method: 'PATCH', body: JSON.stringify({ name }) }),
  remove: (workspaceId: number) => apiRequest<{ message: string }>(`/workspaces/${workspaceId}`, { method: 'DELETE' }),
  members: (workspaceId: number) => apiRequest<WorkspaceMember[]>(`/workspaces/${workspaceId}/members`),
  addMember: (workspaceId: number, email: string, roleId: number) => apiRequest<{ message: string }>(`/workspaces/${workspaceId}/members`, { method: 'POST', body: JSON.stringify({ email, role_id: roleId }) }),
  updateMemberRole: (workspaceId: number, userId: number, roleId: number) => apiRequest<WorkspaceMember>(`/workspaces/${workspaceId}/members/${userId}/role`, { method: 'PATCH', body: JSON.stringify({ role_id: roleId }) }),
  permissions: () => apiRequest<Permission[]>('/workspaces/permissions'),
  roles: (workspaceId: number) => apiRequest<Role[]>(`/workspaces/${workspaceId}/roles`),
  createRole: (workspaceId: number, data: { name: string; permission_ids: number[] }) => apiRequest<Role>(`/workspaces/${workspaceId}/roles`, { method: 'POST', body: JSON.stringify(data) }),
  updateRole: (workspaceId: number, roleId: number, data: { name?: string; permission_ids?: number[] }) => apiRequest<Role>(`/workspaces/${workspaceId}/roles/${roleId}`, { method: 'PATCH', body: JSON.stringify(data) }),
  removeRole: (workspaceId: number, roleId: number) => apiRequest<{ message: string }>(`/workspaces/${workspaceId}/roles/${roleId}`, { method: 'DELETE' }),
}
