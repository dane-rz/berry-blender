// Typed fetch wrapper — the single place HTTP concerns live. Nothing calls a
// real network yet (the berry catalog is mocked in services/berries), but this
// is ready to back real endpoints: a service just calls `client.get<T>(path)`.

export class ApiError extends Error {
  status: number
  details: unknown

  constructor(message: string, status: number, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

const BASE_URL = import.meta.env.VITE_API_URL ?? ''

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  })

  if (!res.ok) {
    const details = await res.json().catch(() => undefined)
    throw new ApiError(`Request to ${path} failed`, res.status, details)
  }

  return res.json() as Promise<T>
}

export const client = {
  get: <T>(path: string, init?: RequestInit) =>
    request<T>(path, { ...init, method: 'GET' }),
  post: <T>(path: string, body?: unknown, init?: RequestInit) =>
    request<T>(path, { ...init, method: 'POST', body: JSON.stringify(body) }),
}
