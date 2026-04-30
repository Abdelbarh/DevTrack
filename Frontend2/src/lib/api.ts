import { useAuth } from '@clerk/clerk-react'

const BASE = import.meta.env.VITE_API_URL ?? 'https://localhost:7272'

export function useApi() {
  const { getToken } = useAuth()

  async function request<T>(path: string, options?: RequestInit): Promise<T> {
    const token = await getToken()
    const res = await fetch(`${BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options?.headers,
      },
    })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(text || `Request failed: ${res.status}`)
    }
    if (res.status === 204) return undefined as T
    return res.json() as Promise<T>
  }

  return { request }
}
