import React, { useState } from 'react'
import { postJson } from '../services/api'
import { useNavigate } from 'react-router-dom'

export default function Register(){
  const [name,setName] = useState('')
  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')
  const [msg,setMsg] = useState(null)
  const nav = useNavigate()

  async function onSubmit(e){
    e.preventDefault()
    const { ok, body, status } = await postJson('/api/auth/register', { name, email, password })
    if (ok || status === 201) {
      alert('Registered. Please login.')
      nav('/login')
    } else {
      setMsg(body.error || JSON.stringify(body))
    }
  }

  return (
    <div className="container">
      <h2>Register</h2>
      {msg && <div style={{color:'red'}}>{msg}</div>}
      <form onSubmit={onSubmit}>
        <div style={{marginBottom:8}}>
          <label>Name<br/><input value={name} onChange={e=>setName(e.target.value)} required /></label>
        </div>
        <div style={{marginBottom:8}}>
          <label>Email<br/><input value={email} onChange={e=>setEmail(e.target.value)} type="email" required /></label>
        </div>
        <div style={{marginBottom:8}}>
          <label>Password<br/><input value={password} onChange={e=>setPassword(e.target.value)} type="password" required /></label>
        </div>
        <button type="submit">Register</button>
      </form>
    </div>
  )
}
