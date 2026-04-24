import { useMutation } from '@tanstack/react-query'
import { useApi } from '@/lib/api'
import { useEffect } from 'react'

export function useUserSync() {
  const { request } = useApi()

  const { mutate } = useMutation({
    mutationFn: () => request<void>('/users/sync', { method: 'POST' }),
  })

  useEffect(() => {
    mutate()
  }, [mutate])
}
