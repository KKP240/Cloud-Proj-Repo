import React, { useState } from 'react'
import { postJson } from '../services/api'
import { useNavigate } from 'react-router-dom'
import '../css/Register.css'

export default function Register() {
  const [firstName, setFirstname] = useState('')
  const [lastName, setLastname] = useState('')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [Confirmpassword, setConfirmpassword] = useState('')
  const [msg, setMsg] = useState(null)
  const nav = useNavigate()

  async function onSubmit(e) {
    e.preventDefault()
    const { ok, body, status } = await postJson('/api/auth/register', { 
      firstName, 
      lastName, 
      email, 
      username, 
      Confirmpassword, 
      password 
    })
    if (ok || status === 201) {
      alert('Registered. Please login.')
      nav('/login')
    } else {
      setMsg(body.error || JSON.stringify(body))
    }
  }

  return (
    <div className="register-container">
      <div className="register-card">
        <h2 className="register-title">Register</h2>
        
        {msg && <div className="error-message">{msg}</div>}
        
        <form onSubmit={onSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Firstname</label>
              <input 
                className="form-input"
                placeholder="Name"
                value={firstName} 
                onChange={e => setFirstname(e.target.value)} 
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Surname</label>
              <input 
                className="form-input"
                placeholder="Surname"
                value={lastName} 
                onChange={e => setLastname(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div className="form-group full-width">
            <label className="form-label">Email</label>
            <input 
              className="form-input"
              placeholder="Email"
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              type="email" 
              required 
            />
          </div>

          <div className="form-group full-width">
            <label className="form-label">Username</label>
            <input 
              className="form-input"
              placeholder="Username"
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              required 
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Password</label>
              <input 
                className="form-input"
                placeholder="Password"
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                type="password" 
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm password</label>
              <input 
                className="form-input"
                placeholder="Confirm password"
                value={Confirmpassword} 
                onChange={e => setConfirmpassword(e.target.value)} 
                type="password" 
                required 
              />
            </div>
          </div>

          <button type="submit" className="submit-button">
            Create User
          </button>
        </form>
      </div>
    </div>
  )
}