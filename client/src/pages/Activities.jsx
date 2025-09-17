import React, { useEffect, useState } from 'react';
import { getActivities } from '../services/api';
import '../css/Activities.css';
export default function Activities(){
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await getActivities({ page: 1, limit: 50 });
        if (!mounted) return;
        setActivities(data);
      } catch (e) {
        console.error(e);
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="container">Loading activities…</div>;
  if (err) return <div className="container" style={{color:'red'}}>Error: {err}</div>;

  return (
    <div className="container">
      <h2>รายการกิจกรรม</h2>
      {activities.length === 0 ? (
        <p>ยังไม่มีรายการกิจกรรม</p>
      ) : (
        <ul style={{listStyle:'none', padding:0}}>
          {activities.map(act => (
            <li key={act.id} style={{padding:12, borderBottom:'1px solid #eee', display:'flex', gap:12}}>
              <div style={{width:120}}>
                {act.posterUrl ? (
                  <img src={act.posterUrl} alt={act.title} style={{width:'100%', height:'auto', borderRadius:6}} />
                ) : (
                  <div style={{width:'100%',height:80,background:'#f3f3f3',display:'flex',alignItems:'center',justifyContent:'center'}}>No image</div>
                )}
              </div>
              <div style={{flex:1}}>
                <h3 style={{margin:'0 0 6px 0'}}>{act.title}</h3>
                <div style={{color:'#555'}}>{act.description}</div>
                <div style={{marginTop:8, fontSize:13, color:'#666'}}>สถานที่: {act.location || '-'}</div>
                <div style={{fontSize:13, color:'#666'}}>วันที่: {new Date(act.startDate).toLocaleDateString()}</div>
              </div>
              <div style={{minWidth:120, textAlign:'right'}}>
                <button onClick={()=>window.location.href=`/activities/${act.id}`}>ดูรายละเอียด</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}