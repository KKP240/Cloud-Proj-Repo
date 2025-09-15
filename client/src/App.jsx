import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import Activities from './pages/Activities';

export default function App() {
  return (
    <div>
      <nav style={{ padding: 12, borderBottom: '1px solid #ddd' }}>
        <Link to="/" style={{ marginRight: 12 }}>Home</Link>
        <Link to="/login" style={{ marginRight: 12 }}>Login</Link>
        <Link to="/register" style={{ marginRight: 12 }}>Register</Link>
        <Link to="/activities" style={{ marginRight: 12 }}>Activities</Link>
      </nav>

      <main style={{ padding: 16 }}>
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/register" element={<Register/>} />
          <Route path="/activities" element={<Activities/>} />
        </Routes>
      </main>
    </div>
  )
}