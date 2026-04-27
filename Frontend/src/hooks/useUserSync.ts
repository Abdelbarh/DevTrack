import { useMutation } from '@tanstack/react-query'
import { useApi } from '@/lib/api'
import { useEffect, useRef } from 'react'

export function useUserSync() {
  const { request } = useApi()
  const synced = useRef(false)

  const { mutate } = useMutation({
    mutationFn: () => request<void>('/users/sync', { method: 'POST' }),
  })

  useEffect(() => {
    if (synced.current) return
    synced.current = true
    mutate()
  }, [mutate])
}
