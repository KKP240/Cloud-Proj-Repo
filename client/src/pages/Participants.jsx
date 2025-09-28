// client/src/pages/Participants.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import "../css/Participants.css";

export default function Participants() {
  const { id } = useParams();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(()=> {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/activities/${id}/participants`, {
          headers: { 'Content-Type':'application/json', ...(token?{ Authorization: 'Bearer '+token }:{}) }
        });
        const body = await res.json().catch(()=>({}));
        console.log(`/api/activities/${id}/participants`, body);
        if (!res.ok) {
          setErr(body.error || 'Failed to load');
        } else {
          if (!cancelled) setList(body.participants || []);
        }
      } catch (e) {
        setErr(e.message || 'Network error');
      } finally { if(!cancelled) setLoading(false); }
    })();
    return ()=> cancelled = true;
  }, [id]);

  if (loading) return <div className="Parttic_css">Loading...</div>;
  if (err) return <div className="Parttic_css" style={{color:'red'}}>Error: {err}</div>;

  return (
    <div className="Parttic_css">
      <h2>Participants</h2>
      <Link to={`/activities/${id}`}>Back to event</Link>
      <ul style={{marginTop:12}}>
        {list.length === 0 ? <li>No participants</li> : list.map(p => (
          <li key={p.registrationId} style={{padding:8,borderBottom:'1px solid #eee'}}>
            <strong>{p.user ? (p.user.firstName || p.user.username) : 'Guest'}</strong>
            <div style={{fontSize:12,color:'#666'}}>{p.user ? p.user.email : ''}</div>
            <div style={{fontSize:12,color:'#999'}}>Registered at: {p.registeredAt ? new Date(p.registeredAt).toLocaleString() : '-'}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}