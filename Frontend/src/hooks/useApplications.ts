import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useApi } from '@/lib/api'
import type { Application, CreateApplicationRequest } from '@/types/application'

export function useApplications() {
  const { request } = useApi()
  return useQuery<Application[]>({
    queryKey: ['applications'],
    queryFn: () => request<Application[]>('/applications'),
  })
}

export function useCreateApplication() {
  const { request } = useApi()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateApplicationRequest) =>
      request<Application>('/applications', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      toast.success('Application added')
      queryClient.invalidateQueries({ queryKey: ['applications'] })
    },
  })
}

export function useUpdateApplicationStatus() {
  const { request } = useApi()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      request<void>(`/applications/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['applications'] }),
  })
}
