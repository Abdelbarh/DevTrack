import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useApi } from '@/lib/api'

export interface Profile {
  stack: string[]
  yearsOfExperience: number
  gitHubUrl: string | null
  resumeText: string | null
}

export interface ParseCvResult {
  stack: string[] | null
  yearsOfExperience: number | null
  gitHubUrl: string | null
  resumeText: string | null
}

export function useProfile() {
  const { request } = useApi()
  return useQuery<Profile>({
    queryKey: ['profile'],
    queryFn: () => request<Profile>('/users/me/profile'),
  })
}

export function useUpdateProfile() {
  const { request } = useApi()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Profile) =>
      request<void>('/users/me/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      toast.success('Profile saved')
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}

export function useParseCv() {
  const { request } = useApi()
  return useMutation({
    mutationFn: () => request<ParseCvResult>('/users/me/profile/parse-cv', { method: 'POST' }),
  })
}
