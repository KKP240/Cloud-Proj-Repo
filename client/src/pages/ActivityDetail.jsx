// client/src/pages/ActivityDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function ActivityDetail() {
  const { id } = useParams();
  const [activityData, setActivityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(()=> {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/activities/${id}`, {
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
        });
        const body = await res.json().catch(()=>({}));
        if (!mounted) return;
        if (!res.ok) {
          setErr(body.error || 'Failed to load');
        } else {
          setActivityData(body);
        }
      } catch (e) {
        console.error(e);
        setErr(e.message || 'Network error');
      } finally {
        setLoading(false);
      }
    })();
    return ()=> mounted = false;
  }, [id]);

  if (loading) return <div className="container">Loading...</div>;
  if (err) return <div className="container" style={{color:'red'}}>Error: {err}</div>;
  if (!activityData) return <div className="container">No data</div>;

  const { activity, participantCount, isRegistered } = activityData;

  return (
    <div className="container">
      <h2>{activity.title}</h2>
      <div style={{display:'flex',gap:16}}>
        <div style={{flex:1}}>
          <p><strong>Location:</strong> {activity.location || '-'}</p>
          <p><strong>Country / Province:</strong> {activity.country || '-'} / {activity.province || '-'}</p>
          <p><strong>Period:</strong> {activity.startDate ? new Date(activity.startDate).toLocaleString() : '-'} — {activity.endDate ? new Date(activity.endDate).toLocaleString() : '-'}</p>
          <p><strong>Capacity:</strong> {activity.capacity || '-'}</p>
          <p><strong>Participants:</strong> {participantCount}</p>
          <p><strong>Tags:</strong> {activity.Tags && activity.Tags.length ? activity.Tags.map(t=>t.name).join(', ') : '-'}</p>
          <div style={{marginTop:12}}>
            {/* Buttons for participate/cancel will be implemented in later steps */}
            <button disabled={isRegistered} title={isRegistered ? 'You are registered' : 'Participate (coming soon)'}>{isRegistered ? 'Registered' : 'Participate'}</button>
            <button style={{marginLeft:8}} disabled={!isRegistered} title="Cancel registration (coming soon)">Cancel</button>
          </div>
        </div>

        <div style={{width:300}}>
          <div>
            {activity.ActivityImages && activity.ActivityImages.length ? (
              activity.ActivityImages.map(img => (
                <img key={img.id} src={img.url} alt={img.alt || activity.title} style={{width:'100%', marginBottom:8, borderRadius:6}} />
              ))
            ) : (
              <div style={{height:160,background:'#f2f2f2',display:'flex',alignItems:'center',justifyContent:'center'}}>No images</div>
            )}
          </div>
        </div>
      </div>

      <section style={{marginTop:16}}>
        <h3>Description</h3>
        <div>{activity.description || '-'}</div>
      </section>

      <section style={{marginTop:16}}>
        <h3>Comments</h3>
        {activity.Comments && activity.Comments.length ? (
          activity.Comments.map(c => (
            <div key={c.id} style={{padding:8,borderBottom:'1px solid #eee'}}>
              <div style={{fontSize:13,color:'#444'}}><strong>{c.User ? (c.User.firstName || c.User.username) : 'Guest'}</strong> <span style={{color:'#999',fontSize:12}}> — {new Date(c.createdAt).toLocaleString()}</span></div>
              <div style={{marginTop:6}}>{c.content}</div>
            </div>
          ))
        ) : (
          <div>No comments yet</div>
        )}
      </section>

      <div style={{marginTop:8}}>
        <Link to="/activities">Back to list</Link>
      </div>
    </div>
  );
}
