import React, { useEffect } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
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
    }else if (location.pathname === "/events/new") {
      document.body.className = "events-body"
    }else {
      document.body.className = "default-body"
    }
  }, [location])

  return null
}

export default function App() {
  return (
    <div>
      <BodyClassController />   {/* ใช้งานตรงนี้ */}
      
      <nav style={{ padding: 12, borderBottom: '1px solid #ddd' }}>
        <Link to="/home" style={{ marginRight: 12 }}>Home</Link>
        <Link to="/login" style={{ marginRight: 12 }}>Login</Link>
        <Link to="/register" style={{ marginRight: 12 }}>Register</Link>
        <Link to="/activities" style={{ marginRight: 12 }}>Activities</Link>
        <Link to="/events/new" style={{ marginRight: 12 }}>Create Event</Link>
        <Link to="/profile" style={{ marginRight: 12 }}>Profile</Link>
      </nav>

      <main style={{ padding: 16}}>
        <Routes>
          <Route path="/home" element={<Home/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/register" element={<Register/>} />
          <Route path="/activities" element={<Activities/>} />
          <Route path="/events/new" element={<CreateEvent/>} />
          <Route path="/activities/:id" element={<ActivityDetail/>} />
          <Route path="/activities/:id/participants" element={<Participants/>} />
          <Route path="/profile" element={<Profile/>} />
        </Routes>
      </main>
    </div>
  )
}
