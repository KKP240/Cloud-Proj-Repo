const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

export async function login(email, password) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ email, password })
  });
  return res.json();
}

export function authFetch(path, opts={}) {
  const token = localStorage.getItem('token');
  const headers = { ...(opts.headers||{}), 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = 'Bearer ' + token;
  return fetch(`${API_BASE}${path}`, { ...opts, headers });
}
