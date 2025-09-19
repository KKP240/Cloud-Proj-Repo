// client/src/pages/Profile.jsx
import React, { useEffect, useState } from "react";
import img12 from "../img/Profile.jpeg";
import "../css/Profile.css";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        // decode JWT payload
        const payload = JSON.parse(atob(token.split(".")[1]));

        // ถ้า payload มีข้อมูลครบก็ใช้จาก JWT
        const userFromToken = {
          id: payload.sub || "-",
          email: payload.email || "-",
          username: payload.username || "-",
          firstname: payload.firstname || "-",
          lastname: payload.lastname || "-",
        };

        // หรือ fetch /me จาก backend
        const res = await fetch("/api/auth/me", {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
        });

        const body = await res.json().catch(() => ({}));
        console.log("User from /me:", body);

        // fallback: ใช้ JWT payload ถ้า /me ไม่ส่ง field
        const finalUser = {
          id: body.id || userFromToken.id,
          email: body.email || userFromToken.email,
          username: body.username || userFromToken.username,
          firstname: body.firstname || userFromToken.firstname,
          lastname: body.lastname || userFromToken.lastname,
        };

        if (!res.ok) {
          throw new Error(body.error || "Failed to load user");
        }

        if (!cancelled) setUser(finalUser);
      } catch (e) {
        if (!cancelled) setErr(e.message || "Network error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => (cancelled = true);
  }, []);

  if (loading) return <div className="Profile">Loading...</div>;
  if (err)
    return (
      <div className="Profile" style={{ color: "red" }}>
        Error: {err}
      </div>
    );

  return (
    <div className="Profile">
      <img src={img12} alt="Profile" className="Profile1" />

      <div className="User">
        <h3>Username:</h3>
        <h3>{user.username || "Not provided"}</h3>
      </div>

      <div className="Firstname">
        <h3>Firstname:</h3>
        <h3>{user.firstname || "Not provided"}</h3>
      </div>

      <div className="Surname">
        <h3>Surname:</h3>
        <h3>{user.lastname || "Not provided"}</h3>
      </div>

      <div className="Email">
        <h3>Email:</h3>
        <h3>{user.email || "Not provided"}</h3>
      </div>
    </div>
  );
}
