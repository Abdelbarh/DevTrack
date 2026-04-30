import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useApi } from '@/lib/api'
import type {
  Application,
  ApplicationDetail,
  CreateApplicationRequest,
} from '@/types/application'

export function useApplications() {
  const { request } = useApi()
  return useQuery<Application[]>({
    queryKey: ['applications'],
    queryFn: () => request<Application[]>('/applications'),
  })
}

export function useApplication(id: string) {
  const { request } = useApi()
  return useQuery<ApplicationDetail>({
    queryKey: ['application', id],
    queryFn: () => request<ApplicationDetail>(`/applications/${id}`),
    enabled: !!id,
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
      toast.success('Application saved')
      queryClient.invalidateQueries({ queryKey: ['applications'] })
    },
  })
}

export function useDeleteApplication() {
  const { request } = useApi()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      request<void>(`/applications/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast.success('Application deleted')
      queryClient.invalidateQueries({ queryKey: ['applications'] })
    },
  })
}

export function useUpdateApplicationStatus() {
  const { request } = useApi()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, newStatus, note }: { id: string; newStatus: string; note?: string }) =>
      request<void>(`/applications/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ newStatus, note }),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['application', variables.id] })
    },
  })
}

export function useParseApplication() {
  const { request } = useApi()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      request<{ companyName: string | null; jobTitle: string | null; parsedData: unknown }>(
        `/applications/${id}/parse`,
        { method: 'POST' }
      ),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['application', id] })
      queryClient.invalidateQueries({ queryKey: ['applications'] })
    },
  })
}

export function useScoreApplication() {
  const { request } = useApi()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      request<{ score: number; explanation: string }>(
        `/applications/${id}/score`,
        { method: 'POST' }
      ),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['application', id] })
      queryClient.invalidateQueries({ queryKey: ['applications'] })
    },
  })
}

export function useCreateDocument() {
  const { request } = useApi()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (appId: string) =>
      request<{ id: string; type: string; content: string; createdAt: string; updatedAt: string }>(
        `/applications/${appId}/documents`,
        { method: 'POST', body: JSON.stringify({ type: 'CoverLetter' }) }
      ),
    onSuccess: (_, appId) => {
      queryClient.invalidateQueries({ queryKey: ['application', appId] })
    },
  })
}

export function useUpdateDocument() {
  const { request } = useApi()
  return useMutation({
    mutationFn: ({ appId, docId, content }: { appId: string; docId: string; content: string }) =>
      request<void>(`/applications/${appId}/documents/${docId}`, {
        method: 'PATCH',
        body: JSON.stringify({ content }),
      }),
  })
}

export function useDeleteDocument() {
  const { request } = useApi()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ appId, docId }: { appId: string; docId: string }) =>
      request<void>(`/applications/${appId}/documents/${docId}`, { method: 'DELETE' }),
    onSuccess: (_, { appId }) => {
      queryClient.invalidateQueries({ queryKey: ['application', appId] })
    },
  })
}
