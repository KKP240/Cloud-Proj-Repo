import React, { useEffect, useState } from "react";
import "../css/Profile.css";
import img12 from "../img/Profile.jpeg";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/auth/me', {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    })
      .then(async res => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || res.statusText);
        }
        return res.json();
      })
      .then(data => {
        console.log(data); // ดูข้อมูลที่ได้รับจาก API
        if (data.error) setErr(data.error);
        else setUser(data.user || data); // รองรับทั้ง {user: {...}} และ {...}
      })
      .catch(e => setErr(e.message));
  }, []);

  if (err) return <div style={{color:'red'}}>Error: {err}</div>;
  if (!user) return <div>Loading...</div>;

  return (
    <div className="Profile">
      <img src={img12} alt="Profile" className="Profile1" />
      <div className="User"><h3>Username: </h3> <h3>{user.username}</h3></div>
      <div className="Firstname"><h3>Firstname: </h3><h3>{user.firstName}</h3></div>
      <div className="Surname"><h3>Surname: </h3><h3>{user.lastName}</h3></div>
      <div className="Email"><h3>Email: </h3><h3>{user.email}</h3></div>
    </div>
  );
}
