import React, { useEffect, useState } from 'react'
import { getJson } from '../services/api'
import "../css/Home.css";
import img1 from "../img/img1.webp";
import img2 from "../img/img2.webp";
import img3 from "../img/img3.webp";
import img4 from "../img/img4.jpeg";



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
    
    <div className="container-Home">
      <h2>Create Your Own Event</h2>
      <p>Get ready for a special experience that you shouldn't miss at the event, which will be filled with fun, knowledge, and opportunities to meet new friends with great ideas,<br /> along with exciting activities, special prizes, and moments that will create unforgettable memories.</p>
      <button className='Start'><a href="/events/new" className='link_event'>Start Your Event</a></button>
      <button className='Join'>Join an Event</button>
      <div>
        <img src={img1} alt="" className='home-img123'/>
        <img src={img2} alt="" className='home-img123'/>
        <img src={img3} alt="" className='home-img123'/>
        <img src={img4} alt="" className='home-img123'/>
      </div>
    </div>
  )
}
