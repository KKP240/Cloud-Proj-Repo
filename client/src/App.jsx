import React, { useEffect } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import './navbar.css';
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
    } else {
      document.body.className = "default-body"
    }
  }, [location])

  return null
}

export default function App() {
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
          <Link to="/Login">login</Link>
          <Link to="/Register">register</Link>
        </div>

        <div className='navbar-signin'>
          <Link to="/login" className='signin-btn'>
            <span>Sign in</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
            </svg>
          </Link>
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
          <Route path="/login" element={<Login />} />
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
