import { apiRequest, queryString } from './client'
import type { Task, TaskInput, TaskListResponse, TaskPriority, TaskStatus, TaskUpdate } from '../types'

export const taskApi = {
  list: (projectId: number, filters: { status?: TaskStatus; priority?: TaskPriority; page?: number; limit?: number } = {}) =>
    apiRequest<TaskListResponse>(`/projects/${projectId}/tasks${queryString({ ...filters })}`),
  get: (projectId: number, taskId: number) => apiRequest<Task>(`/projects/${projectId}/tasks/${taskId}`),
  create: (projectId: number, data: TaskInput) => apiRequest<Task>(`/projects/${projectId}/tasks`, { method: 'POST', body: JSON.stringify(data) }),
  update: (projectId: number, taskId: number, data: TaskUpdate) => apiRequest<Task>(`/projects/${projectId}/tasks/${taskId}`, { method: 'PATCH', body: JSON.stringify(data) }),
  remove: (projectId: number, taskId: number) => apiRequest<{ message: string }>(`/projects/${projectId}/tasks/${taskId}`, { method: 'DELETE' }),
}
