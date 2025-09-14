import React, { useEffect, useState } from 'react'
import { getJson } from '../services/api'

export default function Home(){
  const [user, setUser] = useState(null)
  const [err, setErr] = useState(null)

  useEffect(()=> {
    async function load() {
      const { ok, status, body } = await getJson('/api/auth/me')
      if (ok) {
        // backend returns either { id, email, name } or { user: { ... } }
        setUser(body.user || body)
      } else {
        setErr(body.error || 'Not logged in')
      }
    }
    load()
  }, [])

  function logout(){
    localStorage.removeItem('token')
    window.location.href = '/login'
  }

  return (
    <div className="container">
      <h2>Home</h2>
      {user ? (
        <>
          <p>Logged in as: <strong>{user.name || user.email}</strong></p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <>
          <p>{err || 'Loading...'}</p>
        </>
      )}
    </div>
  )
}
