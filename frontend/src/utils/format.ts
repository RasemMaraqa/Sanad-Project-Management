import type { TaskPriority, TaskStatus } from '../types'

export const priorityLabel: Record<TaskPriority, string> = {
  '1': 'Lowest', '2': 'Low', '3': 'Medium', '4': 'High', '5': 'Urgent',
}

export function initials(value: string) {
  return value.split(/[\s@._-]+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
}

export function formatDate(value: string | null) {
  if (!value) return 'No due date'
  return new Intl.DateTimeFormat(document.documentElement.lang || undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value))
}

export function dateTimeInput(value: string | null) {
  if (!value) return ''
  const date = new Date(value)
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 16)
}

export function isOverdue(value: string | null, status: TaskStatus) {
  return Boolean(value && status !== 'Done' && new Date(value).getTime() < Date.now())
}

export function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong.'
}
