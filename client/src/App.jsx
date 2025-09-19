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
  const [showDropdown, setShowDropdown] = useState(false)
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

  // dropdown เลื่อนลง
  useEffect(() => {
  if (open) {
    setShowDropdown(true) // show dropdown when open
    } else {
      // wait for animation before unmount
      const timeout = setTimeout(() => setShowDropdown(false), 300)
      return () => clearTimeout(timeout)
    }
  }, [open])

  function logout() {
    localStorage.removeItem('token')
    setUserChanged(v => v + 1)
    window.location.href = '/login'
  }

  if (!user) {
    return (
      <Link to="/login" className="signin-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="20" height="20">
          <rect width="256" height="256" fill="none"/>
          <circle cx="128" cy="96" r="64" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
          <path d="M32,216c19.37-33.47,54.55-56,96-56s76.63,22.53,96,56" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
        </svg>
        <span>Sign in</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
        </svg>
</Link>
    )
  }

  return (
    <div className="user-menu" ref={menuRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button className="user-btn" onClick={() => setOpen(v => !v)}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="20" height="20">
          <rect width="256" height="256" fill="none"/>
          <circle cx="128" cy="96" r="64" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
          <path d="M32,216c19.37-33.47,54.55-56,96-56s76.63,22.53,96,56" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
        </svg>
        {user.username || user.email}
        <span
          className={`dropdown-arrow ${open ? 'rotate' : ''}`}
          style={{ marginLeft: 6 }}
        >▼</span>
      </button>
      {showDropdown && (
        <div className={`dropdown ${open ? 'show' : 'hide'}`}>
          <Link to="/profile" className="dropdown-item" onClick={() => setOpen(false)}>Profile</Link>
          <Link to="/activities" className="dropdown-item" onClick={() => setOpen(false)}>Event</Link>
          <Link to="/my-events" className="dropdown-item" onClick={() => setOpen(false)}>Created Event</Link>
          <Link className="dropdown-item" onClick={logout}>Logout</Link>
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
