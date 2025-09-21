// client/src/services/api.js
const API_BASE = import.meta.env.VITE_API_BASE || '';

export async function getActivities({ page = 1, limit = 20 } = {}) {
  const params = new URLSearchParams({ page, limit });
  const res = await fetch(`${API_BASE}/api/activities?${params.toString()}`, {
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) {
    const err = await res.json().catch(()=>({ error: 'Unknown' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function deleteActivity(id) {
  const res = await fetch(`${API_BASE}/api/activities/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!res.ok) {
    let errMsg = res.statusText;
    try {
      const errData = await res.json();
      errMsg = errData.error || errMsg;
    } catch {}
    throw new Error('ลบไม่สำเร็จ: ' + errMsg);
  }
  
  try {
    return await res.json();
  } catch {
    return { message: 'Deleted' };
  }
}

// ✨ เพิ่มฟังก์ชันใหม่: ดึงกิจกรรมที่ผู้ใช้ join แล้ว
export async function getUserActivityIds() {
  const token = localStorage.getItem('token');
  if (!token) return [];
  
  const res = await fetch(`${API_BASE}/api/user/activity-ids`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!res.ok) {
    console.error('Failed to fetch user activities');
    return [];
  }
  
  try {
    return await res.json();
  } catch {
    return [];
  }
}

// เพิ่มฟังก์ชันสำหรับ Profile
export async function getCurrentUser() {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token found');
  
  const res = await fetch(`${API_BASE}/api/auth/me`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to fetch user' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  
  return res.json();
}

export async function updateProfile(userData) {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token found');
  
  const res = await fetch(`${API_BASE}/api/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(userData)
  });
  
  const json = await res.json().catch(() => ({}));
  
  if (!res.ok) {
    throw new Error(json.error || `HTTP ${res.status}`);
  }
  
  return json;
}

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