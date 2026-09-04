import { useQuery } from '@tanstack/react-query'
import { workspaceApi } from '../api/workspaces'
import { useAuth } from '../context/AuthContext'

export function useWorkspaceAccess(workspaceId?: number) {
  const { user } = useAuth()
  const membersQuery = useQuery({ queryKey: ['members', workspaceId], queryFn: () => workspaceApi.members(workspaceId!), enabled: Boolean(workspaceId) })
  const rolesQuery = useQuery({ queryKey: ['roles', workspaceId], queryFn: () => workspaceApi.roles(workspaceId!), enabled: Boolean(workspaceId) })
  const member = membersQuery.data?.find((item) => item.user_id === user?.id)
  const role = rolesQuery.data?.find((item) => item.name === member?.role)
  const permissions = new Set(role?.permissions.map((item) => item.name) ?? [])
  return {
    member,
    roles: rolesQuery.data ?? [],
    permissions,
    can: (permission: string) => permissions.has(permission),
    isLoading: membersQuery.isLoading || rolesQuery.isLoading,
  }
}
