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
import ActivityManager from './pages/ActivityManager';
import ActivitiesEdit from './pages/ActivitiesEdit';

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
    <div className="dropdown-item">
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#000000" viewBox="0 0 256 256"><path d="M144,157.68a68,68,0,1,0-71.9,0c-20.65,6.76-39.23,19.39-54.17,37.17a8,8,0,1,0,12.24,10.3C50.25,181.19,77.91,168,108,168s57.75,13.19,77.87,37.15a8,8,0,0,0,12.26-10.3C183.18,177.07,164.6,164.44,144,157.68ZM56,100a52,52,0,1,1,52,52A52.06,52.06,0,0,1,56,100Zm196.25,43.07-4.66-2.69a23.6,23.6,0,0,0,0-8.76l4.66-2.69a8,8,0,1,0-8-13.86l-4.67,2.7a23.92,23.92,0,0,0-7.58-4.39V108a8,8,0,0,0-16,0v5.38a23.92,23.92,0,0,0-7.58,4.39l-4.67-2.7a8,8,0,1,0-8,13.86l4.66,2.69a23.6,23.6,0,0,0,0,8.76l-4.66,2.69a8,8,0,0,0,8,13.86l4.67-2.7a23.92,23.92,0,0,0,7.58,4.39V164a8,8,0,0,0,16,0v-5.38a23.92,23.92,0,0,0,7.58-4.39l4.67,2.7a7.92,7.92,0,0,0,4,1.07,8,8,0,0,0,4-14.93ZM216,136a8,8,0,1,1,8,8A8,8,0,0,1,216,136Z"></path></svg>
      <Link to="/profile" onClick={() => setOpen(false)} style={{ flex: 1, textDecoration: 'none', color: '#333' }}>
        Profile
      </Link>
    </div>

    <div className="dropdown-item">
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#000000" viewBox="0 0 256 256"><path d="M238.73,43.67A8,8,0,0,0,232,40H152a8,8,0,0,0-7.28,4.69L135.94,64H28a8,8,0,0,0-5.92,13.38L57.19,116,22.08,154.62A8,8,0,0,0,28,168h73.09a8,8,0,0,0,7.28-4.69L117.15,144h62.43l-34.86,76.69a8,8,0,1,0,14.56,6.62l80-176A8,8,0,0,0,238.73,43.67ZM95.94,152H46.08l27.84-30.62a8,8,0,0,0,0-10.76L46.08,80h82.59Zm90.91-24H124.42l32.73-72h62.43Z"></path></svg>
      <Link to="/activities" onClick={() => setOpen(false)} style={{ flex: 1, textDecoration: 'none', color: '#333' }}>
        Event
      </Link>
    </div>

    <div className="dropdown-item">
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#000000" viewBox="0 0 256 256"><path d="M208,32H184V24a8,8,0,0,0-16,0v8H88V24a8,8,0,0,0-16,0v8H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM72,48v8a8,8,0,0,0,16,0V48h80v8a8,8,0,0,0,16,0V48h24V80H48V48ZM208,208H48V96H208V208Zm-48-56a8,8,0,0,1-8,8H136v16a8,8,0,0,1-16,0V160H104a8,8,0,0,1,0-16h16V128a8,8,0,0,1,16,0v16h16A8,8,0,0,1,160,152Z"></path></svg>
      <Link to="/my-events" onClick={() => setOpen(false)} style={{ flex: 1, textDecoration: 'none', color: '#333' }}>
        Created Event
      </Link>
    </div>

    <div className="dropdown-item" onClick={logout} style={{ cursor: 'pointer' }}>
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#000000" viewBox="0 0 256 256"><path d="M120,216a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V40a8,8,0,0,1,8-8h64a8,8,0,0,1,0,16H56V208h56A8,8,0,0,1,120,216Zm109.66-93.66-40-40a8,8,0,0,0-11.32,11.32L204.69,120H112a8,8,0,0,0,0,16h92.69l-26.35,26.34a8,8,0,0,0,11.32,11.32l40-40A8,8,0,0,0,229.66,122.34Z"></path></svg>
      <span style={{ flex: 1, color: '#333' }}>Logout</span>
    </div>
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
          <Link to="/activityManager">ActivityManager</Link>
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
          <Route path="/activityManager" element={<ActivityManager />} />
          <Route path="/activitiesEdit/:id" element={<ActivitiesEdit />} />
        </Routes>
      </main>
    </div>
  )
}
