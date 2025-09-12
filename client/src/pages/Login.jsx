import React, { useState } from 'react';
import { login } from '../services/api';

export default function Login() {
  const [email,setEmail] = useState('');
  const [pw,setPw] = useState('');
  async function onSubmit(e){
    e.preventDefault();
    const res = await login(email, pw);
    if (res.token) {
      localStorage.setItem('token', res.token);
      window.location.href = '/'; // หรือ routed to /home
    } else {
      alert(res.error || 'Login failed');
    }
  }
  return (
    <form onSubmit={onSubmit}>
      <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="email" />
      <input type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="pw" />
      <button>Login</button>
    </form>
  );
}
