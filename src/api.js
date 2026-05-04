const BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'

const TOKEN_KEY = 'pos_token'

export const tokenStore = {
  get:   () => localStorage.getItem(TOKEN_KEY),
  set:   (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY)
}

async function request(path, options = {}) {
  const token = tokenStore.get()
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  }

  const res = await fetch(`${BASE}${path}`, { ...options, headers })

  if (res.status === 401) {
    tokenStore.clear()
    // Only force a redirect when the caller was using a token (logged-in session
    // expired). Public calls or guest visits should just surface the error.
    if (token && !path.startsWith('/auth/')) {
      window.location.href = '/login'
    }
    throw new Error('Unauthenticated')
  }

  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`
    try {
      const body = await res.json()
      if (body?.message) msg = body.message
    } catch { /* noop */ }
    throw new Error(msg)
  }

  if (res.status === 204) return null
  return res.json()
}

export const api = {
  // auth
  login:    (email, password) => request('/auth/login',    { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (payload)         => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  logout:   () => request('/auth/logout', { method: 'POST' }),
  me:       () => request('/auth/me'),

  // data
  dashboard:    () => request('/dashboard'),
  categories:   () => request('/categories'),
  menuItems:    (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return request(`/menu-items${qs ? `?${qs}` : ''}`)
  },
  recentOrders: () => request('/orders/recent'),
  createOrder:  (payload) => request('/orders', { method: 'POST', body: JSON.stringify(payload) })
}
