import React, { useEffect, useState } from 'react';
import { getActivities } from '../services/api';
import '../css/Activities.css';

export default function Activities() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // state สำหรับ search และ filter
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("");
  const [province, setProvince] = useState("");

  // เก็บ country / province ที่มีอยู่จริงจาก activities
  const [countries, setCountries] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [sortOrder, setSortOrder] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await getActivities({ page: 1, limit: 50 });
        if (!mounted) return;

        setActivities(data);

        // สร้าง list ของ country, province จาก data
        const uniqueCountries = [...new Set(data.map(a => a.country).filter(Boolean))];
        const uniqueProvinces = [...new Set(data.map(a => a.province).filter(Boolean))];

        setCountries(uniqueCountries);
        setProvinces(uniqueProvinces);

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

  // filter data ตาม search + country + province
  let filteredActivities = activities.filter(act => {
  const matchesSearch =
    act.title.toLowerCase().includes(search.toLowerCase()) ||
    act.description.toLowerCase().includes(search.toLowerCase());

  const matchesCountry = country ? act.country === country : true;
  const matchesProvince = province ? act.province === province : true;

  return matchesSearch && matchesCountry && matchesProvince;
});

// sort ตาม sortOrder
if (sortOrder === "asc") {
  filteredActivities.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
} else if (sortOrder === "desc") {
  filteredActivities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}
  

  return (
    <div className="activities-container">
      <div className="activities-inner-container">
        <h2 className="activities-title">รายการกิจกรรม</h2>
        <input
            type="text"
            placeholder="ค้นหากิจกรรม..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="activities-search-input"
          />

        {/* Search + Filters */}
        <div className="activities-filters">

          <select value={country} onChange={e => setCountry(e.target.value)}>
            <option value="">-- เลือกประเทศ --</option>
            {countries.map((c, i) => (
              <option key={i} value={c}>{c}</option>
            ))}
          </select>

          <select value={province} onChange={e => setProvince(e.target.value)}>
            <option value="">-- เลือกจังหวัด --</option>
            {provinces.map((p, i) => (
              <option key={i} value={p}>{p}</option>
            ))}
          </select>

          <select value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
    <option value="">-- เรียงตามวันที่สร้าง --</option>
    <option value="asc">จากเก่าสุด → ใหม่สุด</option>
    <option value="desc">จากใหม่สุด → เก่าสุด</option>
  </select>
        </div>

        {filteredActivities.length === 0 ? (
          <div className="activities-empty">
            <div className="activities-empty-icon">📅</div>
            <div>ไม่พบกิจกรรมที่ค้นหา</div>
          </div>
        ) : (
          <div>
            {filteredActivities.map((act) => (
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
                        <span>✈️</span>
                        <span>ประเทศ: {act.country || 'ไม่ระบุ'}</span>
                      </div>
                      <div className="activities-meta-item">
                        <span>📍</span>
                        <span>จังหวัด: {act.province || 'ไม่ระบุ'}</span>
                      </div>
                      <div className="activities-meta-item">
                        <span>📅</span>
                        <span>
                          วันที่: {new Date(act.startDate).toLocaleDateString('th-TH', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
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
