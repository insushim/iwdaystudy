const API_BASE = process.env.NEXT_PUBLIC_APP_URL || '';

export async function dbFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  const res = await fetch(`${API_BASE}/api${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function dbGet<T>(endpoint: string): Promise<T> {
  return dbFetch<T>(endpoint, { method: 'GET' });
}

export async function dbPost<T>(endpoint: string, body: unknown): Promise<T> {
  return dbFetch<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function dbPut<T>(endpoint: string, body: unknown): Promise<T> {
  return dbFetch<T>(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export async function dbDelete<T>(endpoint: string): Promise<T> {
  return dbFetch<T>(endpoint, { method: 'DELETE' });
}
