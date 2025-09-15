// client/src/pages/CreateEvent.jsx
import React, { useState } from 'react';
import { postJson } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function CreateEvent() {
  const [title, setTitle] = useState('');
  const [description, setDesc] = useState('');
  const [location, setLocation] = useState('');
  const [country, setCountry] = useState('');
  const [province, setProvince] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [capacity, setCapacity] = useState('');
  const [tags, setTags] = useState(''); // comma separated
  const [images, setImages] = useState(''); // comma separated URLs for now
  const [msg, setMsg] = useState(null);
  const nav = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setMsg('Creating...');
    const payload = {
      title, description, location, country, province,
      startDate, endDate, capacity: capacity ? Number(capacity) : null,
      tags: tags ? tags.split(',').map(s=>s.trim()).filter(Boolean) : [],
      images: images ? images.split(',').map(s=>s.trim()).filter(Boolean) : []
    };
    const token = localStorage.getItem('token'); // or use DISABLE_AUTH dev bypass

    // use fetch directly because postJson may not attach Auth header
    const res = await fetch('/api/activities', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': 'Bearer ' + token } : {})
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(()=>({}));
    if (res.ok) {
      setMsg('Created');
      nav(`/activities/${data.activity.id}`); // redirect to detail page (to be implemented)
    } else {
      setMsg('Error: ' + (data.error || JSON.stringify(data)));
    }
  }

  return (
    <div className="container">
      <h2>Create Event</h2>
      {msg && <div style={{marginBottom:10}}>{msg}</div>}
      <form onSubmit={onSubmit}>
        <div><label>Title<br/><input value={title} onChange={e=>setTitle(e.target.value)} required/></label></div>
        <div><label>Description<br/><textarea value={description} onChange={e=>setDesc(e.target.value)} /></label></div>
        <div><label>Location<br/><input value={location} onChange={e=>setLocation(e.target.value)} /></label></div>
        <div style={{display:'flex', gap:8}}>
          <label>Country<br/><input value={country} onChange={e=>setCountry(e.target.value)} /></label>
          <label>Province<br/><input value={province} onChange={e=>setProvince(e.target.value)} /></label>
        </div>
        <div style={{display:'flex', gap:8}}>
          <label>Start (ISO datetime)<br/><input value={startDate} onChange={e=>setStartDate(e.target.value)} placeholder="2025-09-01T09:00:00"/></label>
          <label>End (ISO datetime)<br/><input value={endDate} onChange={e=>setEndDate(e.target.value)} placeholder="2025-09-01T12:00:00"/></label>
        </div>
        <div><label>Capacity<br/><input type="number" value={capacity} onChange={e=>setCapacity(e.target.value)} /></label></div>
        <div><label>Tags (comma separated)<br/><input value={tags} onChange={e=>setTags(e.target.value)} /></label></div>
        <div><label>Images URLs (comma separated)<br/><input value={images} onChange={e=>setImages(e.target.value)} /></label></div>
        <div style={{marginTop:10}}><button type="submit">Create</button></div>
      </form>
    </div>
  );
}
