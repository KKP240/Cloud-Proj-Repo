import React, { useEffect, useState } from 'react'
import { getJson } from '../services/api'
import "../css/Home.css";


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
      <h2>Create Your Own Event</h2>
      <p>Create Your Own Event Create Your Own Event Create Your Own Event 
Create Your Own Event Create Your Own Event Create Your Own Event Create Your Own Event</p>
      <button className='Start'>Start Your Event</button>
      <button className='Join'>Join an Event</button>
    </div>
  )
}
