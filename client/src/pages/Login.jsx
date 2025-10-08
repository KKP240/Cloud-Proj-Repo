import React, { useState } from 'react'
import { postJson } from '../services/api'
import { useNavigate } from 'react-router-dom'
import "../css/Login.css";

export default function Login({ setUserChanged }) {
  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')
  const [msg,setMsg] = useState(null)
  const nav = useNavigate()

  async function onSubmit(e){
    e.preventDefault()
    const { ok, body } = await postJson('/api/auth/login', { email, password })
    if (ok && body.token) {
      localStorage.setItem('token', body.token)
      setUserChanged(v => v + 1)
      nav('/')
    } else {
      setMsg(body.error || 'Login failed')
    }
  }

  return (
    <div className="login-container">
      <h2>SIGN IN</h2>
      <form onSubmit={onSubmit}>
        <div className="input-wrapper">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {/* Icon user */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M12 12c2.7 0 4.9-2.2 4.9-4.9S14.7 2.2 12 2.2 7.1 4.4 7.1 7.1 9.3 12 12 12zm0 2.2c-3.3 0-9.9 1.7-9.9 5v2.7h19.8V19.2c0-3.3-6.6-5-9.9-5z"/>
          </svg>
        </div>

        <div className="input-wrapper">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {/* Icon lock */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M12 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm6-7h-1V7a5 5 0 0 0-10 0v3H6c-1.1 0-2 .9-2 2v9c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-9c0-1.1-.9-2-2-2zm-7 0h2V7a3 3 0 0 0-6 0v3h2z"/>
          </svg>
        </div>

        <button type="submit">LOGIN</button>
      </form>

      <div className="signup-text">
        don’t have id ? <a href="/register">Click</a>
      </div>
    </div>
  );

}
