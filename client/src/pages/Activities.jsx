import React, { useEffect, useState } from 'react';
import { getActivities } from '../services/api';
import '../css/Activities.css';

export default function Activities() {
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

  if (loading) {
    return (
      <div className="activities-container">
        <div className="activities-inner-container">
          <div className="activities-loading">
            <div className="activities-spinner"></div>
            <div>กำลังโหลดกิจกรรม...</div>
          </div>
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="activities-container">
        <div className="activities-inner-container">
          <div className="activities-error">
            <h3>เกิดข้อผิดพลาด</h3>
            <p>Error: {err}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="activities-container">
      <div className="activities-inner-container">
        <h2 className="activities-title">รายการกิจกรรม</h2>
        
        {activities.length === 0 ? (
          <div className="activities-empty">
            <div className="activities-empty-icon">📅</div>
            <div>ยังไม่มีรายการกิจกรรม</div>
          </div>
        ) : (
          <div>
            {activities.map((act) => (
              <div 
                key={act.id} 
                className="activities-card"
                onClick={() => window.location.href = `/activities/${act.id}`}
                style={{ cursor: 'pointer' }}
              >
                <div className="activities-card-content">
                  <div className="activities-image-container">
                    {act.posterUrl ? (
                      <img 
                        src={act.posterUrl} 
                        alt={act.title} 
                        className="activities-image"
                      />
                    ) : (
                      <div className="activities-no-image">
                        <span>No Image</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="activities-content">
                    <h3 className="activities-activity-title">{act.title}</h3>
                    <div className="activities-description">{act.description}</div>
                    
                    <div className="activities-meta">
                      <div className="activities-meta-item">
                        <span>📍</span>
                        <span>สถานที่: {act.location || 'ไม่ระบุ'}</span>
                      </div>
                      <div className="activities-meta-item">
                        <span>📅</span>
                        <span>วันที่: {new Date(act.startDate).toLocaleDateString('th-TH', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}