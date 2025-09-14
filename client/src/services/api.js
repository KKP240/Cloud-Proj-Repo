// client/src/services/api.js
const API_BASE = import.meta.env.VITE_API_BASE || '';

export async function postJson(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const json = await res.json().catch(()=>({}));
  return { ok: res.ok, status: res.status, body: json };
}

export async function getJson(path, withAuth=true) {
  const headers = { 'Content-Type': 'application/json' };
  if (withAuth) {
    const token = localStorage.getItem('token');
    if (token) headers['Authorization'] = 'Bearer ' + token;
  }
  const res = await fetch(`${API_BASE}${path}`, { headers });
  const json = await res.json().catch(()=>({}));
  return { ok: res.ok, status: res.status, body: json };
}
