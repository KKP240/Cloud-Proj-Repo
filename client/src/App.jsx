import React, { useEffect, useState, useRef } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import './navbar.css';
import './App.css';
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import Activities from './pages/Activities';
import CreateEvent from './pages/CreateEvent';
import ActivityDetail from './pages/ActivityDetail';
import Participants from './pages/Participants';
import Profile from './pages/Profile';

function BodyClassController() {
  const location = useLocation()

  useEffect(() => {
    if (location.pathname === "/login") {
      document.body.className = "login-body"
    } else if (location.pathname === "/register") {
      document.body.className = "register-body"
    } else if (location.pathname === "/profile") {
      document.body.className = "profile-body"
    } else if (location.pathname === "/home") {
      document.body.className = "home-body"
    } else if (location.pathname === "/events/new") {
      document.body.className = "events-body"
    }else if (location.pathname === "/activities") {
      document.body.className = "activities-body"
    }else if (/^\/activities\/\d+/.test(location.pathname)) {
  document.body.className = "activities-body-1"
}else {
      document.body.className = "default-body"
    }
  }, [location])

  return null
}

function UserMenu({ userChanged, setUserChanged }) {
  const [user, setUser] = useState(null)
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      fetch('/api/auth/me', {
        headers: { 'Authorization': 'Bearer ' + token }
      })
        .then(res => res.json())
        .then(data => setUser(data.user || data))
        .catch(() => setUser(null))
    } else {
      setUser(null)
    }
  }, [userChanged]) // <--- เพิ่ม dependency

  // Close dropdown when click outside
  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  function logout() {
    localStorage.removeItem('token')
    setUserChanged(v => v + 1)
    window.location.href = '/login'
  }

  if (!user) {
    return (
      <Link to="/login" className='signin-btn'>
        <span>Sign in</span>
        {/* ...icon... */}
      </Link>
    )
  }

  return (
    <div className="user-menu" ref={menuRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button className="user-btn" onClick={() => setOpen(v => !v)}>
        {user.username || user.email}
        <span style={{ marginLeft: 6 }}>▼</span>
      </button>
      {open && (
        <div className="dropdown" style={{
          position: 'absolute', right: 0, top: '100%', background: '#fff', border: '1px solid #ddd', borderRadius: 6, minWidth: 160, zIndex: 1000
        }}>
          <div><Link to="/profile" className="dropdown-item" onClick={() => setOpen(false)}>Profile</Link> </div>
          <div><Link to="/activities" className="dropdown-item" onClick={() => setOpen(false)}>Event</Link> </div>
          <div><Link to="/my-events" className="dropdown-item" onClick={() => setOpen(false)}>Created Event</Link> </div>
          <div><Link className="dropdown-item" onClick={logout}>Logout</Link> </div>
        </div>
      )}
    </div>
  )
}

export default function App() {
  const [userChanged, setUserChanged] = useState(0);
  return (
    <div>
      <BodyClassController />   {/* ใช้งานตรงนี้ */}

      <nav className='navbar'>
        <div className='navbar-logo'>
          <Link to="/home">Logo</Link>
        </div>

        <div className='navbar-links'>
          <Link to="/home">Home</Link>
          <Link to="/activities">Activities</Link>
          <Link to="/events/new">Create Event</Link>
          
          {/* for quick test */}
          <Link to="/profile">profile</Link>
          <Link to="/login">login</Link>
          <Link to="/Register">register</Link>
        </div>

        <div className='navbar-signin'>
          <UserMenu userChanged={userChanged} setUserChanged={setUserChanged} />
        </div>
      </nav>

      <main style={{
        paddingTop: '80px',
        paddingLeft: '16px',
        paddingRight: '16px',
        paddingBottom: '16px'
      }}>
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login setUserChanged={setUserChanged} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/events/new" element={<CreateEvent />} />
          <Route path="/activities/:id" element={<ActivityDetail />} />
          <Route path="/activities/:id/participants" element={<Participants />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
    </div>
  )
}
