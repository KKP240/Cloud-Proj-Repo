import React, { useEffect, useState } from "react";
import "../css/Profile.css";
import img12 from "../img/Profile.jpeg";

export default function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      // decode payload ของ JWT
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUser(payload);
    } catch (e) {
      console.error("Invalid token", e);
    }
  }, []);

  if (!user) return <div className="Profile">Loading...</div>;

  return (
    <div className="Profile">
      <img src={img12} alt="Profile" className="Profile1" />
      <div className="User"><h3>Username: </h3> <h3>{user.username}</h3></div>
      <div className="Firstname"><h3>Firstname: </h3><h3>{user.firstname}</h3></div>
      <div className="Surname"><h3>Surname: </h3><h3>{user.surname}</h3></div>
      <div className="Email"><h3>Email: </h3><h3>{user.email}</h3></div>
    </div>
  );
}
